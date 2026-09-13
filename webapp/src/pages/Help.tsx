import { PageTabs } from "@/components/PageTabs";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const TABS = [
	{ id: "start", label: "Start here" },
	{ id: "learn-japanese", label: "So you want to learn Japanese?" },
	{ id: "app", label: "Using the app" },
	{ id: "technical", label: "Technical" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-violet-400 underline decoration-violet-400/40 hover:text-violet-300"
		>
			{children}
		</a>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="mb-8 space-y-3">
			<h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
			<div className="space-y-2 text-sm leading-relaxed text-zinc-300">
				{children}
			</div>
		</section>
	);
}

export default function Help() {
	const [params, setParams] = useSearchParams();
	const initial = useMemo(() => {
		const t = params.get("tab") ?? "start";
		return TAB_IDS.has(t) ? (t as TabId) : "start";
	}, [params]);
	const [tab, setTab] = useState<TabId>(initial);

	useEffect(() => {
		setTab(initial);
	}, [initial]);

	const selectTab = (id: TabId) => {
		setTab(id);
		setParams({ tab: id }, { replace: true });
	};

	return (
		<div className="max-w-4xl" data-testid="help-page">
			<h2 className="mb-2 text-2xl font-bold">Help</h2>
			<p className="mb-4 text-sm text-zinc-400">
				From first steps to MCP ports — pick a tab. Planning a trip? See{" "}
				<Link to="/travel" className="text-violet-400 hover:underline">
					Travel
				</Link>
				.
			</p>

			<PageTabs
				tabs={[...TABS]}
				active={tab}
				onChange={(id) => selectTab(id as TabId)}
				testId="help-tabs"
			/>

			{tab === "start" && (
				<div data-testid="help-panel-start">
					<Section title="Welcome">
						<p>
							<b>japanophile-mcp</b> is your local study desk: kanji and JLPT
							drills, culture articles, travel planning links, and an optional
							AI chat tuned for Japanese learners.
						</p>
						<p>
							Nothing here replaces a good textbook or a teacher — it organizes
							tools and references so you spend less time hunting tabs.
						</p>
					</Section>
					<Section title="Suggested first hour">
						<ol className="list-decimal space-y-2 pl-5">
							<li>
								<Link
									to="/settings"
									className="text-violet-400 hover:underline"
								>
									Settings
								</Link>
								: pick Ollama or a cloud LLM if you want Chat.
							</li>
							<li>
								<Link to="/learn" className="text-violet-400 hover:underline">
									Learn
								</Link>
								: look up one kanji, try one JLPT question.
							</li>
							<li>
								<Link to="/games" className="text-violet-400 hover:underline">
									Games
								</Link>
								: flashcards or JLPT vocabulary for five minutes.
							</li>
							<li>
								<Link to="/know" className="text-violet-400 hover:underline">
									Know
								</Link>
								: skim one culture page that interests you.
							</li>
						</ol>
					</Section>
				</div>
			)}

			{tab === "learn-japanese" && (
				<div data-testid="help-panel-learn-japanese">
					<Section title="So you want to learn Japanese?">
						<p>
							Start with <b>why</b> you care — anime subtitles, living in Japan,
							work, family — because that picks your path (casual vs JLPT vs
							business).
						</p>
					</Section>
					<Section title="Realistic paths">
						<p>
							<b>Casual (6–12 months):</b> hiragana and katakana, core grammar
							(です／ます), 500–800 words, daily listening. Use{" "}
							<Link to="/games" className="text-violet-400 hover:underline">
								Flashcards
							</Link>{" "}
							and{" "}
							<Link
								to="/know?page=language"
								className="text-violet-400 hover:underline"
							>
								Know → language
							</Link>
							.
						</p>
						<p>
							<b>JLPT track:</b> pick a target level (many aim N5 → N4 → N3).
							Use{" "}
							<Link to="/learn" className="text-violet-400 hover:underline">
								Learn → Quiz
							</Link>
							,{" "}
							<Link
								to="/games?game=jlpt-practice-test.html"
								className="text-violet-400 hover:underline"
							>
								JLPT practice test
							</Link>
							, and the kanji wall in Games. Official exam info:{" "}
							<ExtLink href="https://www.jlpt.jp/e/">jlpt.jp</ExtLink>.
						</p>
						<p>
							<b>Immersion boost:</b> switch phone UI to Japanese, label your
							room in kanji, one episode per week with Japanese subs only.
						</p>
					</Section>
					<Section title="What this app does well">
						<ul className="list-disc space-y-1 pl-5">
							<li>Kanji lookup and spaced repetition games</li>
							<li>Culture context so grammar sticks (Know box)</li>
							<li>Chat with japanophile-expert skill when LLM is configured</li>
							<li>Travel and daily-life articles when you plan a trip</li>
						</ul>
					</Section>
					<Section title="What to add outside the app">
						<p>
							A graded textbook (Genki, Minna no Nihongo, Tobira…), a tutor or
							language exchange, and consistent daily time (20 minutes beats
							three hours once a week).
						</p>
					</Section>
				</div>
			)}

			{tab === "app" && (
				<div data-testid="help-panel-app">
					<Section title="Learn">
						Kanji dictionary (~13k seed entries), JLPT quiz with progress in{" "}
						<code className="rounded bg-zinc-800 px-1">data/</code>, vocab and
						examples when{" "}
						<code className="rounded bg-zinc-800 px-1">kanji.db</code> is
						present.
					</Section>
					<Section title="Know">
						Culture knowledge pages (history, food, anime, language…). Long-form
						HTML from the vendored knowledge box.
					</Section>
					<Section title="Travel">
						Planning hub: flights, housing, visas, insurance — plus the budget
						travel guide article.
					</Section>
					<Section title="Games">
						Vendored drills (kanji table, JLPT tests, flashcards…) served from
						the backend compat API on port 11193.
					</Section>
					<Section title="Chat">
						Backend LLM proxy with japanophile-expert system prompt. Configure
						provider and model in Settings; use Test on Ollama to verify
						llama-server, not just the tags API.
					</Section>
					<Section title="Diary · Skills · Tools · Apps">
						Diary is local notes; Skills shows the expert prompt; Tools runs MCP
						tools in the browser; Apps lists related fleet webapps.
					</Section>
				</div>
			)}

			{tab === "technical" && (
				<div data-testid="help-panel-technical">
					<Section title="Ports">
						Backend (API, games, know static):{" "}
						<code className="rounded bg-zinc-800 px-1">11193</code>. Frontend
						(Vite): <code className="rounded bg-zinc-800 px-1">11194</code>. Do
						not use 11191/11192 on this machine (Open WebUI / registry
						conflict).
					</Section>
					<Section title="Data files">
						<code className="rounded bg-zinc-800 px-1">data/kanji.db</code>,{" "}
						<code className="rounded bg-zinc-800 px-1">
							data/wakan_vocab.json
						</code>
						, seeds under{" "}
						<code className="rounded bg-zinc-800 px-1">data/seeds/</code>. Run{" "}
						<code className="rounded bg-zinc-800 px-1">just ensure-data</code>{" "}
						after clone. See{" "}
						<code className="rounded bg-zinc-800 px-1">data/README.md</code>.
					</Section>
					<Section title="MCP">
						Stdio MCP for Claude Desktop; HTTP bridge at{" "}
						<code className="rounded bg-zinc-800 px-1">/mcp</code> when enabled.
						Tool harness at <Link to="/tools">Tools</Link>. Activity in{" "}
						<Link to="/logs">Logs</Link>.
					</Section>
					<Section title="Maintainers">
						<code className="rounded bg-zinc-800 px-1">just check</code>,{" "}
						<code className="rounded bg-zinc-800 px-1">just mcpb-pack</code>,{" "}
						<code className="rounded bg-zinc-800 px-1">
							scripts/vendor_from_donor.ps1
						</code>{" "}
						for asset refresh.
					</Section>
				</div>
			)}
		</div>
	);
}
