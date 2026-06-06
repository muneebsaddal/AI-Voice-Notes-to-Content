# Lead Handoff: Local Transcription Direction

## Decision

Use local `faster-whisper` on the developer's Windows laptop during development and testing.

Recommended initial setup:

- Local backend exposes the same `/transcribe` contract planned for production.
- `faster-whisper` runs with `base.en` for English-only testing or `base` for multilingual testing.
- Use CPU `int8` by default; use GPU acceleration only if the laptop supports it cleanly.
- Frontend tests against mock transcripts first, then the local transcription backend.

## Long-Term Direction

The preferred long-term direction is potentially fully local processing on supported iPhones:

- Local speech-to-text.
- Local intent detection and transformation where quality permits.
- Cloud fallback remains available until local performance is proven.

This is not yet a detailed implementation plan. The existing requirements already define a post-MVP feasibility spike covering:

- Apple Speech.
- `whisper.cpp` or another iPhone-compatible Whisper runtime.
- Apple Foundation Models.
- An embedded local LLM only if Apple Foundation Models are insufficient.
- Quality, latency, battery, thermal impact, app size, and supported-device coverage.

## Architecture Guardrail

Do not couple the mobile app directly to Whisper or any specific cloud provider. Use a provider-neutral transcription contract so these implementations can be swapped:

- Mock provider.
- Laptop-local `faster-whisper`.
- Cloud provider.
- Future iPhone-local provider.

## Lead Action

Ask the Backend Agent to include a `LocalFasterWhisperProvider` in the development transcription plan, but keep the first backend increment mock-only if that is already the assigned scope.

Do not start the iPhone-local spike yet. Schedule it after the core recording-to-output flow works and can be benchmarked consistently.

## Suggested Lead Prompt Addition

```text
Development transcription decision:
Use a local faster-whisper service on the Windows development laptop for free development/testing. Keep the transcription interface provider-neutral so it can later switch among mock, local laptop, cloud, and iPhone-local implementations. Do not begin the iPhone-local implementation yet; preserve it as a dedicated feasibility spike after the core flow works.
```
