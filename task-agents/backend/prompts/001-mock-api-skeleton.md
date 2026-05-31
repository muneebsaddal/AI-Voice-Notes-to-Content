# Backend Agent Prompt: Mock API Skeleton

You are the Backend Agent for the `AI Voice Notes To Content` repo.

You are starting from the project root:

`C:\Users\munee\Documents\development_workspace\apps_development\ai-voice-notes-to-content`

Your agent file is:

`task-agents/backend/AGENT.md`

## Context To Read First

Read these files before changing code:

- `AGENTS.md`
- `memory/current-state.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/privacy-release/AGENT.md`

Use relevant ECC/project skills:

- `backend-patterns` if available, for API structure and provider boundaries.
- `security-review` for secret handling, request validation, safe logging, and retention.
- `verification-loop` or `tdd-workflow` for tests and quality gates.

## Goal

Implement the first backend API skeleton with mocked transcription and generation endpoints so the frontend can later connect to stable contracts without real provider keys.

This task is mock-only. Do not integrate real OpenAI, Anthropic, Deepgram, Whisper, AssemblyAI, Notion, payments, auth, storage, or cloud services yet.

## Scope

Create a small backend foundation in this repo. Prefer a simple TypeScript Node API that can run locally beside the Expo app. Keep it boring, explicit, and easy to swap later.

Implement:

- A backend source folder, such as `backend/`, with clear server/app/module separation.
- A health endpoint.
- A mock transcription endpoint.
- A mock generation endpoint.
- Shared request/response types or schemas that the frontend can import later if reasonable.
- Mock data for all five MVP output types:
  - `note`
  - `todo`
  - `email`
  - `journal`
  - `content`
- Structured error responses for frontend states:
  - permission denied is frontend/local, not a backend error
  - recording upload failed
  - transcription failed
  - generation failed
  - unsupported output type
  - invalid request body
- Local development scripts in `package.json`, keeping existing Expo scripts working.
- Focused backend tests for API contracts and validation.

Suggested contracts:

- `GET /api/health`
  - Returns `{ "ok": true, "service": "voice-notes-api", "mode": "mock" }`

- `POST /api/transcriptions`
  - Accepts JSON mock input for now, for example:
    `{ "audioId": "mock-audio-1", "durationMs": 42000 }`
  - Returns:
    `{ "transcript": string, "language": "en", "durationMs": number, "suggestedOutputType": OutputType }`

- `POST /api/generations`
  - Accepts:
    `{ "transcript": string, "outputType": OutputType }`
  - Returns a generated output matching the frontend shape:
    `{ "id": string, "outputType": OutputType, "title": string, "body": string, "preview": string, "createdAtLabel": string }`

You may adjust these contracts if you find a better minimal shape, but document the final contract in `README.md` or a backend-specific docs file.

## Constraints

- Do not break the existing Expo frontend.
- Do not remove or rewrite existing frontend screens.
- Do not hardcode secrets.
- Do not add real provider keys, sample keys, or `.env` secrets.
- If you add `.env.example`, use placeholder names only.
- Avoid logging raw transcripts/audio content in normal request logs.
- Keep audio retention mocked and privacy-conscious. The mock API should not write uploaded audio files to disk unless the task absolutely requires it.
- Avoid broad unrelated refactors.
- Do not convert the whole repo to a monorepo unless truly necessary for this small step.
- If dependency installation is needed, use the smallest reasonable dependency set and explain why.

## Deliverables

Produce:

- Backend implementation files.
- Scripts to run and verify the backend locally.
- Tests for health, transcription, generation, invalid output type, and invalid request body.
- Documentation of local backend commands and endpoint contracts.
- Any necessary `.gitignore` additions for generated backend artifacts.

## Verification

Run all commands that apply after implementation:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- Any backend-specific test command you add
- Any backend-specific build/typecheck command you add
- Existing frontend export check if the dependency/script changes could affect it:
  `npx expo export --platform web`
- `npm audit --audit-level=high`

Also manually verify the mock API responds locally. Use PowerShell `Invoke-WebRequest` or `curl.exe` and include the important response snippets in your handoff.

## Commit Rule

After implementation and verification, commit the approved changes if the work is ready.

If you are unsure whether the lead/user wants the commit, ask for review and commit approval before finishing. Do not leave finished verified work uncommitted without saying exactly why.

## Handoff

Before you finish, report:

- Skill used
- What you changed
- What you verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt
