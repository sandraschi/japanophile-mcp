import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Know() {
	const [pages, setPages] = useState<string[]>([]);
	const [current, setCurrent] = useState("");
	const [text, setText] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		api
			.knowledgeList()
			.then((r) => setPages((r.data as string[]) ?? []))
			.catch((e: Error) => setError(e.message));
	}, []);

	const open = async (p: string) => {
		setError("");
		try {
			const r = await api.knowledgeGet(p);
			if (!r.success) setError(r.message);
			else {
				setCurrent(p);
				setText(String(r.data));
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		}
	};

	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Know{" "}
				<span className="text-sm font-normal text-zinc-500">
					culture knowledge box
				</span>
			</h2>
			{error && <p className="text-red-400">{error}</p>}
			<div className="flex gap-6">
				<ul data-testid="know-list" className="w-52 shrink-0 space-y-1">
					{pages.map((p) => (
						<li key={p}>
							<button
								type="button"
								data-testid={`know-${p}`}
								onClick={() => open(p)}
								className={`w-full rounded px-3 py-1.5 text-left text-sm ${current === p ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}
							>
								{p}
							</button>
						</li>
					))}
				</ul>
				<article
					data-testid="know-article"
					className="max-w-3xl flex-1 whitespace-pre-wrap text-sm leading-relaxed"
				>
					{current ? (
						<>
							<h3 className="mb-2 text-lg font-bold">{current}</h3>
							{text}
						</>
					) : (
						<p className="text-zinc-500">Pick a page.</p>
					)}
				</article>
			</div>
		</div>
	);
}
