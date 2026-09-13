# CHANGELOG - japanophile-mcp

## 0.1.0 (2026-09-13) - Stage 1: MCP server + inheritance

- Scaffold to fleet gate: .gitignore-first, pyproject (fastmcp>=3.4.4), justfile
  (bootstrap/lint/fix/typecheck/test/serve/fetch-data), start.ps1 + start.bat,
  .env.example, CI (windows-latest: ruff, format-check, pytest).
- Five MCP tools, dialogic returns: kanji (lookup/search/by_jlpt/by_grade/
  by_radical/random), jlpt (next/answer/progress with data/progress.db),
  vocab (400k + jmdict search, by_jlpt; graceful without big DB),
  knowledge (list/get over 29 vendored pages), japanophile_help (status).
- Inheritance vendored from ai-games-collection: kanji_database.db (13,108
  kanji), jlpt_questions (600 Q + 2,400 options), ~15 html/js learning games,
  29 japan/ knowledge pages, README_JAPANESE.md + kanji-learning-suite.md.
- Big-DB policy: kanji.db (135MB), wakan_vocab.json (33MB), edict2.gz fetched
  via scripts/fetch_data.ps1, gitignored, tools degrade with fetch hint.
- Docs: README, INSTALL, TOOLS, CONFIGURATION, INHERITANCE, PRD, TODO,
  skills/japanophile-expert/SKILL.md, glama.json, llms.txt.
- Ports 11191/11192 claimed (backend/frontend).
- Working title weeaboo retired to joke status; listings use japanophile-mcp.
