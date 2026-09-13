# japanophile-mcp justfile
set windows-powershell

default:
    @just --list

bootstrap:
    uv sync --group dev
    pwsh -File scripts/ensure_data.ps1

ensure-data:
    pwsh -File scripts/ensure_data.ps1

vendor-data:
    pwsh -File scripts/vendor_from_donor.ps1

lint:
    uv run ruff check src tests
    uv run ruff format --check src tests

fix:
    uv run ruff check --fix src tests
    uv run ruff format src tests

typecheck:
    uv run pyright src

test:
    uv run pytest -q

serve:
    uv run python -m japanophile_mcp.server

serve-http:
    uv run python -m japanophile_mcp.http --port 11193

fetch-data:
    pwsh -File scripts/ensure_data.ps1

# Bundle for Claude Desktop (MCPB) — fresh copy src -> mcpb/src, then pack
mcpb-pack:
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/mcpb-pack.ps1

# --- Tauri NSIS (Stage 3: needs PyInstaller sidecar + makensis; see BUILD_LOG.md) ---
build-sidecar:
    uv run pyinstaller --onefile --name japanophile-mcp-backend --distpath native/binaries src/japanophile_mcp/http.py

build-native: build-sidecar
    npx @tauri-apps/cli build --bundles nsis
