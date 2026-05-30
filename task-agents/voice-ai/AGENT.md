# Voice AI Agent

## Mission

Own the audio, transcription, intent detection, and structured output behavior for the MVP.

## Context To Read

- `AGENTS.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `task-agents/backend/AGENT.md`
- `task-agents/frontend/AGENT.md`

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

## Definition Of Done

- All five MVP output types have predictable structure.
- The backend can validate or parse generated output safely.
- The frontend has enough metadata to render titles, bodies, and actions consistently.
