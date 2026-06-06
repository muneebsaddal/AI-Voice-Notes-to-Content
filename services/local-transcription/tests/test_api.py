from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.transcriber import TranscriptionResult


class FakeTranscriber:
    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error
        self.calls = 0

    def transcribe(self, path, language=None):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result


def make_client(transcriber):
    app = create_app(
        settings=Settings.from_env({}),
        transcriber_factory=lambda _settings: transcriber,
    )
    return TestClient(app)


def test_health_reports_safe_readiness():
    client = make_client(
        FakeTranscriber(TranscriptionResult("hello", "en", 1.0))
    )

    with client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "provider": "faster-whisper",
        "model": "base.en",
        "device": "cpu",
        "computeType": "int8",
        "ready": True,
    }


def test_health_reports_not_ready_when_model_startup_fails():
    def fail_startup(_settings):
        raise RuntimeError("C:/secret/model/cache")

    app = create_app(
        settings=Settings.from_env({}),
        transcriber_factory=fail_startup,
    )
    client = TestClient(app)

    with client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["ready"] is False
    assert response.json()["status"] == "warming"
    assert "secret" not in response.text


def test_transcribes_supported_upload_and_reuses_started_transcriber():
    transcriber = FakeTranscriber(
        TranscriptionResult("A useful transcript.", "en", 2.5)
    )
    client = make_client(transcriber)

    with client:
        first = client.post(
            "/transcribe",
            files={"file": ("voice.wav", b"wave-bytes", "audio/wav")},
        )
        second = client.post(
            "/transcribe",
            files={"file": ("voice.wav", b"wave-bytes", "audio/wav")},
        )

    assert first.status_code == 200
    assert first.json() == {
        "text": "A useful transcript.",
        "language": "en",
        "durationSeconds": 2.5,
    }
    assert second.status_code == 200
    assert transcriber.calls == 2


def test_rejects_unsupported_upload():
    transcriber = FakeTranscriber(TranscriptionResult("unused", "en", 1.0))
    client = make_client(transcriber)

    with client:
        response = client.post(
            "/transcribe",
            files={"file": ("voice.txt", b"text", "text/plain")},
        )

    assert response.status_code == 415
    assert response.json() == {
        "detail": {"code": "unsupported_audio_type", "message": "Unsupported audio type."}
    }
    assert transcriber.calls == 0


def test_rejects_missing_upload():
    transcriber = FakeTranscriber(TranscriptionResult("unused", "en", 1.0))
    client = make_client(transcriber)

    with client:
        response = client.post("/transcribe")

    assert response.status_code == 422
    assert transcriber.calls == 0


def test_rejects_oversized_upload_before_transcription():
    transcriber = FakeTranscriber(TranscriptionResult("unused", "en", 1.0))
    settings = Settings.from_env({"WHISPER_MAX_UPLOAD_BYTES": "4"})
    app = create_app(
        settings=settings,
        transcriber_factory=lambda _settings: transcriber,
    )
    client = TestClient(app)

    with client:
        response = client.post(
            "/transcribe",
            files={"file": ("voice.wav", b"too-large", "audio/wav")},
        )

    assert response.status_code == 413
    assert response.json() == {
        "detail": {"code": "audio_too_large", "message": "Audio upload is too large."}
    }
    assert transcriber.calls == 0


def test_returns_safe_inference_failure():
    client = make_client(FakeTranscriber(error=RuntimeError("C:/secret/model/cache")))

    with client:
        response = client.post(
            "/transcribe",
            files={"file": ("voice.wav", b"wave-bytes", "audio/wav")},
        )

    assert response.status_code == 502
    assert response.json() == {
        "detail": {"code": "transcription_failed", "message": "Transcription failed."}
    }
    assert "secret" not in response.text
