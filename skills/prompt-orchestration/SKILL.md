---
name: prompt-orchestration
description: Use when the lead developer needs to create prompts for specialist task-agent chats, coordinate multiple agents, hand off implementation work, or resume project leadership after a chat reset.
---

# Prompt Orchestration

Use this skill when coordinating AI Voice Notes To Content through separate specialist chats.

## Role

The lead developer is the coordinator. Specialist chats are workers with a narrow mission. The coordinator writes the prompt, receives the result, reviews it, integrates it into the main repo, and updates project memory.

## Required Context

Every specialist prompt must instruct the agent to read:

- `AGENTS.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- The relevant `task-agents/<agent>/AGENT.md` file

When frontend UI is involved, also point to the Lovable reference folder if it exists locally:

- `tmp/lovable-project-169832d9-ed67-4bfd-a8ea-aee90c2278e0-2026-05-30`

## Prompt Structure

Use this shape:

1. Role: name the specialist agent and its mission.
2. Context to read: list required files.
3. Goal: one clear outcome for this task.
4. Scope: exact files/features the agent may touch.
5. Constraints: product, UX, privacy, and technical guardrails.
6. Deliverables: concrete output expected.
7. Verification: commands, tests, screenshots, or manual checks required.
8. Handoff: ask for a short summary, changed files, unresolved risks, and next prompt suggestion.

## Rules

- Give each agent one bounded task, not the whole app.
- Prefer frontend first when product feel is the highest risk.
- Prefer mock data before real provider integration.
- Never ask an agent to make broad unrelated refactors.
- Make agents update `requirements.md`, `ux-flow.md`, or task-agent briefs only when a decision changes.
- Store reusable prompts beside the relevant agent under `task-agents/<agent>/prompts/`.
- Use global prompt folders only for cross-agent coordinator prompts.
- Ask agents to commit only when the lead explicitly wants that chat to own a commit.
- The coordinator should commit integration points and project-memory updates.

## Output Standard

Agent prompts should be copy/paste ready and self-contained. They should not rely on this chat history.

Each prompt should end with:

```text
Before you finish, report:
- What you changed
- What you verified
- Files touched
- Risks or open questions
- Recommended next task prompt
```
