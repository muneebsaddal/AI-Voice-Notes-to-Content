from app.config import Settings


def test_defaults_are_local_cpu_int8():
    settings = Settings.from_env({})

    assert settings.model == "base.en"
    assert settings.device == "cpu"
    assert settings.compute_type == "int8"
    assert settings.language == "en"
    assert settings.host == "127.0.0.1"
    assert settings.port == 8001
