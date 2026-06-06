# Project Skill System

Use skills in this order:

1. **ECC skills** are the default operating layer.
2. **Superpowers skills** add process rigor, independent review, or orchestration when ECC does not already cover the need.
3. **Other installed, plugin, or project-local skills** provide framework-specific or product-specific guidance.

Choose the smallest set that covers the task. Do not load overlapping skills by habit.

## Core ECC Skills

Use these across the project:

| Task | Primary ECC skill |
|---|---|
| Implement a feature or bug fix | `tdd-workflow` |
| Diagnose a failure | `agent-introspection-debugging` |
| Execute and inspect repository work | `terminal-ops` |
| Verify completed work | `verification-loop` |
| Review maintainability and code quality | `plankton-code-quality` |
| Review AI-assisted changes | `ai-regression-testing` |
| Review APIs, uploads, privacy, or secrets | `security-review` |
| Test critical user flows | `e2e-testing` or `playwright` |
| Evaluate AI outputs and prompts | `eval-harness` |
| Control LLM cost and latency | `cost-aware-llm-pipeline` |
| Research current external facts | `research-ops`, `deep-research`, or `exa-search` |
| Plan a scoped implementation | `blueprint` or `product-capability` |
| Research before an unfamiliar implementation | `search-first` |
| Audit agents, tools, and skills | `workspace-surface-audit` |
| Improve agent/tool workflows | `agent-harness-construction` |
| Prepare deployment or release workflows | `deployment-patterns` |
| Manage context in long tasks | `strategic-compact` |
| Operate GitHub issues, PRs, and repository workflows | `github-ops` |

## Superpowers Layer

Use after the relevant ECC skill:

| Need | Superpowers skill |
|---|---|
| Independent review | `superpowers:requesting-code-review` |
| Evaluate received feedback | `superpowers:receiving-code-review` |
| Strong completion evidence | `superpowers:verification-before-completion` |
| Debug an elusive failure | `superpowers:systematic-debugging` |
| Execute an accepted written plan | `superpowers:executing-plans` |
| Delegate independent workstreams | `superpowers:dispatching-parallel-agents` |
| Finish a reviewed branch | `superpowers:finishing-a-development-branch` |

Prefer ECC `tdd-workflow` over the overlapping Superpowers TDD skill unless a task explicitly requires the Superpowers workflow.

## Project And Specialist Layer

- `.agents/skills/structured-code-review/SKILL.md`: mandatory review format for milestone, pre-commit, and specialist handoff reviews.
- `skills/prompt-orchestration/SKILL.md`: prompts for bounded specialist-agent tasks.
- `skills/research-planning/SKILL.md`: project-specific research-to-plan workflow.
- `.agents/skills/transitions-dev/SKILL.md`: motion reference for Expo UI work.
- `frontend-design`: production UI implementation.
- `ui-ux-pro-max`: additional UX heuristics when a design problem needs them.
- `content-engine` and `article-writing`: App Store, launch, or marketing content only.
- `github-ops` or GitHub plugin skills: repository, PR, issue, and CI operations.

## Task Skill Stacks

### Frontend And Recording

1. `tdd-workflow`
2. `verification-loop`
3. `e2e-testing` or `playwright` for critical flows
4. `security-review` for permissions, local files, uploads, or sensitive state
5. `frontend-design` and `transitions-dev`

### Backend And Providers

1. `tdd-workflow`
2. `security-review`
3. `ai-regression-testing`
4. `verification-loop`
5. `cost-aware-llm-pipeline` for paid model providers

### Voice AI And Structured Generation

1. `eval-harness`
2. `ai-regression-testing`
3. `cost-aware-llm-pipeline`
4. `security-review`
5. `verification-loop`

### Testing And Review

1. `structured-code-review`
2. `verification-loop`
3. `ai-regression-testing`
4. `security-review` when the changed surface requires it
5. `e2e-testing` for user-flow risk
6. `superpowers:requesting-code-review` for independent review
7. `superpowers:verification-before-completion` before approval

### Privacy And Release

1. `security-review`
2. `verification-loop`
3. `deployment-patterns`
4. `research-ops` for current platform requirements
5. Project-specific App Store and privacy guidance

### Research And Planning

1. `research-ops`
2. `deep-research` or `exa-search` when needed
3. `blueprint` or `product-capability`
4. `skills/research-planning/SKILL.md`
5. `skills/prompt-orchestration/SKILL.md` for delegation

## Review Standard

Every non-trivial implementation must pass:

1. Relevant narrow tests.
2. The applicable project verification gates.
3. A diff-based review using `structured-code-review`.
4. Independent review for medium- or high-risk milestones when an independent agent is available.

Reviews must lead with severity-ranked, file-and-line findings. A summary without findings, evidence, verdict, and remaining test gaps is not a completed review.

## Project Guidance Areas

The following names describe project knowledge, not separately installed skills:

- Requirements writing: use `product-capability`, `requirements.md`, and `product-context.md`.
- iOS product design: use `frontend-design`, `ui-ux-pro-max`, `ux-flow.md`, and the Lovable reference.
- Voice AI architecture: use `cost-aware-llm-pipeline`, `eval-harness`, and the Voice AI agent brief.
- Integration planning: use `api-connector-builder`, `product-capability`, and the smallest useful export path.
- App Store launch: use current-source research plus the Privacy Release agent brief.

## Dedicated Task-Agent Briefs

When work becomes specialized, create a task-agent folder under `task-agents/`.

Current specialist briefs:

- `task-agents/frontend/AGENT.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`
- `task-agents/testing/AGENT.md`
- `task-agents/reviewer/AGENT.md`
- `task-agents/product-ux/AGENT.md`
- `task-agents/privacy-release/AGENT.md`
- `task-agents/research-planning/AGENT.md`

Each task-agent `AGENT.md` should include:

- Mission
- Context files to read
- Ordered skill stack
- Scope
- Deliverables
- Constraints
- Verification
- Handoff format
- Commit rule
- Definition of done

Reusable specialist prompts should be stored beside their agent under `task-agents/<agent>/prompts/`.

Every specialist agent should start with `memory/current-state.md` and then follow only the memory links or long project files needed for the task.

Agents that change files should commit approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.
