import { KnowledgeArticleView } from "@/components/KnowledgeArticleView";
import { PageTabs } from "@/components/PageTabs";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

const KNOW_TABS = [
	{ id: "all", label: "All Topics" },
	{ id: "games", label: "Games & Gambling" },
] as const;

type KnowTabId = (typeof KNOW_TABS)[number]["id"];

const GAMES_CLUSTER = new Set(["games-gambling", "yakuza"]);

const PAGE_LABELS: Record<string, string> = {
	"2026-snapshot": "2026 Snapshot",
	"20thcentury": "20th Century",
	anime: "Anime",
	art: "Art",
	bakumatsu: "Bakumatsu",
	battles: "Battles",
	cuisine: "Cuisine",
	culture: "Culture",
	dailylife: "Daily Life",
	economy: "Economy",
	education: "Education",
	emperors: "Emperors",
	"games-gambling": "Games & Gambling",
	geography: "Geography",
	history: "History",
	kombini: "Kombini",
	language: "Language",
	literature: "Literature",
	manga: "Manga",
	modern: "Modern Japan",
	personages: "Personages",
	"police-justice": "Police & Justice",
	problems: "Societal Problems",
	religion: "Religion",
	"samurai-era": "Samurai Era",
	samurai: "Samurai",
	strengths: "Strengths",
	timeline: "Timeline",
	travel: "Travel Guide",
	yakuza: "Yakuza (Organized Crime)",
};

function titleCaseWords(raw: string): string {
	return raw
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

/** Human label for Know sidebar and article header. */
export function pageLabel(stem: string): string {
	if (PAGE_LABELS[stem]) return PAGE_LABELS[stem];
	const spaced = stem
		.replace(/([a-z])([0-9])/g, "$1 $2")
		.replace(/[-_]/g, " ");
	return titleCaseWords(spaced);
}

export default function Know() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [pages, setPages] = useState<string[]>([]);
	const [current, setCurrent] = useState("");
	const [error, setError] = useState("");
	const [cluster, setCluster] = useState<KnowTabId>(() => {
		const t = searchParams.get("cluster") ?? "all";
		return t === "games" ? "games" : "all";
	});

	const visiblePages = useMemo(() => {
		if (cluster === "games") {
			return pages.filter((p) => GAMES_CLUSTER.has(p));
		}
		return pages;
	}, [pages, cluster]);

	const selectPage = (stem: string) => {
		setCurrent(stem);
		const next: Record<string, string> = {};
		if (stem) next.page = stem;
		if (cluster !== "all") next.cluster = cluster;
		setSearchParams(next, { replace: true });
	};

	const selectCluster = (id: KnowTabId) => {
		setCluster(id);
		const inCluster =
			id === "games"
				? pages.filter((p) => GAMES_CLUSTER.has(p))
				: pages;
		const keep = current && inCluster.includes(current);
		const nextPage = keep ? current : (inCluster[0] ?? "");
		setCurrent(nextPage);
		const next: Record<string, string> = {};
		if (nextPage) next.page = nextPage;
		if (id !== "all") next.cluster = id;
		setSearchParams(next, { replace: true });
	};

	useEffect(() => {
		api
			.knowledgeList()
			.then((r) => setPages((r.data as string[]) ?? []))
			.catch((e: Error) => setError(e.message));
	}, []);

	useEffect(() => {
		const q = searchParams.get("page")?.trim();
		const c = searchParams.get("cluster");
		if (c === "games") setCluster("games");
		else if (c === "all" || !c) setCluster("all");
		if (q && pages.includes(q)) {
			setCurrent(q);
		}
	}, [searchParams, pages]);

	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Know{" "}
				<span className="text-sm font-normal text-zinc-500">
					culture knowledge box
				</span>
			</h2>
			<p className="mb-4 text-sm text-zinc-500">
				Plan travel:{" "}
				<Link to="/travel" className="text-blue-400 hover:underline">
					Travel page
				</Link>
				. JLPT drills:{" "}
				<Link to="/games" className="text-blue-400 hover:underline">
					Games menu
				</Link>{" "}
				(not Go/shogi engines).
			</p>
			<PageTabs
				tabs={[...KNOW_TABS]}
				active={cluster}
				onChange={(id) => selectCluster(id as KnowTabId)}
				testId="know-tabs"
			/>
			{error && <p className="text-red-400">{error}</p>}
			<div className="flex gap-6">
				<ul data-testid="know-list" className="w-52 shrink-0 space-y-1">
					{visiblePages.map((p) => (
						<li key={p}>
							<button
								type="button"
								data-testid={`know-${p}`}
								onClick={() => selectPage(p)}
								className={`w-full rounded px-3 py-1.5 text-left text-sm ${current === p ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
							>
								{pageLabel(p)}
							</button>
						</li>
					))}
				</ul>
				<div className="min-w-0 flex-1" data-testid="know-article">
					{!current ? (
						<p className="text-zinc-500">Pick a page.</p>
					) : (
						<>
							<p className="mb-2 text-sm text-zinc-400">{pageLabel(current)}</p>
							<KnowledgeArticleView page={current} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
