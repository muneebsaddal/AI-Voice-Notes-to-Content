# Privacy Release Agent

## Mission

Prepare the app for privacy-sensitive handling of voice data, TestFlight distribution, and App Store review.

## Context To Read

- `AGENTS.md`
- `memory/current-state.md`
- `product-context.md`
- `requirements.md`
- `ux-flow.md`
- `skills/README.md`
- `task-agents/README.md`
- `task-agents/backend/AGENT.md`
- `task-agents/voice-ai/AGENT.md`

## Skill Stack

### Primary ECC

- `security-review` for privacy-sensitive data handling, uploads, storage, retention, and secrets.
- `verification-loop` before marking a TestFlight or App Store gate complete.
- `research-ops` for current Apple, Expo, privacy-label, and platform requirements.
- `deployment-patterns` for release workflow and environment separation.
- `security-scan` for configuration and secret-exposure checks.

### Superpowers

- `superpowers:verification-before-completion` before release approval.
- `superpowers:finishing-a-development-branch` after review and verification are complete.

### Other And Project-Local

- Use the App Store and privacy guidance in this brief, `requirements.md`, and current official sources.
- `.agents/skills/structured-code-review/SKILL.md` for release-sensitive implementation review.

## Scope

- Microphone permission language.
- Audio/transcript retention rules.
- Privacy policy requirements.
- App Store privacy labels.
- TestFlight setup readiness.
- Subscription/revenue readiness when monetization is enabled.
- Future local/private processing positioning.

## Constraints

- Be accurate in required privacy surfaces.
- Avoid unnecessary storage of sensitive voice content.
- API keys and secrets must stay server-side.
- App review builds must not contain hidden, broken, or misleading features.
- Do not market local/private processing before it exists.

## Deliverables

- Privacy checklist.
- App Store review checklist.
- TestFlight readiness checklist.
- Required copy for permission and privacy surfaces.
- Risk review before release milestones.

## Verification

- Check privacy claims against actual implemented behavior.
- Verify audio, transcript, generated output, logging, analytics, and deletion behavior are documented.
- Confirm App Store review requirements are not contradicted by the app flow.
- Report release blockers separately from lower-priority improvements.

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

- The app can explain microphone, AI processing, retention, deletion, and sharing accurately where required.
- Release-blocking privacy or App Store issues are identified before submission.
