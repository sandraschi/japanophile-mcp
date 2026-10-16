"""webapp_ops helpers - authoritative UI map + tour/diagnose receipts.

Port of the learnbot-mcp self-driving-webapp pilot (2026-10-15) to
japanophile-mcp. Phase 1 is static receipts only: no Playwright, no
browser, no fake passes. Live DOM driving is phase 2 and MUST refuse
honestly when Playwright is unavailable.

The map source of truth is ``webapp/public/ui-map.json`` (shipped with the
build). Fallback order: public/ -> embedded minimal (14 routes, no narration).

Sync throughout: this repo's tools are plain ``def`` (see server._call).
"""

from __future__ import annotations

import json
import logging
import os
from datetime import UTC, datetime
from pathlib import Path

log = logging.getLogger(__name__)

OPERATIONS = ("get_ui_map", "tour_page", "demo_webapp", "diagnose_webapp")

_REPO_ROOT = Path(__file__).resolve().parents[2]
_PUBLIC_MAP = _REPO_ROOT / "webapp" / "public" / "ui-map.json"

BACKEND_PORT = int(os.getenv("JAPANOPHILE_HTTP_PORT", "11193"))
SPEECH_MCP_URL = os.getenv("SPEECH_MCP_URL", "http://127.0.0.1:10909").rstrip("/")


def _embedded_map() -> dict:
    routes = [
        {
            "path": p,
            "label": lbl,
            "testid": f"nav-{slug}",
            "page_testid": pt,
            "narrate": f"{lbl} page.",
            "assert": asserts,
            "mutating": m,
        }
        for p, lbl, slug, pt, asserts, m in [
            (
                "/",
                "Dashboard",
                "dashboard",
                "dashboard-hero",
                ["dashboard-hero", "kpi-grid"],
                False,
            ),
            ("/language", "Language", "language", "language-article", ["language-article"], False),
            ("/know", "Knowledge", "know", "know-list", ["know-list", "know-article"], False),
            ("/travel", "Travel", "travel", "travel-page", ["travel-page", "travel-hero"], False),
            ("/diary", "Diary", "diary", "diary-page", ["diary-page", "diary-entries"], False),
            (
                "/library",
                "Library",
                "library",
                "library-read-results",
                ["library-read-results"],
                False,
            ),
            ("/games", "Practice", "games", "games-list", ["games-list", "game-frame"], False),
            ("/chat", "Chat", "chat", "chat-log", ["chat-log", "chat-input", "chat-send"], True),
            ("/skills", "Skills", "skills", "skill-text", ["skill-text"], False),
            ("/tools", "MCP Tools", "tools", "tools-page", ["tools-page", "tools-list"], False),
            ("/apps", "Apps", "apps", "apps-page", ["apps-page", "apps-hero"], False),
            ("/settings", "Settings", "settings", "ai-settings-page", ["ai-settings-page"], False),
            ("/help", "Help", "help", "help-page", ["help-page", "help-panel-start"], False),
            ("/logs", "Logs", "logs", "logs-page", ["logs-page", "logs-stream"], False),
        ]
    ]
    return {
        "app": "japanophile-mcp",
        "version": "embedded-fallback",
        "routes": routes,
        "tour_presets": {
            "demo_60s": ["/", "/language", "/know", "/chat", "/travel"],
            "onboarding": ["/", "/settings", "/chat"],
            "full_walk": ["all"],
        },
        "_source": "embedded-fallback",
    }


def load_ui_map() -> dict:
    """Load the authoritative UI map. Never raises - falls back to embedded."""
    try:
        if _PUBLIC_MAP.is_file():
            data = json.loads(_PUBLIC_MAP.read_text(encoding="utf-8"))
            data["_source"] = str(_PUBLIC_MAP.relative_to(_REPO_ROOT))
            return data
    except Exception as exc:  # noqa: BLE001 - map must never raise; embedded fallback covers all
        log.warning("ui-map read failed %s: %s", _PUBLIC_MAP, exc)
    return _embedded_map()


def _find_route(ui_map: dict, route: str) -> dict | None:
    for entry in ui_map.get("routes", []):
        if entry.get("path") == route:
            return entry
    return None


def _dist_available() -> bool:
    dist = _REPO_ROOT / "webapp" / "dist" / "index.html"
    return dist.is_file()


def _backend_health() -> dict:
    """Best-effort health probe. Never raises - reports unreachable honestly."""
    try:
        import httpx

        url = f"http://127.0.0.1:{BACKEND_PORT}/health"
        resp = httpx.get(url, timeout=3.0)
        return {
            "reachable": resp.status_code == 200,
            "status_code": resp.status_code,
            "url": url,
        }
    except Exception as exc:  # noqa: BLE001 - probe reports unreachable honestly, never raises
        return {"reachable": False, "error": f"{type(exc).__name__}: {exc}"}


def _speak_via_companion(text: str) -> dict:
    """Soft crossconnect to speech-mcp POST /api/v1/tts. Never raises."""
    try:
        import httpx

        url = f"{SPEECH_MCP_URL}/api/v1/tts"
        resp = httpx.post(url, json={"text": text, "provider": "windows"}, timeout=5.0)
        if resp.status_code == 200:
            return {"spoken": True, "via": "speech-mcp", "url": url}
        return {
            "spoken": False,
            "via": "speech-mcp",
            "error": f"HTTP {resp.status_code}: {resp.text[:200]}",
        }
    except Exception as exc:  # noqa: BLE001 - voiceover degrades to text, never raises
        return {
            "spoken": False,
            "via": None,
            "needs_companion": "speech-mcp https://github.com/sandraschi/speech-mcp",
            "error": f"{type(exc).__name__}: {exc}",
        }


def op_get_ui_map() -> dict:
    ui_map = load_ui_map()
    return {
        "success": True,
        "operation": "get_ui_map",
        "source": ui_map.pop("_source", "unknown"),
        "route_count": len(ui_map.get("routes", [])),
        "ui_map": ui_map,
    }


def op_tour_page(route: str = "/", speak: bool = False) -> dict:
    ui_map = load_ui_map()
    entry = _find_route(ui_map, route)
    if entry is None:
        return {
            "success": False,
            "operation": "tour_page",
            "route": route,
            "error": f"unknown route {route!r}; see get_ui_map for 14 known paths",
        }
    health = _backend_health()
    receipt: dict = {
        "success": True,
        "operation": "tour_page",
        "route": route,
        "label": entry.get("label"),
        "testid": entry.get("testid"),
        "page_testid": entry.get("page_testid"),
        "assert": entry.get("assert", []),
        "narrate": entry.get("narrate", ""),
        "mutating": bool(entry.get("mutating", False)),
        "frontend_dist": _dist_available(),
        "backend": health,
        "live_drive": {
            "done": False,
            "reason": "phase-1 static receipt; Playwright live-drive not yet wired",
        },
    }
    if speak:
        receipt["voiceover"] = _speak_via_companion(str(entry.get("narrate", "")))
    elif entry.get("mutating"):
        receipt["note"] = "mutating page: screenshot + narrate only, no form submit in pilot"
    return receipt


def op_demo_webapp(preset: str = "demo_60s", speak: bool = False) -> dict:
    ui_map = load_ui_map()
    presets = ui_map.get("tour_presets", {})
    if preset not in presets:
        return {
            "success": False,
            "operation": "demo_webapp",
            "preset": preset,
            "error": f"unknown preset; known: {sorted(presets)}",
        }
    wanted: list[str] = presets[preset]
    if wanted == ["all"]:
        wanted = [r.get("path", "/") for r in ui_map.get("routes", [])]
    stops = [op_tour_page(route=path, speak=speak) for path in wanted]
    ok = sum(1 for s in stops if s.get("success"))
    return {
        "success": ok == len(stops),
        "operation": "demo_webapp",
        "preset": preset,
        "stops": stops,
        "toured": ok,
        "of": len(stops),
        "video": None,
        "note": "phase-1 receipts only; Playwright video lands in phase 2",
    }


def op_diagnose_webapp() -> dict:
    ui_map = load_ui_map()
    routes = ui_map.get("routes", [])
    health = _backend_health()
    dist = _dist_available()
    pages = []
    for entry in routes:
        pages.append(
            {
                "path": entry.get("path"),
                "label": entry.get("label"),
                "page_testid": entry.get("page_testid"),
                "assert": entry.get("assert", []),
                "mutating": bool(entry.get("mutating", False)),
                "frontend_dist": dist,
                "backend_reachable": health.get("reachable", False),
                "status": "receipt-ok" if dist else "frontend-dist-missing",
            }
        )
    broken = [p for p in pages if p["status"] != "receipt-ok"]
    snapshot = {
        "app": ui_map.get("app", "japanophile-mcp"),
        "at": datetime.now(UTC).isoformat(timespec="seconds"),
        "pages": pages,
        "backend": health,
        "ok": len(pages) - len(broken),
        "of": len(pages),
    }
    try:
        out = _REPO_ROOT / "demos" / "webapp-ops-pilot" / "last-diagnosis.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
        snapshot["snapshot_path"] = str(out.relative_to(_REPO_ROOT))
    except Exception as exc:  # noqa: BLE001 - snapshot is best-effort, receipt still returned
        snapshot["snapshot_error"] = f"{type(exc).__name__}: {exc}"
    return {"success": len(broken) == 0, "operation": "diagnose_webapp", **snapshot}
