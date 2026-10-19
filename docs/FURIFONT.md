# Furifont Evaluation

Date: 2026-10-18
Source: https://furifont.antfu.me / https://github.com/antfu/furifont
Status: evaluated, not yet integrated
Applies to: japanophile-mcp (canonical), learnbot-mcp (consumer)

## What it is

Furifont by Anthony Fu. A Japanese font that shows furigana by itself.
Plain text stays plain: no `<ruby>` markup, no JavaScript, no plugin.
Works anywhere custom fonts work.

```html
<p class="furifont">今日は日本語の勉強をします。</p>
<style>
.furifont {
  font-family: 'Furifont Sans';
  line-height: 1.7;
}
</style>
```

## How it works

Compiled from Source Han Sans JP / Source Han Serif JP. A build step
reads a dictionary of thousands of words and draws the furigana into
new glyphs. For each word the font holds a ligature: 今日 becomes one
glyph with きょう above it. Longer words win (日本語 before 日本).
A kanji with no clear reading stays bare.

Inspired by Mengshen-pinyin-font (pinyin in font for Chinese) and
Fira Code (OpenType ligatures).

## Variants (per release)

- Sans and Serif
- Hiragana and Romaji (Hepburn via `--script hepburn`)
- Regular as OpenType and WOFF2
- Variable font ExtraLight to Heavy (`Furifont Sans VF`) as TTF and WOFF2, furigana follows text weight
- Site also offers bookmarklet + userscript (`furifont.user.js`) with optional okurigana readings

Set `line-height` to 1.6 or more so furigana is not clipped.

## Dictionary / license

- Code: MIT
- Fonts: SIL OFL 1.1 (derived from Adobe Source Han Sans / Serif)
- Dictionary data and reading rules: CC BY-SA 4.0, from JMdict, JMnedict, KANJIDIC2 (EDRDG), JmdictFurigana, yomitan-jlpt-vocab, Tatoeba (CC BY 2.0 FR), Japan Post postal data, JR station names (Desktop Tetsu)

Bundling the WOFF2 is allowed under OFL. Ship attribution in the webapp Help page if we bundle.

## Hard limitation

Upstream warning, quoted verbatim:

> Furigana might be incorrect, due to the limits of fonts: a font sees one run of kanji at a time, not the sentence around it.

Consequences:

- Context-free longest-match only. Homographs and okurigana ambiguity will be wrong sometimes.
- Display layer only. Never use for quiz grading, SRS scheduling (`remember`), JLPT scoring, or dictionary lookup. Those stay on `kanji` / `vocab` / `jlpt` / `kana_convert` tools.
- Copy/paste, search, TTS, screen readers see the underlying plain kanji, not the rendered reading. That is good for data integrity, confusing if the user expects hiragana copy.
- Requires `line-height >= 1.6`. Check vertical rhythm and card layouts before enabling globally.

## Verdict for our repos

Useful for presentation, not for data.

Good fit:

- japanophile-mcp Learn / Know / Games pages, vendored HTML drills, 278k example sentences. One CSS class gives furigana without backend `<ruby>` generation.
- learnbot-mcp graded readers, `/japanese` page, Chat subtitles, Discord / Resonite / Overte / VRChat outputs where `<ruby>` HTML is impossible. Font trick shines exactly there.
- Free Hiragana/Romaji toggle via the shipped variants.

Not a fit:

- Anything that must be correct (quizzes, SRS, `remember` queue, grammar check).
- Anything that parses the reading back out (keep using JMdict-backed tools).

## Integration recipe (japanophile-mcp)

1. Download `Furifont Sans` Regular WOFF2 + `Furifont Sans VF` WOFF2 from the latest GitHub release. Commit under `webapp/public/fonts/` (self-host, no CDN).
2. Add CSS:
   ```css
   @font-face {
     font-family: 'Furifont Sans';
     src: url('/fonts/FurifontSans-Regular.woff2') format('woff2');
   }
   .furifont { font-family: 'Furifont Sans', sans-serif; line-height: 1.7; }
   ```
3. Add a per-page toggle (default off) on Learn, Know, Games. Label: `Reading aid - may be wrong`. Persist in Settings.
4. Add attribution + warning banner linking to https://github.com/antfu/furifont.
5. Do not route quiz answers or SRS through the rendered reading.

## Integration recipe (learnbot-mcp)

Same font files and CSS class. Priority surfaces:

- `/japanese` readers and lesson passages
- Chat transcripts (optional toggle)
- VR / Discord bridges where `<ruby>` cannot be injected

Keep `source_lang` / `target_lang` lesson logic and JMdict lookups unchanged.

## Future option: JLPT-graded builds

Upstream supports custom builds (Node 22.18+):

```bash
npx furifont dev
npx furifont build --base "Source Han Serif JP Bold" --script hepburn --family "My Furigana"
```

Settings live in `furifont.config.json` (defaults in `packages/core/src/defaults.ts`).
We could build N5-only / N4-only furigana fonts for progressive disclosure, matching our JLPT levels. Not started; evaluate after the base toggle ships.

## Links

- Demo: https://furifont.antfu.me
- Repo: https://github.com/antfu/furifont
- Design notes: https://github.com/antfu/furifont/blob/main/docs/design.md
- HN discussion (2026-10-15, 336 pts, 67 comments): https://news.ycombinator.com/item?id=50100994 - consensus matches our verdict: neat for learners/e-readers, context-free readings can't be trusted for grading
- Packages: `furifont` (CLI), `@furifont/core`, `@furifont/compiler`, `@furifont/dictionary`, `@furifont/helper-web`
