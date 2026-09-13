# INHERITANCE - what moved from ai-games-collection and why

japanophile-mcp is the canonical home for Japanese learning. ai-games-collection
keeps playable hanafuda/cho-han; everything learning-shaped moved here.

## Vendored into git (small, safe)

| Asset | Size | Home |
|---|---|---|
| assets/seed/kanji_database.db (13,108 kanji) | 2.6MB | committed |
| assets/seed/jlpt_questions.db + .json (600 Q) | 0.26MB | committed |
| assets/games/japanese-language/* (~15 html/js tools) | ~0.3MB | committed, static |
| assets/knowledge/japan/* (29 pages) | 4.7MB | committed, static |
| docs/inherited/README_JAPANESE.md, kanji-learning-suite.md | 9KB | committed, provenance |

Gamified frontends are vendored as static assets (self-contained html/js, no
server logic duplicated). They read the same seeds the MCP tools read.
No logic fork: if a game grows server needs, it grows here, not there.

## Fetched, never vendored (big)

kanji.db (135MB), wakan_vocab.json (33MB), edict2.gz (7MB, optional):
scripts/fetch_data.ps1 copies from an ai-games-collection checkout or prints
upstream pointers. data/ is gitignored. Tools degrade gracefully without them.

## Canonical-home rule

New Japanese-learning work lands HERE. ai-games-collection links out for
learning/teaching flows and keeps pure-play games. Crossconnect both ways:
hanafuda playable there AND listed in knowledge here.
