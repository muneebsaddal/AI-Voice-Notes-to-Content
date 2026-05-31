# Frontend Prompt 002 - Connect Mock Flow To Backend API

Use this prompt in a new specialist chat for the frontend agent.

```text
You are the Frontend Agent for AI Voice Notes To Content.

Working location:
- Work in this repo root:
  C:\Users\munee\Documents\development_workspace\apps_development\ai-voice-notes-to-content
- The new chat starts at the project root. Confirm your current working directory before changing files.
- Treat that folder as the project root for all paths and commands.
- Do not create or work in a different app/repo folder outside this project.

Your agent identity:
- You are the dedicated Frontend Agent, not the lead developer.
- Your canonical agent brief is:
  task-agents/frontend/AGENT.md
- Read that file before implementation and follow it as your role/scope contract.
- If instructions conflict, follow AGENTS.md first, then task-agents/frontend/AGENT.md, then this task prompt.

Current project status:
- Expo / React Native / TypeScript has already been scaffolded in the repo root.
- The Lovable UI direction has already been ported into a clickable iOS-first mock flow.
- The mock backend API has already been added under backend/.
- This task is not to recreate requirements, not to scaffold a second app, and not to redesign the UI.

Context to read before implementation:
- AGENTS.md
- memory/current-state.md
- product-context.md
- requirements.md
- ux-flow.md
- skills/README.md
- task-agents/README.md
- task-agents/frontend/AGENT.md
- README.md
- App.tsx
- src/screens/
- src/components/
- src/mock/
- src/theme/
- backend/src/types.ts
- backend/src/contracts.ts
- backend/src/app.ts
- backend/src/services/
- If visual reference is needed, inspect:
  tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30

Skills to use:
- Use frontend-design for UI integration judgment.
- Use .agents/skills/transitions-dev/SKILL.md for smooth transitions, then translate the ideas into Expo/React Native animation primitives.
- Use verification-loop before claiming the task is complete.
- Use e2e-testing or playwright if browser verification is available.
- If a bug or unexpected failure appears, use systematic-debugging before making broad changes.

Goal:
Connect the existing Expo frontend mock flow to the local mock backend API while preserving the polished Lovable-inspired UI and keeping mock fallbacks available.

Backend API:
- Default backend base URL: http://127.0.0.1:3333
- Health endpoint:
  GET /api/health
- Transcription endpoint:
  POST /api/transcriptions
  Request:
  { "audioId": "mock-audio-1", "durationMs": 42000 }
  Optional simulation:
  { "audioId": "mock-audio-1", "durationMs": 42000, "simulate": "transcription_failed" }
  or:
  { "audioId": "mock-audio-1", "durationMs": 42000, "simulate": "recording_upload_failed" }
- Generation endpoint:
  POST /api/generations
  Request:
  { "transcript": "Please turn this into something useful.", "outputType": "note" }
  Optional simulation:
  { "transcript": "Please turn this into something useful.", "outputType": "note", "simulate": "generation_failed" }
- Supported output types:
  note, todo, email, journal, content
- Supported backend error codes:
  recording_upload_failed, transcription_failed, generation_failed, internal_error, unsupported_output_type, invalid_request_body, not_found, method_not_allowed
- Permission denial remains a frontend/local state, not a backend error.

Implementation scope:
- Add a small typed frontend API client layer under src/, for example src/api/mockBackendClient.ts.
- Keep the base URL simple and easy to change. Use a local constant or existing project env pattern if one exists. Do not add secret handling.
- Wire the existing mock listening flow so the transcription step calls POST /api/transcriptions using a mock audio id and duration.
- Use the returned transcript and suggestedOutputType in the suggested output confirmation step.
- Wire the generation step so it calls POST /api/generations with the confirmed output type.
- Show the returned generated output in the existing output preview/edit screen.
- Preserve the current mock-only fallback behavior if the backend is not running or a network request fails.
- Map backend and network errors into the existing failure states:
  recording upload failed, transcription failed, generation failed, internal/server error, and network/backend unavailable.
- Keep Settings mock lifecycle previews usable.
- Keep the main listening control fixed in the same screen position across idle, listening, playback-ready, transcription processing, generation processing, and retry states.

Out of scope:
- Do not add real recording, real uploads, provider calls, auth, analytics, payments, subscriptions, cloud storage, or Notion integration.
- Do not redesign the UI.
- Do not touch backend code unless you find a direct contract bug that blocks frontend integration. If that happens, report it and ask before changing backend files.
- Do not rewrite requirements or product strategy documents unless a small README note is needed for changed commands/configuration.

UX and motion constraints:
- Preserve the iOS-first Lovable direction.
- Home remains a recording surface, not a dashboard.
- The first visible action remains the large central listening control.
- No recording timer.
- No prompt box as the primary UI.
- Use blue as the listening identity.
- Use red only for true errors or destructive actions.
- Use calm transitions for backend-driven state changes: processing, confirmation, output editor entry, retry errors, and fallback recovery.
- Respect reduced-motion/accessibility where the selected animation approach supports it.

Deliverables:
- Typed frontend API client for the mock backend.
- Frontend flow connected to transcription and generation endpoints.
- Error/fallback mapping from backend/network failures to existing UI states.
- Minimal docs update only if commands, ports, or env setup changed.
- No duplicated app scaffold.

Verification:
- Run the backend locally:
  npm run backend:dev
- Start the frontend as needed:
  npm run start
  or:
  npm run web
- Run:
  npm run typecheck
  npm run lint
  npm test
  npm run backend:test
  npm run backend:build
  npx expo export --platform web
  npm audit --audit-level=high
- If Playwright or browser tooling is available, verify:
  1. The app loads and is nonblank.
  2. The happy path reaches output preview using backend data.
  3. At least one backend/network failure falls back to the existing retry/error UI.
  4. A narrow iPhone-sized viewport has no obvious overlap or broken layout.
- Timebox Playwright/browser verification to 10 minutes. If the browser extension, profile, or MCP bridge blocks progress, stop waiting, report the blocker, and finish the handoff instead of hanging.
- Stop any backend, Expo, or browser helper processes you started unless the lead developer explicitly asks you to keep them running.
- Report any command you could not run and why.

Commit discipline:
- Do not silently leave file changes uncommitted.
- Do not end the task after starting Playwright or local dev servers without a final handoff.
- If the lead developer or a reviewer has approved the changes and asked you to commit, commit after verification and report the commit hash.
- If review has not happened yet, ask for review and commit approval before finishing.
- If waiting for review or commit approval, list the dirty files.
- Never commit secrets or local-only tokens.

Before you finish, report:
- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt
```
