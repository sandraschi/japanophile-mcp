# Copy learning corpora from a donor folder into japanophile-mcp/data (maintainer refresh only).
# End users must NOT need ai-games-collection — commit the copied files to this repo.
param(
    [string]$DonorRoot = ''
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$data = Join-Path $repo 'data'
New-Item -ItemType Directory -Path $data -Force | Out-Null

if (-not $DonorRoot) {
    $fleetRoot = Split-Path -Parent $repo
    $DonorRoot = Join-Path $fleetRoot 'ai-games-collection\data'
}
if (-not (Test-Path -LiteralPath $DonorRoot)) {
    Write-Error "Donor folder not found: $DonorRoot. Pass -DonorRoot explicitly."
}

$files = @('kanji.db', 'wakan_vocab.json')
foreach ($name in $files) {
    $src = Join-Path $DonorRoot $name
    $dst = Join-Path $data $name
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Output "SKIP (donor missing): $name"
        continue
    }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    $len = (Get-Item -LiteralPath $dst).Length
    Write-Output ("COPIED {0} -> data/ ({1:N0} bytes)" -f $name, $len)
}

Write-Output 'Run scripts/ensure_data.ps1 then commit data/kanji.db and data/wakan_vocab.json.'
