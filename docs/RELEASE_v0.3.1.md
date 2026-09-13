## japanophile-mcp v0.3.1

First tagged release. **MCPB only** — install in Claude Desktop via the bundled `.mcpb` file.

### Highlights

- MCP tools: kanji, JLPT quiz, vocab, knowledge box (29 pages), help/status.
- HTTP bridge on **11193** + React webapp on **11194** (Learn, Know, Games, Chat, Travel planner, Logs).
- Claude bundle includes seeds, games assets, japanophile-expert skill, and prompt examples.

### Install MCPB

1. Download `japanophile-mcp-v0.3.1.mcpb` from this release.
2. Open with Claude Desktop (or import per [MCPB packaging standards](https://github.com/sandraschi/mcp-central-docs)).
3. Or dev: `just mcpb-pack` from a git checkout.

### Dev quick start

```powershell
uv sync --group dev
.\start.ps1
```

See [README.md](https://github.com/sandraschi/japanophile-mcp/blob/main/README.md) and [CHANGELOG.md](https://github.com/sandraschi/japanophile-mcp/blob/main/CHANGELOG.md).
