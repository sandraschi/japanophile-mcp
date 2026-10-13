# Silent NSIS install / boot / health / uninstall smoke (local only).
$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

$Setup = Join-Path $PSScriptRoot "..\dist\Japanophile MCP_0.3.1_x64-setup.exe"
$InstallDir = Join-Path $env:LOCALAPPDATA "Japanophile MCP"
$AppExe = Join-Path $InstallDir "japanophile-mcp-app.exe"
$Port = 11193
$UninstKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Japanophile MCP"

function Stop-JpnProcesses {
    # HARDENED 2026-09-17: was Stop-Process + blind Start-Sleep -Seconds 2, no
    # verification the processes actually died (see TRAPS_AND_PITFALLS.md #36).
    # Poll up to 10s; warn (don't silently proceed) if something's still alive.
    Get-Process -Name "japanophile-mcp-app", "japanophile-mcp-backend" -ErrorAction SilentlyContinue |
        Stop-Process -Force -ErrorAction SilentlyContinue
    $waitSec = 10
    $elapsed = 0
    while ($elapsed -lt $waitSec) {
        Start-Sleep -Milliseconds 500
        $elapsed += 0.5
        if (-not (Get-Process -Name "japanophile-mcp-app", "japanophile-mcp-backend" -ErrorAction SilentlyContinue)) { return }
    }
    Write-Host "  WARNING: japanophile process(es) still alive after ${waitSec}s kill wait" -ForegroundColor DarkYellow
}

function Get-UninstallString {
    if (-not (Test-Path $UninstKey)) {
        return $null
    }
    return (Get-ItemProperty -Path $UninstKey -ErrorAction SilentlyContinue).UninstallString
}

function Invoke-SilentUninstall {
    $uninst = Get-UninstallString
    if (-not $uninst) {
        return
    }
    Write-Host "-> Silent uninstall existing..." -ForegroundColor Yellow
    if ($uninst -match '^"(.+?)"\s*(.*)$') {
        $exe = $Matches[1]
        $args = $Matches[2]
        if ($args -notmatch '/S') {
            $args = "$args /S"
        }
        Start-Process -FilePath $exe -ArgumentList $args.Trim() -Wait
    } else {
        Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", "$uninst /S") -Wait
    }
    Start-Sleep -Seconds 3
    Stop-JpnProcesses
}

if (-not (Test-Path $Setup)) {
    throw "Setup not found: $Setup"
}

Write-Host "=== NSIS smoke 0.3.1 ===" -ForegroundColor Cyan
Stop-JpnProcesses
Invoke-SilentUninstall

Write-Host "-> Silent install..." -ForegroundColor Yellow
$installProc = Start-Process -FilePath $Setup -ArgumentList "/S" -PassThru -Wait
if ($installProc.ExitCode -ne 0) {
    throw "Installer exit code $($installProc.ExitCode)"
}
# HARDENED 2026-09-17: was a blind Start-Sleep -Seconds 5 then a single Test-Path
# check - poll instead so a slow/AV-scanned extraction doesn't false-fail.
$installWaitSec = 20
$installElapsed = 0
while ($installElapsed -lt $installWaitSec -and -not (Test-Path $AppExe)) {
    Start-Sleep -Milliseconds 500
    $installElapsed += 0.5
}
if (-not (Test-Path $AppExe)) {
    throw "App missing after install: $AppExe"
}
Write-Host "  Installed: $InstallDir" -ForegroundColor Green

Write-Host "-> Launch app..." -ForegroundColor Yellow
$appProc = Start-Process -FilePath $AppExe -PassThru
$healthOk = $false
$healthBody = ""
for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -Seconds 2
    if ($appProc.HasExited) {
        throw "App exited early with code $($appProc.ExitCode)"
    }
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:${Port}/health" -UseBasicParsing -TimeoutSec 4
        if ($resp.StatusCode -eq 200) {
            $healthOk = $true
            $healthBody = $resp.Content
            break
        }
    } catch {
        # still booting
    }
}
if (-not $healthOk) {
    Stop-Process -Id $appProc.Id -Force -ErrorAction SilentlyContinue
    throw "Health failed on port $Port after 90s"
}
Write-Host "  Health: $healthBody" -ForegroundColor Green

$knowOk = $false
try {
    $k = Invoke-WebRequest -Uri "http://127.0.0.1:${Port}/api/knowledge" -UseBasicParsing -TimeoutSec 10
    $knowOk = ($k.StatusCode -eq 200)
    if ($knowOk) {
        $parsed = $k.Content | ConvertFrom-Json
        $count = $null
        if ($parsed.data -is [Array]) {
            $count = $parsed.data.Count
        } elseif ($parsed.pages) {
            $count = $parsed.pages.Count
        }
        Write-Host "  Knowledge API OK (items: $count)" -ForegroundColor Green
    }
} catch {
    Write-Host "  Knowledge API check: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

$mainWindow = $false
for ($w = 0; $w -lt 15; $w++) {
    $appProc.Refresh()
    if ($appProc.MainWindowHandle -ne [IntPtr]::Zero) {
        $mainWindow = $true
        Write-Host "  Main window handle present" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
}
if (-not $mainWindow) {
    Write-Host "  Warning: no main window handle (headless or slow WebView)" -ForegroundColor DarkYellow
}

Write-Host "-> Stop app..." -ForegroundColor Yellow
Stop-JpnProcesses

Write-Host "-> Silent uninstall..." -ForegroundColor Yellow
Invoke-SilentUninstall

if (Test-Path $InstallDir) {
    throw "Install dir still present: $InstallDir"
}
Write-Host "  Install dir removed" -ForegroundColor Green

Start-Sleep -Seconds 2
$orphanBackend = Get-Process -Name "japanophile-mcp-backend" -ErrorAction SilentlyContinue
$orphanApp = Get-Process -Name "japanophile-mcp-app" -ErrorAction SilentlyContinue
if ($orphanBackend -or $orphanApp) {
    throw "Orphan processes after uninstall"
}
Write-Host "  No orphan processes" -ForegroundColor Green

try {
    $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue
    if ($tcp.TcpTestSucceeded) {
        throw "Port $Port still listening after uninstall"
    }
} catch {
    if ($_.Exception.Message -notmatch "still listening") {
        # connection refused is OK
    } else {
        throw
    }
}
Write-Host "  Port $Port free" -ForegroundColor Green

Write-Host "=== NSIS smoke PASS ===" -ForegroundColor Green
