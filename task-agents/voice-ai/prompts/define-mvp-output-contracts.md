# Voice AI Agent Task: Define MVP Output Contracts

## Role

Act as the Voice AI specialist for AI Voice Notes To Content. Own the structured generation and intent-routing contract for the five MVP output types.

## Context To Read

Read these files before changing anything:

- `AGENTS.md`
- `product-context.md`
- `memory/current-state.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/backend/AGENT.md`
- `task-agents/frontend/AGENT.md`
- `backend/src/types.ts`
- `backend/src/contracts.ts`
- `backend/src/mockData.ts`
- `backend/src/services/generationService.ts`
- `backend/test/api.test.ts`
- `src/types/index.ts`
- `src/api/mockBackendClient.ts`
- `src/mock/mockData.ts`

Use the ordered stack in `task-agents/voice-ai/AGENT.md`: `eval-harness`,
`ai-regression-testing`, `tdd-workflow`, and `verification-loop`.

## Goal

Define and implement predictable, provider-independent contracts for intent routing and structured generation across:

- Note
- Todo List
- Email
- Journal Entry
- Content Post

The contracts must be safe for backend validation and give the frontend enough information to render and edit outputs consistently.

## Scope

You may:

- Add shared or backend contract/schema modules using the repository's existing TypeScript patterns.
- Refine generation and transcription response types.
- Add runtime validation for generated structured output.
- Add intent-routing rules and a deterministic MVP routing implementation.
- Add golden fixtures and focused tests.
- Update mock data and existing API tests to use the new contracts.
- Add a concise contract document under `docs/` if it materially clarifies field semantics, routing precedence, ambiguity behavior, and provider expectations.
- Update `requirements.md` only if implementation reveals a necessary product decision or naming mismatch.

Do not:

- Integrate a real transcription or generation provider.
- Add API keys, dependencies, authentication, storage, analytics, or payments.
- Redesign the frontend or recording flow.
- Rebuild the backend.
- Make unrelated refactors.
- Commit changes before lead-developer or reviewer approval.

## Required Behavior

### Canonical naming

Resolve the current naming difference between product names (`todo_list`, `journal_entry`, `content_post`) and implementation names (`todo`, `journal`, `content`). Choose one canonical API representation and document any UI aliases or compatibility mapping.

### Common output envelope

Every generated output must have stable shared fields sufficient for the current UI:

- Unique identifier
- Output type
- Editable title
- Editable/renderable body or a deterministic body projection
- Short preview
- Creation timestamp or a clearly documented temporary mock equivalent
- Schema/version identifier
- Structured payload specific to the selected output type
- Plain-language warnings for ambiguity or missing information, when relevant

Do not include provider-specific response fields in the public app contract.

### Output-specific schemas

Model the requirements in `requirements.md` without inventing unsupported facts:

- Note: summary, main points, optional next steps.
- Todo List: actionable tasks, optional explicit due dates, optional priority suggestions, ambiguity flags.
- Email: subject, greeting, body, closing; no invented commitments.
- Journal Entry: entry body, optional supported mood/theme, optional tomorrow focus; no diagnosis.
- Content Post: hook, draft/script, optional caption, optional CTA; no fabricated claims.

Prefer a discriminated union or similarly safe TypeScript structure. Optional fields must be genuinely optional, not empty-string placeholders.

### Intent routing

Implement and test this precedence:

1. A user-selected output type wins.
2. An explicit spoken request wins over inference.
3. Otherwise infer the best output type.
4. If confidence is weak or signals conflict, return a safe default suggestion with uncertainty metadata so the UI can offer `Change Type`.

The router must recognize clear natural-language requests for all five MVP types. Keep the implementation deterministic and provider-independent for now; do not present keyword matching as final AI classification.

### Validation and failure behavior

- Reject malformed or mismatched structured payloads.
- Reject unsupported output types.
- Keep user-facing errors free of provider details.
- Preserve the transcript for generation retry.
- Distinguish invalid provider output from transient generation failure if the existing error model can support that without broad refactoring.
- Do not log raw transcripts or generated content.

## TDD And Golden Examples

Write failing tests first for the contract and routing behavior, then implement the minimum code to pass.

Provide at least:

- One valid golden example for each output type.
- One malformed example per schema family or enough malformed cases to prove discriminated validation works.
- Explicit-intent routing examples for each output type.
- A user-selection override example.
- At least two ambiguous/inferred routing examples.
- A conflict example proving explicit intent precedence.
- Tests proving unsupported inventions such as fabricated dates are represented as warnings/ambiguity rather than silently added.

Golden examples should be realistic voice-note transformations and must not rely on external APIs.

## Compatibility

The current frontend expects `id`, `outputType`, `title`, `body`, `preview`, and `createdAtLabel`. Preserve a clean compatibility path while introducing structured payloads. Avoid forcing a UI redesign in this task.

The current mock backend endpoints are:

- `POST /api/transcriptions`
- `POST /api/generations`

Keep them working unless a narrow, well-tested contract change is necessary.

## Verification

Run the relevant checks, including at minimum:

```text
npm run typecheck
npm run lint
npm test
npm run backend:test
npm run backend:build
git diff --check
```

Also inspect the final diff for accidental transcript/content logging, provider coupling, unrelated changes, and duplicated source-of-truth types.

## Handoff

Do not commit. Ask for review and commit approval after verification.

Before you finish, report:

- Skill used
- What you changed
- What you verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt
