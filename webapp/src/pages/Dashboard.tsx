import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { dataReady, formatCount } from "../lib/format";
import { loadPrefsLocal, resolvePrefs } from "../lib/prefs";

type HelpMetrics = {
	kanji_entries: number | null;
	jlpt_questions: number | null;
	knowledge_pages: number;
	vocabulary_rows: number | null;
	example_rows: number | null;
	jmdict_rows: number | null;
	mcp_tools: number;
};

type HelpPayload = {
	data: Record<string, string>;
	metrics: HelpMetrics;
	knowledge_pages: number;
	ports: { backend: number; frontend: number };
};

type QuizProgress = {
	answered: number;
	correct: number;
};

function StatusDot({ ok }: { ok: boolean }) {
	return (
		<span
			className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`}
			aria-hidden
		/>
	);
}

export default function Dashboard() {
	const [payload, setPayload] = useState<HelpPayload | null>(null);
	const [quiz, setQuiz] = useState<QuizProgress | null>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const prefs = await resolvePrefs().catch(() => loadPrefsLocal());
				const [helpRes, progRes] = await Promise.all([
					api.help(),
					api.jlptProgress(prefs.progress_session_id).catch(() => null),
				]);
				if (cancelled) return;
				const inner = helpRes.data as HelpPayload;
				setPayload(inner);
				if (progRes?.success && progRes.data) {
					setQuiz(progRes.data as QuizProgress);
				}
			} catch (e) {
				if (!cancelled) setError(e instanceof Error ? e.message : String(e));
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const m = payload?.metrics;
	const d = payload?.data;
	const corpusReady = dataReady(d?.["kanji.db"]);
	const seedsOk =
		dataReady(d?.["kanji_database.db"]) && dataReady(d?.["jlpt_questions.db"]);
	const stackOk = seedsOk && corpusReady && !error;

	const heroSummary = loading
		? "Loading fleet metrics…"
		: m
			? [
					m.kanji_entries != null && `${formatCount(m.kanji_entries)} kanji`,
					m.jlpt_questions != null &&
						`${formatCount(m.jlpt_questions)} JLPT items`,
					m.knowledge_pages > 0 &&
						`${formatCount(m.knowledge_pages)} culture pages`,
					corpusReady &&
						m.vocabulary_rows != null &&
						`${formatCount(m.vocabulary_rows)} vocab rows`,
				]
					.filter(Boolean)
					.join(" · ")
			: "Start the backend to see live counts.";

	return (
		<div className="max-w-5xl space-y-8">
			<header
				className="relative overflow-hidden rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950/40 px-6 py-8 sm:px-8"
				data-testid="dashboard-hero"
			>
				<div
					className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl"
					aria-hidden
				/>
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
					japanophile-mcp
				</p>
				<h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
					Your Japanophile workstation
				</h2>
				<p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
					Kanji and JLPT learning, culture knowledge, vocab search, and MCP
					tools for agents — one backend, dark web UI, optional Windows app.
				</p>
				<p
					className="mt-4 text-sm font-medium text-zinc-300 tabular-nums"
					data-testid="hero-summary"
				>
					{heroSummary}
				</p>
				<div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
					<span
						className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
							stackOk
								? "border-emerald-800/60 bg-emerald-950/40 text-emerald-200"
								: "border-amber-800/60 bg-amber-950/40 text-amber-200"
						}`}
						data-testid="hero-stack-badge"
					>
						<StatusDot ok={stackOk && !loading} />
						{loading
							? "Checking stack…"
							: stackOk
								? "Stack ready"
								: "Data incomplete"}
					</span>
					{quiz && quiz.answered > 0 ? (
						<span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1 text-zinc-400">
							Quiz progress: {quiz.correct}/{quiz.answered} correct
						</span>
					) : null}
				</div>
				<div
					className="mt-6 flex flex-wrap gap-2"
					data-testid="dashboard-actions"
				>
					<ActionLink to="/travel" label="Plan travel" />
					<ActionLink to="/learn" label="Learn kanji" />
					<ActionLink
						to="/games?game=japanese-flashcards.html"
						label="Learn kana"
					/>
					<ActionLink to="/games" label="Play drills" />
					<ActionLink to="/know" label="Explore culture" />
					<ActionLink to="/chat" label="Ask specialist" />
				</div>
			</header>

			{error && (
				<div
					className="rounded-lg border border-red-800/80 bg-red-950/40 px-4 py-3 text-sm text-red-200"
					data-testid="backend-error"
				>
					Backend unreachable: {error}. Start{" "}
					<code className="text-red-100">.\start.ps1</code> (API on 11193).
				</div>
			)}

			<div>
				<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
					At a glance
				</h3>
				<div
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
					data-testid="kpi-grid"
				>
					<KpiCard
						label="Kanji dictionary"
						testId="kpi-kanji"
						value={loading ? "…" : formatCount(m?.kanji_entries)}
						sub={
							dataReady(d?.["kanji_database.db"])
								? "Seed loaded · Learn lookup"
								: "Seed missing"
						}
						ok={dataReady(d?.["kanji_database.db"])}
					/>
					<KpiCard
						label="JLPT quiz bank"
						testId="kpi-jlpt"
						value={loading ? "…" : formatCount(m?.jlpt_questions)}
						sub={
							quiz && quiz.answered > 0
								? `Your session: ${quiz.correct}/${quiz.answered} correct`
								: "Multi-choice · Learn quiz tab"
						}
						ok={dataReady(d?.["jlpt_questions.db"])}
					/>
					<KpiCard
						label="Culture knowledge"
						testId="kpi-know"
						value={
							loading
								? "…"
								: formatCount(m?.knowledge_pages ?? payload?.knowledge_pages)
						}
						sub="HTML articles · Know browser"
						ok={(m?.knowledge_pages ?? 0) > 0}
					/>
					<KpiCard
						label="Vocab corpus"
						testId="kpi-corpus"
						value={
							loading
								? "…"
								: corpusReady
									? formatCount(m?.vocabulary_rows)
									: "Not loaded"
						}
						sub={
							corpusReady
								? `${formatCount(m?.example_rows)} examples · ${formatCount(m?.jmdict_rows)} jmdict`
								: "Restore data/kanji.db from git"
						}
						ok={corpusReady}
					/>
				</div>
			</div>

			<section
				className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4"
				data-testid="data-status"
			>
				<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
					Stack health
				</h3>
				{loading ? (
					<p className="text-sm text-zinc-500">Loading…</p>
				) : d ? (
					<ul className="grid gap-2 sm:grid-cols-2 text-sm">
						{Object.entries(d).map(([key, line]) => (
							<li
								key={key}
								className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2"
							>
								<StatusDot ok={dataReady(line)} />
								<span className="font-mono text-xs text-zinc-400">{key}</span>
								<span className="ml-auto text-zinc-200">
									{dataReady(line) ? "ready" : "missing"}
								</span>
							</li>
						))}
						<li className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 sm:col-span-2">
							<StatusDot ok />
							<span className="font-mono text-xs text-zinc-400">mcp_tools</span>
							<span className="ml-auto text-zinc-200">
								{m?.mcp_tools ?? 5} portmanteaus
							</span>
						</li>
					</ul>
				) : null}
				{payload?.ports && (
					<p className="mt-3 text-xs text-zinc-500">
						API {payload.ports.backend} · web UI {payload.ports.frontend}
					</p>
				)}
			</section>
		</div>
	);
}

function ActionLink({ to, label }: { to: string; label: string }) {
	return (
		<Link
			to={to}
			className="inline-flex items-center rounded-lg border border-violet-800/50 bg-violet-950/30 px-4 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-600/60 hover:bg-violet-900/40"
		>
			{label}
		</Link>
	);
}

function KpiCard({
	label,
	value,
	sub,
	ok,
	testId,
}: {
	label: string;
	value: string;
	sub: string;
	ok: boolean;
	testId: string;
}) {
	return (
		<div
			className="rounded-lg border border-zinc-700 bg-zinc-900 p-4"
			data-testid={testId}
		>
			<div className="mb-1 flex items-center gap-2">
				<StatusDot ok={ok} />
				<span className="text-sm font-medium text-zinc-400">{label}</span>
			</div>
			<div className="text-2xl font-semibold tabular-nums text-zinc-50">
				{value}
			</div>
			<p className="mt-1 text-xs leading-snug text-zinc-500">{sub}</p>
		</div>
	);
}
