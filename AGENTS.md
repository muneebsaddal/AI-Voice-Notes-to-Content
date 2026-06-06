# AI Voice Notes To Content Lead Developer Agent

## Mission

Build **AI Voice Notes To Content**, an iOS-first app that turns messy spoken thoughts into useful structured outputs.

Core promise:

**Say it once. Use it everywhere.**

The app should let a user record a voice note and turn it into notes, todo lists, emails, journal entries, content drafts, meeting summaries, reminders, Notion entries, calendar events, and other useful outputs.

This agent acts as the lead developer, product architect, UX planner, and technical project manager for the entire app.

## First Task

Before doing anything, read `product-context.md`.

Before writing app code, create a `requirements.md` file if one does not already exist.

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

Current status: `requirements.md` exists and is implementation-ready. The Expo frontend mock flow, mock backend API, frontend-to-mock-backend connection, direct post-recording output flow, Geist font preview, Expo vector icon pass, Voice AI output contracts, and real Expo recording lifecycle are implemented. Future agents should not recreate requirements, scaffold a second app, repeat completed mock-backend wiring, redefine the five MVP output schemas, or replace the recording provider abstraction.

## Project Context Files

Always treat these files as persistent project memory:

- `AGENTS.md` - operating instructions for the lead developer agent.
- `HANDOFF.md` - quick fresh-chat resume point for what has been built and what comes next.
- `memory/current-state.md` - short project status and decision graph entrypoint.
- `memory/` - Obsidian-compatible project memory graph for decisions, agents, flows, sessions, and context packs.
- `product-context.md` - full product vision, user problems, case studies, integrations, monetization, and strategic decisions.
- `requirements.md` - formal requirements/specification. Create this before coding.
- `skills/README.md` - project-local skill guidance for specialized work.
- `task-agents/` - specialist task-agent briefs for frontend, backend, voice AI, testing, product UX, and privacy/release.
- `task-agents/<agent>/prompts/` - reusable prompts written by the lead developer for specialist chats.

If project decisions change, update `product-context.md` or `requirements.md` so future sessions keep the same context.

## ECC Skill Usage

Use the newly added ECC skills as the default operating layer for non-trivial work.

At the start of each significant task:

- Read `product-context.md` first.
- Read `memory/current-state.md` after product context when the task benefits from current project status.
- Check `skills/README.md` for project-local guidance.
- Choose the most relevant installed ECC skill or project-local skill.
- Load only the skill instructions needed for the task.
- Mention which skill is being used and why.

Recommended mappings:

- Agent/task-agent setup audit: `workspace-surface-audit` plus `agent-harness-construction`.
- Specialist prompt creation: `skills/prompt-orchestration/SKILL.md`.
- Frontend implementation: `frontend-design`, plus `verification-loop` before completion.
- Bug fixing: `systematic-debugging` or `tdd-workflow`.
- Security or privacy-sensitive changes: `security-review`.
- Test strategy and release gates: `verification-loop`, `ai-regression-testing`, or `e2e-testing`.
- Research with current external facts: `research-ops`, `deep-research`, or `exa-search`.

Do not force a skill when the task is a tiny direct command, but for planning, coding, review, release, privacy, prompt orchestration, or agent configuration work, assume a relevant skill should be used.

### Skill Priority

Select skills in this order:

1. ECC skills first for engineering, testing, verification, security, research, planning, and agent operations.
2. Superpowers skills second when they add independent review, process rigor, plan execution, or multi-agent orchestration not already supplied by the chosen ECC skill.
3. Other installed, plugin, or project-local skills last for framework-specific, design-specific, or project-specific guidance.

Use the smallest non-overlapping skill set that covers the task. Read `skills/README.md` for the canonical project skill matrix and task stacks.

Default implementation stack:

- `tdd-workflow` while changing behavior.
- `verification-loop` before completion.
- `ai-regression-testing` for API, mock/real provider, fallback, and structured-output changes.
- `security-review` for audio, uploads, user input, secrets, storage, retention, privacy, or external providers.
- `e2e-testing` or `playwright` for critical user flows.
- `eval-harness` for AI generation quality, routing, prompts, and golden examples.

Use `superpowers:requesting-code-review` for independent review when available and `superpowers:verification-before-completion` before approving medium- or high-risk milestones.

### Structured Review Gate

Use `.agents/skills/structured-code-review/SKILL.md` for implementation reviews, specialist handoff reviews, milestone reviews, and pre-commit approval.

Every completed non-trivial change must have:

1. Acceptance criteria traced to the changed behavior.
2. Relevant automated verification with fresh command evidence.
3. A diff-based review with severity-ranked findings and file/line references.
4. An explicit verdict: `APPROVE`, `APPROVE WITH FOLLOW-UPS`, or `CHANGES REQUIRED`.
5. Remaining test gaps and residual risk stated plainly.

Risk levels:

- Low: docs, copy, isolated styles, or mechanically safe changes. Self-review plus relevant verification is acceptable.
- Medium: shared UI state, storage, API contracts, provider adapters, retries, or cross-layer behavior. Prefer an independent reviewer.
- High: audio deletion/retention, uploads, privacy, secrets, billing, migrations, authentication, release configuration, or destructive behavior. Require independent review when available plus `security-review`.

The reviewer must inspect the diff and tests directly rather than relying on the implementer's handoff. The implementer must not silently treat their own summary as review approval.

## Verification Timebox And Stop Rule

Optional browser, simulator, device, DevTools, local-service, or other manual
smoke checks must not delay an otherwise verified task indefinitely.

- Make one bounded attempt at an optional manual verification step.
- Set a hard tool/command timeout before starting it: 3 minutes for browser,
  Playwright, dev-server, or local-service checks unless the task explicitly
  requires a different limit.
- If the tool times out, returns no status, or repeats the same environment
  failure, stop immediately. Do not retry with different wrappers, ports,
  profiles, or launch commands.
- Stop every server, browser helper, model process, or background process
  started for the check before producing the handoff.
- Real `faster-whisper` model startup, model download, and real-model inference
  are never automatic agent verification steps. Run them only when the user
  explicitly requests the check and accepts the download/runtime cost.
- Report the blocker, the exact automated verification that passed, and the
  remaining manual check.
- When required automated gates pass, present the work for review instead of
  holding completion on optional tooling.
- When the user asks for a bounded action such as commit and push, complete
  that action and report it before beginning the next feature.

## User-Run Test Commands

In this workspace, some agent-started test commands can return no visible
status even when the same command completes immediately in the user's terminal.

- Do not automatically run test, build, lint, typecheck, audit, Expo, backend,
  Python service, or model commands unless the user explicitly asks the agent
  to run them.
- Give the user the exact command or short ordered command list to run.
- State the normal expected duration and a clear stop threshold.
- Wait for the user to paste the result, then treat that output as verification
  evidence and continue the task.
- Do not rerun a command after the user has supplied a current passing result.
- Read-only inspection commands remain available to agents.
- If an automated command must be agent-run for a specific task, explain why
  before running it and keep the existing timeout and stop rules.

Current accepted verification evidence:

- `npm run backend:test`: 41 tests, 5 suites, 41 passed, 0 failed,
  completed in 298.2512 ms on 2026-06-07.

## Current Build Direction

The Lovable design direction is final for the MVP UI unless the user explicitly changes it.

If the local folder exists, use it as the primary UI reference:

- `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30`

The older Figma/Canva/SVG designs are historical references. They should not override the Lovable direction.

Current implementation is in the repo root as an Expo / React Native / TypeScript app with a mock Node/TypeScript backend under `backend/`.

Completed foundation:

- Expo app scaffold.
- Lovable-inspired clickable mock flow.
- Mock backend API for health, transcription, and generation.
- Frontend calls to the mock backend with local fallbacks.
- Direct flow from completed recording to processing to output preview.
- Geist font loading for web preview.
- Expo vector icons for UI controls.
- Structured Voice AI contracts, deterministic intent routing, runtime validation, golden fixtures, and contract tests.
- Real Expo microphone permission, recording start/stop/cancel, temporary audio retention, and cleanup through a provider-independent recording session.

The next implementation step should be local development transcription using a provider-neutral Node boundary and a localhost-only persistent Python `faster-whisper` service. Default to `base.en` on CPU `int8`, then add bounded audio upload while preserving retryable temporary audio. Follow `task-agents/research-planning/plans/real-transcription-integration.md`. Do not start by rebuilding the mock frontend, redefining Voice AI output schemas, replacing the recording lifecycle, or adding a cloud transcription provider.

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
- Relevant skills to use
- Scope
- Deliverables
- Constraints
- Verification
- Handoff format
- Definition of done

The lead developer remains responsible for coherence across all task agents.

Every specialist agent must return a concise handoff with:

- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt

## Commit Discipline

Every agent that changes files must either:

- Commit the approved changes after the user reviews them or a reviewer agent reviews them.
- Ask for review and commit approval if the changes have not yet been reviewed.

Do not silently leave file changes uncommitted. Do not commit before review unless the task prompt or user explicitly says to commit now.

Before requesting commit approval, report the structured review verdict and verification evidence. Do not commit changes with unresolved `P0` or `P1` findings.

## Multi-Chat Coordination Workflow

The user may clear the main chat and start new specialist chats for each task agent.

When acting as lead developer/coordinator:

1. Read `AGENTS.md`, `product-context.md`, `memory/current-state.md`, `requirements.md`, `ux-flow.md`, `skills/README.md`, and `task-agents/README.md`.
2. Choose and load the relevant ECC skill for the coordination task.
3. Use `skills/prompt-orchestration/SKILL.md` when creating prompts for specialist chats.
4. Give each specialist chat one bounded task with context files, relevant skills, scope, constraints, deliverables, verification, and handoff format.
5. Store reusable prompts under the relevant agent folder, such as `task-agents/frontend/prompts/`.
6. Review specialist outputs before integrating them into the roadmap.
7. Update `requirements.md`, `ux-flow.md`, task-agent briefs, or prompt files when decisions change.

Completed coordination steps:

1. Frontend Agent: scaffolded Expo and ported the Lovable mock flow.
2. Frontend Agent: added mocked recording lifecycle states.
3. Backend Agent: added backend API skeleton with mock transcription/generation.
4. Backend Agent: polished backend JSON/error handling.
5. Frontend Agent / Lead Agent recovery: connected frontend to mocked API.
6. Lead Agent: simplified normal flow to go directly from recording completion to processing/output.
7. Lead Agent: added Geist preview fonts and Expo vector icons.
8. Voice AI Agent / Lead Agent review: added structured output schemas, deterministic intent routing, runtime validation, golden fixtures, and contract tests.
9. Lead Agent: added real Expo recording lifecycle, microphone permission recovery, temporary audio cleanup, and recording tests.

Recommended next order:

1. Backend plus Voice AI Agent: implement the provider seam and localhost `faster-whisper` service, then upload captured audio behind the existing backend contract.
2. Backend Agent: integrate real structured generation provider calls.
3. Add local history and native share/export behavior.
4. Testing Agent: add automated frontend interaction tests and manual QA gates.
5. Privacy Release Agent: prepare privacy, TestFlight, and App Store readiness checklist.
