# Backend Agent

Canonical brief:

- [task-agents/backend/AGENT.md](../../task-agents/backend/AGENT.md)

Mission:

- Build secure backend foundations for audio upload, transcription, generation, usage tracking, and future integrations.

Start with:

- [[../current-state|Current State]]
- [[../decisions/cloud-first-processing|Cloud-First Processing]]
- [[voice-ai|Voice AI Agent]]
- [[privacy-release|Privacy Release Agent]]

Current status:

- Mock backend API skeleton is implemented and committed.
- Backend supports `GET /api/health`, `POST /api/transcriptions`, and `POST /api/generations`.
- Backend JSON parsing, structured `internal_error`, simulated failure paths, tests, build, lint, typecheck, and high-severity audit checks have passed.

Do not overbuild integrations before the core voice-to-output loop works.
