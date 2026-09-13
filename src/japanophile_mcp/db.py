"""Shared SQLite helpers: seed fallback, big-DB graceful degradation, progress store."""

from __future__ import annotations

import shutil
import sqlite3
import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    # PyInstaller sidecar: assets bundled under japanophile_assets/, user data
    # next to the executable (Tauri resources dir).
    _BASE = Path(sys.executable).resolve().parent
    REPO_ROOT = Path(getattr(sys, "_MEIPASS", str(_BASE)))
    ASSET_ROOT = REPO_ROOT / "japanophile_assets"
    DATA_DIR = _BASE / "data"
else:
    REPO_ROOT = Path(__file__).resolve().parents[2]
    ASSET_ROOT = REPO_ROOT / "assets"
    DATA_DIR = REPO_ROOT / "data"
SEED_DIR = ASSET_ROOT / "seed"

# Small DBs ship in assets/seed and are readable in place.
SEED_DBS = ("kanji_database.db", "jlpt_questions.db")

# Vendored learning corpora under data/ (see data/README.md).
REQUIRED_DATA_FILES = (
    "kanji.db",
    "wakan_vocab.json",
)

DATA_FILE_HINTS = {
    "kanji.db": "vocab + jmdict + examples + jlpt_vocabulary (~135MB)",
    "wakan_vocab.json": "extended vocab JSON (~33MB)",
    "edict2.gz": "optional upstream EDICT (not wired yet)",
}


BUNDLED_DATA_DIR = ASSET_ROOT / "data"


def resolve_db(name: str) -> Path | None:
    """Return a readable DB path: data/, bundled data/, then assets/seed."""
    for base in (DATA_DIR, BUNDLED_DATA_DIR, SEED_DIR):
        candidate = base / name
        if candidate.is_file():
            return candidate
    return None


def resolve_data_file(name: str) -> Path | None:
    """Readable file under data/ or bundled data/ (e.g. wakan_vocab.json)."""
    for base in (DATA_DIR, BUNDLED_DATA_DIR):
        candidate = base / name
        if candidate.is_file():
            return candidate
    return None


def missing_db_message(name: str) -> str:
    hint = DATA_FILE_HINTS.get(name, "learning corpus")
    return (
        f"{name} is not present ({hint}). Restore data/{name} from git "
        "(see data/README.md). Maintainers: scripts/vendor_from_donor.ps1 to refresh."
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
