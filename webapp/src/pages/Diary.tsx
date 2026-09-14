import { PageTabs } from "@/components/PageTabs";
import {
	IMMICH_MCP,
	TRAVEL_DIARY_ENTRIES,
	TRAVEL_DIARY_INTRO,
} from "@/content/travelDiary";
import { ExternalLink, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import {
	type UserPrefs,
	loadPrefsLocal,
	resolvePrefs,
	subscribePrefs,
} from "../lib/prefs";

const TABS = [
	{ id: "travel", label: "Travel diary" },
	{ id: "study", label: "Study log" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Diary() {
	const [params, setParams] = useSearchParams();
	const [tab, setTab] = useState<TabId>(() =>
		params.get("tab") === "study" ? "study" : "travel",
	);
	const [session, setSession] = useState(loadPrefsLocal().progress_session_id);
	const [progress, setProgress] = useState<{
		answered: number;
		correct: number;
	} | null>(null);
	const [error, setError] = useState("");
	const [immichUp, setImmichUp] = useState<boolean | null>(null);

	useEffect(() => {
		const t = params.get("tab");
		if (t === "study" || t === "travel") setTab(t);
	}, [params]);

	const selectTab = (id: TabId) => {
		setTab(id);
		setParams(id === "travel" ? {} : { tab: id }, { replace: true });
	};

	useEffect(() => {
		let cancelled = false;
		fetch(`${IMMICH_MCP.api}/health`, { signal: AbortSignal.timeout(2500) })
			.then((r) => {
				if (!cancelled) setImmichUp(r.ok);
			})
			.catch(() => {
				if (!cancelled) setImmichUp(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const loadProgress = (sid: string) => {
			setError("");
			api
				.jlptProgress(sid)
				.then((r) => {
					if (r.success && r.data && typeof r.data === "object") {
						const d = r.data as { answered?: number; correct?: number };
						setProgress({
							answered: Number(d.answered ?? 0),
							correct: Number(d.correct ?? 0),
						});
					}
				})
				.catch((e: Error) => setError(e.message));
		};
		const apply = (p: UserPrefs) => {
			setSession(p.progress_session_id);
			loadProgress(p.progress_session_id);
		};
		resolvePrefs()
			.then(apply)
			.catch(() => loadProgress(loadPrefsLocal().progress_session_id));
		return subscribePrefs(apply);
	}, []);

	return (
		<div data-testid="diary-page">
			<h2 className="mb-2 text-2xl font-bold" data-testid="diary-hero">
				Remember · Diary
			</h2>
			<p className="mb-4 max-w-3xl text-sm text-[var(--app-muted-fg)]">
				Travel memory in prose here; photos and albums in{" "}
				<a
					href={IMMICH_MCP.github}
					target="_blank"
					rel="noopener noreferrer"
					className="text-violet-500 hover:underline"
				>
					immich-mcp
				</a>
				. Daily SRS and editable logs remain on the{" "}
				<strong className="text-[var(--app-fg)]">roadmap</strong>.
			</p>

			<PageTabs
				tabs={[...TABS]}
				active={tab}
				onChange={(id) => selectTab(id as TabId)}
				testId="diary-tabs"
			/>

			{tab === "travel" && (
				<div data-testid="diary-travel">
					<section className="mb-6 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="flex items-center gap-2">
								<Images className="h-5 w-5 text-violet-400" aria-hidden />
								<h3 className="font-semibold text-[var(--app-fg)]">
									Photo library · {IMMICH_MCP.name}
								</h3>
							</div>
							<span
								className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-xs text-[var(--app-muted-fg)]"
								data-testid="immich-health"
							>
								{immichUp === null
									? "Checking dashboard…"
									: immichUp
										? "Dashboard online"
										: "Dashboard offline — start immich-mcp"}
							</span>
						</div>
						<p className="mt-2 text-sm text-[var(--app-muted-fg)]">
							Immich holds the real travel archive (RAW/JPEG, albums, map, faces).{" "}
							{IMMICH_MCP.name} exposes MCP tools plus a fleet dashboard for search,
							upload, and chat-friendly thumbnails — not duplicated inside japanophile.
						</p>
						<ul className="mt-3 flex flex-wrap gap-3 text-sm">
							<li>
								<a
									href={IMMICH_MCP.webapp}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-violet-500 hover:underline"
									data-testid="immich-webapp-link"
								>
									Open dashboard
									<ExternalLink className="h-3.5 w-3.5" aria-hidden />
								</a>
								<span className="text-[var(--app-muted-fg)]">
									{" "}
									({IMMICH_MCP.ports.frontend})
								</span>
							</li>
							<li>
								<a
									href={IMMICH_MCP.github}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-violet-500 hover:underline"
									data-testid="immich-github-link"
								>
									GitHub repo
									<ExternalLink className="h-3.5 w-3.5" aria-hidden />
								</a>
							</li>
							<li>
								<Link
									to="/apps"
									className="text-violet-500 hover:underline"
									data-testid="immich-fleet-apps-link"
								>
									Fleet apps
								</Link>
							</li>
							<li>
								<Link to="/travel" className="text-violet-500 hover:underline">
									Travel planner
								</Link>
							</li>
						</ul>
					</section>

					<p className="mb-6 max-w-3xl text-sm leading-relaxed text-[var(--app-fg)]">
						{TRAVEL_DIARY_INTRO}
					</p>

					<ol className="space-y-6" data-testid="diary-entries">
						{TRAVEL_DIARY_ENTRIES.map((e) => (
							<li
								key={e.id}
								className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
								data-testid={`diary-entry-${e.id}`}
							>
								<p className="text-xs uppercase tracking-wide text-[var(--app-muted-fg)]">
									{e.when} · {e.place}
								</p>
								<h3 className="mt-1 text-lg font-semibold text-[var(--app-fg)]">
									{e.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-[var(--app-muted-fg)]">
									{e.body}
								</p>
								{e.tags && e.tags.length > 0 ? (
									<ul className="mt-3 flex flex-wrap gap-2">
										{e.tags.map((t) => (
											<li
												key={t}
												className="rounded bg-[var(--app-muted)] px-2 py-0.5 text-xs text-[var(--app-fg)]"
											>
												{t}
											</li>
										))}
									</ul>
								) : null}
							</li>
						))}
					</ol>
				</div>
			)}

			{tab === "study" && (
				<div data-testid="diary-study">
					<p className="mb-4 max-w-2xl text-sm text-[var(--app-muted-fg)]">
						Quiz progress in{" "}
						<code className="text-[var(--app-fg)]">data/progress.db</code> for session{" "}
						<code className="text-[var(--app-fg)]">{session}</code> (change in{" "}
						<Link to="/settings" className="text-violet-500 hover:underline">
							Settings
						</Link>
						).
					</p>
					{error && <p className="text-red-400">{error}</p>}
					<div
						className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
						data-testid="diary-progress"
					>
						<h3 className="mb-2 font-semibold text-[var(--app-fg)]">
							Exam quiz progress
						</h3>
						{progress ? (
							<p className="text-[var(--app-muted-fg)]">
								{progress.correct}/{progress.answered} correct in this session. Take
								quizzes on{" "}
								<Link to="/learn" className="text-violet-500 hover:underline">
									Learn
								</Link>
								.
							</p>
						) : (
							<p className="text-[var(--app-muted-fg)]">
								No answers yet — start a quiz on Learn.
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
