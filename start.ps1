#Requires -Version 7.0
# japanophile-mcp start.ps1 - backend HTTP :11193 + vite frontend :11194, browser opens.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSCommandPath
Set-Location -LiteralPath $repo
foreach ($port in @(11193, 11194)) {
    $holders = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($h in $holders) {
        try { Stop-Process -Id $h.OwningProcess -Force -ErrorAction Stop } catch {}
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $repo '.venv'))) {
    & "$env:USERPROFILE\.local\bin\uv.exe" sync --group dev
}
$backend = Start-Job -Name 'japanophile-backend' -ScriptBlock {
    param($root)
    Set-Location -LiteralPath $root
    & "$env:USERPROFILE\.local\bin\uv.exe" run python -m japanophile_mcp.http --port 11193
} -ArgumentList $repo
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:11193/health' -TimeoutSec 2 -UseBasicParsing
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep 1
}
if (-not $ready) { Receive-Job -Job $backend; throw 'backend :11193 never became ready' }
$env:PATH = "C:\Users\sandr\.bun\bin;$env:PATH"
Set-Location -LiteralPath (Join-Path $repo 'webapp')
Start-Process -NoNewWindow -FilePath 'bun' -ArgumentList 'run dev' -WorkingDirectory (Join-Path $repo 'webapp')
Start-Sleep 8
Start-Process 'http://127.0.0.1:11194'
Write-Output 'japanophile-mcp up: backend :11193, frontend :11194'
