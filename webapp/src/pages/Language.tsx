import { LanguageArticleView } from "@/components/LanguageArticleView";
import { PageTabs } from "@/components/PageTabs";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../lib/api";

const DEFAULT_TAB = "overview";

type LangTab = { id: string; label: string };

export default function LanguagePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [tabs, setTabs] = useState<LangTab[]>([]);
	const [error, setError] = useState("");
	const tabIds = useMemo(() => new Set(tabs.map((t) => t.id)), [tabs]);

	const current = useMemo(() => {
		let q = searchParams.get("tab")?.trim() ?? DEFAULT_TAB;
		if (q === "jlpt") q = "exams";
		if (q === "textbooks") q = "materials";
		return tabIds.has(q) ? q : (tabs[0]?.id ?? DEFAULT_TAB);
	}, [searchParams, tabIds, tabs]);

	useEffect(() => {
		const raw = searchParams.get("tab")?.trim();
		if (raw === "jlpt" || raw === "textbooks") {
			const mapped = raw === "jlpt" ? "exams" : "materials";
			setSearchParams({ tab: mapped }, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	useEffect(() => {
		fetch(`${API_BASE}/api/language`)
			.then((r) => r.json())
			.then((body) => {
				const list = (body.data as LangTab[]) ?? [];
				setTabs(list);
			})
			.catch((e: Error) => setError(e.message));
	}, []);

	const selectTab = (id: string) => {
		setSearchParams({ tab: id }, { replace: true });
	};

	return (
		<div>
			<h2 className="mb-2 text-2xl font-bold">
				Language{" "}
				<span className="text-sm font-normal text-zinc-500">
					Japanese as a system — script, grammar, sound, study
				</span>
			</h2>
			<p className="mb-4 max-w-3xl text-sm text-zinc-400">
				Curriculum reference for learners. This is separate from{" "}
				<Link to="/know" className="text-violet-400 hover:underline">
					Knowledge
				</Link>{" "}
				(society, history, economy). Drill with{" "}
				<Link to="/games" className="text-violet-400 hover:underline">
					Practice
				</Link>{" "}
				games and agent tools on{" "}
				<Link to="/tools" className="text-violet-400 hover:underline">
					MCP Tools
				</Link>
				.
			</p>
			{tabs.length > 0 && (
				<PageTabs
					tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
					active={current}
					onChange={selectTab}
					testId="language-tabs"
				/>
			)}
			{error && <p className="mt-3 text-red-400">{error}</p>}
			<div className="mt-4" data-testid="language-article">
				{tabs.length === 0 && !error ? (
					<p className="text-zinc-500">Loading tabs…</p>
				) : (
					<LanguageArticleView tab={current} />
				)}
			</div>
		</div>
	);
}
