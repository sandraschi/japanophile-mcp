$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$RepoName = Split-Path -Leaf $Root
$Triple = "x86_64-pc-windows-msvc"
$ResourceDir = "$PSScriptRoot\resources"
$DevDir = "$PSScriptRoot\binaries"
New-Item -ItemType Directory -Force -Path $ResourceDir, $DevDir | Out-Null

Write-Host "=== ${RepoName} Tauri Release Build ===" -ForegroundColor Cyan

# Step 1: TypeScript lint gate + frontend build
$frontend = Join-Path $Root "webapp"
if (-not (Test-Path "$frontend\package.json")) {
    throw "webapp/package.json not found"
}
Write-Host "-> [1/4] Building frontend (webapp)..." -ForegroundColor Yellow
Push-Location $frontend
npm install --silent 2>$null

Write-Host "  tsc --noEmit..." -ForegroundColor Gray
$tscOut = npx tsc --noEmit 2>&1
$tscExit = $LASTEXITCODE
if ($tscExit -ne 0) {
    Write-Host "  TypeScript compilation FAILED - fix errors before building NSIS" -ForegroundColor Red
    Write-Host $tscOut
    throw "TypeScript compilation failed - fix all errors before building NSIS installer"
}

npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
Pop-Location

# Step 2: PyInstaller backend (onefile via spec)
Write-Host "-> [2/4] PyInstaller backend..." -ForegroundColor Yellow
$specFile = "$Root\${RepoName}-backend.spec"
if (-not (Test-Path $specFile)) {
    throw "Spec file not found at $specFile"
}
Push-Location $Root
$fm = "$Root\.venv\Lib\site-packages\fastmcp\__init__.py"
if (Test-Path $fm) {
    $c = Get-Content $fm -Raw
    if ($c -match 'except PackageNotFoundError:\s+    __version__ = _version\("fastmcp"\)') {
        $c = $c -replace 'except PackageNotFoundError:\s+    __version__ = _version\("fastmcp"\)', 'except PackageNotFoundError:
    try:
        __version__ = _version("fastmcp")
    except PackageNotFoundError:
        __version__ = "0.0.0"'
        Set-Content $fm -Value $c -Encoding utf8
        Write-Host "  Patched fastmcp metadata fallback" -ForegroundColor Yellow
    }
}
uv run pyinstaller "$specFile" --clean --noconfirm
if ($LASTEXITCODE -ne 0) { throw "PyInstaller failed with exit code $LASTEXITCODE" }
Pop-Location

# Step 3: Embed in Tauri resources (+ dev fallback) with size gate + smoke test
Write-Host "-> [3/4] Embedding backend..." -ForegroundColor Yellow
$src = "$Root\dist\${RepoName}-backend.exe"
if (-not (Test-Path $src)) { throw "Backend exe not found at $src - PyInstaller step failed" }
$sizeMB = (Get-Item $src).Length / 1MB
if ($sizeMB -lt 5) {
    throw "Backend exe is only $([math]::Round($sizeMB, 1)) MB at $src - PyInstaller produced an empty/broken binary"
}
Write-Host "  Backend exe: $([math]::Round($sizeMB, 1)) MB"

Write-Host "  Smoke-testing frozen binary..." -ForegroundColor Yellow
$testPort = 11999
$testProc = Start-Process -FilePath $src -ArgumentList @("--port", "$testPort", "--host", "127.0.0.1") -NoNewWindow -PassThru -RedirectStandardError "$Root\dist\pyi-crash.log"
Start-Sleep -Seconds 6
if ($testProc.HasExited) {
    $crash = Get-Content "$Root\dist\pyi-crash.log" -Raw
    throw "Frozen binary crashed on launch (exit $($testProc.ExitCode)):`n$crash"
}
try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:${testPort}/health" -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -ne 200) {
        throw "Health returned $($resp.StatusCode)"
    }
} catch {
    $testProc | Stop-Process -Force -ErrorAction SilentlyContinue
    throw "Health check failed on port ${testPort}: $_"
}
$testProc | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item "$Root\dist\pyi-crash.log" -Force -ErrorAction SilentlyContinue
Write-Host "  Frozen binary smoke test PASSED" -ForegroundColor Green

Copy-Item $src "$ResourceDir\${RepoName}-backend.exe" -Force
Copy-Item $src "$DevDir\${RepoName}-backend-$Triple.exe" -Force

# Step 4: Single NSIS installer
Write-Host "-> [4/4] Tauri NSIS bundle..." -ForegroundColor Yellow
Push-Location $PSScriptRoot
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
npx @tauri-apps/cli build --bundles nsis
if ($LASTEXITCODE -ne 0) { throw "Tauri build failed with exit code $LASTEXITCODE" }
Pop-Location

$distDir = Join-Path $Root "dist"
New-Item -ItemType Directory -Force -Path $distDir | Out-Null
$nsisDir = "$PSScriptRoot\target\release\bundle\nsis"
if (Test-Path $nsisDir) {
    Copy-Item "$nsisDir\*-setup.exe" "$distDir\" -Force
}

Write-Host "=== Build complete ===" -ForegroundColor Green
Write-Host "Ship: $nsisDir\*.exe"
