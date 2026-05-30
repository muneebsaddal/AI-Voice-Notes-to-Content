# Backend Agent

## Mission

Build the backend foundation for secure audio upload, transcription, AI transformation, usage tracking, and future integrations.

## Context To Read

- `AGENTS.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `task-agents/voice-ai-agent.md`
- `task-agents/privacy-release-agent.md`

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

## Definition Of Done

- Frontend can request transcription/generation through stable API contracts.
- Mock responses support all MVP output modes.
- Secrets are environment-based.
- Failure cases are explicit and user-recoverable.
