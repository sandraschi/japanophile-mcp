import { PageTabs } from "@/components/PageTabs";
import {
	CONTRIBUTORS,
	LICENSE_SUMMARY,
	PROJECT_LICENSE,
	REPO_CONTRIBUTORS_URL,
	REPO_LICENSE_URL,
	VENDORED_CREDIT,
} from "@/content/legal";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const TABS = [
	{ id: "start", label: "Start here" },
	{ id: "learn-japanese", label: "So you want to learn Japanese?" },
	{ id: "app", label: "Using the app" },
	{ id: "technical", label: "Technical" },
	{ id: "license", label: "License & contributors" },
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
							<b>japanophile-mcp</b> is your local study desk: kanji and exam
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
								<Link
									to="/language"
									className="text-violet-400 hover:underline"
								>
									Language
								</Link>
								: read one curriculum tab (writing, exams, keigo, methods).
							</li>
							<li>
								<Link to="/games" className="text-violet-400 hover:underline">
									Practice
								</Link>
								: flashcards or exam vocabulary for five minutes.
							</li>
							<li>
								<Link to="/know" className="text-violet-400 hover:underline">
									Knowledge
								</Link>
								: skim one article (history, daily life, economy…).
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
							work, family — because that picks your path (casual vs exam track vs
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
								to="/language?tab=writing"
								className="text-violet-400 hover:underline"
							>
								Language → writing
							</Link>
							.
						</p>
						<p>
							<b>Exam track (JLPT and others):</b> pick a target band (many aim
							N5 → N4 → N3). Use{" "}
							<Link to="/games" className="text-violet-400 hover:underline">
								Practice
							</Link>
							(exam mocks, flashcards), and the kanji wall. Curriculum:{" "}
							<Link
								to="/language?tab=exams"
								className="text-violet-400 hover:underline"
							>
								Language → Exams & benchmarks
							</Link>
							; keigo depth on{" "}
							<Link
								to="/language?tab=keigo"
								className="text-violet-400 hover:underline"
							>
								Keigo
							</Link>
							; books and exchange on{" "}
							<Link
								to="/language?tab=materials"
								className="text-violet-400 hover:underline"
							>
								Materials & exchange
							</Link>
							. Optional MCP demo quiz on{" "}
							<Link to="/learn" className="text-violet-400 hover:underline">
								Learn
							</Link>
							. Official exam info:{" "}
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
							<li>Culture context (Knowledge box) plus Language curriculum tabs</li>
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
					<Section title="Language">
						Curriculum reference (script, grammar, keigo, phonetics, materials,
						exams). Separate from society articles in Knowledge.
					</Section>
					<Section title="Learn (MCP demo)">
						Thin UI for kanji / exam quiz / vocab tools — use Practice for drills and
						MCP Tools for the full five portmanteaus.
					</Section>
					<Section title="Knowledge">
						Culture and society articles (history, economy, daily life, crime…).
						Cluster tabs filter the sidebar; HTML unchanged.
					</Section>
					<Section title="Travel">
						Planning hub: flights, housing, visas, insurance — plus the budget
						travel guide article. City guides:{" "}
						<Link
							to="/travel?tab=tokyo"
							className="text-violet-400 hover:underline"
						>
							Tokyo
						</Link>
						,{" "}
						<Link
							to="/travel?tab=kansai"
							className="text-violet-400 hover:underline"
						>
							Kyoto & Osaka
						</Link>
						.
					</Section>
					<Section title="Practice">
						Drills (kanji table, exam tests, flashcards…) on port 11193.
					</Section>
					<Section title="Chat">
						Backend LLM proxy with japanophile-expert system prompt. Configure
						provider and model in Settings; use Test on Ollama to verify
						llama-server, not just the tags API.
					</Section>
					<Section title="Diary · Skills · Tools · Apps">
						<p className="mb-4 text-sm text-zinc-500">
							Diary: travel log + Immich photos; Skills shows the expert prompt;
							Tools runs MCP tools in the browser; Apps lists related fleet
							webapps.
						</p>
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

			{tab === "license" && (
				<div data-testid="help-panel-license">
					<Section title={`${PROJECT_LICENSE} License`}>
						<p>{LICENSE_SUMMARY}</p>
						<p>
							Full text:{" "}
							<ExtLink href={REPO_LICENSE_URL}>LICENSE on GitHub</ExtLink> (or{" "}
							<code className="rounded bg-zinc-800 px-1">LICENSE</code> in the
							repo root).
						</p>
					</Section>
					<Section title="Contributors">
						<ul className="space-y-3">
							{CONTRIBUTORS.map((c) => (
								<li
									key={c.name}
									className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
								>
									{c.href ? (
										<ExtLink href={c.href}>{c.name}</ExtLink>
									) : (
										<span className="font-medium text-zinc-100">{c.name}</span>
									)}
									<p className="mt-1 text-xs text-zinc-400">{c.role}</p>
								</li>
							))}
						</ul>
						<p className="text-xs text-zinc-500">
							<ExtLink href={REPO_CONTRIBUTORS_URL}>CONTRIBUTORS.md</ExtLink> —
							PRs welcome; contributions are under MIT.
						</p>
					</Section>
					<Section title="Vendored assets">
						<p className="text-sm text-zinc-400">{VENDORED_CREDIT}</p>
					</Section>
				</div>
			)}
		</div>
	);
}
