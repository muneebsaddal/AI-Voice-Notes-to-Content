# Agent Folder Workflow

Status: accepted

Specialist agents live under `task-agents/` as project-local operating instructions.

Current agents:

- [[../agents/frontend|Frontend]]
- [[../agents/backend|Backend]]
- [[../agents/voice-ai|Voice AI]]
- [[../agents/testing|Testing]]
- [[../agents/product-ux|Product UX]]
- [[../agents/privacy-release|Privacy Release]]
- [[../agents/research-planning|Research Planning]]

Rules:

- The lead developer remains responsible for coherence.
- Specialist agents complete bounded tasks.
- Reusable prompts live beside the relevant agent under `task-agents/<agent>/prompts/`.
- Handoffs may live under `task-agents/<agent>/handoffs/` and be summarized under `memory/sessions/`.
- Agents that change files must commit approved changes after user or reviewer-agent review, or ask for review and commit approval.
