"""japanophile-mcp: kanji/JLPT learning tools + Japanese knowledge box over MCP.

Stage 1 (this file): working MCP server, stdio + HTTP. Portmanteau tools,
dialogic returns, read-only seeds, graceful degradation for unfetched big DBs.
Stage 2 (roadmap): React webapp + chat/skills pages, Tauri NSIS winapp, travel
planner + diary tools.
"""

from __future__ import annotations

import html as html_mod
import sqlite3
from html.parser import HTMLParser
from pathlib import Path

from fastmcp import FastMCP

from .db import (
    REPO_ROOT,
    ensure_data_from_seed,
    missing_db_message,
    open_ro,
    progress_db,
    resolve_db,
)

mcp = FastMCP("japanophile-mcp")

KNOWLEDGE_DIR = REPO_ROOT / "assets" / "knowledge" / "japan"


def ok(message: str, data: object = None) -> dict:
    return {"success": True, "message": message, "data": data}


def fail(message: str) -> dict:
    return {"success": False, "message": message, "data": None}


class _TextDump(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        text = data.strip()
        if text:
            self.parts.append(text)


def html_to_text(path: Path, limit: int = 6000) -> str:
    parser = _TextDump()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    text = "\n".join(parser.parts)
    text = html_mod.unescape(text)
    if len(text) > limit:
        return text[:limit] + "\n...[truncated]"
    return text


@mcp.tool()
def kanji(
    operation: str,
    query: str = "",
    level: str = "",
    grade: int = 0,
    radical: str = "",
    limit: int = 20,
) -> dict:
    """Kanji dictionary: lookup | search | by_jlpt | by_grade | by_radical | random.

    lookup: query=single kanji char. search: query=English meaning fragment.
    by_jlpt: level=N5..N1. by_grade: grade=1..8. by_radical: radical=char.
    random: optional level filter.
    """
    db = resolve_db("kanji_database.db")
    if db is None:
        return fail(missing_db_message("kanji_database.db"))
    limit = max(1, min(limit, 50))
    conn = open_ro(db)
    try:
        if operation == "lookup":
            rows = conn.execute(
                "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,"
                " categories, frequency, radical, is_jouyou FROM kanji WHERE kanji = ?",
                (query.strip(),),
            ).fetchall()
        elif operation == "search":
            rows = conn.execute(
                "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,"
                " radical FROM kanji WHERE meanings LIKE ? LIMIT ?",
                (f"%{query.strip()}%", limit),
            ).fetchall()
        elif operation == "by_jlpt":
            rows = conn.execute(
                "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes FROM kanji"
                " WHERE jlpt = ? ORDER BY frequency LIMIT ?",
                (level.strip().upper(), limit),
            ).fetchall()
        elif operation == "by_grade":
            rows = conn.execute(
                "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes FROM kanji"
                " WHERE grade = ? LIMIT ?",
                (grade, limit),
            ).fetchall()
        elif operation == "by_radical":
            rows = conn.execute(
                "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes FROM kanji"
                " WHERE radical = ? LIMIT ?",
                (radical.strip(), limit),
            ).fetchall()
        elif operation == "random":
            if level:
                rows = conn.execute(
                    "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes FROM kanji"
                    " WHERE jlpt = ? ORDER BY RANDOM() LIMIT ?",
                    (level.strip().upper(), limit),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes FROM kanji"
                    " ORDER BY RANDOM() LIMIT ?",
                    (limit,),
                ).fetchall()
        else:
            return fail(
                f"Unknown kanji operation '{operation}'. Valid: lookup, search, by_jlpt,"
                " by_grade, by_radical, random."
            )
        return ok(f"{len(rows)} result(s) for kanji/{operation}", [dict(r) for r in rows])
    finally:
        conn.close()


@mcp.tool()
def jlpt(
    operation: str,
    level: str = "N5",
    question_id: int = 0,
    answer: str = "",
    session_id: str = "default",
    response_time_ms: int = 0,
) -> dict:
    """JLPT quiz: next | answer | progress.

    next: random unseen question for level (N5..N1, falls back to any level).
    answer: grade question_id with letter; records to progress store.
    progress: session score summary.
    """
    seed = resolve_db("jlpt_questions.db")
    if seed is None:
        return fail(missing_db_message("jlpt_questions.db"))
    # Writable copy for progress-adjacent tables; reads work from seed directly.
    ensure_data_from_seed("jlpt_questions.db")
    conn = open_ro(seed)
    try:
        if operation == "next":
            row = conn.execute(
                "SELECT q.id, q.level, q.question_type, q.question_text FROM questions q"
                " WHERE q.level = ? ORDER BY RANDOM() LIMIT 1",
                (level.strip().upper(),),
            ).fetchone()
            if row is None:
                row = conn.execute(
                    "SELECT q.id, q.level, q.question_type, q.question_text FROM questions q"
                    " ORDER BY RANDOM() LIMIT 1"
                ).fetchone()
            if row is None:
                return fail("No JLPT questions in database.")
            opts = conn.execute(
                "SELECT option_letter, option_text FROM question_options"
                " WHERE question_id = ? ORDER BY option_letter",
                (row["id"],),
            ).fetchall()
            data = dict(row)
            data["options"] = [dict(o) for o in opts]
            return ok(
                "Question {} ({} {})".format(row["id"], row["level"], row["question_type"]), data
            )
        if operation == "answer":
            row = conn.execute(
                "SELECT q.id, q.level FROM questions q WHERE q.id = ?", (question_id,)
            ).fetchone()
            if row is None:
                return fail(f"Unknown question_id {question_id}.")
            opts = conn.execute(
                "SELECT option_letter, option_text, explanation FROM question_options"
                " WHERE question_id = ?",
                (question_id,),
            ).fetchall()
            # Correct answer: options table carries explanation per option; the
            # seed marks correctness via questions.correct_answer where present.
            correct = None
            try:
                correct = conn.execute(
                    "SELECT correct_answer FROM questions WHERE id = ?", (question_id,)
                ).fetchone()[0]
            except sqlite3.Error:
                correct = None
            given = (answer or "").strip().upper()
            is_correct = correct is not None and given == str(correct).strip().upper()
            pdb = sqlite3.connect(str(progress_db()))
            pdb.execute(
                "INSERT INTO answers (session_id, question_id, user_answer, is_correct,"
                " response_time_ms) VALUES (?, ?, ?, ?, ?)",
                (session_id, question_id, given, int(is_correct), response_time_ms),
            )
            pdb.commit()
            pdb.close()
            return ok(
                "Answer recorded: {}.".format(
                    "correct"
                    if is_correct
                    else "not correct"
                    if correct is not None
                    else "recorded (no key in seed)"
                ),
                {
                    "question_id": question_id,
                    "given": given,
                    "correct": correct,
                    "is_correct": is_correct,
                    "explanations": [dict(o) for o in opts],
                },
            )
        if operation == "progress":
            pdb = sqlite3.connect(str(progress_db()))
            pdb.row_factory = sqlite3.Row
            rows = pdb.execute(
                "SELECT COUNT(*) AS n, SUM(is_correct) AS ok FROM answers WHERE session_id = ?",
                (session_id,),
            ).fetchone()
            pdb.close()
            n = rows["n"] or 0
            good = rows["ok"] or 0
            return ok(
                f"Session '{session_id}': {good}/{n} correct.",
                {"session_id": session_id, "answered": n, "correct": good},
            )
        return fail(f"Unknown jlpt operation '{operation}'. Valid: next, answer, progress.")
    finally:
        conn.close()


@mcp.tool()
def vocab(operation: str, query: str = "", level: str = "", limit: int = 20) -> dict:
    """Vocabulary: search | by_jlpt. Needs the big kanji.db (135MB, fetched).

    search: expression/reading/translation fragment. by_jlpt: jlpt_vocabulary level.
    """
    db = resolve_db("kanji.db")
    if db is None:
        return fail(missing_db_message("kanji.db"))
    limit = max(1, min(limit, 50))
    conn = open_ro(db)
    try:
        if operation == "search":
            like = f"%{query.strip()}%"
            rows = conn.execute(
                "SELECT expression, reading, translation, tags FROM vocabulary"
                " WHERE expression LIKE ? OR reading LIKE ? OR translation LIKE ?"
                " LIMIT ?",
                (like, like, like, limit),
            ).fetchall()
            jrows = conn.execute(
                "SELECT expression, reading, translation, tags FROM jmdict"
                " WHERE expression LIKE ? OR reading LIKE ? OR translation LIKE ?"
                " LIMIT ?",
                (like, like, like, limit),
            ).fetchall()
            return ok(
                f"vocab {len(rows)} + jmdict {len(jrows)} result(s).",
                {"vocabulary": [dict(r) for r in rows], "jmdict": [dict(r) for r in jrows]},
            )
        if operation == "by_jlpt":
            rows = conn.execute(
                "SELECT expression, reading, meaning, jlpt_level FROM jlpt_vocabulary"
                " WHERE jlpt_level = ? LIMIT ?",
                (level.strip().upper(), limit),
            ).fetchall()
            return ok(f"{len(rows)} jlpt_vocabulary result(s).", [dict(r) for r in rows])
        return fail(f"Unknown vocab operation '{operation}'. Valid: search, by_jlpt.")
    finally:
        conn.close()


@mcp.tool()
def knowledge(operation: str, page: str = "") -> dict:
    """Culture knowledge box: list | get. Vendored japan/ pages from ai-games-collection."""
    if not KNOWLEDGE_DIR.is_dir():
        return fail("Knowledge pages missing: assets/knowledge/japan/ not found.")
    if operation == "list":
        pages = sorted(p.stem for p in KNOWLEDGE_DIR.glob("*.html"))
        return ok(f"{len(pages)} knowledge page(s).", pages)
    if operation == "get":
        name = "".join(
            c for c in page.strip().lower().replace(" ", "-") if c.isalnum() or c in "-_"
        )
        target = KNOWLEDGE_DIR / (name + ".html")
        if not target.is_file():
            # Fuzzy fallback: substring match on stems.
            matches = [p for p in KNOWLEDGE_DIR.glob("*.html") if name in p.stem]
            if not matches:
                return fail(f"Unknown knowledge page '{page}'. Use knowledge/list first.")
            target = matches[0]
        return ok(f"Knowledge page: {target.stem}.", html_to_text(target))
    return fail(f"Unknown knowledge operation '{operation}'. Valid: list, get.")


@mcp.tool()
def japanophile_help() -> dict:
    """List tools, data status, and next steps for agents and IDEs."""
    status = {}
    for name in ("kanji_database.db", "jlpt_questions.db", "kanji.db"):
        hit = resolve_db(name)
        status[name] = hit.as_posix() if hit else "MISSING - run scripts/fetch_data.ps1"
    pages = len(list(KNOWLEDGE_DIR.glob("*.html"))) if KNOWLEDGE_DIR.is_dir() else 0
    return ok(
        "japanophile-mcp: Learn (kanji, jlpt, vocab) + Know (knowledge box)."
        " Travel planner + diary are roadmap, not tools yet.",
        {
            "tools": ["kanji", "jlpt", "vocab", "knowledge", "japanophile_help"],
            "data": status,
            "knowledge_pages": pages,
            "ports": {"backend": 11193, "frontend": 11194},
        },
    )


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
