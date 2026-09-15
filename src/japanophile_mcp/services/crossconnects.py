"""Fleet crossconnects: speech-mcp (TTS), calibre-mcp (library), plex-mcp (media).

Thin proxies to sibling fleet MCP servers over their existing REST APIs — no
new protocol, no vendored copy of their data. Each peer is optional and
independently started; unreachable means a friendly `_unreachable()` message,
never a traceback, same graceful-degradation philosophy PRD.md applies to
missing local DBs. See mcp-central-docs/projects/japanophile-mcp/PHILE_PATTERN.md.
"""

from __future__ import annotations

import os
from urllib.parse import urlencode

import httpx

from .fleet_common import get_json

SPEECH_MCP_URL = os.getenv("SPEECH_MCP_URL", "http://127.0.0.1:10909").rstrip("/")
CALIBRE_MCP_URL = os.getenv("CALIBRE_MCP_URL", "http://127.0.0.1:10720").rstrip("/")
PLEX_MCP_URL = os.getenv("PLEX_MCP_URL", "http://127.0.0.1:10740").rstrip("/")


def _unreachable(name: str, url: str, detail: str) -> dict:
    return {
        "success": False,
        "message": f"{name} not reachable at {url} ({detail}). Start it, or point"
        f" the *_MCP_URL env var at wherever it runs.",
        "data": None,
    }


def speak(text: str, provider: str = "gemini", voice_id: str = "default") -> dict:
    """POST speech-mcp /api/v1/tts. Plays on speech-mcp's own speaker (agent-side
    voice output) — for audio the caller can play back, use tts_wav_url instead.
    Defaults to Gemini over Windows SAPI (voice quality preference); pass
    provider="windows" explicitly if Gemini isn't configured on speech-mcp.
    """
    if not text.strip():
        return {"success": False, "message": "speak needs non-empty text.", "data": None}
    # speech-mcp's POST /api/v1/tts passes voice_id="default" through literally to
    # Gemini as a voice NAME (500s — "default" isn't a real Gemini voice), unlike
    # its GET /api/v1/tts/wav sibling which normalizes "default" to "Kore" first.
    # Verified 2026-09-15; worked around here rather than in speech-mcp.
    if provider == "gemini" and voice_id in ("", "default"):
        voice_id = "Kore"
    try:
        resp = httpx.post(
            f"{SPEECH_MCP_URL}/api/v1/tts",
            json={"text": text, "provider": provider, "voice_id": voice_id},
            timeout=45.0,  # Gemini is much slower than Windows SAPI — see tts_wav_url note
        )
        resp.raise_for_status()
        return {
            "success": True,
            "message": f"Spoken via speech-mcp ({provider}).",
            "data": resp.json(),
        }
    except httpx.HTTPError as exc:
        return _unreachable("speech-mcp", SPEECH_MCP_URL, str(exc))


def voices() -> dict:
    """GET speech-mcp /api/v1/voices — real provider/voice list, for a UI dropdown.
    Never hardcode a voice list here: speech-mcp's providers and cloned voices
    change independently of this repo.
    """
    ok, data, err = get_json(f"{SPEECH_MCP_URL}/api/v1/voices", timeout=10.0)
    if not ok:
        return _unreachable("speech-mcp", SPEECH_MCP_URL, err)
    return {"success": True, "message": "Voices from speech-mcp.", "data": data}


def tts_wav_url(text: str, provider: str = "gemini", voice_id: str = "default") -> str:
    """Direct speech-mcp WAV URL — for an `<audio>` tag or a streaming HTTP proxy.

    Defaults to Gemini over Windows SAPI (noticeably better voice quality; Sandra's
    preference 2026-09-15). If speech-mcp has no Gemini API key configured, that
    surfaces as a clear 503/error rather than silently degrading — pass
    provider="windows" explicitly as a fallback if needed.
    """
    qs = urlencode({"text": text, "provider": provider, "voice_id": voice_id})
    return f"{SPEECH_MCP_URL}/api/v1/tts/wav?{qs}"


def library_search(query: str = "", tag: str = "", limit: int = 20) -> dict:
    """GET calibre-mcp /api/search/ — Sandra's Calibre library, by query and/or tag.

    calibre-mcp's `query` param is currently a no-op server-side (verified
    2026-09-15: a nonsense query returns the same fixed result set as any
    other) — flagged upstream, not fixed here. `tag` filters correctly, so
    when `query` is given this also filters client-side over title/authors/
    tags on top of whatever the server returns, to keep this tool's own
    contract honest regardless of the upstream bug.
    """
    if not query.strip() and not tag.strip():
        return {"success": False, "message": "library_search needs query or tag.", "data": None}
    limit = max(1, min(limit, 50))
    params: dict[str, str | int] = {"limit": 200 if query.strip() else limit}
    if tag.strip():
        params["tag"] = tag.strip()
    ok, data, err = get_json(f"{CALIBRE_MCP_URL}/api/search/?{urlencode(params)}", timeout=10.0)
    if not ok:
        return _unreachable("calibre-mcp", CALIBRE_MCP_URL, err)
    items = (data or {}).get("items", [])
    needle = query.strip().lower()
    if needle:
        items = [
            item
            for item in items
            if needle in (item.get("title") or "").lower()
            or needle in " ".join(item.get("authors") or []).lower()
            or needle in " ".join(item.get("tags") or []).lower()
        ]
    items = items[:limit]
    slim = [
        {
            "id": item.get("id"),
            "title": item.get("title"),
            "authors": item.get("authors"),
            "tags": item.get("tags"),
            "rating": item.get("rating"),
        }
        for item in items
    ]
    return {"success": True, "message": f"{len(slim)} book(s) in your Calibre library.", "data": slim}


def media_search(query: str, media_type: str = "", limit: int = 20) -> dict:
    """GET plex-mcp /api/search/ — Sandra's Plex library, by query and optional media_type
    (movie, show, episode, artist, album, track, photo...).

    plex-mcp's `media_type` param is currently a no-op server-side (verified
    2026-09-15: results include every type regardless) — flagged upstream, not
    fixed here. `query` filters correctly, so when media_type is given this
    also filters client-side by `item.type`, fetching a wider batch first so
    filtering still leaves up to `limit` matches.
    """
    if not query.strip():
        return {"success": False, "message": "media_search needs a query.", "data": None}
    limit = max(1, min(limit, 50))
    fetch_limit = min(limit * 5, 200) if media_type.strip() else limit
    params: dict[str, str | int] = {"query": query.strip(), "limit": fetch_limit}
    ok, data, err = get_json(f"{PLEX_MCP_URL}/api/search/?{urlencode(params)}", timeout=10.0)
    if not ok:
        return _unreachable("plex-mcp", PLEX_MCP_URL, err)
    items = (data or {}).get("data", [])
    wanted = media_type.strip().lower()
    if wanted:
        items = [item for item in items if (item.get("type") or "").lower() == wanted]
    items = items[:limit]
    slim = [
        {
            "id": item.get("id"),
            "title": item.get("title"),
            "type": item.get("type"),
            "summary": (item.get("summary") or "")[:280],
        }
        for item in items
    ]
    message = f"{len(slim)} result(s)." if wanted else (data or {}).get("message", f"{len(slim)} result(s).")
    return {"success": True, "message": message, "data": slim}
