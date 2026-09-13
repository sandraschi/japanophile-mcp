# Learning corpora (vendored — repo must run without ai-games-collection)

| File | Role | Approx size |
|------|------|-------------|
| `kanji.db` | Vocab search, jmdict, **examples** (Tatoeba), jlpt_vocabulary, compounds compat | ~135 MB |
| `wakan_vocab.json` | Extended vocab JSON (reserved for future tools) | ~33 MB |

Seeds (committed under `assets/seed/`, not here):

- `kanji_database.db` — kanji tool (13k)
- `jlpt_questions.db` — quiz bank (600 Q)

Writable at runtime (gitignored):

- `progress.db` — JLPT answer history

## Refresh corpora (maintainers only)

One-time or when updating from the historical donor checkout:

```powershell
pwsh -File scripts/vendor_from_donor.ps1 -DonorRoot D:\Dev\repos\ai-games-collection\data
```

Then commit `data/kanji.db` and `data/wakan_vocab.json`. End users clone japanophile-mcp only.

## Verify before release

```powershell
pwsh -File scripts/ensure_data.ps1
```
