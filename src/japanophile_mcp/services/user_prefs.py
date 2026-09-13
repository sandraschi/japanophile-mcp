"""User preferences (study level, progress session) — data/user_prefs.json."""

from __future__ import annotations

import json
import re
from typing import Any

from japanophile_mcp.db import DATA_DIR

JLPT_LEVELS = ("N5", "N4", "N3", "N2", "N1")
PREFS_FILE = "user_prefs.json"
DEFAULT_PREFS: dict[str, str] = {
    "display_name": "",
    "default_jlpt_level": "N5",
    "progress_session_id": "japanophile-local",
}


def _path():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR / PREFS_FILE


def _normalize_level(raw: str) -> str:
    level = (raw or "N5").strip().upper()
    if level not in JLPT_LEVELS:
        raise ValueError(f"Invalid JLPT level '{raw}'. Use one of: {', '.join(JLPT_LEVELS)}")
    return level


def _normalize_session(raw: str) -> str:
    sid = (raw or DEFAULT_PREFS["progress_session_id"]).strip()
    if not sid:
        sid = DEFAULT_PREFS["progress_session_id"]
    if len(sid) > 64:
        raise ValueError("progress_session_id too long (max 64)")
    if not re.fullmatch(r"[A-Za-z0-9._-]+", sid):
        raise ValueError("progress_session_id: use letters, digits, . _ - only")
    return sid


def load_prefs() -> dict[str, Any]:
    path = _path()
    merged = dict(DEFAULT_PREFS)
    if path.is_file():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                merged.update({k: v for k, v in data.items() if k in DEFAULT_PREFS})
        except (json.JSONDecodeError, OSError):
            pass
    merged["default_jlpt_level"] = _normalize_level(str(merged.get("default_jlpt_level", "N5")))
    try:
        merged["progress_session_id"] = _normalize_session(
            str(merged.get("progress_session_id", DEFAULT_PREFS["progress_session_id"]))
        )
    except ValueError:
        merged["progress_session_id"] = DEFAULT_PREFS["progress_session_id"]
    merged["display_name"] = str(merged.get("display_name") or "")[:80]
    return merged


def save_prefs(payload: dict[str, Any]) -> dict[str, Any]:
    current = load_prefs()
    if "display_name" in payload:
        current["display_name"] = str(payload.get("display_name") or "")[:80]
    if "default_jlpt_level" in payload:
        current["default_jlpt_level"] = _normalize_level(str(payload["default_jlpt_level"]))
    if "progress_session_id" in payload:
        current["progress_session_id"] = _normalize_session(str(payload["progress_session_id"]))
    _path().write_text(json.dumps(current, indent=2), encoding="utf-8")
    return current


def quiz_levels_from_study(study_level: str) -> list[str]:
    """Levels at or above the user's study target (N2 -> N2, N1 only)."""
    level = _normalize_level(study_level)
    idx = JLPT_LEVELS.index(level)
    return list(JLPT_LEVELS[idx:])
