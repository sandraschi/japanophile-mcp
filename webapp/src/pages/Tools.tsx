import { useState } from "react";

const CALLS = [
	["kanji lookup", "/api/kanji/lookup?query=水"],
	["kanji N5", "/api/kanji/by_jlpt?level=N5&limit=5"],
	["jlpt next", "/api/jlpt/next?level=N5"],
	["knowledge list", "/api/knowledge"],
	["status", "/api/help"],
];

export default function Tools() {
	const [out, setOut] = useState("Pick a call.");
	const run = async (path: string) => {
		try {
			const r = await fetch(path);
			setOut(JSON.stringify(await r.json(), null, 2).slice(0, 4000));
		} catch (e) {
			setOut(e instanceof Error ? e.message : String(e));
		}
	};
	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">Tools</h2>
			<div className="mb-3 flex flex-wrap gap-2" data-testid="tools-list">
				{CALLS.map(([label, path]) => (
					<button
						type="button"
						key={path}
						data-testid={`tool-${label}`}
						onClick={() => run(path)}
						className="rounded bg-zinc-800 px-3 py-1.5 text-sm"
					>
						{label}
					</button>
				))}
			</div>
			<pre
				data-testid="tools-output"
				className="max-h-[60vh] overflow-auto rounded border border-zinc-800 p-4 text-xs"
			>
				{out}
			</pre>
		</div>
	);
}
