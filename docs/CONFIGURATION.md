# CONFIGURATION - japanophile-mcp

`.env` (copy from `.env.example`, all optional):

| Var | Default | Notes |
|---|---|---|
| JPN_MCP_BACKEND_PORT | 11191 | Stage 2 HTTP surface |
| JPN_MCP_DATA_DIR | data | runtime DBs + progress.db |

DB resolution order: `data/<name>` then `assets/seed/<name>`, read-only URIs.
Seeds: kanji_database.db (2.6MB), jlpt_questions.db (0.23MB) - committed.
Big: kanji.db (135MB), wakan_vocab.json (33MB) - fetched, gitignored.
Progress: data/progress.db, created on first `jlpt/answer`, seeds untouched.
