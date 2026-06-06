# MVP Voice AI Output Contracts

## Canonical Output Types

The API wire values are:

- `note`
- `todo`
- `email`
- `journal`
- `content`

Product and UI labels remain `Note`, `Todo List`, `Email`, `Journal Entry`, and
`Content Post`. Names such as `todo_list`, `journal_entry`, and `content_post`
are display/domain aliases, not additional API values.

## Generated Output Envelope

Every generated output uses schema version `1.0` and includes:

- `id`: unique output identifier.
- `outputType`: canonical wire value.
- `title`: editable title.
- `body`: editable render text projected deterministically from `payload`.
- `preview`: short history/list preview.
- `createdAt`: ISO timestamp.
- `createdAtLabel`: temporary UI-friendly label such as `Today`.
- `schemaVersion`: currently `1.0`.
- `warnings`: plain-language ambiguity or missing-information notices.
- `payload`: output-specific structured data with a matching discriminator.

Provider names, model identifiers, token counts, and raw provider responses are
not part of the public app contract.

## Payload Semantics

- `note`: summary, one or more main points, and optional next steps.
- `todo`: one or more tasks, optional transcript-grounded due dates, optional
  priority suggestions, and per-task ambiguity flags.
- `email`: subject, greeting, body, and closing. Do not add commitments that the
  user did not make.
- `journal`: entry body plus optional transcript-supported mood, theme, and
  tomorrow focus. Do not diagnose the user.
- `content`: hook and draft plus optional caption and CTA. Do not fabricate
  claims, results, or sources.

Optional strings are omitted when unsupported. Empty-string placeholders are
invalid. A todo due date includes `sourceText`; when a transcript is available,
validation rejects a due date whose source text is absent from that transcript.
Unclear timing stays undated and is represented with `ambiguous: true` plus a
plain-language warning.

## Intent Routing

Routing precedence is deterministic for the MVP:

1. A user-selected type wins.
2. A clear spoken format request wins.
3. Otherwise, weighted language signals suggest the best type.
4. Weak or conflicting signals fall back to `note` with low confidence,
   `uncertain: true`, and a warning that supports the UI's `Change Type` action.

The routing result includes the suggestion, source, confidence, uncertainty,
matched signals, and warnings. These rules are an MVP fallback and are not
presented as final AI classification.

## Failure And Retry Behavior

- Unsupported request types return `unsupported_output_type`.
- Malformed requests return `invalid_request_body`.
- Transient generation failures return `generation_failed`.
- Structurally invalid generated data returns `invalid_generated_output`.
- User-facing errors do not expose provider details.
- The generation request transcript remains owned by the caller, allowing retry
  without retranscription. Errors do not log or echo raw transcript/content.
