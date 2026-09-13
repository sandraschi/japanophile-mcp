import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { KnowledgeArticleView } from "@/components/KnowledgeArticleView";

/** Human-ish label for sidebar (manga, 20thcentury, …). */
export function pageLabel(stem: string): string {
	if (stem === "20thcentury") return "20th century";
	if (stem === "travel") return "Travel guide";
	return stem.replace(/([a-z])([0-9])/g, "$1 $2").replace(/-/g, " ");
}

export default function Know() {
	const [searchParams] = useSearchParams();
	const [pages, setPages] = useState<string[]>([]);
	const [current, setCurrent] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		api
			.knowledgeList()
			.then((r) => setPages((r.data as string[]) ?? []))
			.catch((e: Error) => setError(e.message));
	}, []);

	useEffect(() => {
		const q = searchParams.get("page")?.trim();
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
				</Link>{" "}
				(same <code className="text-zinc-400">travel.html</code> article).
			</p>
			{error && <p className="text-red-400">{error}</p>}
			<div className="flex gap-6">
				<ul data-testid="know-list" className="w-52 shrink-0 space-y-1">
					{pages.map((p) => (
						<li key={p}>
							<button
								type="button"
								data-testid={`know-${p}`}
								onClick={() => setCurrent(p)}
								className={`w-full rounded px-3 py-1.5 text-left text-sm ${current === p ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
							>
								{pageLabel(p)}
							</button>
						</li>
					))}
				</ul>
				<div className="min-h-[70vh] flex-1" data-testid="know-article">
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
