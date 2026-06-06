from contextlib import asynccontextmanager
from pathlib import Path
import os
import tempfile
from typing import Callable

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from .config import Settings
from .transcriber import FasterWhisperTranscriber


SUPPORTED_EXTENSIONS = {".m4a", ".mp4", ".wav", ".webm", ".mp3", ".mpeg", ".mpga"}
SUPPORTED_MIME_TYPES = {
    "audio/mp4",
    "video/mp4",
    "audio/x-m4a",
    "audio/m4a",
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "video/webm",
    "audio/mpeg",
    "audio/mp3",
    "application/octet-stream",
}


def _safe_error(code: str, message: str, status: int) -> HTTPException:
    return HTTPException(status_code=status, detail={"code": code, "message": message})


def create_app(
    settings: Settings | None = None,
    transcriber_factory: Callable[[Settings], FasterWhisperTranscriber] | None = None,
) -> FastAPI:
    resolved_settings = settings or Settings.from_env()
    factory = transcriber_factory or FasterWhisperTranscriber

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        try:
            app.state.transcriber = factory(resolved_settings)
            app.state.ready = True
        except Exception:
            app.state.transcriber = None
            app.state.ready = False
        yield

    app = FastAPI(title="Local Transcription Service", lifespan=lifespan)

    @app.get("/health")
    async def health():
        return {
            "status": "ok" if app.state.ready else "warming",
            "provider": "faster-whisper",
            "model": resolved_settings.model,
            "device": resolved_settings.device,
            "computeType": resolved_settings.compute_type,
            "ready": app.state.ready,
        }

    @app.post("/transcribe")
    async def transcribe(
        file: UploadFile = File(...),
        language: str | None = Form(default=None),
    ):
        if not app.state.ready or app.state.transcriber is None:
            raise _safe_error(
                "transcription_unavailable",
                "Transcription is temporarily unavailable.",
                503,
            )

        filename = Path(file.filename or "").name
        extension = Path(filename).suffix.lower()
        content_type = (file.content_type or "").lower()
        if extension not in SUPPORTED_EXTENSIONS or content_type not in SUPPORTED_MIME_TYPES:
            raise _safe_error(
                "unsupported_audio_type", "Unsupported audio type.", 415
            )

        temporary_path = ""
        try:
            with tempfile.NamedTemporaryFile(
                suffix=extension, delete=False
            ) as temporary_file:
                temporary_path = temporary_file.name
                total_bytes = 0
                while chunk := await file.read(1024 * 1024):
                    total_bytes += len(chunk)
                    if total_bytes > resolved_settings.max_upload_bytes:
                        raise _safe_error(
                            "audio_too_large", "Audio upload is too large.", 413
                        )
                    temporary_file.write(chunk)

            if total_bytes == 0:
                raise _safe_error("invalid_request_body", "Invalid request body.", 400)

            result = app.state.transcriber.transcribe(temporary_path, language)
            return {
                "text": result.text,
                "language": result.language,
                "durationSeconds": result.duration_seconds,
            }
        except HTTPException:
            raise
        except Exception:
            raise _safe_error(
                "transcription_failed", "Transcription failed.", 502
            ) from None
        finally:
            await file.close()
            if temporary_path:
                try:
                    os.unlink(temporary_path)
                except FileNotFoundError:
                    pass

    return app


app = create_app()
