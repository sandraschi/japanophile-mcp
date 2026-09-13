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
