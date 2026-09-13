# Downloads travel JPEGs into public/travel/* (Wikimedia Commons 960px thumbs).
# Verify license on each Commons file page before committing to git.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$publicTravel = Join-Path $root "public\travel"

$sets = @(
    @{
        Dir  = "nikko"
        Files = @(
            @{ Name = "yomeimon.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nikko_Tosho-gu_Yomeimon.jpg/960px-Nikko_Tosho-gu_Yomeimon.jpg" },
            @{ Name = "shinkyo.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Shinkyo.JPG/960px-Shinkyo.JPG" },
            @{ Name = "cedar-avenue.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Cedars_in_Nikko.jpg/960px-Cedars_in_Nikko.jpg" }
        )
    },
    @{
        Dir  = "tokyo"
        Files = @(
            @{ Name = "skytree.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Tokyo_Sky_Tree_2014.JPG/960px-Tokyo_Sky_Tree_2014.JPG" },
            @{ Name = "shibuya-scramble.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Shibuya_Crossing_2018.jpg/960px-Shibuya_Crossing_2018.jpg" },
            @{ Name = "sensoji.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sensoji_Asakusa_Tokyo_Japan.jpg/960px-Sensoji_Asakusa_Tokyo_Japan.jpg" },
            @{ Name = "omoide-yokocho.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Omoide_Yokocho_01.jpg/960px-Omoide_Yokocho_01.jpg" }
        )
    },
    @{
        Dir  = "kyoto"
        Files = @(
            @{ Name = "fushimi-inari.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Fushimi_Inari_tori.jpg/960px-Fushimi_Inari_tori.jpg" },
            @{ Name = "kiyomizu-dera.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kiyomizu-dera_in_Kyoto_-_November_2015.jpg/960px-Kiyomizu-dera_in_Kyoto_-_November_2015.jpg" },
            @{ Name = "kinkaku-ji.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Golden_Pavilion_Kinkaku-ji_in_Kyoto_Japan_January_2010.jpg/960px-Golden_Pavilion_Kinkaku-ji_in_Kyoto_Japan_January_2010.jpg" },
            @{ Name = "arashiyama-bamboo.jpg"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Bamboo_Forest_%28Arashiyama%29%2C_Kyoto.jpg/960px-Bamboo_Forest_%28Arashiyama%29%2C_Kyoto.jpg" }
        )
    }
)

foreach ($set in $sets) {
    $dir = Join-Path $publicTravel $set.Dir
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    foreach ($f in $set.Files) {
        $out = Join-Path $dir $f.Name
        Write-Host "Fetching $($set.Dir)/$($f.Name) ..."
        Invoke-WebRequest -Uri $f.Url -OutFile $out -UseBasicParsing
    }
}

Write-Host "Done. See public/travel/CREDITS.md"
