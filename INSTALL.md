# INSTALL japanophile-mcp

## Fastest (local checkout)

```powershell
cd D:\Dev\repos\japanophile-mcp
uv sync --group dev
pwsh -File scripts/fetch_data.ps1   # big DBs from ai-games-collection checkout (optional)
uv run pytest -q
```

## Big data (optional, recommended)

kanji.db (135MB, 400k vocab + examples + jmdict) and wakan_vocab.json (33MB) are
never vendored. Fetch:

```powershell
pwsh -File scripts/fetch_data.ps1
```

Without them, `vocab` answers with a friendly fetch hint. Everything else works
from committed seeds.

## Claude Desktop

```json
{ "mcpServers": { "japanophile-mcp": {
  "command": "uv",
  "args": ["run", "--directory", "D:\\Dev\\repos\\japanophile-mcp",
           "python", "-m", "japanophile_mcp.server"] } } }
```

## Ports

Backend 11191 (Stage 2 HTTP), frontend 11192 (Stage 2 webapp). Registered in
mcp-central-docs/operations/WEBAPP_PORTS.md.
