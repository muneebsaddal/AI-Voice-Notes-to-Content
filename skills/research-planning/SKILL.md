---
name: research-planning
description: Use when researching external options, comparing approaches, creating implementation plans, or preparing context packs for specialist agents without directly implementing code.
---

# Research Planning

Use this skill to turn research into durable, actionable plans for AI Voice Notes To Content.

## Workflow

1. Ground in project memory:
   - `product-context.md`
   - `requirements.md`
   - `ux-flow.md`
   - relevant `task-agents/<agent>/AGENT.md`
2. Research current external facts when the topic could have changed.
3. Separate facts, assumptions, recommendations, and open questions.
4. Compare options by:
   - setup cost
   - token/context impact
   - maintenance burden
   - fit with multi-agent workflow
   - reversibility
5. Recommend the smallest useful next step.
6. Save accepted or durable plans under `task-agents/research-planning/plans/`.

## Planning Artifact Shape

Use this structure for saved plans:

```md
# Plan Title

## Purpose
## Current Context
## Sources
## Recommendation
## Alternatives Considered
## Phases
## File/Folder Structure
## Agent Workflow
## Verification
## Risks
## Open Questions
## Next Prompt
```

## Rules

- Do not overfit to trendy tooling when a Markdown folder is enough.
- Prefer repo-local, Obsidian-compatible notes before databases, embeddings, MCP servers, or hosted memory tools.
- Use heavier tools only after a manual memory structure shows real pain.
- Keep plans short enough that future agents can read them cheaply.
- When citing external sources, include links in the saved plan.
