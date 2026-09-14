import { PageLoading } from "@/components/PageLoading";
import { API_BASE } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

function stripBom(html: string): string {
	return html.charCodeAt(0) === 0xfeff ? html.slice(1) : html;
}

const MIN_FRAME_HEIGHT = 320;

type Props = {
	tab: string;
	testId?: string;
};

/** Renders one Language curriculum HTML tab (backend injects dark-theme CSS). */
export function LanguageArticleView({ tab, testId = "language-iframe" }: Props) {
	const [html, setHtml] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const fitFrameHeight = useCallback(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument;
			if (!doc) return;
			const root = doc.documentElement;
			const body = doc.body;
			const h = Math.max(
				root?.scrollHeight ?? 0,
				root?.offsetHeight ?? 0,
				body?.scrollHeight ?? 0,
				body?.offsetHeight ?? 0,
				MIN_FRAME_HEIGHT,
			);
			setFrameHeight(h);
		} catch {
			/* timing */
		}
	}, []);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError("");
		setFrameHeight(MIN_FRAME_HEIGHT);
		fetch(`${API_BASE}/api/language/html/${encodeURIComponent(tab)}`)
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
				if (!cancelled) setError(e.message);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [tab]);

	useEffect(() => {
		if (!html) return;
		const t = window.setTimeout(fitFrameHeight, 120);
		return () => window.clearTimeout(t);
	}, [html, fitFrameHeight]);

	if (loading) {
		return (
			<PageLoading variant="row" testId="language-loading" label="Loading…" />
		);
	}
	if (error) {
		return <p className="text-red-400">{error}</p>;
	}
	return (
		<iframe
			ref={iframeRef}
			data-testid={testId}
			title={tab}
			srcDoc={html}
			onLoad={fitFrameHeight}
			className="w-full rounded border border-zinc-800 bg-zinc-950"
			style={{ height: frameHeight }}
			sandbox="allow-same-origin"
		/>
	);
}
