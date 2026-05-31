# Backend Agent

## Mission

Build the backend foundation for secure audio upload, transcription, AI transformation, usage tracking, and future integrations.

## Context To Read

- `AGENTS.md`
- `memory/current-state.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/privacy-release/AGENT.md`

## Relevant Skills

- Use `backend-patterns` for API structure and provider boundaries when available.
- Use `security-review` for secret handling, request validation, retention, and logging.
- Use `tdd-workflow` or `verification-loop` for API contracts and risky parsing behavior.

## Scope

- Backend API architecture.
- Audio upload endpoint.
- Transcription endpoint or job flow.
- AI generation endpoint for five MVP output types.
- Provider abstraction for transcription and text generation.
- Environment variables and secret handling.
- Basic usage accounting hooks.
- Error responses suitable for the mobile app.

## Constraints

- API keys must never ship in the mobile app.
- Do not store audio longer than required for the MVP flow.
- Keep provider choices swappable.
- Return structured responses that the frontend can render consistently.
- Do not overbuild direct integrations before the core voice-to-output loop works.

## Deliverables

- Backend scaffold.
- API route contracts.
- Provider adapter interfaces.
- Mock mode for frontend development.
- Real provider wiring once keys/environment are available.
- Backend test plan and basic tests for risky parsing/data handling.

## Verification

- Run backend tests, typecheck, lint, and build commands that exist.
- Verify mock transcription and generation responses cover all five MVP output types.
- Verify provider secrets are environment-based and never exposed to the app.
- Verify error responses are structured and safe for user display.

## Handoff Format

Before finishing, report:

- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt

## Commit Rule

After changing files, commit the approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.

## Definition Of Done

- Frontend can request transcription/generation through stable API contracts.
- Mock responses support all MVP output modes.
- Secrets are environment-based.
- Failure cases are explicit and user-recoverable.
