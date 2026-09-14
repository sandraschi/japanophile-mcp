# japanophile-mcp

<p align="center">
  <a href="https://github.com/sandraschi/japanophile-mcp/releases/tag/v0.3.1"><img src="https://img.shields.io/github/v/release/sandraschi/japanophile-mcp?style=flat-square" alt="Release"></a>
  <a href="https://github.com/casey/just"><img src="https://img.shields.io/badge/just-ready_to_go-7c5cfc?style=flat-square&logo=just&logoColor=white" alt="Just"></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"></a>
  <a href="https://github.com/PrefectHQ/fastmcp"><img src="https://img.shields.io/badge/FastMCP-3.4%2B-7c5cfc?style=flat-square" alt="FastMCP"></a>
  <a href="https://github.com/sandraschi/japanophile-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/sandraschi/japanophile-mcp/ci.yml?branch=main&style=flat-square" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="MIT"></a>
</p>

Your Japanophile workstation: kanji/JLPT learning tools, Japanese culture knowledge box, travel and diary on the roadmap. First **-phile repo** (fleet doc: `mcp-central-docs/projects/japanophile-mcp/PHILE_PATTERN.md`). Polite name on listings; working title was weeaboo, retired to joke status.

Ports: backend **11193**, frontend **11194**. Registered in `mcp-central-docs/operations/WEBAPP_PORTS.md`.

## Quick start (Stage 2)

```powershell
cd D:\Dev\repos\japanophile-mcp
uv sync --group dev
.\start.ps1
```

Opens **http://127.0.0.1:11194** (HTTP API + MCP on **11193**). MCP-only (stdio): `uv run python -m japanophile_mcp.server`.

Claude Desktop bundle: `just mcpb-pack` → `dist/japanophile-mcp-v{version}.mcpb` (see `scripts/mcpb-pack.ps1`, `mcp-central-docs/standards/MCPB_PACKAGING_STANDARDS.md`).

## Stage 1: MCP tools

Seven portmanteau tools, dialogic returns, seeds in `assets/seed/`, learning corpora in `data/` (committed). Deliberately thin on the MCP side by design — this repo is primarily a human webapp (quizzes, games, reading), MCP tools are the agent-facing afterthought, not the product. `vocab`, `jp_utils`, and `remember` were added 2026-09-14 to close the gap against narrower competing MCP servers (Jisho MCP, JLPT Study MCP, Japan Utils MCP, Ayaka, Potto Japan) — see [reports/quality-japanophile-mcp-2026-09-14.md](reports/quality-japanophile-mcp-2026-09-14.md):

| Tool | Operations | Data |
|---|---|---|
| `kanji` | lookup, search, by_jlpt, by_grade, by_radical, random | assets/seed/kanji_database.db (13,108 kanji) |
| `jlpt` | next, answer, progress | assets/seed/jlpt_questions.db (600 Q + options) |
| `vocab` | search (400k vocab + jmdict), by_jlpt, **examples** (278k example sentences) | data/kanji.db (~135MB, vendored) |
| `knowledge` | list, get — **collection=culture** (29 pages) or **collection=language** (grammar/vocab/keigo/exams, 11 pages) | assets/knowledge/japan/*.html, assets/language/*.html |
| `jp_utils` | kana_convert (hiragana/katakana/romaji), era_to_year, year_to_era | pure Python — Hepburn table + Meiji-Reiwa era table |
| `remember` | streak, due (missed-question queue) | data/progress.db `answers` table (same store `jlpt/answer` writes) |
| `japanophile_help` | tool + data status | - |

No structured `grammar` tool: the fleet has no vendored JLPT-graded grammar-point database (unlike Ayaka/Potto Japan), and Makino/Tsutsui's grammar dictionaries are copyrighted — fabricating one would violate the no-fake-data standard. `knowledge(collection=language)` exposes the real vendored grammar prose page instead.

```json
{ "mcpServers": { "japanophile-mcp": {
  "command": "uv",
  "args": ["run", "--directory", "D:\\Dev\\repos\\japanophile-mcp",
           "python", "-m", "japanophile_mcp.server"] } } }
```

## Stage 2: webapp

Dashboard, Learn (kanji / JLPT quiz / vocab), Know, Games (vendored drills), Chat (japanophile-expert + local LLM), Skills, Tools, Settings, Help, Logs. Playwright e2e + screenshot automation in `webapp/e2e/`.

### Webapp (for demo-vid and docs)

| Page | Purpose |
|------|---------|
| **Dashboard** | Backend health, KPI cards for kanji seed, JLPT question bank, and knowledge page count; surfaces fetch hints when large DBs are missing |
| **Learn** | Kanji lookup and search, JLPT quiz with scored sessions, vocabulary search when `kanji.db` is fetched |
| **Know** | Browse and read vendored Japan culture articles (history, travel, food, manga, and related topics) as plain text |
| **Games** | Embedded HTML/JS practice tools: flashcards, stroke order, JLPT tests, grammar and listening drills |
| **Chat** | Local LLM tutoring with the japanophile-expert skill loaded; routes answers through repo tools and knowledge pages (text today; voice via speech-mcp when connected) |
| **Skills** | View the japanophile-expert skill markdown used by Chat |
| **Tools** | One-click MCP tool runner (sample kanji lookup) for debugging and demos |
| **Settings** | Ollama-compatible LLM endpoint and model selection for Chat |
| **Help** | Ports, tool list, and pointers to install docs |
| **Logs** | Sorted, filterable-style diagnostic view of backend health, database paths, and load errors from API probes |

Narrated tour script (two sentences per page, 3s pause between): [docs/demo-vid/narration.yaml](docs/demo-vid/narration.yaml). **demo-vid-mcp** loads it automatically for `demo_vid_generate(repo="japanophile-mcp")`.

**Preview:** draft PNGs + agent-made demo MP4 in [docs/screenshots/README.md](docs/screenshots/README.md) (better PNG contrast planned **2026-09-14**).

## Inheritance

Learn tools (~15 html/js games), 29 knowledge pages, kanji/JLPT seeds vendored from ai-games-collection ([docs/INHERITANCE.md](docs/INHERITANCE.md)). Canonical home for Japanese learning; ai-games-collection keeps hanafuda/cho-han play with crosslinks.

## Crossconnects

- **speech-mcp** — listen/speak drills for the Learn face (voice, not yet wired).
- **local-llm-mcp** — Chat tutoring (wired today).
- **calibre-mcp** — Japanese literature, textbooks, and manga library (not yet wired).
- **plex-mcp** — Japanese movies and anime library (not yet wired).
- **ai-games-collection** — canonical home for hanafuda/cho-han gameplay; this repo owns learning.
- Full crossconnect map: `mcp-central-docs/projects/japanophile-mcp/PHILE_PATTERN.md`.

## Roadmap

- Tauri NSIS winapp (installer built at 0.3.0; next release when rebased on 0.3.1).
- Plan + Remember: travel planner APIs, diary, full SRS scheduler (today's `remember` tool is a missed-question queue, not SM-2/FSRS).
- **austrophile-mcp** as second -phile template.

Docs: [TOOLS](docs/TOOLS.md) - [CONFIGURATION](docs/CONFIGURATION.md) - [INSTALL](INSTALL.md) - [CONTRIBUTORS](CONTRIBUTORS.md)
