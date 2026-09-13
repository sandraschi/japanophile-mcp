import { PageLoading } from "@/components/PageLoading";
import { API_BASE } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

function stripBom(html: string): string {
	return html.charCodeAt(0) === 0xfeff ? html.slice(1) : html;
}

const MIN_FRAME_HEIGHT = 320;

type Props = {
	page: string;
	testId?: string;
};

/** Renders one vendored knowledge HTML page (backend injects dark-theme CSS). */
export function KnowledgeArticleView({ page, testId = "know-iframe" }: Props) {
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
			/* sandbox / timing */
		}
	}, []);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError("");
		setFrameHeight(MIN_FRAME_HEIGHT);
		fetch(`${API_BASE}/api/knowledge/html/${encodeURIComponent(page)}`)
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

	useEffect(() => {
		if (!html) return;
		const iframe = iframeRef.current;
		if (!iframe) return;

		const onLoad = () => {
			fitFrameHeight();
			window.setTimeout(fitFrameHeight, 50);
			window.setTimeout(fitFrameHeight, 300);
		};
		iframe.addEventListener("load", onLoad);
		onLoad();

		let ro: ResizeObserver | undefined;
		try {
			const doc = iframe.contentDocument;
			if (doc?.body && typeof ResizeObserver !== "undefined") {
				ro = new ResizeObserver(() => fitFrameHeight());
				ro.observe(doc.body);
			}
		} catch {
			/* ignore */
		}

		return () => {
			iframe.removeEventListener("load", onLoad);
			ro?.disconnect();
		};
	}, [html, fitFrameHeight]);

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
			ref={iframeRef}
			key={page}
			title={page}
			srcDoc={html}
			sandbox="allow-same-origin"
			scrolling="no"
			className="block w-full rounded border border-zinc-700 bg-zinc-950"
			style={{ height: frameHeight, overflow: "hidden" }}
			data-testid={testId}
		/>
	);
}
