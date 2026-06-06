# Immediate Flow Reliability And Real Generation Plan

Date: 2026-06-07
Status: Ready for execution

## Objective

Complete the next usable vertical slice of the MVP:

1. Make real transcription work from Android Expo Go, not only web.
2. Verify that all five output types remain grounded in the transcript.
3. Replace the local transcript formatter with a real, provider-neutral AI
   generation path.

This plan does not include history gestures, history navigation fixes, visual
icon replacement, recording-orb animation, or output-title overflow. Those
remain in the UX backlog until the core voice-to-output path is reliable.

## Current Evidence

- Real local `faster-whisper` transcription works from web.
- Android Expo Go reaches the app, but device transcription is unresolved.
- The Node backend and Python transcription service report healthy.
- Expo Audio 56 `RecordingPresets.HIGH_QUALITY` records Android as MPEG-4/AAC
  with a `.m4a` extension.
- The current native upload code can fall back to `recording.webm` when URI
  metadata is ambiguous. That fallback conflicts with the actual Android
  recording format and is the first concrete failure candidate.
- The backend has five validated output contracts and a transcript-grounded
  local formatter, but no real AI generation provider.
- Latest accepted backend evidence is 41/41 tests passing on 2026-06-07.

## Execution Order

```text
Phase 1: capture Android failure evidence
  -> Phase 2: fix and verify native audio upload
  -> Phase 3: establish five-output quality fixtures
  -> Phase 4: implement real generation provider
  -> Phase 5: run the complete voice-to-output acceptance flow
```

Phase 3 fixture design may begin while Phase 2 is being manually checked.
Phase 5 depends on both device transcription and real generation.

## Phase 1: Diagnose Android Expo Go Transcription

Owner: Frontend Agent with Backend Agent support

### Work

1. Reproduce one short Android recording and capture:
   - the exact user-visible error;
   - the backend error code and HTTP status;
   - safe recording metadata: platform, duration, selected extension, MIME
     type, and byte size when available.
2. Add development-only diagnostic logging at the upload boundary.
3. Never log the audio URI, audio bytes, transcript text, or provider response
   body.
4. Preserve the recording after every failed upload or transcription attempt.
5. Distinguish preparation, network, backend validation, sidecar unavailable,
   timeout, and inference failures in the development UI/error object.

### Likely First Fix

Add one shared recording-format resolver:

- Native Expo `HIGH_QUALITY`: `.m4a`, `audio/mp4`.
- Web MediaRecorder: derive from the produced Blob, normally `audio/webm`.
- A native URI without a recognized extension must not default to `webm`.
- Filename, MIME type, and actual recording preset must agree.

Add regression tests for:

- Android URI ending in `.m4a`;
- Android `file://` or `content://` URI without an extension;
- iOS `.m4a`;
- web `audio/webm`;
- retry using the retained asset.

### Exit Criteria

- The exact Android failure layer is known from evidence.
- Android uploads use `.m4a` and `audio/mp4`.
- A 5-15 second Android recording produces a matching real transcript.
- Failure keeps the recording available; retry does not require re-recording.
- Web transcription still works.

### User Verification

After the code change, the agent gives these commands individually:

```bash
npm run frontend:test
```

Expected: under 2 seconds. Stop and report if no result after 30 seconds.

```bash
npm run recording:test
```

Expected: under 2 seconds. Stop and report if no result after 30 seconds.

```bash
npm run typecheck
```

Expected: under 20 seconds. Stop and report if no result after 60 seconds.

Then perform one Android Expo Go recording while the two local services are
already running. This is a required manual check, not an agent-started process.

## Phase 2: Harden The Native Upload Boundary

Owner: Frontend Agent and Backend Agent

### Work

1. Centralize extension/MIME selection instead of inferring it independently
   in recording and upload modules.
2. Keep multipart boundary generation under `fetch`; do not set
   `Content-Type` manually.
3. Make backend upload validation accept the supported mobile MPEG-4 aliases
   while still requiring a permitted extension.
4. Return structured, actionable error codes without exposing internal paths or
   dependency errors.
5. Add a small request correlation ID for development troubleshooting without
   using the audio URI or transcript as an identifier.
6. Confirm backend temporary files are removed on both success and failure.

### Exit Criteria

- Filename, MIME, and file bytes describe the same format.
- Invalid or oversized files never invoke Whisper.
- Safe error mapping identifies the failing boundary.
- Web and Android both pass the same external transcription response contract.

### User Verification

```bash
npm run backend:test
```

Expected: under 5 seconds. Stop and report if no result after 30 seconds.

```bash
npm run transcription:test
```

Expected: under 10 seconds without real model inference. Stop and report if no
result after 30 seconds.

## Phase 3: Five-Output Grounding And Quality Matrix

Owner: Voice AI Agent with Testing Agent review

### Work

Create a compact golden fixture matrix for:

- Note
- Todo List
- Email
- Journal Entry
- Content Post

Each type needs at least:

1. An explicit request, such as "turn this into an email".
2. A natural implicit request where intent must be inferred.
3. A change-type case using the same transcript.
4. A sparse or ambiguous transcript.
5. A long transcript case.

Evaluate:

- correct output type;
- valid schema;
- preservation of names, dates, quantities, and commitments;
- no invented facts;
- useful structure;
- deterministic body projection;
- safe handling of ambiguity;
- selected output type overriding inferred type;
- regeneration after `Change Type`.

The local formatter is the baseline for contract correctness, not the final
quality target.

### Exit Criteria

- All five types have durable fixtures and assertions.
- Contract failures are separated from subjective quality observations.
- The same fixture set can test the local formatter and real provider.
- Long transcripts still produce contract-valid, reviewable output.

### User Verification

```bash
npm run backend:test
```

Expected: under 5 seconds. Stop and report if no result after 30 seconds.

The agent will also provide a five-row manual review table containing the input,
selected type, generated title, key facts preserved, and any invention found.

## Phase 4: Real Structured Generation Provider

Owner: Backend Agent with Voice AI Agent and Security Reviewer

### Architecture

```text
POST /api/generations
  -> validate GenerationRequest
  -> GenerationProvider
      -> LocalFormatterProvider
      -> OpenAIProvider
  -> validate and sanitize GeneratedOutput
  -> return existing public contract
```

Provider selection happens once at backend startup:

```text
GENERATION_PROVIDER=local|openai
OPENAI_API_KEY=...
OPENAI_GENERATION_MODEL=...
GENERATION_TIMEOUT_MS=...
```

The implementation must verify the current official OpenAI Responses API and
Structured Outputs documentation immediately before coding. The model remains
configuration-driven; do not bake a dated model name into domain logic.

### Work

1. Define a `GenerationProvider` interface using existing request and output
   contracts.
2. Move the transcript formatter behind `LocalFormatterProvider`.
3. Add `OpenAIProvider` using structured JSON output matching the selected
   payload schema.
4. Keep one shared system policy:
   - use only transcript facts;
   - do not invent recipients, dates, claims, tasks, or context;
   - retain uncertainty rather than guessing;
   - obey the explicitly selected output type.
5. Validate and sanitize every provider result through existing runtime
   contracts before returning it.
6. Add bounded timeout and narrow retry behavior for network errors, rate
   limits, and provider 5xx responses.
7. Do not retry authentication, configuration, or schema-validation failures.
8. Never log API keys, transcript text, full prompts, or provider response
   bodies.
9. Do not silently substitute the local formatter when the configured cloud
   provider fails. Return a clear retryable error.
10. Test with an injected fake HTTP client. Automated tests must not make paid
    provider calls.

### Exit Criteria

- Backend starts with either explicit provider.
- Unsupported or incomplete provider configuration fails safely at startup.
- All five provider outputs pass the same runtime contracts and fixture matrix.
- Provider failures become stable public error codes.
- Existing frontend response contracts do not change.
- One paid real-provider smoke call is optional and requires explicit user
  approval.

### User Verification

```bash
npm run backend:test
```

Expected: under 5 seconds. Stop and report if no result after 30 seconds.

```bash
npm run typecheck
```

Expected: under 20 seconds. Stop and report if no result after 60 seconds.

```bash
npm run lint
```

Expected: under 20 seconds. Stop and report if no result after 60 seconds.

## Phase 5: End-To-End Acceptance

Owner: Testing Agent, reviewed by Lead Agent

### Required Manual Matrix

1. Web: record, transcribe, confirm/change type, generate, view output.
2. Android Expo Go: record, transcribe, confirm/change type, generate, view
   output.
3. Repeat one transcript across all five output types.
4. Stop the Python service after recording, verify retained-audio retry, restart
   it, and retry successfully.
5. Configure an invalid generation credential and verify a safe, actionable
   error without local fallback.
6. Check that the complete successful path normally stays near the product
   target of 30 seconds.

### Final Automated Gate

Run commands separately, not as one chained script:

```bash
npm run recording:test
npm run frontend:test
npm run backend:test
npm run transcription:test
npm run typecheck
npm run lint
```

Agents do not run these commands by default. The user runs them and pastes the
results. Any changed test count must be recorded in `memory/current-state.md`.

### Definition Of Done

- Real Android and web audio both produce accurate transcripts.
- Users can confirm or change the output type before generation.
- All five outputs are transcript-grounded and schema-valid.
- Real AI generation is configurable and provider-neutral.
- Failed transcription keeps audio for retry.
- Failed generation does not pretend a local result is AI-generated.
- Automated and manual evidence is recorded.
- Reviewer reports no unresolved P0/P1 findings.
- Changes are committed only after user or reviewer approval.

## Agent Assignment

1. Frontend Agent: Phases 1-2 native recording metadata and upload behavior.
2. Backend Agent: Phase 2 validation and Phase 4 provider implementation.
3. Voice AI Agent: Phase 3 fixtures, prompt policy, and schema review.
4. Testing Agent: regression matrix and Phase 5 manual checklist.
5. Security Reviewer: provider configuration, logs, error leakage, and retries.
6. Lead Agent: sequence work, review handoffs, update memory, and request commit
   approval.

## Immediate First Task

Start with a bounded Frontend Agent task:

> Diagnose and fix Android Expo Go transcription upload metadata. Treat Expo
> Audio `HIGH_QUALITY` native output as `.m4a`/`audio/mp4`, add regression tests
> for native URIs with and without extensions, preserve retryable audio, and
> return a handoff without running verification commands. Provide the user the
> exact commands, expected durations, and stop thresholds.

Do not begin the OpenAI provider until the Android failure evidence and format
fix are reviewed.

## Sources

- Expo Audio SDK 56 source, `RecordingPresets.HIGH_QUALITY`:
  `node_modules/expo-audio/src/RecordingConstants.ts`
- Expo Audio recording documentation:
  https://docs.expo.dev/versions/latest/sdk/audio/
- Existing transcription plan:
  `task-agents/research-planning/plans/real-transcription-integration.md`
- Current project state:
  `memory/current-state.md`
- Current implementation:
  `src/audio/useExpoRecordingSession.ts`
  `src/api/transcriptionClient.ts`
  `backend/src/services/generationService.ts`
