from dataclasses import dataclass
from typing import Mapping
import os


def _positive_int(value: str | None, default: int, label: str) -> int:
    if value is None:
        return default
    try:
        parsed = int(value)
    except ValueError as error:
        raise ValueError(f"Invalid {label} configuration.") from error
    if parsed <= 0:
        raise ValueError(f"Invalid {label} configuration.")
    return parsed


@dataclass(frozen=True)
class Settings:
    model: str
    device: str
    compute_type: str
    language: str | None
    host: str
    port: int
    max_upload_bytes: int
    vad_filter: bool

    @classmethod
    def from_env(cls, environment: Mapping[str, str] | None = None) -> "Settings":
        env = os.environ if environment is None else environment
        language = env.get("WHISPER_LANGUAGE", "en").strip()
        return cls(
            model=env.get("WHISPER_MODEL", "base.en"),
            device=env.get("WHISPER_DEVICE", "cpu"),
            compute_type=env.get("WHISPER_COMPUTE_TYPE", "int8"),
            language=language or None,
            host=env.get("WHISPER_HOST", "127.0.0.1"),
            port=_positive_int(env.get("WHISPER_PORT"), 8001, "port"),
            max_upload_bytes=_positive_int(
                env.get("WHISPER_MAX_UPLOAD_BYTES"),
                24 * 1024 * 1024,
                "maximum upload size",
            ),
            vad_filter=env.get("WHISPER_VAD_FILTER", "true").lower()
            not in {"0", "false", "no"},
        )
