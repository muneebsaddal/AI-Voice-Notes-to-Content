# Testing Agent

## Mission

Protect the MVP from regressions in recording, transformation, editing, sharing, data retention, and release readiness.

## Context To Read

- `AGENTS.md`
- `requirements.md`
- `ux-flow.md`
- `task-agents/frontend-agent.md`
- `task-agents/backend-agent.md`
- `task-agents/voice-ai-agent.md`

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

## Definition Of Done

- Core app flow has repeatable verification.
- Provider failures, offline states, and permission denial are covered.
- TestFlight candidate has a clear pass/fail checklist.
