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

Frontend implementation has started.

The current app is an Expo / React Native / TypeScript clickable mock that ports the final Lovable direction into the first MVP flow. It uses mock state and mock data only; recording, transcription, AI generation, auth, payments, analytics, backend calls, and real exports are intentionally not wired yet.

Current flow:

1. Permission pre-prompt
2. Permission denied retry state
3. Recording home
4. Active listening
5. Playback-ready review
6. Transcription processing
7. Suggested output confirmation
8. Generation processing
9. Retryable recording, transcription, and generation failure states
10. Change output type sheet
11. Output preview/edit
12. History sheet
13. Settings with mock lifecycle previews

## Local Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

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

The local backend listens on `http://127.0.0.1:3333` by default. Set `PORT` or `HOST` for a different local binding. The current backend is mock-only: it does not call AI, transcription, storage, Notion, auth, payment, or cloud providers, and it does not write uploaded audio to disk.

## Mock Backend API

`GET /api/health`

Returns:

```json
{ "ok": true, "service": "voice-notes-api", "mode": "mock" }
```

`POST /api/transcriptions`

Accepts:

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

Supported mock error codes are `recording_upload_failed`, `transcription_failed`, `generation_failed`, `unsupported_output_type`, `invalid_request_body`, `not_found`, and `method_not_allowed`. Permission denial remains a frontend/local state, not a backend error.

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
