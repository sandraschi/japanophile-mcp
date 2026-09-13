"""Compat shim: old ai-games-collection API shapes for the vendored games.

The vendored html/js learning tools call the games backend's REST shapes
(/api/kanji/search?jlpt=, /api/vocabulary, /api/jlpt/questions, ...).
Rewriting vendored files would fork them; this adapter maps old shapes onto
the new MCP-backed impl instead. Vendored files stay pristine.

Big-DB endpoints (vocab lists, examples, compounds) answer success:false when
kanji.db is unfetched - every caller has an offline fallback.
"""

from __future__ import annotations

import json
import sqlite3

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from . import server
from .db import open_ro, progress_db, resolve_db


def _arr(raw: object) -> list:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x) for x in raw]
    text = str(raw).strip()
    if not text:
        return []
    if text.startswith("["):
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return [str(x) for x in parsed]
        except ValueError:
            pass
    return [p.strip(" '\"") for p in text.replace(",", " ").split() if p.strip(" '\"")]


def _call(tool, *args, **kwargs) -> dict:
    fn = getattr(tool, "fn", tool)
    res = fn(*args, **kwargs)
    return res if isinstance(res, dict) else {"success": True, "data": res}


def mount_compat(app: FastAPI) -> None:
    @app.get("/api/kanji/all")
    def kanji_all(limit: int = 500) -> JSONResponse:
        db = resolve_db("kanji_database.db")
        if db is None:
            return JSONResponse({"success": False, "error": "seed missing"})
        conn = open_ro(db)
        try:
            rows = conn.execute(
                "SELECT kanji, meanings, categories, strokes, grade, radical, jlpt"
                " FROM kanji LIMIT ?",
                (max(1, min(limit, 2000)),),
            ).fetchall()
            return JSONResponse(
                {
                    "success": True,
                    "kanji": [
                        {
                            "kanji": r["kanji"],
                            "meanings": _arr(r["meanings"]),
                            "categories": _arr(r["categories"]),
                            "strokes": r["strokes"],
                            "grade": r["grade"],
                            "radical": r["radical"],
                            "jlpt": r["jlpt"],
                        }
                        for r in rows
                    ],
                }
            )
        finally:
            conn.close()

    @app.get("/api/kanji/search")
    def kanji_search(jlpt: str = "", limit: int = 100) -> JSONResponse:
        res = _call(
            server.kanji,
            "by_jlpt" if jlpt else "random",
            level=jlpt.upper(),
            limit=max(1, min(limit, 200)),
        )
        if not res.get("success"):
            return JSONResponse({"success": False, "error": res.get("message")})
        out = []
        for r in res["data"]:
            out.append(
                {
                    "kanji": r["kanji"],
                    "onyomi": _arr(r.get("onyomi")),
                    "kunyomi": _arr(r.get("kunyomi")),
                    "meanings": _arr(r.get("meanings")),
                    "jlpt": r.get("jlpt"),
                    "radical": r.get("radical"),
                }
            )
        return JSONResponse({"success": True, "kanji": out})

    @app.get("/api/kanji/compounds")
    def kanji_compounds(kanji: str = "", limit: int = 6) -> JSONResponse:
        db = resolve_db("kanji.db")
        if db is None:
            return JSONResponse({"success": True, "compounds": []})
        conn = open_ro(db)
        try:
            like = f"%{kanji.strip()}%"
            rows = conn.execute(
                "SELECT expression AS word, reading, translation AS meaning FROM jmdict"
                " WHERE expression LIKE ? LIMIT ?",
                (like, max(1, min(limit, 20))),
            ).fetchall()
            return JSONResponse({"success": True, "compounds": [dict(r) for r in rows]})
        finally:
            conn.close()

    @app.get("/api/vocabulary")
    def vocabulary(jlpt: str = "all", limit: int = 200) -> JSONResponse:
        return _vocab_list(jlpt, limit)

    @app.get("/api/vocab/jlpt")
    def vocab_jlpt(level: str = "N5", limit: int = 60) -> JSONResponse:
        return _vocab_list(level, limit)

    @app.get("/api/examples/search")
    def examples_search(word: str = "", limit: int = 4) -> JSONResponse:
        db = resolve_db("kanji.db")
        if db is None:
            return JSONResponse({"success": False, "error": "kanji.db not fetched"})
        conn = open_ro(db)
        try:
            rows = conn.execute(
                "SELECT japanese, english FROM examples WHERE japanese LIKE ? LIMIT ?",
                (f"%{word.strip()}%", max(1, min(limit, 10))),
            ).fetchall()
            return JSONResponse({"success": True, "examples": [dict(r) for r in rows]})
        finally:
            conn.close()

    @app.get("/api/jlpt/questions")
    def jlpt_questions(
        level: str = "N5",
        type: str = "mixed",
        limit: int = 10,
        exclude_ids: str = "",
        test_set: int = 0,
    ) -> JSONResponse:
        db = resolve_db("jlpt_questions.db")
        if db is None:
            return JSONResponse({"success": False, "error": "seed missing"})
        excluded = {p.strip() for p in exclude_ids.split(",") if p.strip()}
        conn = open_ro(db)
        try:
            q = "SELECT id, level, question_type, question_text FROM questions WHERE level = ?"
            params: list = [level.strip().upper()]
            if type.strip().lower() not in ("mixed", "", "all"):
                q += " AND question_type = ?"
                params.append(type.strip().lower())
            if test_set:
                q += " AND test_set = ?"
                params.append(test_set)
            q += " ORDER BY RANDOM() LIMIT ?"
            params.append(max(1, min(limit, 50)) * 3)
            out = []
            for row in conn.execute(q, params).fetchall():
                if str(row["id"]) in excluded:
                    continue
                opts = conn.execute(
                    "SELECT option_letter, option_text, explanation FROM question_options"
                    " WHERE question_id = ? ORDER BY option_letter",
                    (row["id"],),
                ).fetchall()
                out.append(
                    {
                        "id": row["id"],
                        "level": row["level"],
                        "type": row["question_type"],
                        "question": row["question_text"],
                        "options": {o["option_letter"]: o["option_text"] for o in opts},
                        "correct": None,  # graded server-side on submit
                        "explanations": {o["option_letter"]: o["explanation"] for o in opts},
                    }
                )
                if len(out) >= max(1, min(limit, 50)):
                    break
            return JSONResponse({"success": True, "questions": out})
        finally:
            conn.close()

    @app.post("/api/jlpt/submit-answers")
    def jlpt_submit(payload: dict) -> JSONResponse:
        session = str(payload.get("session_id", "web"))
        answers = payload.get("answers", [])
        db = resolve_db("jlpt_questions.db")
        correct = 0
        total = 0
        if db is not None:
            conn = open_ro(db)
            try:
                for a in answers:
                    qid = int(a.get("question_id", 0))
                    row = conn.execute(
                        "SELECT correct_answer FROM questions WHERE id = ?", (qid,)
                    ).fetchone()
                    key = row[0] if row else None
                    given = str(a.get("answer", a.get("user_answer", ""))).strip().upper()
                    hit = key is not None and given == str(key).strip().upper()
                    total += 1
                    correct += int(hit)
                    pdb = sqlite3.connect(str(progress_db()))
                    pdb.execute(
                        "INSERT INTO answers (session_id, question_id, user_answer,"
                        " is_correct, response_time_ms) VALUES (?, ?, ?, ?, ?)",
                        (session, qid, given, int(hit), int(a.get("response_time_ms", 0))),
                    )
                    pdb.commit()
                    pdb.close()
            finally:
                conn.close()
        return JSONResponse({"success": True, "data": {"total": total, "correct": correct}})


def _vocab_list(level: str, limit: int):
    db = resolve_db("kanji.db")
    if db is None:
        return JSONResponse({"success": False, "error": "kanji.db not fetched"})
    conn = open_ro(db)
    try:
        lvl = (level or "all").strip().upper()
        lim = max(1, min(limit, 200))
        if lvl in ("ALL", ""):
            rows = conn.execute(
                "SELECT expression AS japanese, reading, meaning, jlpt_level FROM"
                " jlpt_vocabulary ORDER BY RANDOM() LIMIT ?",
                (lim,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT expression AS japanese, reading, meaning, jlpt_level FROM"
                " jlpt_vocabulary WHERE jlpt_level = ? LIMIT ?",
                (lvl, lim),
            ).fetchall()
        return JSONResponse({"success": True, "vocab": [dict(r) for r in rows]})
    finally:
        conn.close()
