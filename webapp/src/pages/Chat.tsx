import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import {
	type ChatMessage,
	chatComplete,
	fetchLlmSettings,
	loadSelection,
	resolveDefaultModel,
	subscribeSelection,
} from "../lib/llm";

interface Msg {
	role: "user" | "assistant";
	content: string;
}

export default function Chat() {
	const [provider, setProvider] = useState(loadSelection().provider);
	const [model, setModel] = useState(loadSelection().model);
	const [skill, setSkill] = useState("Loading japanophile-expert skill…");
	const [input, setInput] = useState("Am I ready for N4?");
	const [log, setLog] = useState<Msg[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const apply = () => {
			const sel = loadSelection();
			setProvider(sel.provider);
			setModel(sel.model);
		};
		apply();
		return subscribeSelection(apply);
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const s = await fetchLlmSettings();
				if (s.provider) setProvider(s.provider);
				if (s.model?.trim()) setModel(s.model);
			} catch {
				/* local mirror */
			}
		})();
	}, []);

	useEffect(() => {
		api
			.skillText()
			.then(setSkill)
			.catch(() =>
				setSkill(
					"japanophile-expert skill (fallback): answer from kanji/exam tools; cite knowledge pages.",
				),
			);
	}, []);

	const send = async () => {
		const text = input.trim();
		if (!text || busy) return;
		let useModel = model.trim();
		if (!useModel) {
			try {
				useModel = await resolveDefaultModel(provider);
				if (useModel) setModel(useModel);
			} catch (e) {
				setError(e instanceof Error ? e.message : String(e));
				return;
			}
		}
		if (!useModel) {
			setError("Pick a model in Settings first.");
			return;
		}
		setBusy(true);
		setError("");
		const next = [...log, { role: "user", content: text } as Msg];
		setLog(next);
		setInput("");
		try {
			const messages: ChatMessage[] = next.map((m) => ({
				role: m.role,
				content: m.content,
			}));
			const reply = await chatComplete(provider, useModel, [
				{ role: "system", content: skill },
				...messages,
			]);
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
					skill-aware · backend proxy
				</span>
			</h2>
			<p className="mb-3 text-xs text-zinc-500">
				{provider} / {model || "(no model)"} ·{" "}
				<Link to="/settings" className="text-violet-400 hover:underline">
					Change in Settings
				</Link>
			</p>
			<div
				data-testid="chat-log"
				className="mb-3 h-[50vh] space-y-3 overflow-y-auto rounded border border-zinc-800 p-4"
			>
				{log.length === 0 && (
					<p className="text-sm text-zinc-500">
						Ask about kanji, exam prep (N5–N1), or Japanese culture.
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
					{error}
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
