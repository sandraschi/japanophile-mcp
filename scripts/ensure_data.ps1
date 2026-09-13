# Ensures vendored learning corpora exist under data/ (no ai-games runtime dependency).
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$data = Join-Path $repo 'data'

$required = @(
    @{ Name = 'kanji.db'; Hint = 'vocab, jmdict, examples, jlpt_vocabulary tables' },
    @{ Name = 'wakan_vocab.json'; Hint = 'extended vocab JSON (future tools)' }
)

$missing = @()
foreach ($item in $required) {
    $path = Join-Path $data $item.Name
    if (Test-Path -LiteralPath $path) {
        $len = (Get-Item -LiteralPath $path).Length
        Write-Output ("OK {0} ({1:N0} bytes) - {2}" -f $item.Name, $len, $item.Hint)
    } else {
        $missing += $item.Name
        Write-Output ("MISSING {0} - {1}" -f $item.Name, $item.Hint)
    }
}

if ($missing.Count -gt 0) {
    Write-Output ''
    Write-Output 'Restore from git (data/kanji.db and data/wakan_vocab.json are vendored).'
    Write-Output 'Maintainers refreshing from donor: scripts/vendor_from_donor.ps1'
    exit 1
}

Write-Output 'data/ corpora OK.'
exit 0
