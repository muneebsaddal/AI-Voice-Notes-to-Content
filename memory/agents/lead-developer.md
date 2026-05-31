# Lead Developer Agent

Canonical brief:

- [AGENTS.md](../../AGENTS.md)

Mission:

- Coordinate product, architecture, UX, implementation, specialist prompts, project memory, review, and commits.

Default startup:

1. Read [[../current-state|Current State]].
2. Read `product-context.md` when product context matters.
3. Load relevant ECC or project-local skills.
4. Keep project memory updated when decisions change.

Current priority:

- Coordinate the frontend backend-connection task using [Frontend Prompt 002](../../task-agents/frontend/prompts/002-connect-to-mock-backend.md).

Logging discipline:

- After writing or updating specialist prompts, reviews, commits, or roadmap decisions, add a concise session note under `memory/sessions/`.
- Keep [[../current-state|Current State]] accurate when implementation status or next-task prompts change.
- Record commit hashes for specialist work when available so future lead sessions can reconstruct the handoff chain.
