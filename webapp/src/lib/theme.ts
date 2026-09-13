const STORAGE_KEY = "jpn.theme";

export type ThemeMode = "dark" | "light";

export function readStoredTheme(): ThemeMode {
	try {
		return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
	} catch {
		return "dark";
	}
}

export function applyTheme(mode: ThemeMode) {
	const root = document.documentElement;
	root.classList.toggle("dark", mode === "dark");
	root.classList.toggle("theme-light", mode === "light");
	root.dataset.theme = mode;
	try {
		localStorage.setItem(STORAGE_KEY, mode);
	} catch {
		/* private mode */
	}
}

export function toggleTheme(): ThemeMode {
	const next: ThemeMode = readStoredTheme() === "dark" ? "light" : "dark";
	applyTheme(next);
	return next;
}

export function initThemeFromStorage() {
	applyTheme(readStoredTheme());
}
