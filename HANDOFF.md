# AI Voice Notes To Content Handoff

Last updated: 2026-06-06

Use this file as the quick resume point for a fresh lead-developer chat. For deeper context, read `AGENTS.md`, `memory/current-state.md`, `product-context.md`, `requirements.md`, and `ux-flow.md`.

## Current Repo State

Latest completed feature commit before this handoff update:

- `05e1781` - Document local transcription development direction.

The working tree should be clean before new work starts. Confirm with:

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

## Important Implementation Notes

- Do not recreate `requirements.md`.
- Do not scaffold a second app.
- Do not rebuild the mock backend.
- Do not depend on specialist chat history as source of truth; use repo commits, `memory/`, and this handoff file.
- Playwright/browser verification should be timeboxed. If the browser bridge blocks progress, report the blocker and finish the handoff.
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

- Real audio upload to the backend.
- Local `faster-whisper` transcription integration.
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

1. Real audio upload and transcription:
   - multipart audio upload from the Expo app.
   - backend file-size/type validation.
   - provider-neutral Node transcription boundary.
   - localhost-only persistent Python `faster-whisper` service.
   - `base.en` on CPU `int8` as the development default.
   - preserve temporary audio for retry on upload/transcription failure.
   - delete temporary audio after successful transcription.
2. Real structured generation provider integration.
3. Local history and share/export.
4. Automated frontend interaction testing.
5. Privacy and release readiness.

## Suggested Fresh Chat Instruction

```text
Read HANDOFF.md first, then AGENTS.md, memory/current-state.md, product-context.md, requirements.md, ux-flow.md, and task-agents/README.md.

Confirm git status is clean. The current Expo mock UI, mock backend, Voice AI output contracts, and real recording lifecycle are implemented. Do not recreate requirements, scaffold another app, rebuild completed mock-backend wiring, redefine the five MVP output schemas, or replace the recording provider abstraction.

Implement the next increment from `task-agents/research-planning/plans/real-transcription-integration.md`: provider seam and localhost `faster-whisper` service first, preserving the existing response contract and privacy defaults.
```
