# Task Agents

These folders define the specialist agents used to build AI Voice Notes To Content.

They are project-local operating instructions, not separate runtime services. Use them when a task needs a focused role, clear deliverables, and a tighter review surface than the lead developer thread.

The lead developer coordinates specialist chats by writing prompts stored beside the relevant agent, such as `task-agents/frontend/prompts/`. Specialist agents should not decide the global roadmap independently; they complete bounded tasks and report back.

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

- `frontend/AGENT.md` - Expo app, UI system, navigation, Lovable design port, animations.
- `backend/AGENT.md` - API, provider integration, audio upload, transcription/generation endpoints.
- `voice-ai/AGENT.md` - audio lifecycle, transcription contract, output schemas, prompt behavior.
- `testing/AGENT.md` - automated tests, manual QA, regression risk, release gates.
- `reviewer/AGENT.md` - independent diff review, findings, verification evidence, and approval verdict.
- `product-ux/AGENT.md` - requirements, UX coherence, copy, App Store-facing product decisions.
- `privacy-release/AGENT.md` - privacy, data retention, App Store review, TestFlight readiness.
- `research-planning/AGENT.md` - current research, option comparisons, implementation plans, and context packs.

## Folder Convention

Each specialist agent owns one folder:

- `AGENT.md` - role, scope, constraints, deliverables, definition of done.
- `prompts/` - reusable task prompts for that specific agent.
- `handoffs/` - optional summaries from completed specialist chats.

The `prompts/` and `handoffs/` folders may be created when needed. Do not add empty placeholder folders just for appearance.

## Agent Brief Standard

Each `AGENT.md` should include:

- Mission
- Context to read
- Ordered skill stack
- Scope
- Constraints
- Deliverables
- Verification
- Handoff format
- Definition of done

Specialist agents should use relevant ECC skills by default. They should load only what they need, then report the skill used in their handoff.

## Skill Selection Order

All task agents use the project hierarchy in `skills/README.md`:

1. ECC skills first.
2. Superpowers skills second when they add review or execution rigor.
3. Other installed, plugin, or project-local skills last.

Each specialist brief lists a role-specific stack. Agents should not load every listed skill. Select the smallest set that covers the assigned task and explain the selection in the handoff.

## Review Workflow

Implementation and review are separate responsibilities:

1. The implementing agent runs relevant narrow tests and `verification-loop`.
2. The lead or reviewer inspects the diff using `.agents/skills/structured-code-review/SKILL.md`.
3. Medium- and high-risk changes should be reviewed by an agent that did not implement them when available.
4. `security-review` is mandatory for audio handling, uploads, user-controlled input, secrets, storage, retention, privacy, external providers, and release-sensitive configuration.
5. `ai-regression-testing` is mandatory for mock/real provider parity, output contracts, fallback behavior, retry behavior, and fixed regressions.
6. The reviewer returns severity-ranked findings, verification evidence, test gaps, and an explicit verdict.

No-findings reviews must say that directly. Review summaries without file/line evidence, verification, and a verdict do not satisfy the review gate.

## Test Command Ownership

- By default, specialist agents provide exact verification commands for the
  user to run rather than launching them.
- Include expected duration and the point at which the user should stop a
  command that returns no output.
- Accept current pasted terminal results as evidence; do not rerun passing
  commands.
- Agents may still use read-only inspection commands.
- Agent-run test or service commands require an explicit user request or a
  task-specific reason stated before execution.

## Coordination Rules

- The lead developer owns final coherence and cross-agent decisions.
- The lead developer writes specialist prompts using `skills/prompt-orchestration/SKILL.md`.
- Specialist prompts should be saved under `task-agents/<agent>/prompts/` when they are likely to be reused.
- Each agent must read `AGENTS.md`, `memory/current-state.md`, its own `task-agents/<agent>/AGENT.md`, and the assigned prompt before starting.
- Agents should read `product-context.md`, `requirements.md`, `ux-flow.md`, `skills/README.md`, this file, and relevant `memory/context-packs/` when the task needs that detail.
- Agents should produce concrete deliverables: files changed, test cases, risks, or implementation notes.
- Agents should keep the core promise in view: **Say it once. Use it everywhere.**
- Agents must follow the review and skill hierarchy in `skills/README.md`.
- Agents that change files must commit approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.
- Every handoff should include the skills used in priority order, what changed, what was verified, files touched, review status, commit status, risks/open questions, and the recommended next task prompt.
