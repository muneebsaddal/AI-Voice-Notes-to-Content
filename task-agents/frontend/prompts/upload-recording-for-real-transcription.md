# Upload Retained Recording For Real Transcription

## Role

Act as the existing Frontend Agent. Connect the retained Expo recording asset
to the tested multipart transcription endpoint without replacing the recording
session abstraction or changing the established UI direction.

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
- `task-agents/frontend/AGENT.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/research-planning/plans/real-transcription-integration.md`

Inspect the backend implementation and tests before coding so the frontend uses
the exact accepted multipart field names and error codes.

Use `frontend-design`, `tdd-workflow`, and `verification-loop` where available.

## Goal

Implement Phase 5 of the local faster-whisper integration plan:

- upload the retained `RecordingAsset` as multipart data;
- use the configured backend URL;
- preserve the recording on every failed upload or transcription;
- discard it only after a valid transcription response is accepted;
- continue through the existing generation and output flow;
- make mock transcription fallback explicit rather than silent.

## Ownership And Scope

You own:

- the frontend API client modules;
- `App.tsx` transcription orchestration and error mapping;
- focused frontend/API tests and required test scripts;
- frontend environment documentation or `.env.example` entries.

Do not modify the backend or Python sidecar. Do not replace
`RecordingSession`, `useExpoRecordingSession`, the five output schemas, or the
Lovable-derived UI. Avoid unrelated visual changes.

## Required Behavior

- Build `FormData` from the current retained `RecordingAsset`.
- Append `file`, positive integer `durationMs`, optional `audioId`, and optional
  language metadata supported by the backend.
- Let `fetch` set the multipart boundary.
- Use `EXPO_PUBLIC_API_BASE_URL`, with a development default documented.
- Handle web `webm` and native iOS file URIs/MIME metadata.
- Retry must reuse the same retained asset.
- Network, timeout, upload, provider-unavailable, and transcription failures
  must not discard the asset.
- Discard only after a validated successful transcription response.
- Map `transcription_unavailable` to clear retry guidance.
- Do not silently substitute a mock transcript. Mock fallback must require an
  explicit development flag and remain a deliberate user action.
- Preserve the existing `TranscriptionResponse`, intent-routing, generation,
  and output-preview behavior.

## Deliverables

- Production multipart upload implementation.
- Focused tests for payload construction, configured base URL, success cleanup,
  failure retention, retry reuse, error mapping, and explicit mock fallback.
- Updated environment/developer documentation.

## Verification

Run:

```text
npm run typecheck
npm run lint
npm test
npm run backend:build
npm run backend:test
npx expo export --platform web
npm audit --audit-level=high
git diff --check
```

An optional manual web upload check gets one attempt with a hard 3-minute tool
timeout. Use a fake or already-running sidecar only; do not start or download a
real Whisper model. Stop every process started for the check and report a
timeout or environment failure without retrying.

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
