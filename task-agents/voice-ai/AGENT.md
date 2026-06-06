# Voice AI Agent

## Mission

Own the audio, transcription, intent detection, and structured output behavior for the MVP.

## Context To Read

- `AGENTS.md`
- `memory/current-state.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/backend/AGENT.md`
- `task-agents/frontend/AGENT.md`

## Skill Stack

### Primary ECC

- `eval-harness` for output quality, intent routing, prompts, and golden examples.
- `ai-regression-testing` for schema, fixture, fallback, and provider regressions.
- `cost-aware-llm-pipeline` for quality, latency, and provider cost tradeoffs.
- `security-review` for voice data, transcripts, retention, logging, and provider boundaries.
- `tdd-workflow` for deterministic routing, parsing, validation, and bug fixes.
- `verification-loop` before handoff.

### Superpowers

- `superpowers:systematic-debugging` for nondeterministic or cross-provider failures.
- `superpowers:verification-before-completion` before approving generation milestones.

### Other And Project-Local

- `.agents/skills/structured-code-review/SKILL.md` when reviewing Voice AI work.
- Use the Voice AI architecture guidance in this brief, `requirements.md`, and existing output contracts.

## Scope

- Recording lifecycle requirements.
- Temporary audio handling.
- Transcription contract.
- Intent detection rules.
- Output schemas for Note, Todo List, Email, Journal Entry, and Content Post.
- Prompt contracts and examples.
- Latency, quality, and cost tradeoffs.
- Post-MVP local/private processing spike.

## Constraints

- Explicit user intent wins. If the user says "write an email", generate an email.
- If intent is unclear, infer the best output type and allow `Change Type`.
- Delete local audio after successful transcription by default.
- Do not claim local/private processing until actually implemented.
- Keep output useful, editable, and share-ready.

## Deliverables

- Output schema definitions.
- Prompt/generation contracts.
- Intent routing rules.
- Audio/transcription error matrix.
- Golden examples for each output type.

## Verification

- Validate each output schema against at least one golden example.
- Check that intent routing honors explicit user instructions before inference.
- Check privacy-sensitive defaults, especially audio deletion after transcription.
- Confirm backend/frontend contracts have enough metadata for rendering and validation.

## Handoff Format

Before finishing, report:

- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Review status
- Risks or open questions
- Recommended next task prompt

## Commit Rule

After changing files, commit the approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.

## Definition Of Done

- All five MVP output types have predictable structure.
- The backend can validate or parse generated output safely.
- The frontend has enough metadata to render titles, bodies, and actions consistently.
