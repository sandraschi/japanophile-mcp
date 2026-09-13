# Self-contained data/ corpora — see data/README.md and scripts/ensure_data.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repo 'scripts\ensure_data.ps1')
