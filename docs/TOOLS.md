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
(214k); by_jlpt hits jlpt_vocabulary (8k). Absent DB returns the fetch hint,
never a traceback.

## knowledge(operation, page)

29 vendored japan/ pages. list returns stems; get accepts exact or substring
stems, returns plain text (HTML stripped, 6000-char cap).

## japanophile_help()

Tool list, per-DB status (path or MISSING + fetch hint), knowledge page count,
ports. Agents call this first.
