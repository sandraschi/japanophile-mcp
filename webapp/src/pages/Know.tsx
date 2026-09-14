import { KnowledgeArticleView } from "@/components/KnowledgeArticleView";
import { PageTabs } from "@/components/PageTabs";
import {
	KNOWLEDGE_CLUSTERS,
	type KnowledgeClusterId,
	pageLabel,
	pagesInCluster,
} from "@/lib/knowledgeClusters";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export { pageLabel } from "@/lib/knowledgeClusters";

const KNOW_TABS = KNOWLEDGE_CLUSTERS;

export default function KnowledgePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [pages, setPages] = useState<string[]>([]);
	const [current, setCurrent] = useState("");
	const [error, setError] = useState("");
	const [cluster, setCluster] = useState<KnowledgeClusterId>(() => {
		const t = searchParams.get("cluster") ?? "all";
		return KNOW_TABS.some((c) => c.id === t)
			? (t as KnowledgeClusterId)
			: "all";
	});

	const visiblePages = useMemo(
		() => pagesInCluster(pages, cluster),
		[pages, cluster],
	);

	const selectPage = (stem: string) => {
		setCurrent(stem);
		const next: Record<string, string> = { page: stem };
		if (cluster !== "all") next.cluster = cluster;
		setSearchParams(next, { replace: true });
	};

	const selectCluster = (id: KnowledgeClusterId) => {
		setCluster(id);
		const inCluster = pagesInCluster(pages, id);
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
		if (c && KNOW_TABS.some((t) => t.id === c)) {
			setCluster(c as KnowledgeClusterId);
		}
		if (q && pages.includes(q)) {
			setCurrent(q);
		}
	}, [searchParams, pages]);

	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Knowledge{" "}
				<span className="text-sm font-normal text-zinc-500">
					Japan in context — history, society, culture
				</span>
			</h2>
			<p className="mb-4 text-sm text-zinc-500">
				For the{" "}
				<Link to="/language" className="text-violet-400 hover:underline">
					Language
				</Link>{" "}
				curriculum (grammar, keigo, exams, materials), use the Language page. Travel:{" "}
				<Link to="/travel" className="text-violet-400 hover:underline">
					Travel
				</Link>
				. Drills:{" "}
				<Link to="/games" className="text-violet-400 hover:underline">
					Practice games
				</Link>
				.
			</p>
			<PageTabs
				tabs={[...KNOW_TABS]}
				active={cluster}
				onChange={(id) => selectCluster(id as KnowledgeClusterId)}
				testId="know-tabs"
			/>
			{error && <p className="text-red-400">{error}</p>}
			<div className="flex gap-6">
				<ul data-testid="know-list" className="w-56 shrink-0 space-y-1">
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
						<p className="text-zinc-500">Pick an article.</p>
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
