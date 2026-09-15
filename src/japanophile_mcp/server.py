"""japanophile-mcp: kanji/JLPT learning tools + Japanese knowledge box over MCP.

Stage 1 (this file): working MCP server, stdio + HTTP. Portmanteau tools,
dialogic returns, read-only seeds, graceful degradation for unfetched big DBs.
Stage 2 (roadmap): React webapp + chat/skills pages, Tauri NSIS winapp, travel
planner + diary tools.
"""

from __future__ import annotations

import html as html_mod
import re
import sqlite3
from datetime import UTC, datetime, timedelta
from html.parser import HTMLParser
from pathlib import Path

from fastmcp import FastMCP

from .db import (
    ASSET_ROOT,
    LANGUAGE_DIR,
    ensure_data_from_seed,
    missing_db_message,
    open_ro,
    progress_db,
    resolve_data_file,
    resolve_db,
)

mcp = FastMCP("japanophile-mcp")

KNOWLEDGE_DIR = ASSET_ROOT / "knowledge" / "japan"

# knowledge(operation, ..., collection) collection name -> (dir, excluded stems).
# "culture": 29-page history/econ/travel box. "language": grammar/vocab/keigo/exam
# study pages — same vendored assets/language/ the webapp Language tab reads,
# now agent-queryable too (there is no separate structured "grammar" tool: the
# fleet has no vendored JLPT-graded grammar-point database, and fabricating one
# would violate the no-fake-data rule — this exposes the real prose pages instead).
KNOWLEDGE_COLLECTIONS = {
    "culture": KNOWLEDGE_DIR,
    "language": LANGUAGE_DIR,
}


def resolve_knowledge_page(page: str, base: Path = KNOWLEDGE_DIR) -> Path | None:
    """Resolve a knowledge slug to {base}/{slug}.html."""
    if not base.is_dir():
        return None
    name = "".join(c for c in page.strip().lower().replace(" ", "-") if c.isalnum() or c in "-_")
    target = base / (name + ".html")
    if target.is_file():
        return target
    matches = [p for p in base.glob("*.html") if name in p.stem]
    if matches:
        return matches[0]
    return None


# Index/utility HTML — not standalone Know articles (tree is 4MB w/ broken inline branches).
KNOWLEDGE_NAV_EXCLUDE = frozenset({"japanese-knowledge-tree", "kanji-table"})


def knowledge_page_stems(base: Path = KNOWLEDGE_DIR) -> list[str]:
    if not base.is_dir():
        return []
    stems = sorted(p.stem for p in base.glob("*.html"))
    if base == KNOWLEDGE_DIR:
        return [s for s in stems if s not in KNOWLEDGE_NAV_EXCLUDE]
    return stems


# Vendored pages link ../../styles.css (ai-games-collection layout). In srcDoc that
# URL resolves to the games /styles.css on the frontend origin — wrong theme. Strip it
# and inject fleet Know embed styles instead.
KNOW_EMBED_STYLE = """<style id="japanophile-know-embed">
html, body {
  background: #18181b !important;
  color: #e4e4e7 !important;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 1rem 1.25rem 2rem;
  overflow: visible !important;
  height: auto !important;
  min-height: 0 !important;
}
.container, .content-section, .content-text, .section-content,
.branch-content, .store-text, p, li, td, dd, dt {
  color: #e4e4e7 !important;
}
.branch-content { margin-top: 0 !important; }
.store-section, .content-section {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1rem 0;
  border-left: 4px solid #eab308;
}
h1, h2, h3, h4, .section-title, .store-section h2 {
  color: #fafafa !important;
}
.store-section h2 { color: #fde047 !important; }
strong, b { color: #f4f4f5 !important; }
a { color: #60a5fa !important; }
.back-button { display: none !important; }
</style>"""

_KNOW_STYLESHEET_LINK = re.compile(
    r'<link[^>]+href=["\']\.\./\.\./styles\.css["\'][^>]*>\s*',
    re.IGNORECASE,
)


def knowledge_html_for_embed(path: Path) -> str:
    raw = path.read_text(encoding="utf-8-sig")
    raw = _KNOW_STYLESHEET_LINK.sub("", raw)
    if "japanophile-know-embed" in raw:
        return raw
    marker = "<head>"
    lower = raw.lower()
    idx = lower.find(marker)
    if idx >= 0:
        insert = idx + len(marker)
        return raw[:insert] + KNOW_EMBED_STYLE + raw[insert:]
    return KNOW_EMBED_STYLE + raw


def ok(message: str, data: object = None) -> dict:
    return {"success": True, "message": message, "data": data}


def fail(message: str) -> dict:
    return {"success": False, "message": message, "data": None}


def _count_table(db_name: str, table: str) -> int | None:
    path = resolve_db(db_name)
    if not path:
        return None
    try:
        conn = open_ro(path)
        try:
            row = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
            return int(row[0]) if row else None
        finally:
            conn.close()
    except sqlite3.Error:
        return None


class _TextDump(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in ("script", "style"):
            self._skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style") and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
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


# Standard Hepburn gojuon table (hiragana). Digraphs checked before singles.
_ROMAJI_SINGLE = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "ゐ": "i", "ゑ": "e", "を": "o", "ん": "n",
}
_ROMAJI_DIGRAPH = {
    "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
    "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
    "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
    "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
    "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
    "ぢゃ": "ja", "ぢゅ": "ju", "ぢょ": "jo",
    "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
    "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
    "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
    "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
    "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
    "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
}
_SOKUON = "っ"
_CHOONPU = "ー"  # katakana long-vowel mark ー


def _kana_shift(text: str, *, to_katakana: bool) -> str:
    """Hiragana<->katakana via the fixed +0x60 Unicode block offset."""
    out = []
    for ch in text:
        code = ord(ch)
        if to_katakana and 0x3041 <= code <= 0x3096:
            out.append(chr(code + 0x60))
        elif not to_katakana and 0x30A1 <= code <= 0x30F6:
            out.append(chr(code - 0x60))
        else:
            out.append(ch)
    return "".join(out)


def _hiragana_to_romaji(text: str) -> str:
    """Hepburn romaji for hiragana. Unknown chars (kanji, punctuation) pass through.

    Does not apply particle-pronunciation exceptions (topic-marker は stays "ha",
    not "wa") or extended loanword katakana digraphs (fa/ti/wi-style combos) —
    those decompose kana-by-kana rather than as the intended loanword sound.
    """
    out: list[str] = []
    i = 0
    pending_double = False
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == _SOKUON:
            pending_double = True
            i += 1
            continue
        if ch == _CHOONPU:
            if out and out[-1]:
                out.append(out[-1][-1])
            i += 1
            continue
        digraph = text[i : i + 2]
        syll = _ROMAJI_DIGRAPH.get(digraph)
        consumed = 2 if syll is not None else 1
        if syll is None:
            syll = _ROMAJI_SINGLE.get(ch)
        if syll is None:
            out.append(ch)
            pending_double = False
            i += consumed
            continue
        if pending_double:
            syll = ("t" + syll) if syll.startswith("ch") else (syll[0] + syll)
            pending_double = False
        out.append(syll)
        i += consumed
    return "".join(out)


# (era name, first Gregorian year, first year of next era or None). Boundary
# year itself is assigned to the NEW era (matches common convention, e.g. 1912
# reported as Taisho 1 even though Meiji ran into mid-1912) — exact month/day
# transition is out of scope for a year-granularity tool.
_ERA_TABLE = (
    ("meiji", 1868, 1912),
    ("taisho", 1912, 1926),
    ("showa", 1926, 1989),
    ("heisei", 1989, 2019),
    ("reiwa", 2019, None),
)


def _era_to_year(era: str, era_year: int) -> int | None:
    era = era.strip().lower()
    for name, start, _end in _ERA_TABLE:
        if name == era:
            return start + era_year - 1
    return None


def _year_to_era(year: int) -> tuple[str, int] | None:
    for name, start, end in _ERA_TABLE:
        if year >= start and (end is None or year < end):
            return name, year - start + 1
    return None


@mcp.tool()
def jp_utils(
    operation: str,
    text: str = "",
    target: str = "romaji",
    year: int = 0,
    era: str = "",
    era_year: int = 0,
) -> dict:
    """Japan-locale utilities: kana_convert | era_to_year | year_to_era.

    kana_convert: text=kana string, target=romaji|hiragana|katakana. Romaji is
    standard Hepburn (gojuon + digraphs + sokuon doubling + chouonpu vowel
    repeat) — see caveats in the conversion docstring.
    era_to_year: era=meiji|taisho|showa|heisei|reiwa, era_year=N -> western year.
    year_to_era: year=western year -> {era, era_year} (year-granularity; see
    _ERA_TABLE note on transition-year handling).
    """
    if operation == "kana_convert":
        if not text.strip():
            return fail("kana_convert needs non-empty text.")
        if target == "hiragana":
            return ok("Converted to hiragana.", {"text": _kana_shift(text, to_katakana=False)})
        if target == "katakana":
            return ok("Converted to katakana.", {"text": _kana_shift(text, to_katakana=True)})
        if target == "romaji":
            hira = _kana_shift(text, to_katakana=False)
            return ok("Converted to romaji.", {"text": _hiragana_to_romaji(hira)})
        return fail(f"Unknown target '{target}'. Valid: romaji, hiragana, katakana.")
    if operation == "era_to_year":
        result = _era_to_year(era, era_year)
        if result is None:
            valid = ", ".join(name for name, _s, _e in _ERA_TABLE)
            return fail(f"Unknown era '{era}'. Valid: {valid}.")
        return ok(f"{era.title()} {era_year} = {result}.", {"western_year": result})
    if operation == "year_to_era":
        if year <= 0:
            return fail("year_to_era needs a positive Gregorian year.")
        result = _year_to_era(year)
        if result is None:
            return fail(f"{year} is before Meiji (1868) — no era table entry.")
        name, era_yr = result
        return ok(f"{year} = {name.title()} {era_yr}.", {"era": name, "era_year": era_yr})
    return fail(
        f"Unknown jp_utils operation '{operation}'. Valid: kana_convert, era_to_year,"
        " year_to_era."
    )


@mcp.tool()
def remember(operation: str, session_id: str = "default", limit: int = 20) -> dict:
    """Review support over your own JLPT answer history: streak | due.

    streak: consecutive days (ending today) with >=1 jlpt/answer logged for
    session_id. due: question_ids answered at least once but never correctly —
    a simple missed-question queue, NOT a full SM-2/FSRS spaced-repetition
    scheduler (see PRD.md open question on SRS algorithm choice; this reads
    the same data/progress.db `answers` table jlpt/answer writes to).
    """
    pdb = sqlite3.connect(str(progress_db()))
    pdb.row_factory = sqlite3.Row
    try:
        if operation == "streak":
            rows = pdb.execute(
                "SELECT DISTINCT date(ts) AS d FROM answers WHERE session_id = ?",
                (session_id,),
            ).fetchall()
            days = {r["d"] for r in rows}
            streak = 0
            # ts column is SQLite CURRENT_TIMESTAMP (UTC) — compare against UTC "today",
            # not local date, or the streak flips a day early/late across the Vienna offset.
            cursor = datetime.now(UTC).date()
            while cursor.isoformat() in days:
                streak += 1
                cursor -= timedelta(days=1)
            return ok(
                f"Streak: {streak} day(s) for session '{session_id}'.",
                {"session_id": session_id, "streak_days": streak, "days_logged": len(days)},
            )
        if operation == "due":
            limit = max(1, min(limit, 50))
            rows = pdb.execute(
                "SELECT question_id, MAX(ts) AS last_ts, SUM(is_correct) AS correct_ct,"
                " COUNT(*) AS attempts FROM answers WHERE session_id = ?"
                " GROUP BY question_id HAVING correct_ct = 0 ORDER BY last_ts DESC LIMIT ?",
                (session_id, limit),
            ).fetchall()
            return ok(f"{len(rows)} question(s) never answered correctly.", [dict(r) for r in rows])
        return fail(f"Unknown remember operation '{operation}'. Valid: streak, due.")
    finally:
        pdb.close()


@mcp.tool()
def crossconnect(
    operation: str,
    text: str = "",
    query: str = "",
    tag: str = "",
    media_type: str = "",
    provider: str = "gemini",
    voice_id: str = "default",
    limit: int = 20,
) -> dict:
    """Fleet crossconnects: speak | voices | library_search | media_search. Each proxies a
    sibling MCP server's REST API (speech-mcp :10909, calibre-mcp :10720,
    plex-mcp :10740 by default, override via SPEECH_MCP_URL/CALIBRE_MCP_URL/
    PLEX_MCP_URL). Peer offline returns a fail() with a start hint, not a
    traceback — see PHILE_PATTERN.md crossconnects section.

    speak: text=... plays via speech-mcp's TTS on ITS OWN speaker (agent voice
    output), not returned audio. Defaults provider=gemini (noticeably better
    than Windows SAPI); pass provider="windows" if Gemini isn't configured on
    speech-mcp. library_search: query and/or tag against Sandra's Calibre
    library. media_search: query (+ optional media_type) against her Plex
    library.
    """
    from .services import crossconnects as cc

    if operation == "speak":
        return cc.speak(text, provider=provider, voice_id=voice_id)
    if operation == "voices":
        return cc.voices()
    if operation == "library_search":
        return cc.library_search(query, tag=tag, limit=limit)
    if operation == "media_search":
        return cc.media_search(query, media_type=media_type, limit=limit)
    return fail(
        f"Unknown crossconnect operation '{operation}'. Valid: speak, voices,"
        " library_search, media_search."
    )


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
    """Vocabulary: search | by_jlpt | examples. Needs the big kanji.db (135MB, fetched).

    search: expression/reading/translation fragment. by_jlpt: jlpt_vocabulary level.
    examples: query against the 278k-row examples table (Japanese sentence, English
    translation, linked words) — vendored with kanji.db but previously unqueried.
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
        if operation == "examples":
            like = f"%{query.strip()}%"
            rows = conn.execute(
                "SELECT japanese, english, words FROM examples"
                " WHERE japanese LIKE ? OR english LIKE ? OR words LIKE ?"
                " LIMIT ?",
                (like, like, like, limit),
            ).fetchall()
            return ok(f"{len(rows)} example sentence(s).", [dict(r) for r in rows])
        return fail(f"Unknown vocab operation '{operation}'. Valid: search, by_jlpt, examples.")
    finally:
        conn.close()


@mcp.tool()
def knowledge(operation: str, page: str = "", collection: str = "culture") -> dict:
    """Knowledge box: list | get. collection=culture (default, 29 history/travel/food
    pages) or collection=language (grammar/vocabulary/keigo/exams/materials study
    pages — same vendored assets/language/ the webapp Language tab reads).
    """
    base = KNOWLEDGE_COLLECTIONS.get(collection)
    if base is None:
        return fail(
            f"Unknown collection '{collection}'. Valid: {', '.join(KNOWLEDGE_COLLECTIONS)}."
        )
    if not base.is_dir():
        return fail(f"Knowledge pages missing: {base.as_posix()} not found.")
    if operation == "list":
        pages = knowledge_page_stems(base)
        return ok(f"{len(pages)} {collection} page(s).", pages)
    if operation == "get":
        target = resolve_knowledge_page(page, base)
        if target is None:
            return fail(f"Unknown {collection} page '{page}'. Use knowledge/list first.")
        return ok(f"{collection.capitalize()} page: {target.stem}.", html_to_text(target))
    return fail(f"Unknown knowledge operation '{operation}'. Valid: list, get.")


@mcp.tool()
def japanophile_help() -> dict:
    """List tools, data status, and next steps for agents and IDEs."""
    status = {}
    seed_names = ("kanji_database.db", "jlpt_questions.db")
    for name in seed_names:
        hit = resolve_db(name)
        if hit:
            status[name] = f"ready ({hit.as_posix()})"
        else:
            status[name] = "MISSING seed — restore assets/seed/ from git"
    kanji_big = resolve_db("kanji.db")
    if kanji_big:
        status["kanji.db"] = f"ready ({kanji_big.as_posix()})"
    else:
        status["kanji.db"] = "MISSING — restore data/kanji.db from git (vocab, jmdict, examples)"
    wakan = resolve_data_file("wakan_vocab.json")
    status["wakan_vocab.json"] = (
        f"ready ({wakan.as_posix()})"
        if wakan
        else "MISSING — restore data/wakan_vocab.json from git"
    )
    pages = len(list(KNOWLEDGE_DIR.glob("*.html"))) if KNOWLEDGE_DIR.is_dir() else 0
    language_pages = len(list(LANGUAGE_DIR.glob("*.html"))) if LANGUAGE_DIR.is_dir() else 0
    metrics = {
        "kanji_entries": _count_table("kanji_database.db", "kanji"),
        "jlpt_questions": _count_table("jlpt_questions.db", "questions"),
        "knowledge_pages": pages,
        "language_pages": language_pages,
        "vocabulary_rows": _count_table("kanji.db", "vocabulary"),
        "example_rows": _count_table("kanji.db", "examples"),
        "jmdict_rows": _count_table("kanji.db", "jmdict"),
        "mcp_tools": 8,
    }
    return ok(
        "japanophile-mcp: Learn (kanji, jlpt, vocab) + Know (knowledge box, culture"
        " + language collections) + jp_utils (romaji/kana/era) + remember (streak/due)"
        " + crossconnect (speech/calibre/plex-mcp). Travel planner + diary are roadmap.",
        {
            "tools": [
                "kanji", "jlpt", "vocab", "knowledge", "jp_utils", "remember",
                "crossconnect", "japanophile_help",
            ],
            "data": status,
            "metrics": metrics,
            "knowledge_pages": pages,
            "language_pages": language_pages,
            "ports": {"backend": 11193, "frontend": 11194},
        },
    )


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
