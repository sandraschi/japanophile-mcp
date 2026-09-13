"""User preferences API and level filtering."""

import pytest
from fastapi.testclient import TestClient

from japanophile_mcp import db
from japanophile_mcp.http import build_app
from japanophile_mcp.services import user_prefs


@pytest.fixture
def isolated_data_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(user_prefs, "DATA_DIR", tmp_path)
    return tmp_path


def test_user_prefs_defaults(isolated_data_dir):
    client = TestClient(build_app())
    res = client.get("/api/user/prefs")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["prefs"]["default_jlpt_level"] == "N5"
    assert body["quiz_levels"] == ["N5", "N4", "N3", "N2", "N1"]


def test_user_prefs_n2_quiz_levels(isolated_data_dir):
    client = TestClient(build_app())
    save = client.post(
        "/api/user/prefs",
        json={"default_jlpt_level": "N2", "progress_session_id": "test-n2"},
    )
    assert save.status_code == 200
    body = save.json()
    assert body["prefs"]["default_jlpt_level"] == "N2"
    assert body["quiz_levels"] == ["N2", "N1"]
    assert "N5" not in body["quiz_levels"]


def test_quiz_levels_from_study_unit():
    assert user_prefs.quiz_levels_from_study("N2") == ["N2", "N1"]
    assert user_prefs.quiz_levels_from_study("N5") == list(user_prefs.JLPT_LEVELS)
