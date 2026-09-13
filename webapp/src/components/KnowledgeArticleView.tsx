import { useEffect, useState } from "react";
import { PageLoading } from "@/components/PageLoading";

function stripBom(html: string): string {
	return html.charCodeAt(0) === 0xfeff ? html.slice(1) : html;
}

type Props = {
	page: string;
	testId?: string;
};

/** Renders one vendored knowledge HTML page (backend injects dark-theme CSS). */
export function KnowledgeArticleView({ page, testId = "know-iframe" }: Props) {
	const [html, setHtml] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError("");
		fetch(`/api/knowledge/html/${encodeURIComponent(page)}`)
			.then(async (res) => {
				if (!res.ok) {
					const body = await res.text();
					throw new Error(body || `HTTP ${res.status}`);
				}
				return res.text();
			})
			.then((raw) => {
				if (!cancelled) setHtml(stripBom(raw));
			})
			.catch((e: Error) => {
				if (!cancelled) {
					setHtml("");
					setError(e.message);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [page]);

	if (loading) {
		return <PageLoading label="Loading page…" testId="know-loading" />;
	}
	if (error) {
		return <p className="text-red-400">{error}</p>;
	}
	if (!html) {
		return null;
	}
	return (
		<iframe
			title={page}
			srcDoc={html}
			sandbox=""
			className="h-[70vh] w-full rounded border border-zinc-700 bg-zinc-950"
			data-testid={testId}
		/>
	);
}
