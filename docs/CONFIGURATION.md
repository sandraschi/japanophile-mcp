# CONFIGURATION - japanophile-mcp

`.env` (copy from `.env.example`, all optional):

| Var | Default | Notes |
|---|---|---|
| JPN_MCP_BACKEND_PORT | 11193 | Stage 2 HTTP surface |
| JPN_MCP_DATA_DIR | data | runtime DBs + progress.db |
| SPEECH_MCP_URL | http://127.0.0.1:10909 | TTS peer for `crossconnect(speak)` and `/api/crossconnect/speak.wav` |
| CALIBRE_MCP_URL | http://127.0.0.1:10720 | Library peer for `crossconnect(library_search)` |
| PLEX_MCP_URL | http://127.0.0.1:10740 | Media peer for `crossconnect(media_search)` |

DB resolution order: `data/<name>` then `assets/seed/<name>`, read-only URIs.
Seeds: kanji_database.db (2.6MB), jlpt_questions.db (0.23MB) - committed.
Big: kanji.db (135MB), wakan_vocab.json (33MB) - fetched, gitignored.
Progress: data/progress.db, created on first `jlpt/answer`, seeds untouched.

## Crossconnects

`crossconnect` proxies three sibling fleet MCP servers over their existing REST
APIs (no vendored copy of their data, no new protocol). Each is optional and
checked live on every call — an unreachable peer returns `success: false` with
a start hint, never a traceback, same as a missing local DB.

| Peer | Default URL | Used for |
|---|---|---|
| speech-mcp | :10909 | `speak` (plays on speech-mcp's own speaker), `/api/crossconnect/speak.wav` (returns audio for the webapp) |
| calibre-mcp | :10720 | `library_search` — Sandra's Calibre library by query/tag |
| plex-mcp | :10740 | `media_search` — Sandra's Plex library by query/media_type |

Override a URL (different host, different port) via the env vars above.
