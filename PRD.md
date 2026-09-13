# PRD: japanophile-mcp (and the -phile pattern)

**Version:** 0.3.0 (Stage 3 shipped) | **Status:** accepted, Stages 1-3 done | **Owner:** sandraschi

## 1. Problem

Culture learning is scattered: Anki decks here, a wiki rabbit hole there, a
half-read travel guide, no memory of what you already learned. Games repos
bury learning tools among 150 browser games (hanafuda next to JLPT drills).
Nobody's longrunner game survives the tab chaos.

## 2. Concept: -phile repos

One repo per culture you love. Four faces, same every culture:

| Face | japanophile-mcp v0.1 | Roadmap |
|---|---|---|
| **Learn** | kanji tools (lookup/search/level/grade/radical/random), JLPT quiz (600 Q + progress), vocab search (400k + jmdict), 15 gamified html/js tools | streaks, SRS scheduling, diary-linked reviews |
| **Know** | 29-page knowledge box (history, culture, econ, religion, food, travel, manga...) | sourced citations, update pass, JP/EN parallel |
| **Plan** | - (not started) | travel planner: JR transit pattern, bookings, itineraries |
| **Remember** | jlpt progress store (per-session scores) | diary: daily log + history of your journey |

Second instance proves the pattern: sinophile-mcp (hanzi suite, history box,
travel planner, diary). Then Europe (FR/IT/ES/DE), then the long tail with
solicited contributors. Concept page: sandraschi/PHILE_FLEET.md.

## 3. Users

- **Sandra**: JLPT prep as daily longrunner, trip planning, knowledge reference.
- **Agents**: tool-callable kanji/JLPT/vocab/knowledge for tutoring flows.
- **Future learners**: anyone who wants a culture in a box, local-first, EUR 0.

## 4. Non-goals (v0.3)

Travel planner + diary (new builds, not ports - Stage 4). Hanafuda/cho-han
gameplay (stays canonical in ai-games-collection, crosslinked both ways).
Shipped since v0.1: webapp (Stage 2), Tauri winapp + .mcpb bundle (Stage 3).

## 5. Data strategy

Vendored seeds (git-safe, <=5MB): kanji 13k (2.6MB), JLPT Q (0.26MB),
knowledge html (4.7MB), game frontends (0.3MB). Fetched big DBs (gitignored):
kanji.db 135MB (400k vocab + 278k examples + jmdict), wakan 33MB, edict2.gz.
Graceful degradation everywhere: missing big DB answers with the fetch hint,
never a traceback. Canonical-home rule: new JP-learning work lands here.

## 6. Acceptance (Stages 1-3, all met 2026-09-13)

- Stage 1: `uv run pytest -q` green on seeds alone; ruff + format clean; MCP
  tools over stdio (kanji 水, jlpt round-trip, manga in knowledge list, vocab
  fetch hint); .gitignore before first add; ports registered.
- Stage 2: FastAPI bridge + compat shim (vendored games unmodified); 10-page
  webapp (tsc + Biome + build green); chat wired to local LLM + skill;
  Playwright 13/13 (8 audit + 5 screenshots); README Preview; ports moved to
  11193/11194 (open-webui squat documented).
- Stage 3: PyInstaller sidecar verified frozen with real data; NSIS installer
  with install/boot/uninstall smoke and no orphans; .mcpb 7.8MB 44 files,
  prompts 3043/4000 + 101 real examples, bundle-tested standalone.

## 7. Open questions

- SRS algorithm choice (SM-2 vs FSRS) for the diary-linked review scheduler.
- JP/EN parallel knowledge pages: machine-translate + human pass, or human first?
- jmdict vs EDICT licensing notes for the .mcpb bundle (Stage 2).
