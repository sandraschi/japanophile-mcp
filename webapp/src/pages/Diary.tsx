import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import {
	type UserPrefs,
	loadPrefsLocal,
	resolvePrefs,
	subscribePrefs,
} from "../lib/prefs";

export default function Diary() {
	const [session, setSession] = useState(loadPrefsLocal().progress_session_id);
	const [progress, setProgress] = useState<{
		answered: number;
		correct: number;
	} | null>(null);
	const [error, setError] = useState("");

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
		<div>
			<h2 className="mb-4 text-2xl font-bold" data-testid="diary-hero">
				Remember · Diary
			</h2>
			<p className="mb-4 max-w-2xl text-sm text-zinc-400">
				Daily log, streaks, and SRS-linked reviews are on the{" "}
				<strong className="text-zinc-300">roadmap</strong> (Stage 4). For now
				this page shows quiz progress in{" "}
				<code className="text-zinc-300">data/progress.db</code> for your session{" "}
				<code className="text-zinc-300">{session}</code> (change in{" "}
				<Link to="/settings" className="text-violet-400 hover:underline">
					Settings
				</Link>
				).
			</p>
			{error && <p className="text-red-400">{error}</p>}
			<div
				className="rounded border border-zinc-600 bg-zinc-900 p-4"
				data-testid="diary-progress"
			>
				<h3 className="mb-2 font-semibold text-zinc-100">
					JLPT quiz progress (preview)
				</h3>
				{progress ? (
					<p className="text-zinc-300">
						{progress.correct}/{progress.answered} correct in this session. Take
						quizzes on{" "}
						<Link to="/learn" className="text-blue-400 hover:underline">
							Learn
						</Link>{" "}
						to grow this score.
					</p>
				) : (
					<p className="text-zinc-500">
						No answers yet — start a quiz on Learn.
					</p>
				)}
			</div>
		</div>
	);
}
