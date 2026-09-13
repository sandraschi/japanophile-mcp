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

Five portmanteau tools, dialogic returns, seeds in `assets/seed/`, learning corpora in `data/` (committed):

| Tool | Operations | Data |
|---|---|---|
| `kanji` | lookup, search, by_jlpt, by_grade, by_radical, random | assets/seed/kanji_database.db (13,108 kanji) |
| `jlpt` | next, answer, progress | assets/seed/jlpt_questions.db (600 Q + options) |
| `vocab` | search (400k vocab + jmdict), by_jlpt | data/kanji.db (~135MB, vendored) |
| `knowledge` | list, get (29 pages) | assets/knowledge/japan/*.html |
| `japanophile_help` | tool + data status | - |

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

## Roadmap

- Tauri NSIS winapp (installer built at 0.3.0; next release when rebased on 0.3.1).
- Plan + Remember: travel planner APIs, diary, SRS.
- **austrophile-mcp** as second -phile template.

Docs: [TOOLS](docs/TOOLS.md) - [CONFIGURATION](docs/CONFIGURATION.md) - [INSTALL](INSTALL.md) - [CONTRIBUTORS](CONTRIBUTORS.md)
