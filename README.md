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

Planning phase.

The initial product context and formal requirements are in place. App implementation has not started yet.

Before app code is written, the project should continue from:

1. Requirements approval
2. UX flow and screen plan
3. Technical setup
4. Recording prototype
5. Transcription prototype
6. AI output prototype
7. MVP UI
8. Export/share
9. TestFlight and App Store readiness

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
- `product-context.md` - product vision, users, strategy, roadmap, and monetization
- `requirements.md` - living product and technical requirements
- `skills/README.md` - project-local guidance for specialized work

When product decisions change, update `product-context.md` or `requirements.md` before implementation continues.

## Target MVP Deadline

Target MVP deadline: 2026-07-15.

## Definition Of Done

The MVP is done when a user can record a voice note on iPhone, receive an accurate transcription, convert it into at least five useful output types, edit the result, save it, share/export it, and understand what happened if something fails.

