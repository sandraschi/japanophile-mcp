# Preview media (draft)

These captures are **placeholders**: zinc-on-zinc UI, no hero polish, and contrast that reads poorly in README thumbnails. **Higher-contrast shots are planned for 2026-09-14** (lighter accent chips, Know article open, Games iframe with a real drill loaded).

## How the current PNGs were taken (automation)

No manual Snipping Tool. The fleet **catch-them-all e2e harness** drives a real stack and dumps pixels:

1. **Playwright** `webapp/e2e/screenshots.spec.ts` sets a fixed **1280x720** viewport (same shape as demo-vid landscape).
2. **`playwright.config.ts`** starts **`webapp/scripts/dev-stack.ps1`**: spawns `uv run python -m japanophile_mcp.http` on **11193**, waits for `/health`, then runs **`bun run dev`** on **11194** (Playwright tears both down when the run finishes - no orphan servers).
3. For each route (`/`, `/learn`, `/know`, `/games`, `/chat`), the spec waits for `app-title`, pauses **1.5s** for KPI/quiz/iframe paint, then writes **`docs/screenshots/{name}.png`** via `page.screenshot()`.

Regenerate after UI changes:

```powershell
Set-Location D:\Dev\repos\japanophile-mcp\webapp
$env:PATH = "C:\Users\sandr\.bun\bin;$env:PATH"
bun run e2e -- e2e/screenshots.spec.ts
```

Same machinery as **`e2e/app.spec.ts`** (audit suite); only the output path differs.

## Video (agent-generated)

Narrated walkthrough via **[demo-vid-mcp](https://github.com/sandraschi/demo-vid-mcp)** CLI. Script: **[../demo-vid/narration.yaml](../demo-vid/narration.yaml)** (two user-facing sentences per page, **3 second** on-screen pause between them; auto-loaded by `demo_vid_generate`).

| Asset | Path |
|-------|------|
| MP4 | [japanophile-demo.mp4](./japanophile-demo.mp4) |
| Poster | [japanophile-demo-poster.jpg](./japanophile-demo-poster.jpg) |
| Reproduce | [AGENT_DEMO_VID.md](./AGENT_DEMO_VID.md) |

Regenerate after UI or script edits:

```powershell
$env:PATH = "$env:USERPROFILE\scoop\shims;$env:USERPROFILE\.bun\bin;$env:PATH"
Set-Location D:\Dev\repos\demo-vid-mcp
uv run python -c "import asyncio; from demo_vid_mcp.tools.generate import demo_vid_generate; print(asyncio.run(demo_vid_generate(repo='japanophile-mcp')))"
Copy-Item data\videos\japanophile-mcp\final.mp4 D:\Dev\repos\japanophile-mcp\docs\screenshots\japanophile-demo.mp4 -Force
```

Draft PNGs below remain low contrast until **2026-09-14** refresh (`bun run screenshots` in webapp).

| File | Route |
|------|--------|
| [dashboard.png](./dashboard.png) | `/` |
| [learn.png](./learn.png) | `/learn` |
| [know.png](./know.png) | `/know` |
| [games.png](./games.png) | `/games` |
| [chat.png](./chat.png) | `/chat` |
