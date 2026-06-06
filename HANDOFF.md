# AI Voice Notes To Content Handoff

Last updated: 2026-06-06

Use this file as the quick resume point for a fresh lead-developer chat. For deeper context, read `AGENTS.md`, `memory/current-state.md`, `product-context.md`, `requirements.md`, and `ux-flow.md`.

## Current Repo State

Latest completed feature commit:

- `7b3c76c` - Add Voice AI output contracts.

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

- Real microphone recording.
- Real audio file handling/upload.
- Real transcription provider.
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

1. Real recording lifecycle/provider interfaces:
   - permission flow.
   - recording start/stop/cancel.
   - recording failed.
   - playback availability if needed.
   - provider abstraction without real keys if keys are not ready.
2. Backend real provider integration when environment keys are ready.
3. Local history and share/export.
4. Automated frontend interaction testing.
5. Privacy and release readiness.

## Suggested Fresh Chat Instruction

```text
Read HANDOFF.md first, then AGENTS.md, memory/current-state.md, product-context.md, requirements.md, ux-flow.md, and task-agents/README.md.

Confirm git status is clean. The current Expo mock UI, mock backend, and Voice AI output contracts are implemented through commit 7b3c76c. Do not recreate requirements, scaffold another app, rebuild completed mock-backend wiring, or redefine the five MVP output schemas.

Implement the next increment: real recording lifecycle/provider interfaces without real provider calls unless environment keys are already available.
```
