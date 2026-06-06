# Local Faster-Whisper Transcription Integration Plan

Date: 2026-06-06
Status: Proposed for review
Supersedes: The OpenAI-first version of this plan

## Objective

Replace mock transcription with real transcription from recorded audio during
development and testing, using `faster-whisper` on the developer's Windows
laptop.

This increment ends when a user can:

1. Record audio in the Expo app.
2. Upload the retained temporary recording to the existing Node backend.
3. Receive a transcript produced locally by `faster-whisper`.
4. Continue through the existing intent-routing and mock-generation flow.
5. Retry after a failure without losing the recording.

Real structured-output generation and on-device iPhone transcription remain
separate increments.

## Decisions

| Area | Decision |
|---|---|
| Development transcription | Local `faster-whisper` |
| Default model | `base.en` for English-only development |
| Multilingual option | `base`, selected by configuration |
| Default execution | CPU with `int8` compute |
| GPU | Deferred until CPU behavior is working and benchmarked |
| Mobile-facing API | Existing Node `POST /api/transcriptions` endpoint |
| Whisper runtime | Persistent Python HTTP service bound to localhost |
| Provider selection | Backend environment configuration |
| Test default | Injected fake/mock provider; no model download required |
| Audio retention | Delete after successful transcription; retain on failure |

## Recommended Architecture

```text
Expo recording asset
  -> multipart POST /api/transcriptions
  -> Node upload validation and temporary-file boundary
  -> TranscriptionProvider interface
      -> MockTranscriptionProvider for automated tests
      -> LocalFasterWhisperProvider for local development
  -> localhost-only Python /transcribe service
  -> faster-whisper model loaded once at service startup
  -> existing intent router
  -> existing TranscriptionResponse
  -> delete temporary audio after accepted success
```

The Expo app must not know that Whisper is being used. It should depend only on
the existing backend contract. This leaves room for a cloud provider in a
deployed backend and an iPhone-local implementation later.

### Why a persistent Python service

- `faster-whisper` is a Python library.
- Keeping one process alive avoids loading the model for every request.
- The Node backend remains the app-facing gateway for transcription,
  generation, validation, and future authentication.
- The provider boundary can be tested without installing Python or downloading
  model weights.
- The Python service can remain bound to `127.0.0.1` even when the Node backend
  is exposed to a physical phone on the local network.

Do not spawn a new Python process per transcription request.

## External Contract

### Request

Change `POST /api/transcriptions` from mock JSON metadata to
`multipart/form-data`.

Fields:

- `file`: required audio file.
- `durationMs`: required positive integer.
- `language`: optional language hint.
- `audioId`: optional client correlation identifier.

Supported initial formats:

- `m4a`
- `mp4`
- `wav`
- `webm`
- `mp3`
- `mpeg`
- `mpga`

Initial maximum upload size: 24 MB, configurable by environment variable.

### Response

Preserve the current response shape:

```ts
type TranscriptionResponse = {
  transcript: string;
  language: string;
  durationMs: number;
  suggestedOutputType: OutputType;
  routing: IntentRoutingResult;
};
```

Do not expose model paths, model-cache paths, segment internals, Python stack
traces, or provider-specific response objects.

### Error codes

- `invalid_request_body`
- `unsupported_audio_type`
- `audio_too_large`
- `recording_upload_failed`
- `transcription_unavailable`
- `transcription_failed`
- `backend_unavailable`
- `internal_error`

The frontend must keep the temporary recording for every upload,
unavailability, timeout, and transcription failure.

## Internal Python Service Contract

### `GET /health`

Return a small readiness response:

```json
{
  "status": "ok",
  "provider": "faster-whisper",
  "model": "base.en",
  "device": "cpu",
  "computeType": "int8",
  "ready": true
}
```

Do not include filesystem or model-cache locations.

### `POST /transcribe`

Accept:

- one multipart audio file;
- optional language hint.

Return:

```json
{
  "text": "Transcribed text",
  "language": "en",
  "durationSeconds": 8.4
}
```

The first implementation does not need word timestamps, streaming, diarization,
or segment data in its response.

## Provider Boundary

Add a Node interface similar to:

```ts
type TranscriptionProviderInput = {
  filePath: string;
  filename: string;
  mimeType: string;
  language?: string;
};

type TranscriptionProviderResult = {
  text: string;
  language?: string;
  durationSeconds?: number;
};

interface TranscriptionProvider {
  transcribe(
    input: TranscriptionProviderInput,
  ): Promise<TranscriptionProviderResult>;
}
```

Implement:

- `MockTranscriptionProvider` for deterministic automated tests.
- `LocalFasterWhisperProvider` as an HTTP adapter to the Python service.

Provider selection should happen once during backend startup, not inside the
route:

```text
TRANSCRIPTION_PROVIDER=mock|local-faster-whisper
```

An unsupported provider value should fail backend startup with a safe
configuration error.

## Implementation Phases

### Phase 1: Contract tests and provider seam

Owner: Backend Agent

1. Add failing backend tests for provider injection and the existing response
   contract.
2. Extract mock transcription behind `TranscriptionProvider`.
3. Keep existing JSON mock behavior only where current tests require a short
   migration bridge.
4. Add startup provider selection with `mock` as the test default.
5. Verify intent routing still runs on provider-returned text.

Exit criteria:

- Existing mock tests pass through the provider interface.
- No Python runtime is required by Node tests.
- No provider-specific fields reach the external response.

### Phase 2: Local Python transcription service

Owner: Voice/Audio Agent with Backend Agent review

Create a focused service directory such as:

```text
services/local-transcription/
  app/
    main.py
    config.py
    transcriber.py
  tests/
  requirements.txt
  README.md
```

Tasks:

1. Add a pinned Python dependency set for FastAPI, its multipart dependency,
   an ASGI server, `faster-whisper`, and test tooling.
2. Parse configuration once at startup.
3. Load one `WhisperModel` instance and reuse it.
4. Default to `base.en`, `device="cpu"`, and `compute_type="int8"`.
5. Iterate the returned segment generator completely before responding.
6. Join and trim segment text into one transcript.
7. Enable conservative VAD filtering initially; keep its settings
   configurable if real recordings reveal clipped speech.
8. Add `/health` and `/transcribe`.
9. Convert decoding and inference failures into safe service errors.
10. Bind to `127.0.0.1` by default.

Exit criteria:

- Service starts on Windows with CPU-only dependencies.
- Model loads once rather than once per request.
- A local audio file produces a non-empty transcript.
- Unit tests can replace the actual model with a fake.

### Phase 3: Bounded multipart upload in Node

Owner: Backend Agent

1. Add a narrowly scoped multipart parser to the existing custom Node server.
2. Enforce the total request limit while reading the request.
3. Require exactly one file and one valid `durationMs`.
4. Validate extension and MIME type while tolerating generic mobile MIME values
   only when the extension is allowed.
5. Write uploads only to an OS temporary location.
6. Delete backend temporary files in `finally` after success or failure.
7. Pass the validated temporary file to the selected provider.
8. Map sidecar connection refusal and timeout to
   `transcription_unavailable`.
9. Map valid service responses with inference failures to
   `transcription_failed`.
10. Never log audio bytes, transcript text, local device URI, or Python error
    bodies.

Exit criteria:

- Valid `m4a` and `webm` uploads reach a fake provider.
- Invalid and oversized uploads never invoke the provider.
- Temporary backend files are always removed.

### Phase 4: `LocalFasterWhisperProvider`

Owner: Backend Agent

1. Post the validated file to the localhost Python `/transcribe` endpoint.
2. Apply a configurable request timeout suitable for CPU inference.
3. Validate the Python response before returning it to the route.
4. Reject an empty transcript as `transcription_failed`.
5. Keep the Python URL configurable but localhost-only by default.
6. Extend backend health information with transcription-provider readiness
   without making the entire backend unavailable when Whisper is warming up.

Exit criteria:

- Node can transcribe a fixture through the running local service.
- Stopping the Python service produces a structured retryable error.
- Provider internals remain absent from the app response.

### Phase 5: Expo multipart upload

Owner: Frontend Agent

1. Replace mock transcription JSON with `FormData`.
2. Build the upload file from the retained `RecordingAsset.uri`.
3. Append `durationMs` and optional language metadata.
4. Let the fetch implementation set the multipart boundary.
5. Make the backend base URL configurable with
   `EXPO_PUBLIC_API_BASE_URL`.
6. Preserve the current development mock fallback only when explicitly enabled;
   do not silently show a fake transcript after a local transcription failure.
7. Retain the recording on upload or transcription failure.
8. Discard the recording only after a valid transcript response is accepted.
9. Map `transcription_unavailable` to clear retry guidance.

Exit criteria:

- Web recordings upload as `webm`.
- iOS recordings upload in their native captured format.
- Retry reuses the same retained recording asset.
- Success continues into existing processing and output preview.

### Phase 6: Local developer workflow

Owner: Backend Agent

Add documented commands for:

1. Creating a Python virtual environment.
2. Installing pinned Python dependencies.
3. Starting the Python transcription service.
4. Starting the Node backend in `local-faster-whisper` mode.
5. Starting Expo with the correct API base URL.
6. Warming or verifying the model through `/health`.

Recommended environment:

```text
TRANSCRIPTION_PROVIDER=local-faster-whisper
LOCAL_WHISPER_URL=http://127.0.0.1:8001
TRANSCRIPTION_TIMEOUT_MS=120000
MAX_AUDIO_UPLOAD_BYTES=25165824

WHISPER_MODEL=base.en
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
WHISPER_LANGUAGE=en
WHISPER_HOST=127.0.0.1
WHISPER_PORT=8001
```

For a physical iPhone:

- expose only the Node backend on the trusted LAN;
- set `EXPO_PUBLIC_API_BASE_URL` to the laptop LAN address;
- keep the Python service on `127.0.0.1`;
- document Windows Firewall access narrowly for the Node port if needed.

The first model load downloads weights from Hugging Face. Document that network
access and additional startup time are expected once; later runs should use the
local model cache.

## Test Plan

### Node backend tests

- Selects mock and local providers from valid configuration.
- Rejects unsupported provider configuration.
- Accepts valid `m4a`, `wav`, and `webm` multipart uploads.
- Passes the exact file metadata to the provider.
- Preserves the current `TranscriptionResponse`.
- Runs intent routing on returned transcript text.
- Rejects missing and multiple files.
- Rejects invalid duration.
- Rejects unsupported type.
- Rejects oversized content before provider invocation.
- Maps sidecar outage and timeout to `transcription_unavailable`.
- Maps empty or invalid provider output to `transcription_failed`.
- Removes temporary files after success and failure.

### Python service tests

- Loads configuration defaults correctly.
- Reuses one transcriber instance.
- Iterates all returned segments.
- Joins segment text deterministically.
- Returns detected or configured language.
- Rejects missing and invalid uploads.
- Returns safe errors without stack traces or paths.
- Reports readiness accurately.

Normal Python tests should fake the model. Add one opt-in local integration test
that requires downloaded model weights.

### Frontend tests

- Builds multipart data from `RecordingAsset`.
- Uses configured API base URL.
- Keeps the asset after network, timeout, and transcription errors.
- Deletes the asset only after accepted success.
- Does not activate mock fallback unless explicitly configured.
- Uses the returned transcript and suggested output type.

### Manual checks

These are human-triggered checks, not automatic agent completion gates. A
real-model run may download weights and must only happen after explicit user
approval. Browser, device, and local-service attempts must use a hard timeout
and stop all spawned processes afterward.

- Record 5-15 seconds in web and receive a matching local transcript.
- Record 5-15 seconds on iPhone and receive a matching local transcript.
- Stop the Python service after recording; verify retry UI and retained audio.
- Restart the service; retry without re-recording.
- Verify successful transcription removes temporary frontend audio.
- Verify no audio or transcript content appears in Node or Python logs.
- Compare `base.en` CPU `int8` latency against the product's 30-second goal.

## Verification Gates

Run:

```text
npm run typecheck
npm run lint
npm test
npm run backend:build
npm run backend:test
python -m pytest services/local-transcription/tests
npx expo export --platform web
npm audit --audit-level=high
git diff --check
```

Also run the opt-in end-to-end local transcription check with a short,
non-sensitive recording.

## Security And Privacy

- Keep the Python service localhost-only.
- Do not store audio outside temporary request handling.
- Delete Node temporary files in `finally`.
- Delete device audio only after successful transcription.
- Do not log audio content, transcript content, file URIs, filenames, or model
  cache paths.
- Bound upload size before unbounded buffering.
- Return safe error codes rather than raw dependency errors.
- Keep test fixtures free of personal voice data.
- Do not claim iPhone-local processing; this phase is laptop-local only.

## Acceptance Criteria

- Real Expo audio reaches the Node backend as multipart data.
- Node validates the upload before invoking a provider.
- `LocalFasterWhisperProvider` transcribes through a localhost Python service.
- CPU `int8` with `base.en` works without a system FFmpeg installation.
- Existing response and intent-routing contracts remain stable.
- Failure preserves the frontend recording for retry.
- Success deletes frontend and backend temporary audio by default.
- Automated tests do not download or run a real model.
- The documented Windows workflow can be followed from a clean checkout.
- All verification gates pass.

## Out Of Scope

- Cloud transcription provider implementation.
- Real structured-output generation.
- Embedded Whisper or another STT runtime on iPhone.
- GPU setup as a required path.
- Streaming or live partial transcripts.
- Speaker diarization.
- Word-level timestamps.
- Background upload.
- Long-recording chunking.
- Persistent audio storage.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| First startup downloads model weights | Document it and expose readiness |
| CPU latency varies by laptop | Benchmark `base.en` before considering GPU |
| Python sidecar adds a second process | Add clear setup/start/health commands |
| Physical iPhone cannot use laptop localhost | Configure Expo with laptop LAN URL |
| Node multipart parsing can over-buffer | Enforce byte limits during request reading |
| Web and iOS produce different formats | Test `webm` and `m4a` paths explicitly |
| Silent mock fallback hides failures | Require an explicit mock-mode flag |
| VAD may trim quiet speech | Start conservatively and test real voice notes |

## Recommended Agent Assignment

Use two bounded specialist tasks rather than creating a new permanent agent:

1. Backend Agent: Phases 1, 3, 4, and Node portions of Phase 6.
2. Voice/Audio Agent: Phase 2 and the local transcription quality/latency checks.
3. Frontend Agent: Phase 5 after the multipart contract is tested.
4. Testing Agent: final cross-process and device verification.

The Backend Agent should integrate the work and preserve the public contract.
Parallel implementation should begin only after the provider interface and
multipart request contract are fixed.

## Recommended First Implementation Increment

Complete Phases 1 and 2 first:

- extract the provider interface behind current mock behavior;
- add the Python service with fake-model tests;
- prove one manual local file transcription on CPU `int8`;
- stop for review before wiring multipart uploads.

This creates the highest-risk local runtime foundation without changing the
working mobile flow yet.

## Sources

- Local direction handoff:
  `task-agents/research-planning/handoffs/2026-06-06-local-transcription-direction.md`
- `faster-whisper` README:
  https://github.com/SYSTRAN/faster-whisper
- CTranslate2 installation:
  https://opennmt.net/CTranslate2/installation.html
- CTranslate2 hardware support:
  https://opennmt.net/CTranslate2/hardware_support.html
- FastAPI file upload documentation:
  https://fastapi.tiangolo.com/tutorial/request-files/
