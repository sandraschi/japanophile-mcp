const API = "";
export const API_BASE = API;
// Static assets live on the backend origin (CORS open). Never relative:
// /games, /know, /skills are frontend ROUTES - relative fetches would hit the SPA.
const BACKEND = "http://127.0.0.1:11193";

async function get<T>(path: string): Promise<T> {
	const res = await fetch(`${API}${path}`);
	if (!res.ok) throw new Error(`${path}: ${res.status}`);
	return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${path}: ${res.status}`);
	return res.json() as Promise<T>;
}

export interface Dialogic<T = unknown> {
	success: boolean;
	message: string;
	data: T;
}

export interface KanjiEntry {
	kanji: string;
	onyomi: string;
	kunyomi: string;
	meanings: string;
	jlpt: string;
	grade: number;
	strokes: number;
	radical?: string;
	categories?: string;
	frequency?: number;
}

export interface QuizQuestion {
	id: number;
	level: string;
	question_type: string;
	question_text: string;
	options: { option_letter: string; option_text: string }[];
}

export const api = {
	health: () => get<{ ok: boolean; repo: string; stage: number }>("/health"),
	help: () => get<Dialogic>("/api/help"),
	kanji: (op: string, params: Record<string, string | number> = {}) => {
		const q = new URLSearchParams({ ...params } as Record<
			string,
			string
		>).toString();
		return get<Dialogic<KanjiEntry[]>>(`/api/kanji/${op}?${q}`);
	},
	jlptNext: (level: string) =>
		get<Dialogic<QuizQuestion>>(`/api/jlpt/next?level=${level}`),
	jlptAnswer: (payload: {
		question_id: number;
		answer: string;
		session_id: string;
		response_time_ms: number;
	}) => post<Dialogic>("/api/jlpt/answer", payload),
	jlptProgress: (session: string) =>
		get<Dialogic>(
			`/api/jlpt/progress?session_id=${encodeURIComponent(session)}`,
		),
	vocab: (op: string, params: Record<string, string | number> = {}) => {
		const q = new URLSearchParams({ ...params } as Record<
			string,
			string
		>).toString();
		return get<Dialogic>(`/api/vocab/${op}?${q}`);
	},
	knowledgeList: () => get<Dialogic<string[]>>("/api/knowledge"),
	knowledgeGet: (page: string) =>
		get<Dialogic<string>>(`/api/knowledge/${encodeURIComponent(page)}`),
	skillText: () =>
		fetch(`${BACKEND}/skills/japanophile-expert/SKILL.md`).then((r) => {
			if (!r.ok) throw new Error(`skill: ${r.status}`);
			return r.text();
		}),
};
