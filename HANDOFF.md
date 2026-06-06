# AI Voice Notes To Content Handoff

Last updated: 2026-06-06

Use this file as the quick resume point for a fresh lead-developer chat. For deeper context, read `AGENTS.md`, `memory/current-state.md`, `product-context.md`, `requirements.md`, and `ux-flow.md`.

## Current Repo State

Latest completed feature commit before the current uncommitted implementation:

- `05e1781` - Document local transcription development direction.

The complete local transcription milestone is implemented and remains
uncommitted pending review and commit approval. Confirm with:

```bash
git status --short
```

## What Has Been Built

- Expo / React Native / TypeScript app scaffold in the repo root.
- Lovable-inspired iOS-first clickable mock flow.
- Mock Node / TypeScript backend under `backend/`.
- Frontend calls to mock backend transcription and generation endpoints.
- Local mock fallbacks when backend is unavailable.
- Direct normal flow from recording completion to processing to output preview.
- Retryable recording, transcription, and generation failure states.
- Output preview/edit screen with Save, Copy, and Share controls.
- History sheet.
- Settings screen with mock lifecycle previews.
- Geist font loading for web preview.
- Expo vector icons for UI controls.
- Structured output contracts for Note, Todo List, Email, Journal Entry, and Content Post.
- Deterministic intent routing with user-selection and explicit-intent precedence.
- Runtime validation and sanitization of generated output.
- Golden Voice AI fixtures and focused contract/routing tests.
- Real Expo microphone permission and recording lifecycle.
- Recording start, stop, cancel, temporary asset retention, and deletion.
- Permission-denied recovery through device Settings.
- Provider-independent recording session with focused lifecycle tests.
- Provider-neutral Node transcription interface and startup selection.
- Deterministic mock transcription provider for automated tests.
- Bounded multipart transcription upload with format, duration, and size
  validation.
- Temporary backend audio cleanup after success and failure.
- Localhost-only `LocalFasterWhisperProvider` with timeout/readiness handling.
- Persistent FastAPI `faster-whisper` sidecar under
  `services/local-transcription/`.
- Python defaults of `base.en`, CPU, and `int8`.
- Fake-model Python tests that do not download or load real model weights.
- Expo multipart upload from the retained recording asset.
- Configurable `EXPO_PUBLIC_API_BASE_URL`.
- Explicit, disabled-by-default mock fallback.
- Retry reuses the retained recording after upload/provider failures.
- Successful transcription discards temporary frontend audio only after the
  response is validated.
- Focused frontend tests for web/native multipart payloads, timeout/error
  mapping, retry retention, and success cleanup.
- Root lint, typecheck, test, backend test/build, and web export scripts.
- Project memory graph under `memory/`.
- Specialist task-agent briefs under `task-agents/`.

## Current Commands

Run frontend web:

```bash
cd /c/Users/munee/Documents/development_workspace/apps_development/ai-voice-notes-to-content
npm run web
```

Run mock backend:

```bash
cd /c/Users/munee/Documents/development_workspace/apps_development/ai-voice-notes-to-content
npm run backend:dev
```

Run fake-model transcription tests:

```bash
npm run transcription:test
```

The real sidecar workflow is documented in
`services/local-transcription/README.md`. Do not start it as an automatic agent
verification step because first startup can download model weights.

Open:

- `http://localhost:8081`

Backend:

- `http://127.0.0.1:3333`

## Verified Recently

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run backend:test`
- `npx expo export --platform web`
- `npm audit --audit-level=high`

The last full frontend polish verification before `0467b46` included:

- `npm run typecheck`
- `npm run lint`
- `npx expo export --platform web`
- `git diff --check`

The Voice AI contract milestone was verified with:

- `npm run typecheck`
- `npm run lint`
- `npm test` with 27 passing tests
- `npm run backend:build`
- `git diff --check`
- `npm audit --audit-level=high` with zero vulnerabilities

The recording lifecycle milestone was verified with:

- `npm run typecheck`
- `npm run lint`
- `npm test` with 35 passing tests
- `npm run backend:build`
- `npx expo export --platform web`
- `npm audit --audit-level=high` with zero vulnerabilities
- `git diff --check`

The uncommitted local transcription milestone was verified with:

- `npm run recording:test`: 8 tests passed.
- `npm run frontend:test`: 9 tests passed.
- `npm run backend:test`: 40 tests passed before the frontend integration. A
  later unchanged-backend rerun was stopped after the test command hung.
- `npm run transcription:test`: 9 Python tests passed.
- `npm run typecheck`
- `npm run lint`
- `npx expo export --platform web`
- `npm audit --audit-level=high`: zero vulnerabilities.
- `git diff --check`
- No listeners remained on ports 3333, 8001, or 8081.

## Important Implementation Notes

- Do not recreate `requirements.md`.
- Do not scaffold a second app.
- Do not rebuild the mock backend.
- Do not depend on specialist chat history as source of truth; use repo commits, `memory/`, and this handoff file.
- Playwright/browser/local-service verification gets one attempt with a hard
  3-minute tool timeout. Stop spawned processes and finish the handoff after
  any timeout or repeated environment failure.
- Do not automatically start or download a real `faster-whisper` model for
  verification. Real-model checks require explicit user approval.
- Stop any local dev servers you start unless explicitly told to leave them running.
- Commit approved changes or ask for review/commit approval; do not leave silent dirty work.

## Current Product Direction

The app is iOS-first and should feel like:

1. Open app.
2. Speak naturally.
3. App infers/transforms intent.
4. User gets a useful output.
5. User edits, copies, shares, or exports.

The current mock flow intentionally skips the old playback/transcribe review page. After recording stops, it moves directly through processing to the output preview.

## Not Built Yet

- End-to-end real-model transcription check with explicit user approval.
- Physical iPhone upload check.
- Real AI generation provider.
- Local persistent history.
- Native share/export implementation.
- Notion share/export path.
- Auth.
- Payments/subscriptions.
- Analytics.
- TestFlight/iOS device build.
- Automated frontend interaction tests.

## Recommended Next Steps

1. Review and commit the combined local transcription milestone.
2. Run a bounded real-model and device/web integration check with explicit user
   approval.
3. Real structured generation provider integration.
4. Local history and share/export.
5. Automated frontend interaction testing.
6. Privacy and release readiness.

## Suggested Fresh Chat Instruction

```text
Read HANDOFF.md first, then AGENTS.md, memory/current-state.md, product-context.md, requirements.md, ux-flow.md, and task-agents/README.md.

Review the uncommitted complete local transcription milestone. The provider
seam, multipart backend route, localhost faster-whisper sidecar, Expo multipart
client, retry retention, explicit mock fallback, and automated tests are
implemented. Do not start or download a real model during automatic
verification.
```
