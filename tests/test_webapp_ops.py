"""webapp_ops surface — UI map, tour/diagnose receipts, REST routes."""

from fastapi.testclient import TestClient

from japanophile_mcp import server
from japanophile_mcp.http import build_app

client = TestClient(build_app())


def _call(tool, *args, **kwargs):
    fn = getattr(tool, "fn", tool)
    return fn(*args, **kwargs)


def test_ui_map_has_14_routes():
    res = _call(server.webapp_ops, "get_ui_map")
    assert res["success"], res
    assert res["route_count"] == 14
    assert "demo_60s" in res["ui_map"]["tour_presets"]


def test_tour_unknown_route_fails_with_known_paths():
    res = _call(server.webapp_ops, "tour_page", route="/nope")
    assert not res["success"]
    assert "14 known paths" in res["error"]


def test_tour_page_receipt_shape():
    res = _call(server.webapp_ops, "tour_page", route="/chat")
    assert res["success"], res
    assert res["operation"] == "tour_page"
    assert res["testid"] == "nav-chat"
    assert "chat-send" in res["assert"]
    assert res["mutating"] is True
    assert res["live_drive"]["done"] is False


def test_demo_preset_walks():
    res = _call(server.webapp_ops, "demo_webapp", preset="demo_60s")
    assert res["success"], res
    assert res["toured"] == res["of"] == 5
    assert res["video"] is None


def test_diagnose_shape():
    import json
    from pathlib import Path

    snapshot = (
        Path(__file__).resolve().parents[1] / "demos" / "webapp-ops-pilot" / "last-diagnosis.json"
    )
    backup = snapshot.read_text(encoding="utf-8") if snapshot.is_file() else None
    try:
        res = _call(server.webapp_ops, "diagnose_webapp")
        assert res["operation"] == "diagnose_webapp"
        assert res["of"] == 14
        assert len(res["pages"]) == 14
        body = json.loads(json.dumps(res))  # JSON-serializable for the REST route
        assert body["of"] == 14
    finally:
        if backup is not None:
            snapshot.write_text(backup, encoding="utf-8")


def test_http_ui_map_route():
    r = client.get("/api/ui-map")
    assert r.status_code == 200
    body = r.json()
    assert len(body["routes"]) == 14
    assert body["routes"][0]["testid"] == "nav-dashboard"


def test_http_diagnose_route():
    from pathlib import Path

    snapshot = (
        Path(__file__).resolve().parents[1] / "demos" / "webapp-ops-pilot" / "last-diagnosis.json"
    )
    backup = snapshot.read_text(encoding="utf-8") if snapshot.is_file() else None
    try:
        r = client.get("/api/webapp/diagnose")
        assert r.status_code == 200
        body = r.json()
        assert body["operation"] == "diagnose_webapp"
        assert body["of"] == 14
    finally:
        if backup is not None:
            snapshot.write_text(backup, encoding="utf-8")


def test_bad_operation():
    res = _call(server.webapp_ops, "dance")
    assert not res["success"]
