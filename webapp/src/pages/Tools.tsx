import { PageLoading } from "@/components/PageLoading";
import { ToolsHarnessExplainer } from "@/components/tools-harness-explainer";
import { API_BASE } from "@/lib/api";
import {
	CATEGORY_ORDER,
	type ToolMeta,
	relatedPage,
	toolCategory,
} from "@/lib/tool-schema";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function normalizeTools(raw: unknown): ToolMeta[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((item) => {
		if (typeof item === "string") return { name: item, description: "" };
		return item as ToolMeta;
	});
}

export default function Tools() {
	const [tools, setTools] = useState<ToolMeta[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const fetchTools = async () => {
			try {
				const response = await fetch(`${API_BASE}/api/tools`);
				const data = await response.json();
				setTools(normalizeTools(data.tools));
			} catch (error) {
				console.error("Failed to fetch tools", error);
			} finally {
				setLoading(false);
			}
		};
		fetchTools();
	}, []);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return tools;
		return tools.filter((tool) => {
			const hay =
				`${tool.name} ${tool.description || ""} ${toolCategory(tool.name)}`.toLowerCase();
			return hay.includes(q);
		});
	}, [tools, search]);

	const groups = useMemo(() => {
		const map = new Map<string, ToolMeta[]>();
		for (const tool of filtered) {
			const cat = toolCategory(tool.name);
			const list = map.get(cat) || [];
			list.push(tool);
			map.set(cat, list);
		}
		const order = [...CATEGORY_ORDER];
		for (const key of map.keys()) {
			if (!order.includes(key)) order.push(key);
		}
		return order
			.filter((cat) => map.has(cat))
			.map((cat) => [cat, map.get(cat) || []] as const);
	}, [filtered]);

	return (
		<div className="space-y-6" data-testid="tools-page">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold">MCP Tools</h2>
					<p className="text-zinc-400 max-w-2xl text-sm">
						{loading
							? "Loading…"
							: `${filtered.length} of ${tools.length} tools`}{" "}
						— API playground for agents (same surface as Cursor / Claude Desktop).
					</p>
				</div>
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Filter tools…"
					className="max-w-sm rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
				/>
			</div>

			<ToolsHarnessExplainer variant="full" />

			{loading ? (
				<PageLoading
					variant="row"
					testId="tools-loading"
					label="Loading tool catalog…"
				/>
			) : (
				groups.map(([category, items]) => (
					<div key={category} className="space-y-3">
						<h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
							{category}
						</h3>
						<div
							className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
							data-testid="tools-list"
						>
							{items.map((tool) => {
								const href = `/tools/${encodeURIComponent(tool.name)}`;
								const related = relatedPage(tool.name);
								return (
									<div
										key={tool.name}
										className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 hover:bg-zinc-800/50"
									>
										<div className="mb-2 font-mono text-sm font-semibold break-all">
											{tool.name}
										</div>
										<p className="mb-3 min-h-[2.5rem] text-xs text-zinc-400">
											{(tool.description || "MCP tool").slice(0, 160)}
										</p>
										<div className="flex gap-2">
											<Link
												to={href}
												className="inline-flex flex-1 items-center justify-center rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
												data-testid={`tool-run-${tool.name}`}
											>
												Run tool
											</Link>
											{related ? (
												<Link
													to={related}
													className="inline-flex items-center justify-center rounded bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
												>
													Page
												</Link>
											) : null}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))
			)}

			{!loading && filtered.length === 0 && (
				<p className="text-center text-zinc-500 py-12">No tools match</p>
			)}
		</div>
	);
}
