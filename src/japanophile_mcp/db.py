"""Shared SQLite helpers: seed fallback, big-DB graceful degradation, progress store."""

from __future__ import annotations

import shutil
import sqlite3
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"
SEED_DIR = REPO_ROOT / "assets" / "seed"

# Small DBs ship in assets/seed and are readable in place.
SEED_DBS = ("kanji_database.db", "jlpt_questions.db")

# Big DBs live in data/ only (see scripts/fetch_data.ps1). Never vendored.
BIG_DBS = {
    "kanji.db": "135MB kanji + 400k vocab + 278k examples + jmdict (ai-games-collection)",
    "wakan_vocab.json": "33MB extended vocab JSON",
    "edict2.gz": "7MB EDICT dictionary (upstream)",
}


def resolve_db(name: str) -> Path | None:
    """Return a readable DB path: data/ first, then assets/seed. None if absent."""
    for base in (DATA_DIR, SEED_DIR):
        candidate = base / name
        if candidate.is_file():
            return candidate
    return None


def missing_db_message(name: str) -> str:
    hint = BIG_DBS.get(name, "seed database")
    return (
        f"{name} is not present ({hint}). Run scripts/fetch_data.ps1 to fetch it, "
        "or copy it from an ai-games-collection checkout into data/."
    )


def open_ro(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(f"file:{path.as_posix()}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def progress_db() -> Path:
    """Writable progress store, created fresh. Seeds stay pristine."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / "progress.db"
    if not path.is_file():
        conn = sqlite3.connect(str(path))
        conn.execute(
            "CREATE TABLE IF NOT EXISTS answers ("
            "id INTEGER PRIMARY KEY, session_id TEXT, question_id INTEGER, "
            "user_answer TEXT, is_correct INTEGER, response_time_ms INTEGER, "
            "ts DATETIME DEFAULT CURRENT_TIMESTAMP)"
        )
        conn.commit()
        conn.close()
    return path


def ensure_data_from_seed(name: str) -> Path | None:
    """Copy a seed DB into data/ on first write need. Returns data path or None."""
    target = DATA_DIR / name
    if target.is_file():
        return target
    seed = SEED_DIR / name
    if seed.is_file():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy(seed, target)
        return target
    return None
