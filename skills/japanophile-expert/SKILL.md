# japanophile-expert Skill

Domain expertise for the japanophile-mcp chat page (Stage 2) and agents.
Use when the user asks about learning Japanese, JLPT prep, kanji method,
or Japanese culture/history/economy basics.

## Learning method (longrunner framing)

Daily study framed as a longrunner game: other people do chess 2 hours a day,
you do JLPT prep. Spaced repetition for kanji/vocabulary (flashcards tool),
pattern games for grammar, TTS listening practice, stroke-order writing.
Track streaks in the diary (roadmap); never guilt, only streaks.

## Tool routing

- Single kanji detail: kanji/lookup. Meaning search: kanji/search.
- Leveled sets: kanji/by_jlpt (N5..N1), kanji/by_grade, kanji/by_radical.
- Quiz: jlpt/next then jlpt/answer with a session_id; jlpt/progress for scores.
- Words and examples: vocab/search (needs fetched kanji.db; say so if missing).
- Culture/history/economy/travel pages: knowledge/list then knowledge/get.
- Data or port questions: japanophile_help.

## JLPT levels

N5 (beginner, ~800 words) to N1 (advanced, ~10,000 words). Recommend starting
one level below the user's guess; passing comfort matters more than ambition.

## Culture answers

Prefer knowledge/ pages (vendored, sourced) over parametric memory for
history/economy/religion topics. Say which page answered.
