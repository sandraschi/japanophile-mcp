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
