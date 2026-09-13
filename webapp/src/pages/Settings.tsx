import { useLlm } from "../store/llm";

export default function Settings() {
	const { endpoint, model, setEndpoint, setModel } = useLlm();
	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Settings{" "}
				<span className="text-sm font-normal text-zinc-500">LLM provider</span>
			</h2>
			<div className="max-w-md space-y-4">
				<label className="block text-sm">
					<span className="text-zinc-500">
						Local LLM endpoint (Ollama-compatible)
					</span>
					<input
						data-testid="llm-endpoint"
						value={endpoint}
						onChange={(e) => setEndpoint(e.target.value)}
						className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
					/>
				</label>
				<label className="block text-sm">
					<span className="text-zinc-500">Model</span>
					<input
						data-testid="llm-model"
						value={model}
						onChange={(e) => setModel(e.target.value)}
						className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
					/>
				</label>
				<p className="text-xs text-zinc-500">
					Browser calls need Ollama started with OLLAMA_ORIGINS=* (or use LM
					Studio with CORS on). Defaults: endpoint http://127.0.0.1:11434, model
					muse-glimmer.
				</p>
			</div>
		</div>
	);
}
