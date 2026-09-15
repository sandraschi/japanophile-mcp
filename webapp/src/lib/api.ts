// Static assets live on the backend origin (CORS open). Never relative:
// /games, /know, /skills are frontend ROUTES - relative fetches would hit the SPA.
export const BACKEND = "http://127.0.0.1:11193";
/** Direct backend URL — empty only works under Vite dev /api proxy. */
export const API_BASE =
	(typeof import.meta.env.VITE_API_BASE === "string" &&
		import.meta.env.VITE_API_BASE.length > 0 &&
		import.meta.env.VITE_API_BASE) ||
	BACKEND;
const API = API_BASE;

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

export interface LibraryBook {
	id: string;
	title: string;
	authors: string[];
	tags: string[];
	rating: number | null;
}

export interface MediaResult {
	id: string;
	title: string;
	type: string;
	summary: string;
}

export interface VoiceProvider {
	name: string;
	status: string;
	voices: string[];
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
	/** Direct URL for an <audio> tag — proxies speech-mcp, so no CORS/port wiring in
	 * the browser. Defaults to Gemini over Windows SAPI (voice quality preference). */
	speakWavUrl: (text: string, provider = "gemini", voiceId = "default") =>
		`${API}/api/crossconnect/speak.wav?${new URLSearchParams({ text, provider, voice_id: voiceId }).toString()}`,
	voices: () =>
		get<Dialogic<{ providers: VoiceProvider[] }>>("/api/crossconnect/voices"),
	librarySearch: (query: string, tag = "", limit = 20) =>
		get<Dialogic<LibraryBook[]>>(
			`/api/crossconnect/library_search?${new URLSearchParams({ query, tag, limit: String(limit) }).toString()}`,
		),
	mediaSearch: (query: string, mediaType = "", limit = 20) =>
		get<Dialogic<MediaResult[]>>(
			`/api/crossconnect/media_search?${new URLSearchParams({ query, media_type: mediaType, limit: String(limit) }).toString()}`,
		),
	skillText: () =>
		fetch(`${BACKEND}/skills/japanophile-expert/SKILL.md`).then((r) => {
			if (!r.ok) throw new Error(`skill: ${r.status}`);
			return r.text();
		}),
};
