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
