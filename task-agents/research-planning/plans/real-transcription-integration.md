# Real Transcription Integration Plan

Date: 2026-06-06

## Objective

Replace the mock transcription input with a real recorded-audio upload and backend-mediated transcription call while preserving the existing frontend response contract, intent routing, retry behavior, and privacy defaults.

This increment ends when a user can record on the device, stop, upload the temporary audio, receive a real transcript, and continue through the existing mock generation flow.

Real structured output generation is a separate increment.

## Recommended Architecture

```text
Expo recording asset
  -> multipart POST /api/transcriptions
  -> backend upload validation
  -> TranscriptionProvider interface
  -> OpenAI transcription adapter
  -> existing intent router
  -> existing TranscriptionResponse
  -> delete local temporary audio after success
```

### Provider choice

Use OpenAI `gpt-4o-transcribe` as the initial configurable default because transcription quality is the highest risk in the core product promise. Keep the model configurable through `OPENAI_TRANSCRIPTION_MODEL` so a lower-cost model can be evaluated later without changing the API contract.

The OpenAI API key must exist only in the backend environment as `OPENAI_API_KEY`.

## Contract

### Request

Change `POST /api/transcriptions` from mock JSON metadata to `multipart/form-data`.

Fields:

- `file`: required audio file.
- `durationMs`: required positive integer.
- `language`: optional ISO-639-1 hint when the user has selected a language.
- `audioId`: optional client correlation identifier; do not log it with audio content.

The Expo client should use `expo/fetch` with `FormData` and an `expo-file-system` `File` created from the recording URI.

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

Do not expose provider response objects, model internals, token details, prompts, or storage URLs.

### Errors

Keep structured, user-safe errors:

- `invalid_request_body`: missing or malformed multipart fields.
- `unsupported_audio_type`: unsupported extension or MIME type.
- `audio_too_large`: upload exceeds the configured limit.
- `recording_upload_failed`: transport or upload parsing failed.
- `transcription_failed`: provider rejected or could not transcribe the file.
- `backend_unavailable`: frontend-only network failure mapping.
- `internal_error`: unexpected backend failure.

The frontend must preserve the temporary recording for retry on every upload or transcription failure.

## File And Size Policy

Accept only:

- `mp3`
- `mp4`
- `mpeg`
- `mpga`
- `m4a`
- `wav`
- `webm`

Use a backend limit below the provider maximum to leave multipart overhead and operational margin. Recommended initial limit: 24 MB.

Reject using both filename extension and MIME checks where available, while accounting for generic mobile MIME values such as `application/octet-stream`. Never trust the client-provided filename alone.

Do not write the upload to long-lived storage. Stream or buffer it only long enough to call the provider, then release it. If a temporary backend file is necessary, delete it in `finally`.

## Implementation Sequence

### 1. Backend multipart boundary

- Add a narrowly scoped multipart parser suitable for the existing Node HTTP server.
- Enforce total request bytes while reading the request.
- Accept exactly one audio file.
- Validate required metadata.
- Add explicit file type and size errors.
- Keep the existing mock mode available for automated tests through dependency injection, not a public production bypass.

### 2. Provider interface

Add a provider-neutral interface such as:

```ts
type TranscriptionProviderInput = {
  bytes: Uint8Array;
  filename: string;
  mimeType: string;
  language?: string;
};

type TranscriptionProviderResult = {
  text: string;
  language?: string;
};

interface TranscriptionProvider {
  transcribe(input: TranscriptionProviderInput): Promise<TranscriptionProviderResult>;
}
```

The route owns validation and response shaping. The provider adapter owns only the external transcription call.

### 3. OpenAI adapter

- Add the official OpenAI Node SDK.
- Read `OPENAI_API_KEY` from the backend environment.
- Read `OPENAI_TRANSCRIPTION_MODEL`, defaulting to `gpt-4o-transcribe`.
- Send the file to `audio.transcriptions.create`.
- Use JSON response format.
- Supply `language` only when known.
- Convert provider failures into `transcription_failed`.
- Do not log audio bytes, transcript text, file URI, provider response, or API key.

### 4. Frontend upload client

- Replace the JSON transcription request with `FormData`.
- Create an `expo-file-system` `File` from `RecordingAsset.uri`.
- Append the file and duration metadata.
- Do not manually set the multipart `Content-Type` boundary.
- Keep the temporary asset until the response succeeds.
- Call the existing recording discard operation only after a valid transcript is accepted.
- Preserve the current local mock fallback for development when the backend is unavailable, but label it clearly in code as development-only.

### 5. Existing flow integration

- Feed the real transcript into the existing deterministic intent router.
- Preserve `suggestedOutputType` and routing metadata.
- Continue into the existing mock generation flow.
- Keep generation errors independent from upload/transcription errors.

## TDD Plan

Write and verify failing tests before production changes.

### Backend tests

- Accepts a valid `m4a` multipart upload.
- Accepts a valid `webm` multipart upload.
- Passes exact audio bytes and metadata to the provider interface.
- Returns a real transcript through the existing response contract.
- Runs intent routing on the returned transcript.
- Rejects a missing file.
- Rejects multiple files.
- Rejects zero or invalid duration.
- Rejects unsupported file types.
- Rejects oversized uploads before provider invocation.
- Maps provider failure to `transcription_failed`.
- Does not include transcript/audio/provider data in error responses.
- Cleans temporary resources after success and failure.

### Frontend/unit tests

- Builds multipart form data from a `RecordingAsset`.
- Keeps the asset after upload/network failure.
- Keeps the asset after transcription failure.
- Deletes the asset only after successful transcription.
- Uses the returned transcript and suggested output type.
- Maps new structured backend errors to the correct recovery UI.

### Manual device checks

- iPhone permission accepted.
- Record 5-15 seconds and receive matching transcript.
- Cancel deletes the recording.
- Airplane mode after recording preserves audio and allows retry.
- Backend stopped after recording preserves audio and allows retry.
- Permission denied opens Settings recovery.
- Successful transcription removes the temporary file.

## Security And Privacy Review

- API key exists only on the backend.
- Audio and transcripts are absent from logs.
- CORS is restricted for production configuration.
- Request size is enforced before unbounded buffering.
- Provider error text is not passed directly to users.
- Temporary backend files are deleted in `finally`.
- Local audio is deleted only after successful transcription.
- No analytics event contains transcript text, audio URI, filename, or generated content.

## Environment

Add a documented backend environment template:

```text
OPENAI_API_KEY=
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
MAX_AUDIO_UPLOAD_BYTES=25165824
```

The server should fail fast with a safe configuration error when real mode is enabled without `OPENAI_API_KEY`. Tests must use an injected fake provider and never require a real API call.

## Acceptance Criteria

- A real Expo recording reaches the backend as multipart audio.
- The backend validates the upload before calling the provider.
- A real transcript is returned through the current response contract.
- Existing intent routing runs on that transcript.
- Upload/transcription failure keeps local audio available for retry.
- Successful transcription deletes local temporary audio by default.
- API keys and sensitive content never appear in frontend code or logs.
- Unit and integration tests run without paid provider calls.
- Typecheck, lint, tests, backend build, web export, audit, and diff checks pass.

## Out Of Scope

- Real AI output generation.
- Streaming transcription.
- Speaker diarization.
- Background recording/upload.
- Long-recording chunking.
- Persistent cloud audio storage.
- Auth, subscriptions, or usage billing enforcement.
- Playback UI changes.

## Risks

- The existing backend uses a small custom Node HTTP stack, so multipart parsing must remain bounded and well tested.
- Web and iOS recordings may use different formats (`webm` versus `m4a`).
- Provider upload limits require an app-level duration/file-size strategy later.
- A production mobile device cannot use `127.0.0.1`; backend base URL configuration must support LAN or deployed HTTPS endpoints.

## Sources

- OpenAI speech-to-text guide: https://developers.openai.com/api/docs/guides/speech-to-text
- OpenAI transcription API reference: https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create
- OpenAI `gpt-4o-transcribe` model: https://developers.openai.com/api/docs/models/gpt-4o-transcribe
- Expo FileSystem upload documentation: https://docs.expo.dev/versions/latest/sdk/filesystem/
- Expo Audio recording documentation: https://docs.expo.dev/versions/latest/sdk/audio/
