"""Inspect kanji.db schema (local data/ or pass path as argv[1])."""
import sqlite3
import sys
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
default = repo / "data" / "kanji.db"
p = Path(sys.argv[1]) if len(sys.argv) > 1 else default
if not p.is_file():
    print(f"Missing {p}. Restore from git or run scripts/vendor_from_donor.ps1.")
    raise SystemExit(1)

conn = sqlite3.connect(f"file:{p.as_posix()}?mode=ro", uri=True)
cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY 1")
print("tables:", [r[0] for r in cur.fetchall()])
for table in ("examples", "vocabulary", "jmdict", "jlpt_vocabulary"):
    try:
        n = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"{table}: {n}")
    except sqlite3.Error as e:
        print(f"{table}: {e}")
conn.close()
