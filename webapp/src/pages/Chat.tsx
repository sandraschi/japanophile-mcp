import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { chatComplete, useLlm } from "../store/llm";

interface Msg {
	role: "user" | "assistant";
	content: string;
}

export default function Chat() {
	const { endpoint, model } = useLlm();
	const [skill, setSkill] = useState("Loading japanophile-expert skill…");
	const [input, setInput] = useState("Am I ready for N4?");
	const [log, setLog] = useState<Msg[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		api
			.skillText()
			.then(setSkill)
			.catch(() =>
				setSkill(
					"japanophile-expert skill (fallback): answer from kanji/JLPT tools; cite knowledge pages.",
				),
			);
	}, []);

	const send = async () => {
		const text = input.trim();
		if (!text || busy) return;
		setBusy(true);
		setError("");
		const next = [...log, { role: "user", content: text } as Msg];
		setLog(next);
		setInput("");
		try {
			const reply = await chatComplete(endpoint, model, skill, next);
			setLog([...next, { role: "assistant", content: reply }]);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setBusy(false);
		}
	};

	return (
		<div>
			<h2 className="mb-4 text-2xl font-bold">
				Chat{" "}
				<span className="text-sm font-normal text-zinc-500">
					skill-aware, local LLM
				</span>
			</h2>
			<div
				data-testid="chat-log"
				className="mb-3 h-[50vh] space-y-3 overflow-y-auto rounded border border-zinc-800 p-4"
			>
				{log.length === 0 && (
					<p className="text-sm text-zinc-500">
						Ask about kanji, JLPT prep, or Japanese culture. Answers route
						through the repo tools.
					</p>
				)}
				{log.map((m) => (
					<div
						key={`${m.role}-${m.content}`}
						className={`rounded p-3 text-sm ${m.role === "user" ? "bg-zinc-800" : "bg-zinc-900"}`}
					>
						<b>{m.role === "user" ? "You" : "Skill"}:</b>{" "}
						<span className="whitespace-pre-wrap">{m.content}</span>
					</div>
				))}
			</div>
			{error && (
				<p className="mb-2 text-sm text-red-400" data-testid="chat-error">
					{error} (Ollama needs OLLAMA_ORIGINS=* for browser calls)
				</p>
			)}
			<div className="flex gap-2">
				<input
					data-testid="chat-input"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && send()}
					className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
					placeholder="Ask…"
				/>
				<button
					type="button"
					data-testid="chat-send"
					onClick={send}
					disabled={busy}
					className="rounded bg-zinc-100 px-4 py-2 text-sm text-black disabled:opacity-50"
				>
					{busy ? "…" : "Send"}
				</button>
			</div>
		</div>
	);
}
