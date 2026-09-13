import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Skills() {
	const [text, setText] = useState("Loading…");
	useEffect(() => {
		api
			.skillText()
			.then(setText)
			.catch((e: Error) => setText(`Failed: ${e.message}`));
	}, []);
	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">Skills</h2>
			<p className="mb-3 text-sm text-zinc-500">
				Bespoke domain expertise the chat page and agents ingest. Served live
				from skills/.
			</p>
			<pre
				data-testid="skill-text"
				className="whitespace-pre-wrap rounded border border-zinc-800 p-4 text-sm"
			>
				{text}
			</pre>
		</div>
	);
}
