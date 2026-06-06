# AI Voice Notes To Content

An iOS-first app that turns messy spoken thoughts into useful structured outputs.

**Say it once. Use it everywhere.**

## Overview

AI Voice Notes To Content is designed to help users record a natural voice note and transform it into the thing they actually needed:

- A clean note
- A todo list
- A polished email
- A journal entry
- A content post
- A meeting summary
- A client follow-up
- A Notion-ready entry

The goal is not simple transcription. The goal is turning thought into action with as little friction as possible.

## Current Status

The current app is an Expo / React Native / TypeScript implementation that
ports the final Lovable direction into the first MVP flow. Real Expo microphone
permission and recording retention are implemented. The backend now has a
provider-neutral transcription boundary, bounded multipart audio upload, and a
localhost `faster-whisper` provider plus a tested Python sidecar. The frontend
uploads retained recordings as multipart audio. Native Expo `HIGH_QUALITY`
recordings are sent as `.m4a`/`audio/mp4`, including opaque Android content
URIs. The backend also has provider-neutral structured generation with a local
formatter and an OpenAI Responses API provider. Auth, payments, analytics,
history storage, and native exports are not wired yet.

Current flow:

1. Permission pre-prompt
2. Permission denied retry state
3. Recording home
4. Active listening
5. Transcription processing
6. Generation processing
7. Retryable recording, transcription, and generation failure states
8. Output preview/edit
9. Change output type sheet
10. History sheet
11. Settings with mock lifecycle previews

## Local Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Frontend environment variables:

```text
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3333
EXPO_PUBLIC_ENABLE_MOCK_FALLBACK=false
```

For a physical iPhone, set `EXPO_PUBLIC_API_BASE_URL` to the laptop's trusted
LAN address. Mock fallback is disabled by default and must be explicitly
enabled for frontend-only development.

Typecheck:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Test:

```bash
npm test
```

Build the mock backend:

```bash
npm run backend:build
```

Run the mock backend locally:

```bash
npm run backend:dev
```

The local backend listens on `http://127.0.0.1:3333` by default. Set `PORT` or
`HOST` for a different local binding. It supports a mock transcription provider
and a localhost `faster-whisper` provider. See
`services/local-transcription/README.md` for the Windows setup.

Generation configuration:

```text
GENERATION_PROVIDER=local
GENERATION_TIMEOUT_MS=15000
```

For real AI generation, set:

```text
GENERATION_PROVIDER=openai
OPENAI_API_KEY=your-server-side-key
OPENAI_GENERATION_MODEL=your-structured-output-capable-model
```

The model is configuration-driven. The OpenAI provider uses the Responses API
with strict JSON Schema, does not store responses, retries only transient
network, rate-limit, and provider 5xx failures, and never falls back silently
to the local formatter.

The Expo app uploads the retained recording as multipart `file`, `durationMs`,
and `audioId`. It keeps the recording after upload/provider failures for retry
and deletes it only after accepting a valid transcript. Development diagnostics
include only safe format metadata, byte size when available, and a request ID,
never audio URIs, audio contents, or transcript text. The backend JSON
transcription request remains a temporary compatibility bridge for older test
and development callers.

## Mock Backend API

`GET /api/health`

Returns:

```json
{ "ok": true, "service": "voice-notes-api", "mode": "mock" }
```

`POST /api/transcriptions`

The real-audio contract accepts `multipart/form-data`:

- `file`: exactly one supported audio file
- `durationMs`: required positive integer
- `language`: optional language hint
- `audioId`: optional client correlation identifier

Supported extensions are `m4a`, `mp4`, `wav`, `webm`, `mp3`, `mpeg`, and
`mpga`. The default total request limit is 24 MB.

The temporary mock bridge also accepts:

```json
{ "audioId": "mock-audio-1", "durationMs": 42000 }
```

Returns:

```json
{
  "transcript": "Quick note before Thursday...",
  "language": "en",
  "durationMs": 42000,
  "suggestedOutputType": "email"
}
```

`POST /api/generations`

Accepts:

```json
{ "transcript": "Please turn this into something useful.", "outputType": "note" }
```

`outputType` must be one of `note`, `todo`, `email`, `journal`, or `content`.

Returns:

```json
{
  "id": "mock-note-1",
  "outputType": "note",
  "title": "Thursday Workshop Plan",
  "body": "Summary\nOpen Thursday's workshop...",
  "preview": "Open with onboarding flow, then move into pricing discussion.",
  "createdAtLabel": "Today"
}
```

Structured errors use:

```json
{ "error": { "code": "invalid_request_body", "message": "Invalid request body." } }
```

Transcription errors include `invalid_request_body`, `unsupported_audio_type`,
`audio_too_large`, `recording_upload_failed`, `transcription_unavailable`, and
`transcription_failed`. Generation errors include `generation_failed`,
`generation_unavailable`, `generation_configuration_error`, and
`invalid_generated_output`. Other API errors include `internal_error`,
`unsupported_output_type`, `not_found`, and `method_not_allowed`. Permission
denial remains a frontend/local state, not a backend error.

## MVP Scope

Version 1 should include:

- Voice recording
- Audio playback
- Speech-to-text transcription
- AI cleanup and transformation
- Five output modes:
  - Note
  - Todo List
  - Email
  - Journal Entry
  - Content Post
- Output preview and editing
- Local history
- Copy/share/export
- Basic Notion export path
- Privacy-first handling of voice notes and transcripts
- TestFlight-ready iOS build path

## Recommended Stack

The current recommendation is:

- React Native / Expo for the iOS-first MVP
- Lightweight backend for transcription and AI generation calls
- Local database for saved history
- Secure storage for sensitive settings and future tokens
- RevenueCat or StoreKit for subscriptions when monetization is enabled

See `requirements.md` for tradeoffs and decision notes.

## Project Memory

These files are treated as persistent project memory:

- `AGENTS.md` - operating instructions for the lead developer agent
- `memory/current-state.md` - short current project state and decision graph entrypoint
- `memory/` - lightweight Markdown memory graph for decisions, flows, agents, sessions, and context packs
- `product-context.md` - product vision, users, strategy, roadmap, and monetization
- `requirements.md` - living product and technical requirements
- `skills/README.md` - project-local guidance for specialized work

When product decisions change, update `product-context.md` or `requirements.md` before implementation continues.

## Target MVP Deadline

Target MVP deadline: 2026-07-15.

## Definition Of Done

The MVP is done when a user can record a voice note on iPhone, receive an accurate transcription, convert it into at least five useful output types, edit the result, save it, share/export it, and understand what happened if something fails.
