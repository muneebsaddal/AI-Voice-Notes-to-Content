# Project-Local Skills

These are lightweight project-local skill guides for building AI Voice Notes To Content.

The general installed skills are still useful. Use them for broader workflows such as brainstorming, writing plans, frontend design, verification, and debugging. These local skills exist to preserve project-specific standards and decisions.

## Recommended Skill Areas

### requirements-writing

Use when creating or updating `requirements.md`.

Focus on:

- Product vision
- User personas
- Core use cases
- Functional requirements
- Non-functional requirements
- MVP vs later scope
- Data model
- Integrations
- Privacy
- Acceptance criteria

### ios-product-design

Use when designing the iOS user experience.

Focus on:

- One-tap recording
- Output preview/edit flow
- History
- Share/export
- Clear permissions
- Fast, calm, native-feeling UI
- Minimal user decisions

### voice-ai-architecture

Use when planning audio, transcription, and AI transformation.

Focus on:

- Recording lifecycle
- Audio permissions
- Transcription pipeline
- Prompt/output schemas
- Error states
- Latency
- Cost control
- Privacy

### integration-planning

Use when planning connections to other apps.

Focus on:

- Notion
- Apple Reminders
- Apple Calendar
- Gmail / Apple Mail
- Todoist / Things / TickTick
- Day One / Apple Journal
- Slack / Teams

Start with the smallest useful export path before deeper API integrations.

### app-store-launch

Use when preparing launch.

Focus on:

- App Store positioning
- Screenshots
- Demo videos
- Keywords
- Pricing
- Free tier limits
- TestFlight feedback
- Instagram launch content

### prompt-orchestration

Use when the lead developer needs to create prompts for specialist task-agent chats.

Focus on:

- Writing self-contained agent prompts
- Assigning one bounded task per specialist chat
- Making agents read the correct project memory files
- Defining deliverables, verification, and handoff format
- Keeping the lead developer as coordinator
- Updating project memory when agent outputs change decisions

## Dedicated Task-Agent Briefs

When work becomes specialized, create a task-agent folder under `task-agents/`.

Examples:

- `task-agents/requirements/AGENT.md`
- `task-agents/ios-ux/AGENT.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/integrations/AGENT.md`
- `task-agents/privacy-review/AGENT.md`
- `task-agents/app-store-launch/AGENT.md`

Current specialist briefs:

- `task-agents/frontend/AGENT.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/testing/AGENT.md`
- `task-agents/product-ux/AGENT.md`
- `task-agents/privacy-release/AGENT.md`

Each task-agent `AGENT.md` should include:

- Mission
- Context files to read
- Scope
- Deliverables
- Constraints
- Definition of done

Reusable specialist prompts should be stored beside their agent under `task-agents/<agent>/prompts/`.
