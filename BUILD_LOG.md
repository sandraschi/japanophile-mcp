# BUILD_LOG - japanophile-mcp native builds

Running record for every NSIS build attempt (gate rule: no build without a log).

## 2026-09-13 - scaffold (no build yet)

- native/ scaffolded from the yahboom-mcp pattern: tauri.conf.json (11193
  backend, 11194 frontend dist), Cargo sidecar spawn with port-clear +
  health-poll + kill-on-exit, capabilities/default.json, hinomaru placeholder
  icons (PIL-generated, placeholder grade - replace with designed icon).
- NOT attempted yet: PyInstaller sidecar build (needs run_server entry +
  spec), `npx @tauri-apps/cli build --bundles nsis` (needs makensis -
  `winget install NSIS.NSIS`, not present on this box), CUA NSIS smoke test.
- Known before starting: read TAURI_PRODUCTION_PITFALLS.md A-J, then append
  the attempt here with failures and fixes.

## 2026-09-13 - first NSIS build: PASS

- makensis via winget (NSIS.NSIS, was absent). PyInstaller sidecar
  (japanophile-mcp-backend.spec, 28.9MB exe) verified frozen: /health,
  kanji lookup, 29 knowledge pages, compat shim all live from the exe.
- Frozen-path support added in db.py (sys._MEIPASS asset root, exe-side
  data dir); 2 real Rust E0308s fixed (AppHandle refs); cargo check green.
- `npx @tauri-apps/cli build --bundles nsis` -> Japanophile MCP_0.2.0_x64-setup.exe
  (31.2MB). Smoke: silent install to %LOCALAPPDATA%, app boot spawned backend
  (health OK, window "Japanophile MCP" with handle, 29 pages from installed
  layout), silent uninstall removed dir with no orphan processes/ports.
- Placeholder-grade icons (PIL hinomaru) still to replace with designed icon.

## 2026-09-14 - NSIS 0.3.1: PASS

- `just build-native` via `native/build.ps1` (fleet docker-mcp pattern): webapp
  tsc+vite, PyInstaller spec (~80 MB sidecar), health poll on port 11999,
  Tauri NSIS with `CARGO_TARGET_DIR` cleared so artifacts land under
  `native/target/` (Cursor sandbox env otherwise redirects cargo output).
- Ship: `native/target/release/bundle/nsis/Japanophile MCP_0.3.1_x64-setup.exe`
  (copy in `dist/`). Includes shopping Know + Travel tab from 0e9e4f5.
- Build script fixes: PS native-command stderr, pre-PyInstaller process kill,
  40s health retry loop.
- CUA smoke (`scripts/nsis-smoke.ps1`): silent `/S` install to
  `%LOCALAPPDATA%\Japanophile MCP`, app launch, `/health` OK, knowledge list
  31 pages, main window handle, silent uninstall, no orphans, port 11193 free.

## 2026-09-14 - NSIS 0.3.1 rebuild (games in sidecar): PASS

- Root cause: PyInstaller spec omitted `assets/games`; installed sidecar returned
  404 for all `/games/*` iframe cards while `/health` was OK.
- Fix: `japanophile-mcp-backend.spec` adds `assets/games` -> `japanophile_assets/games`.
- Verified frozen exe: `/games/kanji-master.html`, `/styles.css`, `/js/theme-switcher.js` -> 200.
- Ship: same path `Japanophile MCP_0.3.1_x64-setup.exe` (~82.5 MB in `dist/`).
