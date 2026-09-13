import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const SESSION = "webapp-diary";

export default function Diary() {
	const [progress, setProgress] = useState<{
		answered: number;
		correct: number;
	} | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		api
			.jlptProgress(SESSION)
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
	}, []);

	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold" data-testid="diary-hero">
				Remember · Diary
			</h2>
			<p className="mb-4 max-w-2xl text-sm text-zinc-400">
				Daily log, streaks, and SRS-linked reviews are on the{" "}
				<strong className="text-zinc-300">roadmap</strong> (Stage 4). For now this page
				shows quiz progress stored in{" "}
				<code className="text-zinc-300">data/progress.db</code> for session{" "}
				<code className="text-zinc-300">{SESSION}</code>.
			</p>
			{error && <p className="text-red-400">{error}</p>}
			<div
				className="rounded border border-zinc-600 bg-zinc-900 p-4"
				data-testid="diary-progress"
			>
				<h3 className="mb-2 font-semibold text-zinc-100">JLPT quiz progress (preview)</h3>
				{progress ? (
					<p className="text-zinc-300">
						{progress.correct}/{progress.answered} correct in this session. Take quizzes on{" "}
						<Link to="/learn" className="text-blue-400 hover:underline">
							Learn
						</Link>{" "}
						to grow this score.
					</p>
				) : (
					<p className="text-zinc-500">No answers yet — start a quiz on Learn.</p>
				)}
			</div>
		</div>
	);
}
