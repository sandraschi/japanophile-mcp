import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Dashboard() {
	const [status, setStatus] = useState<Record<string, string> | null>(null);
	const [pages, setPages] = useState(0);
	const [error, setError] = useState("");

	useEffect(() => {
		api
			.help()
			.then((r) => {
				const d = r.data as {
					data: Record<string, string>;
					knowledge_pages: number;
				};
				setStatus(d.data);
				setPages(d.knowledge_pages);
			})
			.catch((e: Error) => setError(e.message));
	}, []);

	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold" data-testid="dashboard-hero">
				Your Japanophile workstation
			</h2>
			{error && (
				<p className="text-red-400" data-testid="backend-error">
					Backend unreachable: {error}
				</p>
			)}
			<div
				className="grid grid-cols-1 gap-4 md:grid-cols-3"
				data-testid="kpi-grid"
			>
				<div className="rounded border border-zinc-800 p-4">
					<div className="text-sm text-zinc-500">Kanji seed</div>
					<div className="text-lg" data-testid="kpi-kanji">
						{status ? "13,108 kanji" : "…"}
					</div>
				</div>
				<div className="rounded border border-zinc-800 p-4">
					<div className="text-sm text-zinc-500">JLPT questions</div>
					<div className="text-lg" data-testid="kpi-jlpt">
						{status ? "600 + options" : "…"}
					</div>
				</div>
				<div className="rounded border border-zinc-800 p-4">
					<div className="text-sm text-zinc-500">Knowledge pages</div>
					<div className="text-lg" data-testid="kpi-know">
						{pages || "…"}
					</div>
				</div>
			</div>
			<div
				className="mt-6 rounded border border-zinc-800 p-4"
				data-testid="data-status"
			>
				<h3 className="mb-2 font-semibold">Data status</h3>
				{status ? (
					<ul className="text-sm">
						{Object.entries(status).map(([k, v]) => (
							<li key={k}>
								<span className="text-zinc-500">{k}:</span>{" "}
								{String(v).includes("MISSING") ? (
									<span className="text-amber-400">{v}</span>
								) : (
									<span className="text-emerald-400">ready</span>
								)}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-zinc-500">Loading…</p>
				)}
			</div>
		</div>
	);
}
