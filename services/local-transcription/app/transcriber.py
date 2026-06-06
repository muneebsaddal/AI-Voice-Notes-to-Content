from dataclasses import dataclass
from typing import Any

from .config import Settings


@dataclass(frozen=True)
class TranscriptionResult:
    text: str
    language: str
    duration_seconds: float | None


class FasterWhisperTranscriber:
    def __init__(self, settings: Settings, model: Any = None):
        self._settings = settings
        if model is None:
            from faster_whisper import WhisperModel

            model = WhisperModel(
                settings.model,
                device=settings.device,
                compute_type=settings.compute_type,
            )
        self._model = model

    def transcribe(
        self, file_path: str, language: str | None = None
    ) -> TranscriptionResult:
        segments, info = self._model.transcribe(
            file_path,
            language=language or self._settings.language,
            vad_filter=self._settings.vad_filter,
        )
        text = " ".join(
            segment.text.strip() for segment in segments if segment.text.strip()
        ).strip()
        if not text:
            raise ValueError("Transcription was empty.")

        detected_language = getattr(info, "language", None)
        duration = getattr(info, "duration", None)
        return TranscriptionResult(
            text=text,
            language=detected_language or language or self._settings.language or "en",
            duration_seconds=float(duration) if duration is not None else None,
        )
