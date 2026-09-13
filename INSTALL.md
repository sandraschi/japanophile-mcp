# INSTALL japanophile-mcp

## Fastest (local checkout)

```powershell
cd D:\Dev\repos\japanophile-mcp
uv sync --group dev
pwsh -File scripts/ensure_data.ps1
uv run pytest -q
```

## Learning corpora (required for full vocab / examples)

Committed under `data/` (see `data/README.md`):

- `kanji.db` (~135MB) — vocab, jmdict, Tatoeba examples, jlpt_vocabulary
- `wakan_vocab.json` (~33MB) — extended vocab JSON (future tools)

If files are missing after clone, restore from git history or ask a maintainer.
Maintainers only: `pwsh -File scripts/vendor_from_donor.ps1` to refresh from the
historical donor checkout, then commit.

Without `kanji.db`, `vocab` and example APIs return a clear missing-data message.
Kanji lookup, JLPT quiz, and knowledge pages work from `assets/seed/`.

## Claude Desktop

```json
{ "mcpServers": { "japanophile-mcp": {
  "command": "uv",
  "args": ["run", "--directory", "D:\\Dev\\repos\\japanophile-mcp",
           "python", "-m", "japanophile_mcp.server"] } } }
```

Or install the bundle: `just mcpb-pack`, then drag `dist/japanophile-mcp-v*.mcpb` onto Claude Desktop.

## Ports

Backend 11193 (Stage 2 HTTP), frontend 11194 (Stage 2 webapp). Registered in
mcp-central-docs/operations/WEBAPP_PORTS.md.
