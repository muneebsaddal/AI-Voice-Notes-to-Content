# Implement Local Faster-Whisper Backend

## Role

Act as the existing Backend Agent. Implement the backend and local Python
transcription foundation for the real transcription increment.

You are not alone in the codebase. Do not revert changes made by others. Work
with the current repository state and keep edits within the assigned scope.

## Context To Read

Read these files before editing:

- `AGENTS.md`
- `product-context.md`
- `memory/current-state.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/research-planning/plans/real-transcription-integration.md`

Use the ordered stack in `task-agents/backend/AGENT.md`: `tdd-workflow`,
`security-review`, `ai-regression-testing`, and `verification-loop`.

## Goal

Implement Phases 1 through 4 and the backend/Python parts of Phase 6 from the
approved local faster-whisper integration plan:

- provider-neutral Node transcription boundary;
- deterministic mock provider for tests;
- startup provider selection;
- persistent localhost-only Python `faster-whisper` service;
- bounded multipart upload in the existing Node backend;
- `LocalFasterWhisperProvider`;
- documented Windows local-development workflow.

Preserve the existing public `TranscriptionResponse` and intent-routing
behavior.

## Ownership And Scope

You own:

- backend transcription provider modules and configuration;
- the existing backend transcription route and its tests;
- narrowly scoped multipart parsing and temporary-file handling;
- `services/local-transcription/**`;
- backend/Python environment examples and development documentation;
- package scripts needed to run or verify this backend increment.

Do not edit the Expo multipart upload flow in this task. Do not implement a
cloud provider or real structured generation. Do not redefine the five output
schemas or replace the recording session abstraction.

## Required Behavior

- `TRANSCRIPTION_PROVIDER=mock|local-faster-whisper`, selected once at startup.
- Unsupported provider configuration fails startup safely.
- `POST /api/transcriptions` accepts the planned multipart contract.
- Enforce a configurable 24 MB default limit while reading the request.
- Require exactly one supported audio file and a positive integer
  `durationMs`.
- Use OS temporary storage and delete backend files in `finally`.
- Never log audio bytes, transcript text, device URIs, filenames, Python error
  bodies, model cache paths, or stack traces in API responses.
- The Python service loads one model instance and reuses it.
- Python defaults: `base.en`, CPU, `int8`, `127.0.0.1:8001`.
- Normal automated tests must fake the model and require no model download.
- Sidecar connection refusal or timeout maps to
  `transcription_unavailable`.
- Invalid or empty inference results map to `transcription_failed`.
- Provider-specific fields must not leak into the mobile response.
- Keep any narrowly necessary JSON mock bridge only if existing tests require
  it, and document its removal path.

## Deliverables

- Production implementation for the assigned phases.
- Focused Node tests for provider selection, multipart validation, response
  stability, error mapping, routing, and temporary-file cleanup.
- Python tests for configuration, model reuse, segment consumption, health,
  upload validation, and safe failures.
- Pinned Python dependencies and a concise service README.
- Root/backend commands or documentation for starting the Python sidecar and
  Node backend on Windows.
- Any necessary `.env.example` updates without secrets.

## Verification

Run every applicable command:

```text
npm run typecheck
npm run lint
npm test
npm run backend:build
npm run backend:test
python -m pytest services/local-transcription/tests
npx expo export --platform web
npm audit --audit-level=high
git diff --check
```

Do not start a real model, inspect model caches, download model weights, or run
real-model inference as part of agent verification. Those checks require an
explicit user request. Give every local-service command a hard 3-minute timeout
and stop any process it starts before the handoff.

## Commit Rule

Do not commit. Leave the changes ready for lead-agent review.

## Handoff

Before you finish, report:

- Skill used
- What you changed
- What you verified, including exact pass/fail counts
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt
