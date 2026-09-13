import { useState } from "react";

const GAMES = [
	["kanji-table.html", "Kanji table (2,500 wall)"],
	["kanji-master.html", "Kanji master (spaced repetition)"],
	["kanji-3d-visualizer.html", "Kanji 3D visualizer"],
	["kanji-stroke.html", "Stroke order"],
	["jlpt-practice-test.html", "JLPT practice test"],
	["jlpt-vocabulary.html", "JLPT vocabulary"],
	["japanese-flashcards.html", "Flashcards"],
	["japanese-grammar.html", "Grammar"],
	["japanese-listening.html", "Listening"],
];

export default function Games() {
	const [current, setCurrent] = useState(GAMES[0][0]);
	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Games{" "}
				<span className="text-sm font-normal text-zinc-500">
					vendored learning tools
				</span>
			</h2>
			<div className="mb-3 flex flex-wrap gap-2" data-testid="games-list">
				{GAMES.map(([file, label]) => (
					<button
						type="button"
						key={file}
						data-testid={`game-${file}`}
						onClick={() => setCurrent(file)}
						className={`rounded px-3 py-1.5 text-sm ${current === file ? "bg-zinc-100 text-black" : "bg-zinc-800 text-zinc-300"}`}
					>
						{label}
					</button>
				))}
			</div>
			<iframe
				data-testid="game-frame"
				title={current}
				src={`http://127.0.0.1:11193/games/${current}`}
				className="h-[70vh] w-full rounded border border-zinc-800 bg-white"
			/>
		</div>
	);
}
