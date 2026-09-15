import { KnowledgeArticleView } from "@/components/KnowledgeArticleView";
import { PageTabs } from "@/components/PageTabs";
import type { VoiceProvider } from "@/lib/api";
import {
	KNOWLEDGE_CLUSTERS,
	type KnowledgeClusterId,
	pageLabel,
	pagesInCluster,
} from "@/lib/knowledgeClusters";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export { pageLabel } from "@/lib/knowledgeClusters";

const KNOW_TABS = KNOWLEDGE_CLUSTERS;

const TTS_PROVIDER_KEY = "jpn.tts_provider";
const TTS_VOICE_KEY = "jpn.tts_voice";

function loadPref(key: string, fallback: string): string {
	try {
		return localStorage.getItem(key) ?? fallback;
	} catch {
		return fallback;
	}
}

function savePref(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		/* private mode / storage disabled — selection just won't persist */
	}
}

export default function KnowledgePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [pages, setPages] = useState<string[]>([]);
	const [current, setCurrent] = useState("");
	const [error, setError] = useState("");
	const [listenState, setListenState] = useState<"idle" | "loading" | "error">(
		"idle",
	);
	const audioRef = useRef<HTMLAudioElement>(null);
	const [ttsProviders, setTtsProviders] = useState<VoiceProvider[]>([]);
	const [ttsProvider, setTtsProviderState] = useState(() =>
		loadPref(TTS_PROVIDER_KEY, "gemini"),
	);
	const [ttsVoice, setTtsVoiceState] = useState(() =>
		loadPref(TTS_VOICE_KEY, "default"),
	);

	useEffect(() => {
		api
			.voices()
			.then((r) =>
				setTtsProviders(
					(r.data?.providers ?? []).filter((p) => p.status === "available"),
				),
			)
			.catch(() => setTtsProviders([]));
	}, []);

	const changeTtsProvider = (name: string) => {
		setTtsProviderState(name);
		savePref(TTS_PROVIDER_KEY, name);
		setTtsVoiceState("default");
		savePref(TTS_VOICE_KEY, "default");
	};
	const changeTtsVoice = (v: string) => {
		setTtsVoiceState(v);
		savePref(TTS_VOICE_KEY, v);
	};
	const currentVoices =
		ttsProviders.find((p) => p.name === ttsProvider)?.voices ?? [];

	const listen = async () => {
		if (!current) return;
		setListenState("loading");
		try {
			const res = await api.knowledgeGet(current);
			// Gemini (default TTS voice) takes ~20s for 400 chars — trimmed to keep
			// the wait reasonable; Windows SAPI would tolerate more but sounds worse.
			const text = (res.data ?? "").slice(0, 200).trim();
			if (!text) throw new Error("No text to read.");
			const audio = audioRef.current;
			if (!audio) return;
			audio.src = api.speakWavUrl(text, ttsProvider, ttsVoice);
			await audio.play();
			setListenState("idle");
		} catch {
			// speech-mcp likely not running — degrade quietly, same spirit as a
			// missing local DB (PRD.md data strategy): a friendly state, no crash.
			setListenState("error");
		}
	};
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
				curriculum (grammar, keigo, exams, materials), use the Language page.
				Travel:{" "}
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
							<div className="mb-2 flex flex-wrap items-center gap-2">
								<p className="text-sm text-zinc-400">{pageLabel(current)}</p>
								<button
									type="button"
									data-testid="know-listen"
									onClick={listen}
									disabled={listenState === "loading"}
									className="rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-50"
									title="Read the first ~200 characters aloud via speech-mcp"
								>
									{listenState === "loading"
										? "Synthesizing…"
										: "🔊 Listen (excerpt)"}
								</button>
								<select
									data-testid="know-tts-provider"
									value={ttsProvider}
									onChange={(e) => changeTtsProvider(e.target.value)}
									title="TTS provider (speech-mcp)"
									className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs text-zinc-400"
								>
									{ttsProviders.length === 0 && (
										<option value={ttsProvider}>{ttsProvider}</option>
									)}
									{ttsProviders.map((p) => (
										<option key={p.name} value={p.name}>
											{p.name}
										</option>
									))}
								</select>
								<select
									data-testid="know-tts-voice"
									value={ttsVoice}
									onChange={(e) => changeTtsVoice(e.target.value)}
									title="Voice/speaker"
									className="max-w-[10rem] rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs text-zinc-400"
								>
									<option value="default">default</option>
									{currentVoices.map((v) => (
										<option key={v} value={v}>
											{v}
										</option>
									))}
								</select>
								{listenState === "error" && (
									<span className="text-xs text-red-400">
										speech-mcp not reachable
									</span>
								)}
							</div>
							{/* biome-ignore lint/a11y/useMediaCaption: TTS output has no source track to caption */}
							<audio
								ref={audioRef}
								data-testid="know-audio"
								className="hidden"
							/>
							<KnowledgeArticleView page={current} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
