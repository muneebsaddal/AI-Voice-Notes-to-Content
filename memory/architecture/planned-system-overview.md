# Planned System Overview

MVP stack:

- Expo / React Native / TypeScript app.
- Lightweight backend for provider-mediated transcription and generation.
- Local storage for generated history.
- Native clipboard and iOS Share Sheet for export.

Planned modules:

- `recording`: permissions, record, stop, playback, temporary audio.
- `transcription`: upload audio, receive transcript, retry, errors.
- `intent`: infer or honor requested output type.
- `generation`: output prompts, schemas, parsing, regeneration.
- `history`: local save, edit, delete, reopen.
- `export`: copy, share sheet, basic Notion path.
- `settings`: privacy, retention, usage, subscription placeholders.
- `backend`: provider adapters, validation, rate limits, usage tracking.

Security and privacy:

- API keys never ship in the app.
- Avoid logging raw audio, transcripts, generated outputs, or audio URLs.
- Delete local audio after successful transcription by default.
- Disclose cloud processing accurately where required.

Related:

- [[../decisions/cloud-first-processing|Cloud-First Processing]]
- [[../decisions/native-share-sheet-v1|Native Share Sheet v1]]
