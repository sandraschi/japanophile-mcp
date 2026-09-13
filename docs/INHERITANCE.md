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

## Vendored learning corpora (data/, committed)

| File | Size | Used for |
|---|---|---|
| data/kanji.db | ~135MB | vocab, jmdict, examples (Tatoeba), jlpt_vocabulary, compounds compat |
| data/wakan_vocab.json | ~33MB | reserved for extended vocab tools |

Runtime does **not** depend on ai-games-collection. Maintainers refresh corpora
with `scripts/vendor_from_donor.ps1` when updating from the historical donor,
then commit. Verify with `scripts/ensure_data.ps1` or `just ensure-data`.

Writable: `data/progress.db` (gitignored).

Optional upstream: `edict2.gz` (not wired yet).

## Canonical-home rule

New Japanese-learning work lands HERE. ai-games-collection links out for
learning/teaching flows and keeps pure-play games. Crossconnect both ways:
hanafuda playable there AND listed in knowledge here.
