# Travel photo credits

Images load from `public/travel/{nikko,tokyo,kyoto}/` when present, otherwise from Wikimedia Commons thumbs (see `webapp/src/content/*Photos.ts`).

## Optional local copies (offline / MCPB)

```powershell
Set-Location D:\Dev\repos\japanophile-mcp\webapp
.\scripts\fetch-travel-photos.ps1
```

(`fetch-nikko-photos.ps1` still works for Nikko only.)

### Tokyo (`public/travel/tokyo/`)

| File | Subject |
|------|---------|
| `skytree.jpg` | Tokyo Skytree |
| `shibuya-scramble.jpg` | Shibuya scramble crossing |
| `sensoji.jpg` | Senso-ji, Asakusa |
| `omoide-yokocho.jpg` | Omoide Yokocho (Shinjuku yakitori alleys) |

### Kyoto (`public/travel/kyoto/`)

| File | Subject |
|------|---------|
| `fushimi-inari.jpg` | Fushimi Inari torii |
| `kiyomizu-dera.jpg` | Kiyomizu-dera |
| `kinkaku-ji.jpg` | Kinkaku-ji (Golden Pavilion) |
| `arashiyama-bamboo.jpg` | Arashiyama bamboo grove |

### Nikko (`public/travel/nikko/`)

| File | Subject |
|------|---------|
| `yomeimon.jpg` | Toshogu Yomeimon gate |
| `shinkyo.jpg` | Shinkyo bridge |
| `cedar-avenue.jpg` | Cedar avenue |

Replace or add photos only if you hold redistribution rights. Verify CC terms on each Commons file page before git commit.
