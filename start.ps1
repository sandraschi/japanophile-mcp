#Requires -Version 7.0
# japanophile-mcp start.ps1 - clears ports, serves MCP over stdio + HTTP.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSCommandPath
Set-Location -LiteralPath $repo
foreach ($port in @(11191, 11192)) {
    $holders = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($h in $holders) {
        try { Stop-Process -Id $h.OwningProcess -Force -ErrorAction Stop } catch {}
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $repo '.venv'))) {
    & "$env:USERPROFILE\.local\bin\uv.exe" sync --group dev
}
& "$env:USERPROFILE\.local\bin\uv.exe" run python -m japanophile_mcp.server
