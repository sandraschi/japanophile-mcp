# Agent CLI: demo video for japanophile-mcp

Reproduce the narrated fleet walkthrough **without** the demo-vid webapp Generate page.

## Prerequisites (once per machine)

| Dependency | Install |
|------------|---------|
| **FFmpeg** | `scoop install ffmpeg` (must be on PATH for compose) |
| **Playwright Chromium** | `Set-Location D:\Dev\repos\demo-vid-mcp`; `npm install`; `npx playwright install chromium` |
| **speech-mcp** | Running on default URL (voiceover; pipeline degrades to silent if down) |
| **Bun** | `~\.bun\bin` on PATH for demo-vid frontend autostart |

## One-shot (agent or terminal)

```powershell
$env:PATH = "$env:USERPROFILE\scoop\shims;$env:USERPROFILE\.bun\bin;$env:PATH"
Set-Location D:\Dev\repos\demo-vid-mcp
uv run python -c @"
import asyncio, json
from demo_vid_mcp.tools.generate import demo_vid_generate
print(json.dumps(asyncio.run(demo_vid_generate(repo='japanophile-mcp')), indent=2, default=str))
"@
```

Output: `D:\Dev\repos\demo-vid-mcp\data\videos\japanophile-mcp\final.mp4` (+ `poster.jpg`, `subtitles.vtt`).

## What autostart expects

- `japanophile-mcp\start.ps1` must accept **`-Headless -BackendOnly`** under **Windows PowerShell 5.1** (`powershell.exe`, as demo-vid calls it). Backend runs as a **detached** process (not `Start-Job`).
- demo-vid then starts Vite with `bun run dev` on port **11194** (from WEBAPP_PORTS.md).

## Copy into this repo (optional)

```powershell
Copy-Item D:\Dev\repos\demo-vid-mcp\data\videos\japanophile-mcp\final.mp4 `
  D:\Dev\repos\japanophile-mcp\docs\screenshots\japanophile-demo.mp4
```

First agent run: **2026-09-13** (Cursor agent, CLI only; vfx-mcp transitions skipped, plain concat).
