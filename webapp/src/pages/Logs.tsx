import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Logs() {
	const [lines, setLines] = useState<string[]>(["Booting diagnostics…"]);
	useEffect(() => {
		const run = async () => {
			const out: string[] = ["backend :11193 reachable: checking."];
			try {
				const h = await api.health();
				out.push(`health: ok=${h.ok} repo=${h.repo} stage=${h.stage}`);
				const help = await api.help();
				const d = help.data as { data: Record<string, string> };
				for (const [k, v] of Object.entries(d.data))
					out.push(`${k}: ${String(v).slice(0, 90)}`);
			} catch (e) {
				out.push(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
			}
			setLines(out);
		};
		run();
	}, []);
	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Logs{" "}
				<span className="text-sm font-normal text-zinc-500">diagnostics</span>
			</h2>
			<pre
				data-testid="logs-output"
				className="rounded border border-zinc-800 p-4 text-xs"
			>
				{lines.join("\n")}
			</pre>
		</div>
	);
}
