export default function Help() {
	return (
		<div className="max-w-3xl">
			<h2 className="mb-4 text-2xl font-bold">Help</h2>
			<div className="space-y-3 text-sm leading-relaxed">
				<p>
					<b>Learn</b>: kanji dictionary (13,108 entries), JLPT quiz with
					progress, vocab search (needs fetched kanji.db).
				</p>
				<p>
					<b>Know</b>: 29 culture knowledge pages, plain text, sourced.
				</p>
				<p>
					<b>Games</b>: vendored learning tools from ai-games-collection,
					running against this backend via the compat shim.
				</p>
				<p>
					<b>Chat</b>: asks the local LLM with japanophile-expert injected as
					system prompt. Configure endpoint + model in Settings.
				</p>
				<p>
					<b>Big data</b>: kanji.db (135MB) is never vendored. Run{" "}
					<code>pwsh -File scripts/fetch_data.ps1</code> in the repo; tools
					degrade with a fetch hint until then.
				</p>
				<p>
					<b>Ports</b>: backend 11193, frontend 11194. Open WebUI squats
					11191/11192 on this box (Docker) - that pair is registry-marked, do
					not use.
				</p>
			</div>
		</div>
	);
}
