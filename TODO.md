# TODO - japanophile-mcp

## Now (Stage 1 close-out)

- [x] Scaffold: .gitignore-first, pyproject, justfile, start scripts
- [x] MCP tools: kanji, jlpt, vocab, knowledge, japanophile_help
- [x] Vendored inheritance (seeds, games, knowledge html, 2 docs)
- [x] fetch_data.ps1 + graceful degradation
- [x] Tests green on seeds, ruff clean, CI file
- [x] Docs: README, INSTALL, TOOLS, CONFIGURATION, INHERITANCE, SKILL.md
- [x] PRD/TODO/CHANGELOG seed, glama.json, llms.txt
- [ ] Register ports 11191/11194 in WEBAPP_PORTS.md
- [ ] git init + initial commit, create GitHub repo, push
- [ ] Verify MCP registration in Claude Desktop (stdio smoke)

## Done (Stage 2: human faces, 2026-09-13)

- [x] React webapp catch-them-all (11194): Dashboard, Learn, Know, Games, Chat, Skills, Tools, Settings, Help, Logs
- [x] skills/japanophile-expert wired into chat page (local LLM, system prompt)
- [x] Vendored html/js games as Games tabs (backend-origin iframe + compat shim, no fork)
- [x] Screenshots (docs/screenshots x5) + README Preview
- [x] Playwright e2e 8/8 (dev-stack webServer owns backend+vite; proxy-shadowing lesson recorded)
- [x] Ports moved 11191/11192 -> 11193/11194 (open-webui Docker squat, registry-marked)
- [x] Tauri scaffold (native/: sidecar spawn, capabilities, icons, just recipes, BUILD_LOG.md); cargo check green
- [ ] Tauri NSIS build (needs makensis + PyInstaller sidecar) -> Stage 3
- [ ] .mcpb bundle (prompts 3-4-100) + Glama publish -> Stage 3

## Later (faces 3-4: Plan + Remember)

- [ ] Travel planner tools (JR transit pattern, bookings, itineraries)
- [ ] Diary tools (daily log, streaks, SRS scheduler: SM-2 vs FSRS decision)
- [ ] SRS review scheduler linked to jlpt progress
- [ ] JP/EN parallel knowledge pages
- [ ] sinophile-mcp scaffold (pattern proof #2)
- [ ] ai-games-collection backlinks (learning sections point here)
