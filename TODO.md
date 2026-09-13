# TODO - japanophile-mcp

## Now (Stage 1 close-out)

- [x] Scaffold: .gitignore-first, pyproject, justfile, start scripts
- [x] MCP tools: kanji, jlpt, vocab, knowledge, japanophile_help
- [x] Vendored inheritance (seeds, games, knowledge html, 2 docs)
- [x] fetch_data.ps1 + graceful degradation
- [x] Tests green on seeds, ruff clean, CI file
- [x] Docs: README, INSTALL, TOOLS, CONFIGURATION, INHERITANCE, SKILL.md
- [x] PRD/TODO/CHANGELOG seed, glama.json, llms.txt
- [ ] Register ports 11191/11192 in WEBAPP_PORTS.md
- [ ] git init + initial commit, create GitHub repo, push
- [ ] Verify MCP registration in Claude Desktop (stdio smoke)

## Next (Stage 2: human faces)

- [ ] React webapp catch-them-all (11192): Dashboard, Learn, Know, Quiz, Chat + skill, Settings (LLM), Help, Logs
- [ ] skills/japanophile-expert wired into chat page
- [ ] Vendored html/js games surfaced as Learn tabs (iframe or port)
- [ ] Screenshots spec (docs/screenshots + README Preview)
- [ ] Playwright e2e (Fleet Audit minimum)
- [ ] Tauri NSIS winapp (pitfalls audit A-J first, BUILD_LOG.md)
- [ ] .mcpb bundle (prompts 3-4-100) + Glama publish

## Later (faces 3-4: Plan + Remember)

- [ ] Travel planner tools (JR transit pattern, bookings, itineraries)
- [ ] Diary tools (daily log, streaks, SRS scheduler: SM-2 vs FSRS decision)
- [ ] SRS review scheduler linked to jlpt progress
- [ ] JP/EN parallel knowledge pages
- [ ] sinophile-mcp scaffold (pattern proof #2)
- [ ] ai-games-collection backlinks (learning sections point here)
