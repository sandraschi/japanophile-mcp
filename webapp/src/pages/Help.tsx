export default function Help() {
	return (
		<div className="max-w-3xl">
			<h2 className="mb-4 text-2xl font-bold">Help</h2>
			<div className="space-y-3 text-sm leading-relaxed">
				<p>
					<b>Learn</b>: kanji dictionary (13,108 entries), JLPT quiz with
					progress, vocab and example sentences from vendored{" "}
					<code>data/kanji.db</code>.
				</p>
				<p>
					<b>Know</b>: 29 culture knowledge pages, plain text, sourced.
				</p>
				<p>
					<b>Games</b>: vendored learning tools, running against this backend
					via the compat shim.
				</p>
				<p>
					<b>Chat</b>: asks the local LLM with japanophile-expert injected as
					system prompt. Configure endpoint + model in Settings.
				</p>
				<p>
					<b>Data</b>: <code>data/kanji.db</code> and{" "}
					<code>data/wakan_vocab.json</code> ship with the repo (see{" "}
					<code>data/README.md</code>). Verify with{" "}
					<code>just ensure-data</code>. Maintainers refresh with{" "}
					<code>scripts/vendor_from_donor.ps1</code>.
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
