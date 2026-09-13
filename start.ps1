# japanophile-mcp start.ps1 - backend HTTP :11193 + vite frontend :11194.
# demo-vid-mcp autostart: powershell.exe -File start.ps1 -Headless -BackendOnly (PS 5.1+)
param(
    [switch]$Headless,
    [switch]$BackendOnly,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSCommandPath
Set-Location -LiteralPath $repo
$uv = "$env:USERPROFILE\.local\bin\uv.exe"

$ports = @(11193)
if (-not $BackendOnly) { $ports += 11194 }
foreach ($port in $ports) {
    $holders = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($h in $holders) {
        try { Stop-Process -Id $h.OwningProcess -Force -ErrorAction Stop } catch {}
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $repo '.venv'))) {
    & $uv sync --group dev
}

$kanjiDb = Join-Path $repo 'data\kanji.db'
if (-not (Test-Path -LiteralPath $kanjiDb)) {
    Write-Output 'WARNING: data/kanji.db missing — restore from git or run scripts/vendor_from_donor.ps1 (maintainer).'
}

# Detached process (not Start-Job): demo-vid and other autostarters exit after start.ps1 returns.
$backendCmd = @"
Set-Location -LiteralPath '$repo'
& '$uv' run python -m japanophile_mcp.http --port 11193
"@ -replace "`r`n", ' '
Start-Process -FilePath 'powershell.exe' -WindowStyle Hidden -ArgumentList @(
    '-NoProfile', '-Command', $backendCmd
) -WorkingDirectory $repo

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:11193/health' -TimeoutSec 2 -UseBasicParsing
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep 1
}
if (-not $ready) { throw 'backend :11193 never became ready' }

if ($BackendOnly) {
    Write-Output 'japanophile-mcp backend :11193 (Headless autostart OK; frontend not started)'
    exit 0
}

$env:PATH = "C:\Users\sandr\.bun\bin;$env:PATH"
$webapp = Join-Path $repo 'webapp'
$devArgs = @('run', 'dev')

if ($Headless) {
    Start-Process -WindowStyle Hidden -FilePath 'bun' -ArgumentList $devArgs -WorkingDirectory $webapp
} else {
    Start-Process -NoNewWindow -FilePath 'bun' -ArgumentList $devArgs -WorkingDirectory $webapp
}

Start-Sleep 8
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:11194/' -TimeoutSec 2 -UseBasicParsing
        if ($r.StatusCode -lt 500) { break }
    } catch {}
    Start-Sleep 1
}

if (-not $NoBrowser -and -not $Headless) {
    Start-Process 'http://127.0.0.1:11194'
}
Write-Output 'japanophile-mcp up: backend :11193, frontend :11194'
