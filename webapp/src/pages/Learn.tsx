import { useEffect, useState } from "react";
import { type KanjiEntry, type QuizQuestion, api } from "../lib/api";
import {
	type JlptLevel,
	type UserPrefs,
	loadPrefsLocal,
	quizLevelsForStudy,
	resolvePrefs,
	subscribePrefs,
} from "../lib/prefs";

type Tab = "kanji" | "quiz" | "vocab";

export default function Learn() {
	const [tab, setTab] = useState<Tab>("kanji");
	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">Learn</h2>
			<div className="mb-4 flex gap-2" data-testid="learn-tabs">
				{(["kanji", "quiz", "vocab"] as Tab[]).map((t) => (
					<button
						type="button"
						key={t}
						data-testid={`tab-${t}`}
						onClick={() => setTab(t)}
						className={`rounded px-4 py-2 text-sm ${tab === t ? "bg-zinc-100 text-black" : "bg-zinc-800 text-zinc-300"}`}
					>
						{t}
					</button>
				))}
			</div>
			{tab === "kanji" && <KanjiPanel />}
			{tab === "quiz" && <QuizPanel />}
			{tab === "vocab" && <VocabPanel />}
		</div>
	);
}

function KanjiPanel() {
	const [q, setQ] = useState("水");
	const [rows, setRows] = useState<KanjiEntry[]>([]);
	const [msg, setMsg] = useState("");
	const run = async (
		op: string,
		extra: Record<string, string | number> = {},
	) => {
		setMsg("");
		try {
			const r = await api.kanji(op, { query: q, ...extra });
			if (!r.success) setMsg(r.message);
			setRows((r.data as KanjiEntry[]) ?? []);
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
		}
	};
	return (
		<div>
			<div className="mb-3 flex gap-2">
				<input
					data-testid="kanji-input"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
					placeholder="水 or water"
				/>
				<button
					type="button"
					data-testid="kanji-lookup"
					onClick={() => run("lookup")}
					className="rounded bg-zinc-100 px-4 py-2 text-sm text-black"
				>
					Lookup
				</button>
				<button
					type="button"
					data-testid="kanji-search"
					onClick={() => run("search")}
					className="rounded bg-zinc-800 px-4 py-2 text-sm"
				>
					Search
				</button>
				<button
					type="button"
					data-testid="kanji-random"
					onClick={() => run("random", { limit: 5 })}
					className="rounded bg-zinc-800 px-4 py-2 text-sm"
				>
					Random 5
				</button>
			</div>
			{msg && <p className="text-amber-400">{msg}</p>}
			<ul
				data-testid="kanji-results"
				className="grid grid-cols-1 gap-2 md:grid-cols-2"
			>
				{rows.map((k) => (
					<li key={k.kanji} className="rounded border border-zinc-800 p-3">
						<span className="text-3xl">{k.kanji}</span>
						<span className="ml-3 text-sm text-zinc-400">{k.meanings}</span>
						<div className="mt-1 text-xs text-zinc-500">
							on: {k.onyomi} · kun: {k.kunyomi} · {k.jlpt} · grade {k.grade} ·{" "}
							{k.strokes} strokes
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function QuizPanel() {
	const [prefs, setPrefs] = useState<UserPrefs>(() => loadPrefsLocal());
	const allowed = quizLevelsForStudy(prefs.default_jlpt_level);
	const [level, setLevel] = useState<JlptLevel>(prefs.default_jlpt_level);
	const [session, setSession] = useState(prefs.progress_session_id);
	const [question, setQuestion] = useState<QuizQuestion | null>(null);
	const [picked, setPicked] = useState<string | null>(null);
	const [verdict, setVerdict] = useState("");
	const [score, setScore] = useState<{
		answered: number;
		correct: number;
	} | null>(null);
	const [t0, setT0] = useState(0);

	useEffect(() => {
		resolvePrefs().then((p) => {
			setPrefs(p);
			setSession(p.progress_session_id);
			const levels = quizLevelsForStudy(p.default_jlpt_level);
			setLevel((cur) => (levels.includes(cur) ? cur : p.default_jlpt_level));
		});
		return subscribePrefs((p) => {
			setPrefs(p);
			setSession(p.progress_session_id);
			const levels = quizLevelsForStudy(p.default_jlpt_level);
			setLevel((cur) => (levels.includes(cur) ? cur : p.default_jlpt_level));
		});
	}, []);

	const next = async () => {
		setPicked(null);
		setVerdict("");
		const r = await api.jlptNext(level);
		if (r.success) {
			setQuestion(r.data as QuizQuestion);
			setT0(Date.now());
		}
	};
	const answer = async (letter: string) => {
		if (!question || picked) return;
		setPicked(letter);
		const r = await api.jlptAnswer({
			question_id: question.id,
			answer: letter,
			session_id: session,
			response_time_ms: Date.now() - t0,
		});
		const d = r.data as { is_correct: boolean; correct: string | null };
		setVerdict(
			d.correct == null
				? "Recorded (key: explanation shown)"
				: d.is_correct
					? "Correct"
					: `Not correct (key: ${d.correct})`,
		);
		const p = await api.jlptProgress(session);
		const s = p.data as { answered: number; correct: number };
		setScore({ answered: s.answered, correct: s.correct });
	};
	return (
		<div>
			<div className="mb-3 flex items-center gap-2">
				<select
					data-testid="quiz-level"
					value={level}
					onChange={(e) => setLevel(e.target.value as JlptLevel)}
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				>
					{allowed.map((l) => (
						<option key={l} value={l}>
							{l}
						</option>
					))}
				</select>
				<button
					type="button"
					data-testid="quiz-next"
					onClick={next}
					className="rounded bg-zinc-100 px-4 py-2 text-sm text-black"
				>
					Next question
				</button>
				{score && (
					<span data-testid="quiz-score" className="text-sm text-zinc-400">
						Score: {score.correct}/{score.answered}
					</span>
				)}
			</div>
			{question && (
				<div
					data-testid="quiz-card"
					className="rounded border border-zinc-800 p-4"
				>
					<p className="mb-3">{question.question_text}</p>
					<div className="grid gap-2">
						{question.options.map((o) => (
							<button
								type="button"
								key={o.option_letter}
								data-testid={`quiz-opt-${o.option_letter}`}
								onClick={() => answer(o.option_letter)}
								disabled={picked !== null}
								className={`rounded border px-3 py-2 text-left text-sm ${picked === o.option_letter ? "border-zinc-100" : "border-zinc-800 hover:border-zinc-600"}`}
							>
								<b>{o.option_letter}</b> · {o.option_text}
							</button>
						))}
					</div>
					{verdict && (
						<p data-testid="quiz-verdict" className="mt-3 text-emerald-400">
							{verdict}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

function VocabPanel() {
	const [q, setQ] = useState("water");
	const [msg, setMsg] = useState("");
	const [rows, setRows] = useState<
		{ expression: string; reading: string; translation: string }[]
	>([]);
	const run = async () => {
		setMsg("");
		try {
			const r = await api.vocab("search", { query: q, limit: 20 });
			if (!r.success) {
				setMsg(r.message);
				setRows([]);
				return;
			}
			const d = r.data as {
				vocabulary: {
					expression: string;
					reading: string;
					translation: string;
				}[];
			};
			setRows(d.vocabulary ?? []);
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
		}
	};
	return (
		<div>
			<div className="mb-3 flex gap-2">
				<input
					data-testid="vocab-input"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				/>
				<button
					type="button"
					data-testid="vocab-search"
					onClick={run}
					className="rounded bg-zinc-100 px-4 py-2 text-sm text-black"
				>
					Search
				</button>
			</div>
			{msg && (
				<p className="text-amber-400" data-testid="vocab-msg">
					{msg}
				</p>
			)}
			<ul data-testid="vocab-results" className="grid gap-2">
				{rows.map((v) => (
					<li
						key={`${v.expression}-${v.reading}`}
						className="rounded border border-zinc-800 p-2 text-sm"
					>
						<b>{v.expression}</b>{" "}
						<span className="text-zinc-400">{v.reading}</span> — {v.translation}
					</li>
				))}
			</ul>
		</div>
	);
}
