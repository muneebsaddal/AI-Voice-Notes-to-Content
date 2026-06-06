# Testing Agent

## Mission

Protect the MVP from regressions in recording, transformation, editing, sharing, data retention, and release readiness.

## Context To Read

- `AGENTS.md`
- `memory/current-state.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/frontend/AGENT.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`

## Skill Stack

### Primary ECC

- `verification-loop` for repeatable quality gates and evidence.
- `ai-regression-testing` for contracts, fixtures, mock/real parity, fallbacks, retries, and fixed bugs.
- `e2e-testing` or `playwright` for critical user flows.
- `eval-harness` for AI output quality, routing, and prompt behavior.
- `security-review` for abuse cases around uploads, input, retention, privacy, and secrets.
- `tdd-workflow` when adding tests alongside a feature or bug fix.

### Superpowers

- `superpowers:systematic-debugging` when a test fails without a clear cause.
- `superpowers:verification-before-completion` before release-gate approval.

### Other And Project-Local

- `.agents/skills/structured-code-review/SKILL.md` when the task includes implementation review.

## Scope

- Unit tests for transformation contracts and parsing.
- Frontend component tests where practical.
- Backend API tests.
- Manual QA checklist for iPhone/TestFlight.
- Regression checklist before each commit or release milestone.
- Accessibility and viewport checks for main screens.

## Constraints

- Focus tests on risky behavior, not vanity coverage.
- Do not require real paid AI calls for ordinary local test runs.
- Mock network/provider behavior by default.
- Verify failure states, not only happy paths.

## Deliverables

- Test strategy.
- Automated test setup.
- Manual QA checklist.
- Release readiness checklist.
- Bug reports with reproduction steps.

## Verification

- Run all available automated tests relevant to the changed surface.
- Confirm manual QA steps cover permission denial, offline/provider failures, and export/share.
- Keep test runs mock/provider-free by default.
- Give browser, Playwright, simulator, device, and local-service checks one
  attempt with a hard 3-minute tool timeout. Stop spawned processes after the
  attempt and never block the handoff on an optional check.
- Never download or start a real transcription model unless the user
  explicitly requests that verification.
- Report any commands that could not be run and why.

## Handoff Format

Before finishing, report:

- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Review status
- Risks or open questions
- Recommended next task prompt

## Commit Rule

After changing files, commit the approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.

## Definition Of Done

- Core app flow has repeatable verification.
- Provider failures, offline states, and permission denial are covered.
- TestFlight candidate has a clear pass/fail checklist.
