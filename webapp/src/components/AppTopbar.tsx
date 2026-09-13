import { api } from "@/lib/api";
import {
	loadPrefsLocal,
	resolvePrefs,
	subscribePrefs,
	type UserPrefs,
} from "@/lib/prefs";
import { readStoredTheme, toggleTheme, type ThemeMode } from "@/lib/theme";
import {
	ChevronDown,
	Grid3X3,
	HelpCircle,
	LogOut,
	Moon,
	ScrollText,
	Settings,
	Sun,
	User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type BackendState = "online" | "offline" | "checking";

export function AppTopbar() {
	const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme());
	const [backend, setBackend] = useState<BackendState>("checking");
	const [prefs, setPrefs] = useState<UserPrefs>(() => loadPrefsLocal());
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		return subscribePrefs(setPrefs);
	}, []);

	useEffect(() => {
		let cancelled = false;
		resolvePrefs()
			.then((p) => {
				if (!cancelled) setPrefs(p);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		const poll = async () => {
			try {
				await api.health();
				if (!cancelled) setBackend("online");
			} catch {
				if (!cancelled) setBackend("offline");
			}
		};
		poll();
		const id = window.setInterval(poll, 15000);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, []);

	useEffect(() => {
		if (!menuOpen) return;
		const onDoc = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [menuOpen]);

	const displayLabel =
		prefs.display_name.trim() || "Local profile (no sign-in)";

	const onThemeClick = () => {
		setTheme(toggleTheme());
	};

	const menuItemClass =
		"flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-muted)]";

	return (
		<header
			className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4"
			data-testid="app-topbar"
		>
			<button
				type="button"
				onClick={onThemeClick}
				className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-border)] text-[var(--app-muted-fg)] transition-colors hover:bg-[var(--app-muted)] hover:text-[var(--app-fg)]"
				title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
				aria-label="Toggle light and dark mode"
				data-testid="theme-toggle"
			>
				{theme === "dark" ? (
					<Sun className="h-4 w-4" />
				) : (
					<Moon className="h-4 w-4" />
				)}
			</button>

			<div
				className="flex items-center gap-2 rounded-full border border-[var(--app-border)] px-3 py-1 text-xs"
				data-testid="backend-status"
			>
				<span
					className={`inline-block h-2 w-2 rounded-full ${
						backend === "online"
							? "bg-emerald-400"
							: backend === "offline"
								? "bg-rose-400"
								: "bg-amber-400"
					}`}
					aria-hidden
				/>
				<span className="text-[var(--app-muted-fg)]">
					{backend === "online"
						? "Backend online"
						: backend === "offline"
							? "Backend offline"
							: "Checking…"}
				</span>
			</div>

			<div className="relative" ref={menuRef}>
				<button
					type="button"
					onClick={() => setMenuOpen((v) => !v)}
					className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-muted)]/40 px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-muted)]"
					aria-expanded={menuOpen}
					aria-haspopup="menu"
					data-testid="user-menu-trigger"
				>
					<User className="h-4 w-4 text-violet-400" />
					<span className="max-w-[140px] truncate">{displayLabel}</span>
					<ChevronDown className="h-4 w-4 opacity-60" />
				</button>

				{menuOpen ? (
					<div
						role="menu"
						className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-xl"
						data-testid="user-menu-panel"
					>
						<p className="border-b border-[var(--app-border)] px-3 py-2 text-xs text-[var(--app-muted-fg)]">
							Single-user local mode. API keys live in Settings.
						</p>
						<button
							type="button"
							role="menuitem"
							className={menuItemClass}
							onClick={() => {
								setMenuOpen(false);
								navigate("/settings");
							}}
						>
							<Settings className="h-4 w-4" />
							AI & preferences
						</button>
						<button
							type="button"
							role="menuitem"
							className={menuItemClass}
							onClick={() => {
								setMenuOpen(false);
								navigate("/apps");
							}}
						>
							<Grid3X3 className="h-4 w-4" />
							Fleet apps
						</button>
						<button
							type="button"
							role="menuitem"
							className={menuItemClass}
							onClick={() => {
								setMenuOpen(false);
								navigate("/help");
							}}
						>
							<HelpCircle className="h-4 w-4" />
							Help
						</button>
						<button
							type="button"
							role="menuitem"
							className={menuItemClass}
							onClick={() => {
								setMenuOpen(false);
								navigate("/logs");
							}}
						>
							<ScrollText className="h-4 w-4" />
							Logs
						</button>
						<div className="my-1 border-t border-[var(--app-border)]" />
						<button
							type="button"
							role="menuitem"
							className={`${menuItemClass} text-[var(--app-muted-fg)]`}
							disabled
							title="OAuth not configured for this server"
						>
							<LogOut className="h-4 w-4" />
							Sign out (N/A)
						</button>
						<p className="px-3 pb-2 text-[10px] text-[var(--app-muted-fg)]">
							Set display name under{" "}
							<Link
								to="/settings"
								className="text-violet-500 underline"
								onClick={() => setMenuOpen(false)}
							>
								Settings
							</Link>
							.
						</p>
					</div>
				) : null}
			</div>
		</header>
	);
}
