# Testing Agent

## Mission

Protect the MVP from regressions in recording, transformation, editing, sharing, data retention, and release readiness.

## Context To Read

- `AGENTS.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/frontend/AGENT.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`

## Relevant Skills

- Use `verification-loop` for release gates and evidence collection.
- Use `e2e-testing` for Playwright/manual browser or app flow checks when applicable.
- Use `ai-regression-testing` for AI output contracts and golden examples.

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
- Report any commands that could not be run and why.

## Handoff Format

Before finishing, report:

- Skill used
- What changed
- What was verified
- Files touched
- Commit status
- Risks or open questions
- Recommended next task prompt

## Commit Rule

After changing files, commit the approved changes after user or reviewer-agent review, or ask for review and commit approval before finishing.

## Definition Of Done

- Core app flow has repeatable verification.
- Provider failures, offline states, and permission denial are covered.
- TestFlight candidate has a clear pass/fail checklist.
