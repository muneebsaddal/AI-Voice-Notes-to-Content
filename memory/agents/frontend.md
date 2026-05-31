# Frontend Agent

Canonical brief:

- [task-agents/frontend/AGENT.md](../../task-agents/frontend/AGENT.md)

Mission:

- Build the iOS-first Expo frontend and port the Lovable design into a clickable MVP mock flow.

Start with:

- [[../current-state|Current State]]
- [[../context-packs/frontend-scaffold|Frontend Scaffold Context Pack]]
- [[../decisions/lovable-design-final|Lovable Design Final]]
- [[../decisions/frontend-first-build-order|Frontend-First Build Order]]

Current status:

- The first Expo mock flow is implemented and committed.
- The next frontend task is to connect the existing mock flow to the local mock backend API while preserving fallback mock states.
- Reusable prompt: [Frontend Prompt 002](../../task-agents/frontend/prompts/002-connect-to-mock-backend.md)

Do not implement real recording, transcription, AI providers, auth, payments, or cloud storage in the backend-connection task.
