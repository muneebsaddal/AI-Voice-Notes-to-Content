# AI Voice Notes To Content Lead Developer Agent

## Mission

Build **AI Voice Notes To Content**, an iOS-first app that turns messy spoken thoughts into useful structured outputs.

Core promise:

**Say it once. Use it everywhere.**

The app should let a user record a voice note and turn it into notes, todo lists, emails, journal entries, content drafts, meeting summaries, reminders, Notion entries, calendar events, and other useful outputs.

This agent acts as the lead developer, product architect, UX planner, and technical project manager for the entire app.

## First Task

Before doing anything, read `product-context.md`.

Before writing app code, create a `requirements.md` file.

The `requirements.md` file should define:

- Product vision
- Target users
- Main user problems
- Core use cases
- MVP scope
- Non-MVP features
- User flows
- Output types
- Integration requirements
- Data model
- AI/transcription requirements
- Privacy and security requirements
- Monetization assumptions
- Technical stack recommendation
- Milestones and deadline
- Open questions

Do not start coding until the requirements are clear enough to guide the first MVP.

## Project Context Files

Always treat these files as persistent project memory:

- `AGENTS.md` - operating instructions for the lead developer agent.
- `product-context.md` - full product vision, user problems, case studies, integrations, monetization, and strategic decisions.
- `requirements.md` - formal requirements/specification. Create this before coding.
- `skills/README.md` - project-local skill guidance for specialized work.
- `task-agents/` - specialist task-agent briefs for frontend, backend, voice AI, testing, product UX, and privacy/release.
- `task-agents/<agent>/prompts/` - reusable prompts written by the lead developer for specialist chats.

If project decisions change, update `product-context.md` or `requirements.md` so future sessions keep the same context.

## Current Build Direction

The Lovable design direction is final for the MVP UI unless the user explicitly changes it.

If the local folder exists, use it as the primary UI reference:

- `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30`

The older Figma/Canva/SVG designs are historical references. They should not override the Lovable direction.

The first implementation step is the frontend: scaffold Expo and port the Lovable UI into a clickable mock flow. Backend work starts after the mock frontend flow exists.

## Product Direction

The app is not just a transcription app.

It should transform raw voice into the thing the user actually wanted:

- A clean note
- A structured todo list
- A polished email
- A journal entry
- A meeting summary
- A client follow-up
- A content post
- A Notion database entry
- A reminder
- A calendar event
- A project idea
- A study note

The product should feel natural, fast, and obvious. The user should not need to think in prompts. They should speak normally, then the app should infer intent, ask for confirmation only when needed, and produce the right output.

## Target Platform

Start with **iOS first**.

Reason:

- The app is mobile-native by nature.
- Voice capture happens naturally on a phone.
- iOS users are more likely to pay for premium productivity and AI subscriptions.
- Apple ecosystem integrations can become a strong advantage.

Recommended technical approach:

- Prefer **React Native / Expo** if speed and future Android support matter most.
- Prefer **Swift / SwiftUI** if deep iOS polish, native recording, Siri Shortcuts, widgets, Apple Reminders, and Apple Calendar integrations become central.
- Make the final stack decision in `requirements.md` after comparing tradeoffs.

## Core MVP

The first MVP should include:

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
- Output preview/edit screen
- Save history
- Copy/share/export
- Basic Notion export or share-to-Notion workflow

The MVP should avoid complex integrations until the core voice-to-output experience feels excellent.

## Version Roadmap

### Version 1

- Record voice note
- Transcribe
- Choose output type
- Generate structured output
- Edit result
- Save local history
- Copy/share/export
- Basic Notion export path

### Version 1.5

- Auto-detect output type
- Tone selector
- Templates by use case
- Apple Reminders export
- Calendar/reminder extraction
- Journal template
- Better Notion mapping

### Version 2

- Full Notion database mapping
- Gmail draft creation
- Todoist / Things / TickTick export
- Day One / Apple Journal workflow
- Slack / Teams update generation
- Siri Shortcut capture
- Home screen widget
- Multi-language support
- Web dashboard if needed

## Integrations To Consider

Prioritize integrations that turn captured thoughts into action.

Important integrations:

- Notion
- Apple Reminders
- Apple Calendar
- Google Calendar
- Apple Notes
- Gmail
- Apple Mail
- Day One
- Apple Journal
- Todoist
- Things
- TickTick
- Slack
- Microsoft Teams
- Google Docs

Start with the integrations that are easiest and most valuable. Do not overbuild integrations before the core app works.

## User Experience Principles

- Recording should be one tap.
- Output generation should feel instant or clearly in progress.
- The app should never feel like a complicated AI prompt box.
- Use plain language labels.
- Show useful defaults.
- Make editing easy.
- Make sending/exporting obvious.
- Reduce decisions for the user.
- Keep the first version focused and polished.

The app should feel like:

1. Open app.
2. Speak.
3. Pick or confirm output.
4. Get polished result.
5. Send it where it belongs.

## Monetization

Default monetization model:

- Free tier: limited monthly voice notes
- Pro monthly: unlimited notes and all output types
- Annual plan: discounted yearly subscription
- Creator plan later: content templates and batch generation
- Team plan later: shared meeting notes, client updates, and workspace outputs

Suggested starting prices to test:

- Free: 10 notes/month
- Pro: $7.99/month
- Annual: $59.99/year
- Creator: $12.99/month

Keep monetization simple for the MVP.

## Marketing Constraints

The user prefers not to rely on cold calls or direct sales.

Plan the product so it can be marketed through:

- Instagram Reels
- Instagram carousels
- Short demos
- App Store search
- Paid ads
- SEO landing pages
- Creator workflows
- Free templates
- Before/after examples

Every major feature should be easy to demonstrate visually.

## Technical Responsibilities

When implementing the app, this agent should:

- Keep architecture simple.
- Prefer proven libraries for audio, transcription, auth, payments, and integrations.
- Protect user privacy.
- Avoid storing sensitive voice content unnecessarily.
- Separate UI, domain logic, API calls, and storage.
- Add tests for risky transformation logic and data handling.
- Make errors understandable.
- Design for future Android support if React Native is chosen.

## Planning Responsibilities

For every significant feature, define:

- User story
- Acceptance criteria
- Edge cases
- Data needed
- UI states
- Error states
- Privacy considerations
- Test plan

## Privacy And Trust

Voice notes can be personal. Treat privacy as a core product feature.

Requirements to consider:

- Clear permission prompts
- Clear explanation of what is uploaded
- Delete note option
- Local-only storage where possible
- Secure API handling
- No training on user data unless explicitly allowed
- Export/delete account later

## Definition Of Done For MVP

The MVP is done when a user can:

- Record a voice note on iPhone
- Get an accurate transcription
- Convert it into at least five useful output types
- Edit the result
- Save it
- Share/copy/export it
- Understand what happened if something fails

The product is successful if a user can speak naturally and receive a useful output within about 30 seconds.

## Working Style

Be decisive but document tradeoffs.

Before building, clarify requirements. After requirements are written, break work into milestones and implement step by step.

Prefer small, shippable increments:

1. Requirements
2. UX flow
3. Technical stack decision
4. Project setup
5. Recording prototype
6. Transcription prototype
7. AI output prototype
8. MVP UI
9. Export/share
10. TestFlight-ready build

Always keep the app's main promise in view:

**A user should be able to turn a natural spoken thought into useful action without friction.**

## Dedicated Task Agents

This lead developer agent may create dedicated task-agent folders when work becomes specialized.

Use task-agent briefs for focused work such as:

- Product requirements agent
- iOS UX design agent
- Voice/audio engineering agent
- AI prompt and transformation agent
- Integrations engineering agent
- Privacy/security review agent
- App Store launch and monetization agent
- QA and TestFlight readiness agent

Dedicated task-agent folders should be created under `task-agents/` when needed. Each folder should contain an `AGENT.md` file that defines:

- Mission
- Inputs/context to read
- Scope
- Deliverables
- Constraints
- Definition of done

The lead developer remains responsible for coherence across all task agents.

## Multi-Chat Coordination Workflow

The user may clear the main chat and start new specialist chats for each task agent.

When acting as lead developer/coordinator:

1. Read `AGENTS.md`, `product-context.md`, `requirements.md`, `ux-flow.md`, `skills/README.md`, and `task-agents/README.md`.
2. Use `skills/prompt-orchestration/SKILL.md` when creating prompts for specialist chats.
3. Give each specialist chat one bounded task with context files, scope, constraints, deliverables, verification, and handoff format.
4. Store reusable prompts under the relevant agent folder, such as `task-agents/frontend/prompts/`.
5. Review specialist outputs before integrating them into the roadmap.
6. Update `requirements.md`, `ux-flow.md`, task-agent briefs, or prompt files when decisions change.

The lead developer should usually assign work in this order:

1. Frontend Agent: scaffold Expo and port the Lovable mock flow.
2. Frontend Agent plus Voice AI Agent: add recording lifecycle interfaces and mock audio states.
3. Backend Agent: add backend API skeleton with mock transcription/generation.
4. Voice AI Agent: define output schemas, intent routing, and generation contracts.
5. Frontend Agent: connect frontend to mocked API.
6. Backend Agent: integrate real provider calls when keys/environment are ready.
7. Testing Agent: add automated tests and manual QA gates.
8. Privacy Release Agent: prepare TestFlight/App Store privacy and release checklist.
