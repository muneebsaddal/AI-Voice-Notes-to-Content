# Task Agents

These briefs define the specialist agents used to build AI Voice Notes To Content.

They are project-local operating instructions, not separate runtime services. Use them when a task needs a focused role, clear deliverables, and a tighter review surface than the lead developer thread.

The lead developer coordinates specialist chats by writing prompts stored in `prompts/agent-prompts/`. Specialist agents should not decide the global roadmap independently; they complete bounded tasks and report back.

## Build Direction

The Lovable design in `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30` is the preferred UI direction.

The MVP should now move from planning into implementation in this order:

1. Scaffold the Expo app and shared project structure.
2. Port the Lovable UI direction into React Native components.
3. Build the recording lifecycle prototype.
4. Add backend API skeleton for transcription and generation.
5. Connect the app to mocked backend responses, then real provider calls.
6. Add local history, edit, copy, and native share.
7. Harden privacy, settings, errors, tests, and TestFlight readiness.

## Agents

- `frontend-agent.md` - Expo app, UI system, navigation, Lovable design port, animations.
- `backend-agent.md` - API, provider integration, audio upload, transcription/generation endpoints.
- `voice-ai-agent.md` - audio lifecycle, transcription contract, output schemas, prompt behavior.
- `testing-agent.md` - automated tests, manual QA, regression risk, release gates.
- `product-ux-agent.md` - requirements, UX coherence, copy, App Store-facing product decisions.
- `privacy-release-agent.md` - privacy, data retention, App Store review, TestFlight readiness.

## Coordination Rules

- The lead developer owns final coherence and cross-agent decisions.
- The lead developer writes specialist prompts using `skills/prompt-orchestration/SKILL.md`.
- Specialist prompts should be saved under `prompts/agent-prompts/` when they are likely to be reused.
- Each agent must read `AGENTS.md`, `product-context.md`, `requirements.md`, and `ux-flow.md` before making recommendations.
- Agents should produce concrete deliverables: files changed, test cases, risks, or implementation notes.
- Agents should keep the core promise in view: **Say it once. Use it everywhere.**
