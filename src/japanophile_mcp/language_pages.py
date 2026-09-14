"""Curriculum HTML for the Language page (separate from Knowledge culture box)."""

from __future__ import annotations

from pathlib import Path

from .db import ASSET_ROOT
from .server import knowledge_html_for_embed

LANGUAGE_DIR = ASSET_ROOT / "language"

LANGUAGE_TABS: tuple[tuple[str, str], ...] = (
    ("overview", "Overview & basics"),
    ("writing", "Writing systems"),
    ("grammar", "Grammar"),
    ("keigo", "Keigo (honorifics)"),
    ("vocabulary", "Vocabulary"),
    ("phonetics", "Phonetics & pitch"),
    ("methods", "Learning methods"),
    ("materials", "Materials & exchange"),
    ("exams", "Exams & benchmarks"),
)


def language_tab_ids() -> list[str]:
    return [tab_id for tab_id, _ in LANGUAGE_TABS]


def resolve_language_tab(tab: str) -> Path | None:
    if not LANGUAGE_DIR.is_dir():
        return None
    slug = "".join(c for c in tab.strip().lower() if c.isalnum() or c in "-_")
    if not slug:
        return None
    # Legacy URLs
    if slug == "jlpt":
        slug = "exams"
    if slug == "textbooks":
        slug = "materials"
    target = LANGUAGE_DIR / f"{slug}.html"
    return target if target.is_file() else None


def language_html_for_embed(path: Path) -> str:
    return knowledge_html_for_embed(path)
