# Project Memory Graph Plan

## Purpose

Create a lightweight, Obsidian-compatible project memory graph so specialist chats can resume faster, read less context, and understand decisions without scanning every long document.

## Current Context

AI Voice Notes To Content now uses specialist task-agent folders under `task-agents/`. The lead developer has a separate coordinator chat. This research/planning chat should support the lead by researching options and writing plans.

The project already has durable memory files:

- `AGENTS.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `task-agents/`
- `skills/`

The missing piece is a small graph-style memory layer for current state, decisions, sessions, agent handoffs, and context packs.

## Sources

- Agent Memory describes a Markdown-first agent memory protocol with facts, append-only events, and generated views: https://agentmemory.site/
- engraph provides a local Markdown/Obsidian knowledge graph with hybrid search and MCP/REST, but requires more setup than the first version needs: https://github.com/devwhodevs/engraph
- obsidian-graph adds embeddings, PostgreSQL, pgvector, MCP, and graph traversal for Markdown vaults; useful later but heavy for now: https://github.com/drewburchfield/obsidian-graph
- SwarmVault is a larger local-first graph/wiki/RAG system; interesting later after the simple vault proves useful: https://www.swarmvault.ai/
- ECC Tools exposes planning and multi-agent workflow skills/commands, including planning-oriented catalog entries such as `multi-plan`: https://ecc.tools/skills
- GitHub's custom agent library includes an implementation-planner pattern for markdown technical plans: https://docs.github.com/en/copilot/tutorials/customization-library/custom-agents/implementation-planner

## Recommendation

Start with a simple repo-local Markdown memory graph. Do not add embeddings, MCP, vector search, or graph databases yet.

Use Obsidian-compatible wikilinks such as `[[Lovable Design Final]]` and `[[Frontend Agent]]`. The graph should be useful to humans in Obsidian and cheap for agents to read with normal file tools.

## Alternatives Considered

### Plain Markdown Graph

Pros:
- Zero infrastructure.
- Works with Git and Obsidian.
- Easy for any agent to read.
- Low token cost if agents read only `current-state.md` and relevant linked notes.

Cons:
- No automatic semantic search.
- Requires discipline to update memory.

### engraph

Pros:
- Local, offline Markdown graph with search APIs.
- Designed for agents.

Cons:
- More setup and moving parts.
- Premature before the vault structure is proven.

### obsidian-graph

Pros:
- Semantic search, hidden connection discovery, graph traversal.
- MCP-compatible.

Cons:
- Requires PostgreSQL, pgvector, embeddings, and provider setup.
- Too heavy for the current project phase.

### SwarmVault

Pros:
- Full local-first wiki/RAG/graph workflow.
- Good for large knowledge bases.

Cons:
- Larger system than needed for a single app MVP.

## Phases

### Phase 1 - Manual Markdown Memory

Create:

```text
memory/
  README.md
  index.md
  current-state.md
  decisions/
  sessions/
  agents/
  flows/
  architecture/
  context-packs/
  open-questions.md
```

Add the first decision notes:

```text
memory/decisions/lovable-design-final.md
memory/decisions/frontend-first-build-order.md
memory/decisions/cloud-first-processing.md
memory/decisions/native-share-sheet-v1.md
memory/decisions/agent-folder-workflow.md
```

### Phase 2 - Agent Read Protocol

Update agent prompts so each specialist starts by reading:

1. `memory/current-state.md`
2. relevant `memory/context-packs/<task>.md` if present
3. its own `task-agents/<agent>/AGENT.md`
4. only the project docs needed for the task

This is where token savings come from.

### Phase 3 - Handoffs And Sessions

After each specialist chat, save a short handoff:

```text
task-agents/<agent>/handoffs/YYYY-MM-DD-short-task.md
memory/sessions/YYYY-MM-DD-agent-task.md
```

Each session note should link to decisions and touched areas.

### Phase 4 - Optional Search Tooling

Only after the Markdown graph grows enough to be painful, evaluate:

- Obsidian graph view only.
- A lightweight local search index.
- engraph.
- obsidian-graph.

## File/Folder Structure

Recommended first implementation:

```text
memory/
  README.md
  index.md
  current-state.md
  open-questions.md
  decisions/
    lovable-design-final.md
    frontend-first-build-order.md
    cloud-first-processing.md
    native-share-sheet-v1.md
    agent-folder-workflow.md
  agents/
    lead-developer.md
    research-planning.md
    frontend.md
    backend.md
    voice-ai.md
    testing.md
    product-ux.md
    privacy-release.md
  flows/
    mvp-voice-to-output.md
  architecture/
    planned-system-overview.md
  context-packs/
    frontend-scaffold.md
  sessions/
```

## Agent Workflow

New chat startup should become:

1. Read `memory/current-state.md`.
2. Read the relevant agent `AGENT.md`.
3. Read the prompt for the task.
4. Follow links only when needed.
5. On finish, write a handoff if asked.

## Verification

- Confirm all memory files use relative Markdown links or Obsidian wikilinks.
- Confirm `memory/current-state.md` is under roughly 100-150 lines.
- Confirm specialist prompts point to `memory/current-state.md` after Phase 2.
- Confirm no sensitive secrets or private provider keys are stored in memory.

## Risks

- Memory can become stale if not updated after decisions.
- Too many notes can increase context load if agents read everything.
- Graph tools can become a distraction before the app exists.

Mitigation: keep `current-state.md` as the only mandatory memory file, and use links for everything else.

## Open Questions

- Should handoffs live only in `task-agents/<agent>/handoffs/`, or also be mirrored under `memory/sessions/`?
- Should decisions use short Obsidian-style titles or kebab-case filenames only?
- Should the lead developer approve every memory update, or can specialist agents write handoffs directly?

## Next Prompt

Use this prompt for the Research Planning Agent or Lead Developer:

```text
Implement Phase 1 of the Project Memory Graph Plan.

Read:
- AGENTS.md
- skills/research-planning/SKILL.md
- task-agents/research-planning/AGENT.md
- task-agents/research-planning/plans/001-project-memory-graph.md

Create the initial `memory/` folder and the Phase 1 files exactly enough to support future specialist chats. Keep each note concise. Use Obsidian-compatible wikilinks where helpful. Do not add external graph tooling yet.

Before finishing, report files created, any assumptions, and the next prompt needed to update specialist prompts to read `memory/current-state.md`.
```
