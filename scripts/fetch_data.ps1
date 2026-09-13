#Requires -Version 7.0
<#
  fetch_data.ps1 - fetch big DBs that are NEVER vendored into git.
  kanji.db (135MB): copy from an ai-games-collection checkout if present.
  wakan_vocab.json (33MB): same. edict2.gz: upstream EDICT (prints URL).
  Small seeds already live in assets/seed/ and need no fetching.
#>
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$data = Join-Path $repo 'data'
New-Item -ItemType Directory -Path $data -Force | Out-Null
$games = 'D:\Dev\repos\ai-games-collection\data'

function Get-BigFile($name) {
    $target = Join-Path $data $name
    if (Test-Path -LiteralPath $target) { Write-Output "OK (present): $name"; return }
    $source = Join-Path $games $name
    if (Test-Path -LiteralPath $source) {
        Copy-Item -LiteralPath $source -Destination $target
        Write-Output "COPIED from ai-games-collection: $name"
    } else {
        Write-Output "MISSING: $name - no ai-games-collection checkout found."
    }
}

Get-BigFile 'kanji.db'
Get-BigFile 'wakan_vocab.json'
Write-Output 'edict2.gz: fetch upstream EDICT (https://www.edrdg.org/jmdict/edict.html) into data/ - optional, not wired to tools yet.'
Write-Output 'Done. Tools degrade gracefully when big DBs are absent.'
