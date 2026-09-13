import { create } from "zustand";

interface LlmState {
	endpoint: string;
	model: string;
	setEndpoint: (v: string) => void;
	setModel: (v: string) => void;
}

function stored(key: string, fallback: string): string {
	try {
		return localStorage.getItem(key) ?? fallback;
	} catch {
		return fallback;
	}
}

function save(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		/* private mode */
	}
}

export const useLlm = create<LlmState>((set) => ({
	endpoint: stored("jpn.llm.endpoint", "http://127.0.0.1:11434"),
	model: stored("jpn.llm.model", "muse-glimmer"),
	setEndpoint: (v) => {
		save("jpn.llm.endpoint", v);
		set({ endpoint: v });
	},
	setModel: (v) => {
		save("jpn.llm.model", v);
		set({ model: v });
	},
}));

export async function chatComplete(
	endpoint: string,
	model: string,
	system: string,
	messages: { role: string; content: string }[],
): Promise<string> {
	const res = await fetch(`${endpoint.replace(/\/$/, "")}/api/chat`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model,
			stream: false,
			messages: [{ role: "system", content: system }, ...messages],
		}),
	});
	if (!res.ok) throw new Error(`LLM ${res.status} at ${endpoint}`);
	const data = await res.json();
	return (data.message?.content ?? "").trim();
}
