# Cloud-First Processing

Status: accepted for MVP

The MVP uses backend-mediated cloud transcription and AI generation for speed, quality, and implementation practicality.

Rules:

- API keys stay server-side.
- Do not ship provider secrets in the mobile app.
- Do not market v1 as fully local or offline.
- Disclose data processing accurately in required privacy surfaces.
- Delete local audio after successful transcription by default.
- Keep provider choices swappable.

Future:

- Investigate Apple Speech, Apple Foundation Models, and local LLM runtimes after the cloud MVP flow works.

Related:

- [[../agents/backend|Backend Agent]]
- [[../agents/voice-ai|Voice AI Agent]]
- [[../agents/privacy-release|Privacy Release Agent]]
