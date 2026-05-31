# Current State

Last updated: 2026-05-31

## Product

AI Voice Notes To Content is an iOS-first app that turns messy spoken thoughts into useful structured outputs.

Core promise: **Say it once. Use it everywhere.**

The MVP should let a user record a voice note, transcribe it, transform it into one of five output types, edit it, save it, copy/share/export it, and get content into Notion through the native iOS Share Sheet.

## Current Phase

Planning is complete enough to continue implementation.

The frontend-first implementation is underway:

1. Expo / React Native / TypeScript has been scaffolded.
2. The Lovable mock flow has been ported into a clickable mobile UI.
3. The UI uses mock data only.
4. The mock flow now covers permission denied, active recording, playback-ready audio, transcription processing/failure, suggested output confirmation, generation processing/failure, output editing, history, and settings.
5. Recording providers, backend calls, AI providers, storage, export, testing depth, and release readiness remain later increments.

`requirements.md` is already implementation-ready for frontend increments. Frontend agents should not recreate requirements or stop at planning-only output.

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
- [[agents/product-ux|Product UX]] owns UX coherence and copy decisions.
- [[agents/privacy-release|Privacy Release]] owns privacy, TestFlight, and App Store readiness.
- [[agents/research-planning|Research Planning]] researches options and writes implementation plans.

## Immediate Context Packs

- [[context-packs/frontend-scaffold|Frontend Scaffold Context Pack]]

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
