# PRD: japanophile-mcp (and the -phile pattern)

**Version:** 0.1.0 (Stage 1) | **Status:** accepted | **Owner:** sandraschi

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

## 4. Non-goals (v0.1)

Webapp, Tauri winapp, .mcpb bundle (Stage 2). Travel planner + diary (new
builds, not ports). Hanafuda/cho-han gameplay (stays canonical in
ai-games-collection, crosslinked both ways).

## 5. Data strategy

Vendored seeds (git-safe, <=5MB): kanji 13k (2.6MB), JLPT Q (0.26MB),
knowledge html (4.7MB), game frontends (0.3MB). Fetched big DBs (gitignored):
kanji.db 135MB (400k vocab + 278k examples + jmdict), wakan 33MB, edict2.gz.
Graceful degradation everywhere: missing big DB answers with the fetch hint,
never a traceback. Canonical-home rule: new JP-learning work lands here.

## 6. Acceptance (Stage 1)

- `uv run pytest -q` green on seeds alone (no big DB, no network).
- `ruff check + format --check` clean, CI file present.
- MCP tools callable over stdio: kanji lookup 水, jlpt next/answer/progress
  round-trip, knowledge list contains manga, vocab degrades with fetch hint.
- .gitignore exists before first git add; no *.db, .venv, *.bak committed.
- Ports 11191/11192 registered in WEBAPP_PORTS.md.

## 7. Open questions

- SRS algorithm choice (SM-2 vs FSRS) for the diary-linked review scheduler.
- JP/EN parallel knowledge pages: machine-translate + human pass, or human first?
- jmdict vs EDICT licensing notes for the .mcpb bundle (Stage 2).
