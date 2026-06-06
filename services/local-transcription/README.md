# Local Faster-Whisper Service

This localhost-only FastAPI service keeps one `faster-whisper` model loaded and
accepts temporary audio from the Node backend. It defaults to `base.en` on CPU
with `int8` compute.

## Windows Setup

From the repository root:

```powershell
python -m venv services/local-transcription/.venv
services/local-transcription/.venv/Scripts/Activate.ps1
python -m pip install -r services/local-transcription/requirements.txt
npm run transcription:dev
```

The first real startup downloads model weights from Hugging Face and can take
longer. Later starts use the local model cache. The service never returns or
logs the cache path.

Verify readiness:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
```

In a second terminal, start the Node backend:

```powershell
$env:TRANSCRIPTION_PROVIDER="local-faster-whisper"
$env:LOCAL_WHISPER_URL="http://127.0.0.1:8001"
$env:TRANSCRIPTION_TIMEOUT_MS="120000"
$env:MAX_AUDIO_UPLOAD_BYTES="25165824"
npm run backend:dev
```

`npm run backend:dev:local-transcription` is a Windows shortcut for the default
provider settings.

For a physical iPhone, expose only the Node backend on the trusted LAN by
setting `HOST=0.0.0.0`, and point Expo's `EXPO_PUBLIC_API_BASE_URL` at the
laptop's LAN address and Node port. Keep this Python service on `127.0.0.1`.
Allow only the Node port through Windows Firewall and only on trusted private
networks.

## Tests

```powershell
npm run transcription:test
```

Tests inject a fake model and do not download weights. A real-model smoke check
is intentionally manual and opt-in.

## Request Contract

`POST /transcribe` accepts one supported multipart `file` plus an optional
`language`. Supported extensions are `m4a`, `mp4`, `wav`, `webm`, `mp3`,
`mpeg`, and `mpga`.
