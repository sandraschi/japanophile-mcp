# Downloads Nikko travel JPEGs into public/travel/nikko (Wikimedia Commons thumbs).
# Verify license on each Commons file page before committing to git.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root "public\travel\nikko"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$files = @(
    @{ Name = "yomeimon.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nikko_Tosho-gu_Yomeimon.jpg/960px-Nikko_Tosho-gu_Yomeimon.jpg" },
    @{ Name = "shinkyo.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Shinkyo.JPG/960px-Shinkyo.JPG" },
    @{ Name = "cedar-avenue.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Cedars_in_Nikko.jpg/960px-Cedars_in_Nikko.jpg" }
)

foreach ($f in $files) {
    $out = Join-Path $dir $f.Name
    Write-Host "Fetching $($f.Name) ..."
    Invoke-WebRequest -Uri $f.Url -OutFile $out -UseBasicParsing
}

Write-Host "Done. Prefer fetch-travel-photos.ps1 for all regions. See public/travel/CREDITS.md"
