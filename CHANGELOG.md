# CHANGELOG - japanophile-mcp

## 0.3.0 (2026-09-13) - Stage 3: installer + bundle shipped

- NSIS installer (Japanophile MCP_0.3.0_x64-setup.exe, 31.2MB): makensis via
  winget, PyInstaller sidecar 28.9MB verified frozen (health, kanji, 29
  knowledge pages, compat shim live from the exe), Tauri sidecar spawn with
  port-clear + health-poll + kill-on-exit. Smoke: silent install, app boot
  with window + live data from installed layout, silent uninstall, no orphans.
  Frozen-path support in db.py (sys._MEIPASS roots, exe-side data dir).
- .mcpb bundle (japanophile-mcp.mcpb, 7.8MB, 44 files): manifest 0.3.0,
  fresh-copy src, seeds + 29 knowledge pages + skill bundled, prompts
  3043/4000 words + 101 real tool-run examples (gen_examples.py), zero
  forbidden content, bundle-tested standalone (extract + kanji/knowledge live).
- Version unified at 0.3.0 (pyproject, webapp, Tauri, manifest, __init__).

## 0.2.0 (2026-09-13) - Stage 2: webapp + Tauri scaffold

- FastAPI HTTP bridge (11193): REST for kanji/jlpt/vocab/knowledge/help,
  static /games /know /skills, /mcp mount, open CORS. Compat shim
  (compat.py) serving old games-backend shapes so vendored games run
  unmodified (kanji/search, kanji/all, kanji/compounds, vocabulary,
  vocab/jlpt, examples/search, jlpt/questions + submit-answers).
- React 19 + Vite + TS + Tailwind webapp (11194): Dashboard KPIs + data
  status, Learn (kanji/quiz/vocab), Know (29 pages), Games (iframe tabs),
  Chat (local LLM + japanophile-expert system prompt), Skills, Tools,
  Settings (LLM endpoint/model), Help, Logs. tsc + Biome + vite build green.
- Playwright e2e 8/8 + 5 screenshots (docs/screenshots + README Preview).
  Lessons: dev-stack webServer owns backend+vite (tool shells reap orphans);
  never proxy frontend route prefixes (/games /know /skills shadowed the SPA).
- Ports moved 11191/11192 -> 11193/11194: open-webui Docker container
  squats 11191 on this box (registry-marked, do not assign).
- Tauri scaffold (native/): sidecar spawn/kill/health-poll, capabilities,
  hinomaru placeholder icons, just build-sidecar/build-native, BUILD_LOG.md.
  cargo check green (2 real E0308s fixed). NSIS build needs makensis +
  sidecar exe -> Stage 3. .mcpb (prompts 3-4-100) -> Stage 3.

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
