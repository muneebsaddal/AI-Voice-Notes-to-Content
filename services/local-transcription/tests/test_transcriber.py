from dataclasses import replace

from app.config import Settings
from app.transcriber import FasterWhisperTranscriber


class Segment:
    def __init__(self, text):
        self.text = text


class Info:
    language = "en"
    duration = 3.25


class FakeModel:
    calls = 0

    def transcribe(self, path, **kwargs):
        self.calls += 1
        return iter([Segment(" First sentence. "), Segment("Second sentence. ")]), Info()


def test_consumes_all_segments_and_reuses_model():
    model = FakeModel()
    settings = replace(Settings.from_env({}), vad_filter=True)
    transcriber = FasterWhisperTranscriber(settings, model=model)

    first = transcriber.transcribe("one.wav")
    second = transcriber.transcribe("two.wav")

    assert first.text == "First sentence. Second sentence."
    assert first.language == "en"
    assert first.duration_seconds == 3.25
    assert second.text == first.text
    assert model.calls == 2
