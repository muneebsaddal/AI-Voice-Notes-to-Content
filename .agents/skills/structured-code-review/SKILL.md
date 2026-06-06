---
name: structured-code-review
description: This skill should be used when reviewing implementation changes, reviewing a milestone before commit, auditing a specialist-agent handoff, or deciding whether code is ready to merge in AI Voice Notes To Content.
---

# Structured Code Review

Review changes as an independent correctness check, not as a summary of the implementation.

## Skill Order

Load only the skills required by the changed surface:

1. ECC first:
   - `verification-loop` for build, type, lint, test, security, and diff evidence.
   - `plankton-code-quality` for maintainability defects with concrete engineering risk.
   - `ai-regression-testing` for mock/real parity, contracts, fixtures, fallbacks, and prior bugs.
   - `security-review` for audio uploads, user input, APIs, secrets, storage, retention, or privacy.
   - `e2e-testing` for critical user flows.
   - `eval-harness` for AI output quality or agent/prompt behavior.
2. Superpowers second:
   - `superpowers:requesting-code-review` when an independent reviewer or subagent is available.
   - `superpowers:receiving-code-review` when evaluating review feedback.
   - `superpowers:verification-before-completion` before a final ready claim.
3. Other or project-local skills last:
   - Load only when the review needs framework, design, release, or project-specific guidance.

## Review Inputs

Read:

- The assigned task and acceptance criteria.
- The relevant diff and changed files.
- Existing tests for the changed behavior.
- `requirements.md`, `ux-flow.md`, or a task-agent brief only when needed to verify intent.
- The specialist handoff, if reviewing delegated work.

Do not rely on the implementer's summary as evidence.

## Review Procedure

1. Establish scope.
   - Identify the intended behavior, changed files, and affected contracts.
   - Separate pre-existing dirty changes from the reviewed change.
2. Inspect behavior.
   - Trace success, failure, retry, cancellation, and cleanup paths.
   - Check cross-layer contracts between Expo, Node, Python, providers, and stored state.
3. Inspect risk.
   - Look for data loss, stale state, unsafe fallbacks, unbounded input, secret exposure, retention errors, race conditions, and misleading UI states.
4. Inspect tests.
   - Confirm tests exercise behavior rather than implementation details.
   - Require a regression test for every fixed bug.
   - Check mock and real-provider paths for contract parity.
5. Run relevant verification.
   - Prefer the narrowest relevant command first, then the broader project gate.
   - Follow the repository's three-minute stop rule for optional browser, device, simulator, or local-service checks.
6. Produce a verdict.
   - Do not approve while blocking findings remain.
   - Do not invent findings to make a review look substantial.

## Severity

- `P0 Critical`: security breach, destructive data loss, or unusable release.
- `P1 High`: likely user-facing failure in a core flow or broken contract.
- `P2 Medium`: edge-case regression, maintainability defect with concrete risk, or meaningful missing test.
- `P3 Low`: small robustness or clarity issue worth fixing but not release-blocking.

Style preferences without behavioral impact are not findings unless they violate an established project rule.

## Required Output

Lead with findings ordered by severity. For each finding include:

- Severity and short title.
- Exact file and line.
- The failing scenario.
- Why it matters.
- The smallest reasonable correction or missing test.

Then report:

- `Verdict`: `APPROVE`, `APPROVE WITH FOLLOW-UPS`, or `CHANGES REQUIRED`.
- `Verification`: commands run and their results.
- `Test gaps`: required coverage that could not be verified.
- `Open questions`: only questions that affect correctness or scope.

When no findings exist, say so explicitly and still report residual risk and verification evidence.

## Independence Rule

For medium- or high-risk milestones, prefer a reviewer that did not implement the change. If no independent reviewer is available, state that limitation and compensate with stronger automated checks, contract tests, and diff tracing.
