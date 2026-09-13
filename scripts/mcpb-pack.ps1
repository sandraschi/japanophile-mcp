#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build a fleet-standard MCPB bundle for japanophile-mcp (fresh-stage, verify, pack).

.DESCRIPTION
    Per MCPB_PACKAGING_STANDARDS.md (mcp-central-docs):
      0. Fresh-stage src/<pkg> -> mcpb/src/<pkg> (wipe + recopy)
      1. Sync repo assets -> mcpb/assets (seed, knowledge, games, skills)
      2. Sync canonical prompts assets/prompts -> mcpb/assets/prompts
      3. Sync manifest version from pyproject.toml; copy run_server.py + pyproject.toml
      4. 3-4-100 prompt gate; entry import from mcpb/src only; pollution check
      5. mcpb pack -> dist/{name}-v{version}.mcpb
      6. Remove mcpb/src (unless -KeepStage)

.PARAMETER RepoRoot
    Repo root. Defaults to parent of this script directory.

.PARAMETER KeepStage
    Leave mcpb/src after pack (diagnostics only).
#>
param(
    [string]$RepoRoot = "",
    [switch]$KeepStage
)

$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = Split-Path $PSScriptRoot -Parent }

Write-Host "`n=== mcpb-pack.ps1 - japanophile-mcp ===" -ForegroundColor Cyan

$mcpbCmd = Get-Command mcpb.cmd -ErrorAction SilentlyContinue
if (-not $mcpbCmd) { $mcpbCmd = Get-Command mcpb -ErrorAction SilentlyContinue }
if (-not $mcpbCmd) {
    $npmMcpb = Join-Path $env:APPDATA "npm\mcpb.cmd"
    if (Test-Path $npmMcpb) { $mcpbCmd = $npmMcpb } else { throw "mcpb CLI not found. Install: npm install -g @anthropic-ai/mcpb" }
}
Write-Host "  mcpb CLI: $mcpbCmd" -ForegroundColor Green

$pyprojPath = Join-Path $RepoRoot "pyproject.toml"
$pyproj = Get-Content $pyprojPath -Raw -Encoding UTF8
$name = if ($pyproj -match '(?m)^name\s*=\s*"([^"]*)"') { $matches[1] } else { "japanophile-mcp" }
$version = if ($pyproj -match '(?m)^version\s*=\s*"([^"]*)"') { $matches[1] } else { "0.0.0" }
Write-Host "  Package: $name v$version" -ForegroundColor Yellow

function Sync-Tree([string]$RelativeSrc, [string]$RelativeDst) {
    $src = Join-Path $RepoRoot $RelativeSrc
    $dst = Join-Path $RepoRoot $RelativeDst
    if (-not (Test-Path -LiteralPath $src)) { return }
    if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $dst -Recurse -Force }
    $parent = Split-Path -Parent $dst
    if ($parent -and -not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    Copy-Item -LiteralPath $src -Destination $dst -Recurse -Force
    Write-Host "  Synced $RelativeSrc -> $RelativeDst" -ForegroundColor Green
}

# --- 0. Fresh-stage source ---
$pkgDir = Get-ChildItem (Join-Path $RepoRoot "src") -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName "__init__.py") } | Select-Object -First 1
if (-not $pkgDir) { throw "No Python package under $RepoRoot\src" }
$pkgName = $pkgDir.Name
$stagePkg = Join-Path $RepoRoot "mcpb\src\$pkgName"

Write-Host "  Fresh-staging src\$pkgName -> mcpb\src\$pkgName ..." -ForegroundColor Yellow
if (Test-Path (Join-Path $RepoRoot "mcpb\src")) {
    Remove-Item -Recurse -Force (Join-Path $RepoRoot "mcpb\src")
}
New-Item -ItemType Directory -Force -Path (Split-Path $stagePkg) | Out-Null
Copy-Item -Recurse -Force $pkgDir.FullName $stagePkg
Get-ChildItem $stagePkg -Recurse -Filter "__pycache__" -Directory -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem $stagePkg -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue |
    Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "  Staged fresh source" -ForegroundColor Green

# --- 1. Static assets into mcpb ---
Sync-Tree "assets\seed" "mcpb\assets\seed"
Sync-Tree "assets\knowledge" "mcpb\assets\knowledge"
Sync-Tree "assets\games" "mcpb\assets\games"
Sync-Tree "skills" "mcpb\assets\skills"

$seedKanji = Join-Path $RepoRoot "mcpb\assets\seed\kanji_database.db"
if (-not (Test-Path -LiteralPath $seedKanji)) {
    Write-Host "  WARNING: mcpb/assets/seed/kanji_database.db missing after sync - kanji tool may fail in bundle" -ForegroundColor DarkYellow
}

# --- 2. Canonical prompts ---
$srcPrompts = Join-Path $RepoRoot "assets\prompts"
$destPrompts = Join-Path $RepoRoot "mcpb\assets\prompts"
if (-not (Test-Path (Join-Path $srcPrompts "system.md"))) {
    $legacy = Join-Path $RepoRoot "mcpb\assets\prompts\system.md"
    if (Test-Path -LiteralPath $legacy) {
        New-Item -ItemType Directory -Force -Path $srcPrompts | Out-Null
        Copy-Item -Recurse -Force (Join-Path $RepoRoot "mcpb\assets\prompts\*") $srcPrompts
        Write-Host "  Bootstrapped assets/prompts from mcpb (canonical going forward)" -ForegroundColor Yellow
    }
}
if (Test-Path (Join-Path $srcPrompts "system.md")) {
    New-Item -ItemType Directory -Force -Path $destPrompts | Out-Null
    Copy-Item -Recurse -Force (Join-Path $srcPrompts "*") $destPrompts
    Write-Host "  Copied assets/prompts -> mcpb/assets/prompts" -ForegroundColor Green
} else {
    throw "Missing assets/prompts (3-4-100). Add system.md, user.md, examples.json."
}

function Get-WordCount([string]$Path) {
    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    return (@($raw -split '\s+' | Where-Object { $_ })).Count
}

$sysW = Get-WordCount (Join-Path $destPrompts "system.md")
$userW = Get-WordCount (Join-Path $destPrompts "user.md")
$exJson = Get-Content (Join-Path $destPrompts "examples.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$exN = @($exJson).Count
if ($sysW -lt 3000 -or $userW -lt 4000 -or $exN -lt 100) {
    throw "3-4-100 FAIL: system=$sysW user=$userW examples=$exN (need 3000 / 4000 / 100)"
}
Write-Host "  3-4-100 OK: system=$sysW user=$userW examples=$exN" -ForegroundColor Green

# --- 3. Pack metadata ---
Copy-Item -LiteralPath (Join-Path $RepoRoot "run_server.py") -Destination (Join-Path $RepoRoot "mcpb\run_server.py") -Force -ErrorAction SilentlyContinue
$mcpbRun = Join-Path $RepoRoot "mcpb\run_server.py"
if (-not (Test-Path -LiteralPath $mcpbRun)) {
    throw "mcpb/run_server.py missing after sync"
}
# MCPB entry must be stdio server, not HTTP sidecar
$mcpbRunText = @'
"""MCPB / Claude Desktop entry (stdio MCP)."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src"))

from japanophile_mcp.server import main

if __name__ == "__main__":
    main()
'@
[System.IO.File]::WriteAllText($mcpbRun, $mcpbRunText, (New-Object System.Text.UTF8Encoding($false)))

Copy-Item -LiteralPath $pyprojPath -Destination (Join-Path $RepoRoot "mcpb\pyproject.toml") -Force

$manifestPath = Join-Path $RepoRoot "mcpb\manifest.json"
if (-not (Test-Path -LiteralPath $manifestPath)) { throw "mcpb/manifest.json missing" }
$manifestRaw = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8
$manifestRaw = [regex]::Replace($manifestRaw, '(?<="version"\s*:\s*")[^"]+(?=")', $version)
$manifestRaw = $manifestRaw -replace 'Needs fetched kanji\.db\.', 'Uses data/kanji.db when present (~135MB, not in .mcpb; seeds + knowledge ship in bundle).'
[System.IO.File]::WriteAllText($manifestPath, $manifestRaw, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "  manifest.json version -> $version" -ForegroundColor Green

Get-ChildItem (Join-Path $RepoRoot "mcpb") -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '\.(bak|orig|rej)$' -or $_.Name -match '\.bak\.' } |
    ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue }

# --- 4. .mcpbignore at pack root ---
$rootIgnore = Join-Path $RepoRoot ".mcpbignore"
$packIgnore = Join-Path $RepoRoot "mcpb\.mcpbignore"
if (Test-Path -LiteralPath $rootIgnore) {
    Copy-Item -LiteralPath $rootIgnore -Destination $packIgnore -Force
    Write-Host "  Synced mcpb/.mcpbignore from repo root" -ForegroundColor Green
} elseif (Test-Path -LiteralPath $packIgnore) {
    Write-Host "  Using existing mcpb/.mcpbignore" -ForegroundColor Yellow
} else {
    throw "No .mcpbignore at repo root or mcpb/"
}

# --- 5. Entry import from mcpb/src only ---
$prevPath = $env:PYTHONPATH
$prevNoByte = $env:PYTHONDONTWRITEBYTECODE
$env:PYTHONDONTWRITEBYTECODE = "1"
$uvCmd = Get-Command uv -ErrorAction SilentlyContinue
$env:PYTHONPATH = Join-Path $RepoRoot "mcpb\src"
if ($uvCmd) {
    $importOut = (& uv run --project $RepoRoot python -c "import $pkgName; print('import-ok', $pkgName.__file__)" 2>&1 | Out-String)
} else {
    $py = Get-Command python -ErrorAction SilentlyContinue
    if (-not $py) { throw "Neither uv nor python found for import verify" }
    $importOut = (& python -c "import $pkgName; print('import-ok', $pkgName.__file__)" 2>&1 | Out-String)
}
$env:PYTHONPATH = $prevPath
$env:PYTHONDONTWRITEBYTECODE = $prevNoByte
if ($LASTEXITCODE -ne 0 -or $importOut -notmatch "import-ok") {
    throw "Entry import FAILED from mcpb/src only: $importOut"
}
if ($importOut -match "site-packages") {
    throw "Entry resolved from site-packages - not self-contained"
}
Write-Host "  Entry import OK from mcpb/src only" -ForegroundColor Green

# --- 6. Pollution check ---
$bad = Get-ChildItem (Join-Path $RepoRoot "mcpb") -Recurse -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Name -match '^__pycache__$' -or
        $_.Name -match '\.(pyc|bak|orig|rej)$' -or
        $_.Name -match '\.bak\.'
    }
if ($bad) { throw "Pollution under mcpb/: $($bad.FullName -join ', ')" }
Write-Host "  mcpb/ tree clean" -ForegroundColor Green

# --- 7. Pack ---
$distDir = Join-Path $RepoRoot "dist"
New-Item -ItemType Directory -Force -Path $distDir | Out-Null
$outputFile = Join-Path $distDir "$name-v$version.mcpb"
if (Test-Path -LiteralPath $outputFile) { Remove-Item -LiteralPath $outputFile -Force }
Write-Host "  Packing -> $outputFile ..." -ForegroundColor Yellow
& $mcpbCmd pack (Join-Path $RepoRoot "mcpb") $outputFile 2>&1 | ForEach-Object { Write-Host $_ }
if (-not (Test-Path -LiteralPath $outputFile)) { throw "mcpb pack did not produce $outputFile" }

if (-not $KeepStage -and (Test-Path (Join-Path $RepoRoot "mcpb\src"))) {
    Remove-Item -Recurse -Force (Join-Path $RepoRoot "mcpb\src")
    Write-Host "  Removed mcpb/src staging" -ForegroundColor Green
}

$sizeMB = [math]::Round((Get-Item -LiteralPath $outputFile).Length / 1MB, 2)
Write-Host "`n  BUILT: $outputFile ($sizeMB MB)" -ForegroundColor Green
Write-Host "  Drag into Claude Desktop or run: mcpb validate `"$outputFile`"" -ForegroundColor Cyan
