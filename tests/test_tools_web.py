"""Web tool harness routes."""

from fastapi.testclient import TestClient

from japanophile_mcp.http import build_app


def test_list_tools_includes_kanji():
    client = TestClient(build_app())
    res = client.get("/api/tools")
    assert res.status_code == 200
    body = res.json()
    names = [t["name"] for t in body["tools"]]
    assert "kanji" in names
    assert body["count"] >= 5


def test_invoke_kanji_lookup():
    client = TestClient(build_app())
    res = client.post(
        "/api/tools/kanji",
        json={"arguments": {"operation": "lookup", "query": "水"}},
    )
    assert res.status_code == 200
    payload = res.json()
    assert payload["success"] is True
    result = payload["result"]
    assert result.get("success") is True or "水" in str(result)


def test_api_help_returns_data_status():
    client = TestClient(build_app())
    res = client.get("/api/help")
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["success"] is True
    inner = body["data"]
    assert "data" in inner
    assert "kanji_database.db" in inner["data"]
    assert isinstance(inner.get("knowledge_pages"), int)
    assert "metrics" in inner
    assert inner["metrics"].get("kanji_entries", 0) or inner["metrics"]["kanji_entries"] is None


def test_games_stylesheet_and_theme_js():
    client = TestClient(build_app())
    css = client.get("/styles.css")
    assert css.status_code == 200
    assert "text/css" in css.headers.get("content-type", "")
    assert "body" in css.text
    js = client.get("/js/theme-switcher.js")
    assert js.status_code == 200
    assert "initTheme" in js.text or "gamesTheme" in js.text


def test_games_kanji_table_page():
    client = TestClient(build_app())
    page = client.get("/games/kanji-table.html")
    assert page.status_code == 200
    assert "kanjiTable" in page.text
    assert "/games/kanji-table.js" in page.text
    script = client.get("/games/kanji-table.js")
    assert script.status_code == 200
    assert "initializeKanjiTable" in script.text
    assert "/api/kanji/all" in script.text


def test_kanji_all_feeds_kanji_table():
    client = TestClient(build_app())
    res = client.get("/api/kanji/all", params={"limit": 500})
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["count"] >= 500
    assert len(body["kanji"]) >= 500
    first = body["kanji"][0]
    assert "kanji" in first
    assert "onyomi" in first
    assert "kunyomi" in first
    assert "meanings" in first


def test_vended_apps_hub():
    client = TestClient(build_app())
    res = client.get("/api/apps")
    assert res.status_code == 200
    body = res.json()
    assert "apps" in body
    assert isinstance(body["apps"], list)


def test_vended_logs_api():
    client = TestClient(build_app())
    res = client.get("/api/logs", params={"limit": 10})
    assert res.status_code == 200
    body = res.json()
    assert "entries" in body
    assert body["total"] >= 1
    client.get("/api/help")
    after = client.get("/api/logs", params={"limit": 20, "kind": "api"})
    assert after.status_code == 200
    api_rows = after.json()["entries"]
    assert any("GET /api/help" in e.get("detail", "") for e in api_rows)
    stats = client.get("/api/logs/stats")
    assert stats.status_code == 200
    assert stats.json()["rotation"] == "ring_buffer"


def test_vended_llm_providers_registry():
    client = TestClient(build_app())
    res = client.get("/api/llm/providers")
    assert res.status_code == 200
    body = res.json()
    ids = [p["id"] for p in body["providers"]]
    assert "ollama" in ids
    assert "openai" in ids


def test_vended_llm_test_ollama_shape():
    client = TestClient(build_app())
    res = client.get("/api/llm/test?provider=ollama")
    assert res.status_code == 200
    body = res.json()
    assert body["provider"] == "ollama"
    assert "inference" in body
    assert "message" in body
    assert isinstance(body["success"], bool)


def test_vended_llm_settings_roundtrip():
    client = TestClient(build_app())
    get0 = client.get("/api/settings/llm")
    assert get0.status_code == 200
    assert get0.json().get("model") == ""
    save = client.post(
        "/api/settings/llm",
        json={
            "provider": "ollama",
            "endpoint": "http://127.0.0.1:11434",
            "model": "",
        },
    )
    assert save.status_code == 200
    assert save.json()["success"] is True
