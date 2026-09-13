import { API_BASE } from "@/lib/api";

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JlptLevel = (typeof JLPT_LEVELS)[number];

export type UserPrefs = {
	display_name: string;
	default_jlpt_level: JlptLevel;
	progress_session_id: string;
};

const STORAGE_KEY = "jpn.user_prefs";
const PREFS_EVENT = "jpn-prefs-changed";

const DEFAULT_PREFS: UserPrefs = {
	display_name: "",
	default_jlpt_level: "N5",
	progress_session_id: "japanophile-local",
};

function storageGet(): UserPrefs | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return { ...DEFAULT_PREFS, ...JSON.parse(raw) } as UserPrefs;
	} catch {
		return null;
	}
}

function storageSet(prefs: UserPrefs) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
		window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: prefs }));
	} catch {
		/* private mode */
	}
}

/** Study target N2 -> quiz levels [N2, N1] only (no N5/N4/N3). */
export function quizLevelsForStudy(studyLevel: string): JlptLevel[] {
	const idx = JLPT_LEVELS.indexOf(studyLevel as JlptLevel);
	if (idx < 0) return [...JLPT_LEVELS];
	return JLPT_LEVELS.slice(idx) as JlptLevel[];
}

export function loadPrefsLocal(): UserPrefs {
	return storageGet() ?? { ...DEFAULT_PREFS };
}

export function subscribePrefs(cb: (prefs: UserPrefs) => void): () => void {
	const onCustom = (e: Event) => {
		const d = (e as CustomEvent).detail as UserPrefs | undefined;
		if (d) cb(d);
	};
	const onStorage = (e: StorageEvent) => {
		if (e.key === STORAGE_KEY) cb(loadPrefsLocal());
	};
	window.addEventListener(PREFS_EVENT, onCustom);
	window.addEventListener("storage", onStorage);
	return () => {
		window.removeEventListener(PREFS_EVENT, onCustom);
		window.removeEventListener("storage", onStorage);
	};
}

export async function fetchUserPrefs(): Promise<{
	prefs: UserPrefs;
	quiz_levels: JlptLevel[];
}> {
	const res = await fetch(`${API_BASE}/api/user/prefs`);
	if (!res.ok) throw new Error(`/api/user/prefs: ${res.status}`);
	const data = (await res.json()) as {
		prefs: UserPrefs;
		quiz_levels: JlptLevel[];
	};
	storageSet(data.prefs);
	return data;
}

export async function saveUserPrefs(
	partial: Partial<UserPrefs>,
): Promise<{ prefs: UserPrefs; quiz_levels: JlptLevel[] }> {
	const res = await fetch(`${API_BASE}/api/user/prefs`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(partial),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `/api/user/prefs: ${res.status}`);
	}
	const data = (await res.json()) as {
		prefs: UserPrefs;
		quiz_levels: JlptLevel[];
	};
	storageSet(data.prefs);
	return data;
}

/** Backend-first, then localStorage mirror. */
export async function resolvePrefs(): Promise<UserPrefs> {
	try {
		const { prefs } = await fetchUserPrefs();
		return prefs;
	} catch {
		return loadPrefsLocal();
	}
}
