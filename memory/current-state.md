# Current State

Last updated: 2026-08-01

## Product

AI Voice Notes To Content is an iOS-first app that turns messy spoken thoughts into useful structured outputs.

Core promise: **Say it once. Use it everywhere.**

The MVP should let a user record a voice note, transcribe it, transform it into one of five output types, edit it, save it, copy/share/export it, and get content into Notion through the native iOS Share Sheet.

## Current Phase

Planning is complete enough to continue implementation.

The frontend-first implementation has produced the first mock app, backend foundation, frontend-to-mock-backend connection, and initial UI polish:

1. Expo / React Native / TypeScript has been scaffolded.
2. The Lovable mock flow has been ported into a clickable mobile UI.
3. The mock flow covers permission denied, active recording, direct transcription/generation processing after recording, retryable failure states, output editing, history, and settings.
4. Lint/test/typecheck scripts exist at the root.
5. A mock Node/TypeScript backend exists under `backend/` with health, transcription, and generation endpoints.
6. Backend JSON parsing, structured errors, contract tests, and mock failure simulations have been reviewed and polished.
7. The frontend calls the local mock backend for transcription and generation when available, with local mock fallbacks retained.
8. The UI now uses Geist as a web-preview font and Expo vector icons for controls.
9. Voice AI output contracts now define structured payloads for all five MVP types, deterministic intent routing, runtime validation/sanitization, golden fixtures, and contract tests.
10. Real Expo microphone permission, recording start/stop/cancel, temporary asset retention, permission recovery, and audio cleanup are implemented behind a provider-independent session.
11. The Node backend now has a provider-neutral transcription boundary,
    deterministic mock provider, localhost `LocalFasterWhisperProvider`,
    bounded multipart upload validation, safe error mapping, and temporary-file
    cleanup.
12. A persistent localhost-only FastAPI `faster-whisper` service now exists
    under `services/local-transcription/`, defaults to `base.en` on CPU
    `int8`, reuses one model instance, and has fake-model tests that require no
    model download.
13. The Expo app now uploads the retained recording as multipart audio using a
    configurable API base URL, preserves it after upload/transcription failure,
    reuses it for retry, and deletes it only after accepting a valid transcript.
14. Mock transcription fallback is disabled by default and requires explicit
    development configuration and user action.
15. Provider-neutral structured generation now supports the deterministic local
    formatter and an OpenAI Responses API provider selected once at backend
    startup.
16. The post-transcription confirmation page is restored so the inferred output
    type is visible and `Change Type` remains reachable before generation.
17. The transcript-grounded local formatter is now behind the same
    `GenerationProvider` boundary as the real provider.
18. Native Expo `HIGH_QUALITY` recording metadata is centralized as
    `.m4a`/`audio/mp4`, including Android `content://` and extensionless URIs.
19. Upload diagnostics now use safe format metadata and request correlation IDs
    without logging audio URIs, bytes, transcripts, prompts, or provider bodies.
20. Multipart validation requires the extension and MIME type to agree while
    accepting supported mobile MPEG-4 aliases.
21. A durable five-output fixture matrix covers explicit, implicit,
    change-type, sparse, and long transcript cases for all MVP output types.
22. The OpenAI provider uses strict Structured Outputs, runtime contract
    validation, bounded timeout, one narrow transient retry, safe error mapping,
    and no silent local fallback.
23. Real transcription remains confirmed on web. The Android Expo Go metadata
    defect is implemented but still requires the user-run device acceptance
    check. Real-provider generation also requires optional user-approved paid
    smoke verification.
24. Persistent native history now stores generated-output-only records,
    encrypts them with XChaCha20-Poly1305, and keeps the encryption key in
    device-only SecureStore. Raw transcripts, audio references, provider
    payloads, and warnings are not retained.
25. History now supports save/update, restart restoration on native devices,
    read-only detail, confirmed individual deletion, confirmed delete-all, and
    corruption-safe failure without overwriting unreadable data.
26. Copy uses Expo Clipboard and Share / Export opens the native Share Sheet
    with Markdown-friendly text for Notion or other destinations. Visible edits
    are copied or shared even before Save.
27. Web preview history is session-only to avoid persisting sensitive generated
    content in unencrypted browser storage.
28. Independent structured review of the history/export milestone returned
    `APPROVE WITH FOLLOW-UPS`; remaining gaps are user-run automated commands
    and physical-device acceptance.

`requirements.md` is already implementation-ready for frontend increments. Frontend agents should not recreate requirements or stop at planning-only output.

## Owner pause (2026-08-01)

The owner postponed this project. Do not resume the pending verification or
commit work, and do not archive the repository, unless the owner explicitly
chooses one of those actions. The current uncommitted local work must be
preserved unchanged while paused.

Next task when resumed:

- Run the bounded automated verification commands listed in
  `task-agents/testing/immediate-flow-reliability-checklist.md`.
- Verify save, restart restoration on Android/iOS, read-only reopen, copy,
  Share / Export to Notion, individual delete, and delete-all.
- Complete the Android Expo Go and web acceptance matrix with the local
  transcription services already running.
- Optionally approve one paid OpenAI smoke call after automated verification.
- Review the diff and commit only after the structured review verdict is
  accepted.

## Stack Decision

Recommended MVP stack:

- React Native with Expo.
- Lightweight backend for transcription and AI generation.
- Local database for history.
- Native share sheet for v1 export.

See [[architecture/planned-system-overview|Planned System Overview]].

## Active Decisions

- [[decisions/lovable-design-final|Lovable Design Final]]
- [[decisions/frontend-first-build-order|Frontend-First Build Order]]
- [[decisions/cloud-first-processing|Cloud-First Processing]]
- [[decisions/native-share-sheet-v1|Native Share Sheet v1]]
- [[decisions/agent-folder-workflow|Agent Folder Workflow]]

## Active Agents

- [[agents/lead-developer|Lead Developer]] coordinates project memory, roadmap, prompts, reviews, and commits.
- [[agents/frontend|Frontend]] owns the Expo UI and Lovable mock flow.
- [[agents/backend|Backend]] owns secure provider-mediated APIs.
- [[agents/voice-ai|Voice AI]] owns transcription, intent routing, output schemas, and prompt contracts.
- [[agents/testing|Testing]] owns automated and manual QA gates.
- [[agents/reviewer|Reviewer]] owns independent diff review, severity-ranked findings, and pre-commit approval verdicts.
- [[agents/product-ux|Product UX]] owns UX coherence and copy decisions.
- [[agents/privacy-release|Privacy Release]] owns privacy, TestFlight, and App Store readiness.
- [[agents/research-planning|Research Planning]] researches options and writes implementation plans.

## Immediate Context Packs

- [[context-packs/frontend-scaffold|Frontend Scaffold Context Pack]]

## Recent Coordination Log

- [[sessions/2026-05-31-lead-project-memory-graph|Lead Project Memory Graph]]
- [[sessions/2026-05-31-lead-agent-coordination-log|Lead Agent Coordination Log]]
- [[sessions/2026-06-01-frontend-agent-stale-verification|Frontend Agent Stale Verification]]
- [[sessions/2026-06-01-frontend-backend-connection-recovered|Frontend Backend Connection Recovered]]
- [[sessions/2026-06-04-chat-handoff-ui-polish|Chat Handoff UI Polish]]
- [[sessions/2026-06-07-android-flow-review|Android Flow Review]]

## Installed Project Skills

- `transitions-dev` is installed under `.agents/skills/transitions-dev` for smooth UI motion guidance. Frontend work should use it as a transition catalog and translate CSS/web examples into Expo/React Native animation patterns.

## Read Protocol

For new specialist chats:

1. Read this file.
2. Read the relevant `task-agents/<agent>/AGENT.md`.
3. Read the task prompt.
4. Follow memory links only when needed.
5. Read long files such as `requirements.md` and `ux-flow.md` when the task requires exact requirements.

## Commit Discipline

Agents that change files must commit approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.

## Verification Execution

The user runs test/build/lint/typecheck/service commands by default because
agent-started commands can appear stuck with no response in this workspace.
Agents provide exact commands, expected duration, and stop thresholds, then use
the user's pasted results as evidence.

Latest evidence:

- `npm run backend:test`: 52/52 tests passed across 8 suites on 2026-06-07.
- `npm run transcription:test`: 9/9 tests passed in 0.90 seconds on
  2026-06-07. One upstream Starlette pending-deprecation warning remains.
- `npm run recording:test`, `npm run frontend:test`, `npm run typecheck`, and
  `npm run lint`: user-confirmed passing on 2026-06-07.

## Owner archive (2026-08-02)

The owner archived all app work for now. Preserve the repository and its uncommitted local work unchanged. Do not resume pending verification, commit work, paid checks, deployment, or release preparation without explicit owner instruction.
