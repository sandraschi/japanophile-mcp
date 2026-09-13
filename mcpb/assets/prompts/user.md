# japanophile-mcp — User Prompt (task cookbook)

How to get things done with the Japanophile workstation. Every task names the
tools and the call order. Start any session with `japanophile_help` to confirm
data presence - big-DB tasks need kanji.db fetched.

## A. First contact (5 minutes)

1. "Am I set up?" Call `japanophile_help`. Read the data map: seeds ready,
   kanji.db present or fetch hint, knowledge page count (expect 30).
2. "Show me water." `kanji/lookup` query 水. Read onyomi, kunyomi, meanings,
   JLPT, grade, strokes in one screen.
3. "What do you know about?" `knowledge/list`. Open `manga` and
   `2026-snapshot` via `knowledge/get` to see the box's range.
4. "Quiz me once." `jlpt/next` level N5, answer with `jlpt/answer`
   (session_id like `tryout`), check `jlpt/progress`.

## B. Daily longrunner (the core loop)

Other people do chess two hours a day; you do JLPT prep. Same session_id all
day (e.g. `2026-09-13`), new one tomorrow - streaks emerge from progress rows.

1. Warm-up draw: `kanji/random` limit 5, say each meaning aloud before reading
   the row. Star any miss for the evening list.
2. Leveled set: `kanji/by_jlpt` your level minus one (comfort first), limit 20.
   Read frequency order as priority order - top of the list deserves most attention.
3. Quiz block: `jlpt/next` ten times, answering each via `jlpt/answer` with
   response_time_ms honest (it feeds future pacing analysis). Explanations come
   back per option - read the wrong ones, they teach more.
4. Score check: `jlpt/progress`. Below 70%: drop a level tomorrow. Above 90%
   twice running: move up.
5. Words: `vocab/search` for every word you missed today (needs kanji.db;
   fetch once via scripts/fetch_data.ps1 and never think about it again).
6. Culture dessert: one `knowledge/get` page per day, top to bottom of the
   list. Thirty pages, one month, a whole country.

## C. Kanji deep dives

- "Everything about 海": `kanji/lookup` 海, then `kanji/by_radical` radical 氵,
  then `vocab/search` query 海 for compounds with readings. Three calls, full
  family.
- "N5 in frequency order": `kanji/by_jlpt` N5 limit 50, paginate by re-drawing
  (no offsets - random + level draws cover the set over days).
- "School order": `by_grade` 1 then 2 - classroom sequence for kids' homework help.
- "Water universe": `by_radical` 水, then open the kanji-3d-visualizer game tab
  (Games page) for the spatial view of the same family.
- Missing data: empty radical/categories results mean sparse seed fields. Note
  it, move on - never let the model invent readings. Invented onyomi is the
  cardinal sin of this workstation.

## D. Quiz mastery

- Mixed drills: `jlpt/next` per level in rotation N5→N4→N3; record all under
  one session_id; `progress` is the scoreboard.
- Fallback awareness: when a question arrives without a key, the answer still
  records and explanations attach - grade manually from the explanation and
  note it in the diary (roadmap).
- Test sets: the vendored practice-test game supports test_set 1..12 via the
  compat `/api/jlpt/questions` shape - full mock exams, submit via
  `/api/jlpt/submit-answers`, batch-graded into the same progress store.
- Honesty: response_time_ms is self-reported; games use it for pacing display
  only, never for grading.

## E. Culture questions (with citations)

- "Why is the yen cheap and who likes it?": `knowledge/get` 2026-snapshot
  (money section) + economy page. Answer: tourists and exporters love it,
  households pay import prices. Cite both pages.
- "Is Japan drifting right?": 2026-snapshot politics section: Takaichi's
  supermajority, Article 9 debate with counter-protests, assessment included.
  Quote the snapshot, add the six-month rule: re-check quarterly.
- "What should I read?": knowledge/list filtered by interest (manga, cuisine,
  religion, history, timeline), one page per answer, always name the page.
- "Plan 5 days in Kansai": travel page + geography + maand... combine travel, geography, cuisine, and rail notes (rural lines dying -
  bus/car verification).
  Full planner tools are roadmap; today the agent composes from pages.
- Propaganda requests: decline briefly per the editorial line, offer the
  sourced page instead. No exceptions, any direction.

## F. Games page flows (vendored tools, live backend)

- Flashcards: JLPT filter loads 200 vocab cards (or the built-in sample set
  when kanji.db is absent - the page says which). Keyboard: space flips,
  arrows grade. Scores stay in-page; promotion to progress.db is roadmap.
- Kanji master: level sets come from `/api/kanji/search` (100 per level),
  compounds lazy-load from jmdict (needs big DB; "none available" otherwise).
- Practice test: 10-question pages from `/api/jlpt/questions`, batch submit,
  explanations per option in results. Fallback question bank built in.
- Vocabulary lab: per-level lists from `/api/vocab/jlpt` (needs big DB) with
  Tatoeba examples lazy-loaded per word.
- 3D cosmos: 500-kanji universe from `/api/kanji/all`, category orbits
  (water/fire/earth/wind/emotion), sample universe offline.
- Listening/grammar/stroke/table: static tools, no backend needed.

## G. Agent and IDE integration

- Claude Desktop / Cursor / opencode: stdio via `uv run python -m
  japanophile_mcp.server` (see README snippet). Five tools, dialogic returns.
- Tutoring loops: an agent can run the whole daily longrunner (section B)
  unattended - draw, quiz, grade, summarize misses, propose tomorrow's level.
- Gap analysis ("what does the popular qcad-style competitor have?"): pair
  with git discovery + quality-check; MIT repos are fair game with attribution.
- Voice: route through speech-mcp ("quiz me on N4 food words while I cook");
  this server answers, speech talks.
- Videos: demo-vid-mcp narrates this repo's walkthroughs from the live webapp.

## H. Troubleshooting tasks

- "vocab says fetch hint": run scripts/fetch_data.ps1 (needs the games
  checkout) or accept seed-only mode - everything else works.
- "quiz recorded but not graded": seed lacks the key for that id; read the
  attached explanations, grade manually.
- "kanji lookup empty": rare variant or extension-B char; try search by
  meaning, then the big-DB jmdict via vocab.
- "knowledge page unknown": list first - stems are slugified (e.g.
  japanese-knowledge-tree).
- "backend unreachable": start.ps1 for humans; the winapp spawns its own
  sidecar; `uv run python -m japanophile_mcp.http --port 11193` by hand.
- "port in use": 11193/11194 are registered; 11191/11192 belong to an
  open-webui Docker container on the home box - never assign those.

## I. Level study plans (N5 through N1)

- **N5 (months 1-3):** `by_jlpt` N5 sets of 20, daily; quiz block of 10 with
  session `n5-<date>`; flashcards recognition mode; one cuisine or kombini
  knowledge page per week for morale. Pass mark comfort: 90% twice running.
- **N4 (months 4-6):** N4 sets; grammar game tab twice weekly (the vendored
  grammar tool drills patterns the quiz engine lacks); listening tab with TTS;
  first manga attempts (Doraemon-grade, knowledge/manga page for context).
- **N3 (months 7-12):** the bridge. N3 sets are the largest jump; split into
  frequency halves. Vocabulary lab with Tatoeba examples per word (needs big
  DB - fetch it now if not done). Read one short news article weekly,
  dictionary in hand (`vocab/search` per unknown word, log them).
- **N2 (year 2):** business/news vocabulary via `vocab/by_jlpt` N2; kanji
  random draws across N2+N1 for breadth; knowledge/history + modern + economy
  pages as reading practice (they are written for learners, roughly N3-N2).
- **N1 (year 2-3):** literature + religion + personages pages; jmdict deep
  compounds per kanji via the master game's compound view; write summaries in
  Japanese in the diary (roadmap) and have the chat page correct them.

## J. Ten worked culture answers (cite the page every time)

1. "Tea ceremony in one paragraph?" knowledge/get culture + dailylife.
2. "Why do trains apologize?" dailylife + education (social norms sections).
3. "Shinkansen vs rural lines?" geography + travel + the Rumoi closure note
   in 2026-snapshot.
4. "What is Sanseito and should I care?" 2026-snapshot politics + modern;
   six-month rule attached.
5. "Cheap yen for my trip?" 2026-snapshot money + travel; both halves.
6. "Manga vs anime industry size?" manga page + kanji-suite cultural note.
7. "Best first novel in Japanese?" literature page + N3 reading plan above.
8. "Onsen etiquette?" dailylife + religion (purification roots).
9. "Emperor's role today?" emperors page + modern; factual, neutral.
10. "What did I miss this month?" 2026-snapshot re-read + aiwatcher Japan
    surge profile; snapshot refresh is quarterly.

## K. Travel builds (composed today, tooled tomorrow)

- Tokyo 3 days: emperors (palace grounds) + modern + cuisine pages; transit
  notes from travel; kombini page as survival guide.
- Kyoto 2 days: history + temples via religion + literature (Heian); rent a
  bicycle note from dailylife.
- Osaka + food: cuisine deep dive + economy (merchant culture) + nightlife
  safety notes from problems page (read it, it is honest).
- Rural week: geography + travel + the rural-rail warning; verify bus lines
  the week before; diary the journey (roadmap tool will want daily entries).
- Festival timing: check modern + 2026-snapshot events (Asian Games Aichi
  Sept-Oct 2026), then festival pages; book around, not through.

## L. Agent recipes (copy-paste prompts)

- Tutor loop: "Using japanophile-mcp, run my daily longrunner: 5 random
  kanji, 20 N4 by frequency, 10 quiz questions, score me, list misses,
  propose tomorrow's level. Session <date>."
- Gap analysis: "Compare our kanji tools against <repo>: list ops they have
  that japanophile_help lacks, with file pointers for porting."
- Voice drill: via speech-mcp: "Ask me N4 food words; I answer aloud;
  transcribe, grade against vocab/search, keep score."
- Video tour: via demo-vid-mcp: "Narrate the Learn page flow: lookup, quiz,
  score, from the live webapp."
- Morning Japan brief: "Pull the aiwatcher Japan surge, summarize top 3,
  append to the diary (roadmap), speak the headlines via speech-mcp."

## M. Thirty-day starter (N5 from zero)

Days 1-3: hiragana/katakana via the Games flashcards tab; `kanji/lookup` for
each kana's example kanji ( あ → 安, ア → 阿 ). No quiz yet.
Days 4-7: `by_jlpt` N5 limit 10 daily, read aloud; first `jlpt/next` attempts,
session `starter`; cuisine + kombini knowledge pages for morale.
Days 8-14: N5 sets of 20; quiz block of 5 daily; grammar game tab twice;
first manga page (Doraemon-grade vocabulary is N5-heavy).
Days 15-21: add vocab/search for every miss (fetch kanji.db this week);
stroke-order game for the 20 most-missed kanji; dailylife knowledge page.
Days 22-30: full 10-question quiz blocks; `progress` must show 70%+ twice
before month end; travel page skim as reward reading; plan month 2 (N5
consolidation or N4 entry per scores, never per calendar).

Rules throughout: one session_id per day; misses get looked up the same day;
streaks over hours (20 focused minutes beats 2 guilty ones); the diary
(roadmap) gets one line per day starting now, even on paper.

## N. Exam-day checklist and score reading

Week before: two full mock exams via the practice-test game (test_set 1, 2),
batch submit, read every explanation including the ones you got right.
Night before: no new kanji; re-read your miss list; sleep.
`progress` interpretation: 90%+ twice running means move up a level; 70-90%
means consolidate; below 70% means drop a level with zero shame. Scores are
pacing instruments, not verdicts. A falling week after a level-up is normal
(calibration, not failure); two falling weeks means the level was premature.

## O. Contributor walkthroughs (step by step)

Adding a knowledge page: write plain sourced HTML as
assets/knowledge/japan/<slug>.html (h1 title, dated-snapshot banner if
time-sensitive, sources list at the bottom); verify via knowledge/get;
list it in docs; quiz yourself from it once. No build step, no review queue -
small PRs welcome.

Adding quiz items: match the seed schema (questions row + 4 question_options
rows with per-option explanations); correct_answer where known - null-safe
grading covers the rest, but keys are better; run pytest before pushing.

Adding a culture (-phile #N): clone this repo's shape (tools + seeds +
knowledge + skill + compat pattern); swap the corpus; register ports BEFORE
allocating (read the registry, never guess); write the PHILE-pattern page;
publish the bundle with real prompts (3-4-100 is the floor, not the goal).
sinophile-mcp is the reference next build.

Taste and truth: agents scaffold, humans verify. Readings are never guessed.
History claims carry sources. Travel facts get re-checked quarterly. Taste
is a human job description.

## P. Rapid Q&A bank (forty answers, one tool each)

Greetings and basics: "good morning" → vocab/search おはよう. "thank you
levels" → vocab ありがとう (casual vs ございます). "excuse me uses" →
vocab すみません (apology vs attention). "yes/no nuances" → はい vs ええ
vs うん via vocab. "counting people" → kanji lookup 人 + vocab ひとり,
ふたり (the irregular pair that breaks the pattern).
Food: "water" → kanji 水 + vocab みず/お水 (polite prefix). "rice/meal" →
vocab ご飯 (the meal-word that means cooked rice). "drink" → vocab 飲む
+ kanji 飲. "expensive/cheap" → vocab 高い/安い (the i-adjective pair).
"delicious variants" → vocab おいしい + knowledge/cuisine.
Time: "today/tomorrow" → vocab 今日/明日 (readings break the rules -
tomorrow is あした usually, あす formally). "day/sun" → kanji 日 (ニチ,
ジツ, ひ, か - the four-reading monster). "month/moon" → kanji 月. "year" →
kanji 年 (ネン, とし). "time/hour" → kanji 時 + vocab 時間.
School: "study" → vocab 勉強 (する-verb, takes を). "school" → vocab 学校
+ kanji 学. "teacher" → vocab 先生 (せんせい, never きょうし to their face).
"book" → kanji 本 (ホン, もと, and the counter book!). "language" → kanji 語.
Travel: "station" → vocab 駅. "train" → vocab 電車 + kanji 電. "ticket" →
vocab 切符 (きっぷ, rendaku included). "how much" → vocab いくら + grammar
game (question patterns). "where is X" → grammar game (どこ patterns) +
vocab どこ. "bathroom" → vocab トイレ/お手洗い (polite matters).
Nature: "mountain" → kanji 山. "river" → kanji 川 + vocab かわ. "flower" →
kanji 花 + vocab はな. "rain" → kanji 雨 + vocab あめ. "snow" → vocab 雪
+ knowledge/geography (snow country). "sea" → kanji 海 + vocab うみ.
People: "person" → kanji 人. "friend" → vocab 友達. "family" → vocab 家族
+ knowledge/dailylife (household structure). "I/me" → vocab 私 (わたし
casual-formal, わたくし humble). "Japan" → kanji 日本 (にほん vs にっぽん -
both correct, pick one).
Each answer: tool call first, reading aloud second, one example sentence
third (vocab/search examples or Tatoeba via the lab). Forty answers is N5
survival - the whole trip runs on these.

## Q. Session templates (copy-paste openers)

- Self-study: "japanophile session <date>: 5 random kanji, N4 set of 20,
  10 quiz, score me."
- Tutor mode (agent runs it): "You are my 日本語 tutor. Use japanophile-mcp
  tools only: drill me 15 minutes, adapt difficulty to my miss rate, end with
  a score and tomorrow's level. Session <date>."
- Culture evening: "One knowledge page (next unread), three quiz questions
  from its vocabulary, one travel note for the future trip file."
- Exam sim: "Mock exam: 10 questions via the practice-test game, batch
  submit, full explanations, score with 70/90 thresholds."
- Voice mode: "Through speech-mcp: ask, I answer aloud, grade via tools,
  keep score, no screen."

## R. The three ladders (reading, listening, writing)

Reading ladder, bottom to top: (1) quiz option sentences (short, graded);
(2) flashcard examples (one line each); (3) Tatoeba examples via the vocab
lab (real sentences, mixed difficulty); (4) manga pages with furigana
(Doraemon, Chi's Sweet Home); (5) knowledge/* pages (learner-written,
N3-N2); (6) NHK Easy News with `vocab/search` per unknown; (7) real novels
(Kawakami Hiromi short stories first). Climb one rung per month. Look up
with tools, never guess; log unknowns into the diary word list (roadmap).

Listening ladder: (1) listening game tab with browser TTS, slowed; (2) same
at full speed; (3) speech-mcp spoken quizzes (no screen); (4) anime with
Japanese subtitles (context carries you); (5) anime without subtitles;
(6) news podcasts at 1x. Shadowing counts double: repeat aloud, same breath.

Writing ladder: (1) stroke-order game for your 50 most-missed kanji; (2) copy
example sentences by hand (muscle memory is real); (3) diary one line daily
(Japanese only, mistakes allowed); (4) chat page corrects yesterday's entry
(feed it as context); (5) summaries of knowledge pages in Japanese. The chat
correction loop is the ladder's engine - use it weekly from month 2.

## S. Year plan, month by month (N5 to N3 in twelve)

1: kana + first 50 kanji by frequency; cuisine/kombini pages. 2: N5 sets of
20; quiz 5/day; session streak starts. 3: N5 complete; first mock exam;
travel page reward reading. 4: N4 entry; grammar tab twice weekly; manga
attempts. 5: N4 sets; listening tab; fetch kanji.db (vocab unlocks). 6: N4
mock exams; 70% gate to proceed. 7: N3 entry (split frequency halves);
Tatoeba examples per word; first news article. 8: N3 sets; dailylife +
religion pages as reading. 9: N3 quiz blocks of 10; diary Japanese-only
trial week. 10: N3 mocks; history + economy pages. 11: weak-half repeat
(progress data picks the half, not feelings). 12: N3 exam or N2 entry
decision by scores (90% twice = advance). Miss a month? Repeat it. The
plan is a ladder, not a calendar.

## T. Plateau clinic (named problems, prescribed fixes)

- "Kanji soup" (all look alike): radical families via by_radical for the
  confused set + stroke-order game for ten of them. Soup needs structure.
- "Quiz high, conversation zero": output famine. Shadowing daily + diary
  aloud + voice quizzes. Input without output rusts.
- "N3 wall" (scores flat for weeks): split the set in halves by frequency;
  drill the weak half only; re-read grammar patterns (the wall is usually
  grammar wearing a kanji costume).
- "Tutorial fatigue" (new tools, no progress): stop adding resources. One
  session_id, same loop, thirty days. Novelty is procrastination in a coat.
- "Burnout smell" (dread before sessions): halve the block, double the
  culture dessert (manga page, cuisine deep dive). Streaks survive on joy.

## U. Kids and homework (grade sets, not JLPT)

by_grade 1-6 maps to Japanese elementary years: homework help runs grade by
grade, not level by level. Stroke game for write-ups, flashcards for readings,
quiz engine for test prep (teachers test readings + meanings, exactly the
master game's modes). Keep sessions under 15 minutes; the streak matters
more than the block. Praise readings first (effort), meanings second.

## V. The trip playbook (before, during, after)

Before (8 weeks out): N5 survival set complete (forty answers, section P);
transit homework (travel + geography pages; JR pass math: 7-day pass pays off
at roughly Tokyo-Kyoto round trip); bookings via the travel notes; learn
すみません/お願いします/いくらですか cold - the three phrases that unlock
everything. Read problems page once (honest risks, no fear).
Before (1 week): kombini survival (kombini page: onigiri codes, ATM hours,
trash rules); cash strategy (cards accepted widely now, cash still king
rural); download offline maps + theQuiz app data; diary opens with the packing
list.
During, daily: morning `kanji/random` 5 over coffee; photograph every sign
you can read (streak fuel); evening diary line + 3 new words via vocab;
ask one real question per day (kombini staff are patient tutors); weekly
knowledge page tied to where you are (temples week = religion page).
After: diary becomes the trip report (share it - long-tail contributors are
born this way); missed-words list becomes month 1 of the next level; photos
of signs become flashcards (reading practice with memories attached); write
the travel page corrections you earned (contributors welcome, see below).
The trip is not a break from the longrunner - it is the boss level.

## W. Classroom deployment (thirty machines, zero cloud)

The winapp installs silently (`setup.exe /S`), runs the sidecar locally, and
phones nothing home - the privacy story schools actually need. Per machine:
install, fetch nothing (seeds suffice for grades 1-6 work), open the Learn
tab. Teacher flow: `by_grade` sets per school year on the projector; quiz
competitions with one session_id per student (`class-3a-taro`) aggregated via
`progress` per session at week's end; flashcards on the big screen for group
rounds (space flips, class shouts readings). No accounts anywhere - sessions
are strings, progress is local SQLite, GDPR surface is approximately a desk
drawer. Big-DB fetch on the teacher machine only (vocab extension for keen
students). Report cards: progress counts + accuracy trends, exported by hand
(copy the numbers - there is no cloud dashboard and that is the point).

## X. Reading your own progress data (SQL for nerds)

data/progress.db is SQLite; open it with any client. Schema: answers(id,
session_id, question_id, user_answer, is_correct, response_time_ms, ts).

Accuracy by session (the streak view):
SELECT session_id, COUNT(*) n, SUM(is_correct) ok,
ROUND(100.0*SUM(is_correct)/COUNT(*),1) pct FROM answers GROUP BY session_id
ORDER BY MIN(ts);

Response-time trend (speed is fluency forming):
SELECT session_id, ROUND(AVG(response_time_ms)) avg_ms FROM answers
GROUP BY session_id ORDER BY MIN(ts);

Weak questions (drill these): SELECT question_id, COUNT(*) tries,
SUM(is_correct) ok FROM answers GROUP BY question_id HAVING ok < tries
ORDER BY tries DESC LIMIT 20; then look each up and re-quiz.

Level estimate: join your sessions against jlpt_questions.db question levels
- sustained 85%+ at a level across 50+ attempts means the next level is due.
Plateau proof: same accuracy for 3+ sessions means change the input (new
game tab, new level, new modality), not the hours.

Back up progress.db before reinstalls (it lives beside user data, gitignored
by design). Copy it to a new machine and history travels with you.

## Y. Learner glossary (the words about the words)

Onyomi: Chinese-derived reading, katakana in dictionaries, compounds (水 スイ
in 水曜日). Kunyomi: native reading, hiragana, standalone words (水 みず).
Okurigana: kana endings that inflect (食べる たべる). Furigana: small reading
prints above kanji (manga has them, newspapers do not). Jouyou: 2,136
standard-use kanji (school + newspapers). Jinmeiyou: name-use extras.
Radical (部首): indexing component, sometimes the meaning hint, sometimes
decoration. Rendaku: sequential voicing inside compounds (切符 きっぷ - the き
voices to ぎ). Keigo: polite language ladder (plain, polite
ます, humble, honorific - use polite until invited otherwise). Counters:
shape-dependent number words (本 for long things, the kanji that also means
book - learn counters as vocabulary, not grammar). Pitch accent: the melody
of words (はし = bridge vs chopsticks); comprehension survives without it,
naturalness does not. Gairaigo: loanwords in katakana (often English
mangled beyond recognition - say them with Japanese phonetics or fail).
Wasei-eigo: fake English made in Japan (サラリーマン). Ateji: kanji used for
sound only (寿司). Kokuji: kanji made in Japan (畑). Yojijukugo: four-kanji
idioms (一期一会 - learn five, deploy sparingly, impress everyone).

## Z. After N1 (the streak never ends)

Passed N1 is a beginning: newspapers without a dictionary (six months of
daily articles, vocab tool for the residue), one novel per quarter (start
with the author you already love in translation), keigo drills before any
job using Japanese (the politeness ladder is a separate exam), dialect
tourism (Osaka-ben via comedy shows, Hakata-ben via travel - the standard
language is nowhere's mother tongue), teaching beginners (nothing exposes
gaps like explaining は vs が), and contributing back: your miss lists
become quiz items, your trip notes become knowledge pages, your streak
becomes somebody else's proof. The longrunner has no final boss - that is
why it is a longrunner.

## AA. Contributor tasks (long tail cultures welcome)

Acceptance bar for contributions: quiz items need four distinct options
(no two plausibly correct), exactly one key, and per-option explanations
that teach (why right AND why each wrong one is wrong). Knowledge pages need
named sources, a date line when time-sensitive, and no unsourced superlatives
("best", "oldest", "only" require citations). Code follows the repo gates
(ruff, format, pytest, pyright, Biome, tsc). Docs follow the fleet voice:
plain, sourced, dated, ASCII. First PRs should be small (one page, five
questions); reviewers check readings first, everything else second.
Contributed content is MIT like the repo; do not paste copyrighted textbook
items or commercial test banks - write originals. Translations: EN-first
pages get JP parallels on demand, machine draft plus human pass, never raw
machine output committed. Long-tail cultures inherit this whole cookbook:
swap the corpus, keep the discipline, translate the method before the words.
Start each new -phile with this file open beside the blank repo. The pattern
is the product; cultures are the content. Now open the repo and begin today.

- New knowledge page: add `assets/knowledge/japan/<slug>.html` (plain,
  sourced), list it in docs, quiz yourself via knowledge/get. No build step.
- New quiz items: append to the seed format (questions + 4 options +
  explanations); correct_answer where known, null-safe grading covers the rest.
- New culture (-phile #N): clone this repo's shape, swap seeds + knowledge +
  skill, register ports, write the PHILE-pattern page. sinophile-mcp is next.
- Taste and truth: agents scaffold, humans verify readings, history claims,
  and travel facts. Readings are never guessed. Ever.
