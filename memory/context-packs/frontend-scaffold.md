# Frontend Scaffold Context Pack

Use this for the first Frontend Agent implementation task.

Required reading:

1. [[../current-state|Current State]]
2. [task-agents/frontend/AGENT.md](../../task-agents/frontend/AGENT.md)
3. [task-agents/frontend/prompts/001-scaffold-and-lovable-port.md](../../task-agents/frontend/prompts/001-scaffold-and-lovable-port.md)
4. [[../decisions/lovable-design-final|Lovable Design Final]]
5. [[../flows/mvp-voice-to-output|MVP Voice To Output]]
6. [.agents/skills/transitions-dev/SKILL.md](../../.agents/skills/transitions-dev/SKILL.md)

Important source files when exact details are needed:

- [requirements.md](../../requirements.md)
- [ux-flow.md](../../ux-flow.md)
- Lovable reference folder: `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30`

Implementation boundaries:

- Build a clickable mock frontend first.
- Use mock state and mock data.
- Do not connect real recording, transcription, AI, auth, subscriptions, analytics, or backend APIs.
- Keep the central listening control stable across idle, recording, and processing states.
- Keep the home screen minimal and recording-first.
- Use `transitions-dev` as a motion catalog and timing/easing reference, but translate CSS/web snippets into Expo/React Native animation patterns.

Expected deliverables:

- Expo / React Native / TypeScript scaffold.
- Reusable `ListeningOrb` or equivalent.
- Theme tokens.
- Motion tokens or animation helpers for consistent smooth transitions.
- Mock screens for the MVP flow.
- Verification notes and commit status.
