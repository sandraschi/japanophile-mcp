# TOOLS - japanophile-mcp

Portmanteau tools, dialogic returns (`success, message, data`). All read-only
except `jlpt/answer` (writes to data/progress.db, seeds stay pristine).

## kanji(operation, query, level, grade, radical, limit)

13,108 kanji from assets/seed/kanji_database.db.

| operation | params | returns |
|---|---|---|
| lookup | query=single char, e.g. 水 | onyomi, kunyomi, meanings, jlpt, grade, strokes, categories, frequency, radical, is_jouyou |
| search | query=English fragment | matches on meanings (limit default 20, max 50) |
| by_jlpt | level=N5..N1 | ordered by frequency |
| by_grade | grade=1..8 | school grade set |
| by_radical | radical=char | kanji sharing the radical |
| random | optional level | drill draws |

## jlpt(operation, level, question_id, answer, session_id, response_time_ms)

600 questions + 2,400 options from assets/seed/jlpt_questions.db.

| operation | behavior |
|---|---|
| next | random unseen question for level (falls back to any level), options included, answer key NOT included |
| answer | grades letter vs key (null-safe: records + explains when seed lacks a key), writes progress row |
| progress | session score summary from data/progress.db |

## vocab(operation, query, level, limit)

Needs data/kanji.db (fetched, 135MB). search hits vocabulary (400k) + jmdict
(214k); by_jlpt hits jlpt_vocabulary (8k); examples hits the 278,746-row
examples table (Japanese sentence, English translation, linked words — same
DB, previously unqueried). Absent DB returns the fetch hint, never a traceback.

## knowledge(operation, page, collection)

collection=culture (default): 29 vendored assets/knowledge/japan/ pages.
collection=language: 11 vendored assets/language/ study pages (grammar,
vocabulary, keigo, exams, materials, methods, mobile, overview, phonetics,
writing, bloopers) — same content the webapp Language tab reads, now
agent-queryable. list returns stems; get accepts exact or substring stems,
returns plain text (HTML stripped, 6000-char cap).

No separate structured `grammar` tool — no vendored JLPT-graded grammar-point
database exists, and Makino/Tsutsui's grammar dictionaries are copyrighted, so
the honest option is exposing the real grammar.html prose page via
`knowledge(collection=language)` rather than fabricating structured entries.

## jp_utils(operation, text, target, year, era, era_year)

Pure-Python, no external data or dependency.

| operation | params | behavior |
|---|---|---|
| kana_convert | text, target=romaji\|hiragana\|katakana | Hepburn gojuon + digraphs + sokuon doubling + chouonpu vowel repeat. No particle-pronunciation exceptions (は stays "ha") or extended loanword katakana digraphs (ファ/ティ/ウィ-style). |
| era_to_year | era=meiji\|taisho\|showa\|heisei\|reiwa, era_year | -> Western year |
| year_to_era | year | -> {era, era_year}, year-granularity (boundary year assigned to the new era) |

## remember(operation, session_id, limit)

Reads data/progress.db `answers` (the table `jlpt/answer` writes to).

| operation | behavior |
|---|---|
| streak | consecutive UTC days ending today with >=1 answer logged |
| due | question_ids answered at least once, never correctly — a missed-question queue, NOT a full SM-2/FSRS scheduler |

## crossconnect(operation, text, query, tag, media_type, provider, voice_id, limit)

Thin proxies to sibling fleet MCP servers over their existing REST APIs —
no vendored copy of their data. Each peer is checked live on every call;
unreachable returns `success: false` with a start hint, never a traceback.
Env override: SPEECH_MCP_URL, CALIBRE_MCP_URL, PLEX_MCP_URL (defaults
:10909 / :10720 / :10740). See docs/CONFIGURATION.md.

| operation | params | behavior |
|---|---|---|
| speak | text, provider, voice_id | POST speech-mcp `/api/v1/tts` — plays on speech-mcp's OWN speaker (agent voice output). For audio the caller can play, the webapp instead uses `GET /api/crossconnect/speak.wav` directly. |
| library_search | query, tag, limit | GET calibre-mcp `/api/search/`. calibre-mcp's `query` param is currently a no-op server-side (verified 2026-09-15) — this tool filters client-side over title/authors/tags on top of it so the result is honest regardless. |
| media_search | query, media_type, limit | GET plex-mcp `/api/search/`. plex-mcp's `media_type` param is currently a no-op server-side (verified 2026-09-15) — this tool filters client-side by `item.type` on top of it. |

Both upstream bugs are flagged as follow-up tasks in the respective repos, not
fixed in this repo (out of scope) — the client-side workarounds here just keep
this tool's own contract honest in the meantime.

## japanophile_help()

Tool list, per-DB status (path or MISSING + fetch hint), knowledge + language
page counts, ports. Agents call this first.
