# dev-stack.ps1 - Playwright webServer entry: backend (child) + vite (foreground).
# Playwright owns this tree: both die when the run ends. No orphan servers.
$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$webapp = Join-Path $repo "webapp"

$backend = Start-Process -FilePath "C:\Users\sandr\.local\bin\uv.exe" `
    -ArgumentList "run python -m japanophile_mcp.http --port 11193" `
    -WorkingDirectory $repo -PassThru -WindowStyle Hidden

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:11193/health" -TimeoutSec 2 -UseBasicParsing
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep 1
}
if (-not $ready) {
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    throw "backend :11193 never became ready"
}

Set-Location -LiteralPath $webapp
$env:PATH = "C:\Users\sandr\.bun\bin;$env:PATH"
& bun run dev
