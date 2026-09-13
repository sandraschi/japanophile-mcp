import { AppTopbar } from "@/components/AppTopbar";
import { cn } from "@/lib/utils";
import { initThemeFromStorage } from "@/lib/theme";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const SIDEBAR_KEY = "jpn.sidebar_collapsed";

const links = [
	["Dashboard", "/"],
	["Learn", "/learn"],
	["Know", "/know"],
	["Travel", "/travel"],
	["Diary", "/diary"],
	["Games", "/games"],
	["Chat", "/chat"],
	["Skills", "/skills"],
	["Tools", "/tools"],
	["Apps", "/apps"],
	["Settings", "/settings"],
	["Help", "/help"],
	["Logs", "/logs"],
];

export default function App() {
	const [collapsed, setCollapsed] = useState(() => {
		try {
			return localStorage.getItem(SIDEBAR_KEY) === "1";
		} catch {
			return false;
		}
	});

	useEffect(() => {
		initThemeFromStorage();
	}, []);

	const toggleSidebar = () => {
		setCollapsed((v) => {
			const next = !v;
			try {
				localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
			} catch {
				/* ignore */
			}
			return next;
		});
	};

	return (
		<div className="flex min-h-screen flex-col bg-[var(--app-bg)] text-[var(--app-fg)]">
			<header className="border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 sm:px-6">
				<h1 className="text-xl font-bold" data-testid="app-title">
					japanophile-mcp{" "}
					<span className="text-sm font-normal text-[var(--app-muted-fg)]">
						Learn · Know · Plan · Remember
					</span>
				</h1>
			</header>
			<div className="flex min-h-0 flex-1">
				<nav
					className={cn(
						"flex shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] transition-[width] duration-200",
						collapsed ? "w-14" : "w-48",
					)}
					data-testid="sidebar"
				>
					<div
						className={cn(
							"flex border-b border-[var(--app-border)] p-1",
							collapsed
								? "flex-col items-center gap-1"
								: "items-center justify-end px-2 py-2",
						)}
					>
						<button
							type="button"
							onClick={toggleSidebar}
							className="rounded-md p-2 text-[var(--app-muted-fg)] hover:bg-[var(--app-muted)] hover:text-[var(--app-fg)]"
							aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
							data-testid="sidebar-toggle"
						>
							{collapsed ? (
								<ChevronRight className="h-5 w-5" />
							) : (
								<ChevronLeft className="h-5 w-5" />
							)}
						</button>
					</div>
					<div className="flex-1 overflow-y-auto p-2">
						{links.map(([label, to]) => (
							<NavLink
								key={to + label}
								to={to}
								end={to === "/"}
								title={label}
								aria-label={label}
								className={({ isActive }) =>
									cn(
										"mb-1 block rounded px-3 py-2.5 text-base transition-colors",
										collapsed ? "px-1 text-center text-xs" : "",
										isActive
											? "bg-violet-600/80 font-semibold text-white"
											: "text-[var(--app-muted-fg)] hover:bg-[var(--app-muted)] hover:text-[var(--app-fg)]",
									)
								}
							>
								{collapsed ? label.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2) : label}
							</NavLink>
						))}
					</div>
				</nav>
				<div className="flex min-w-0 flex-1 flex-col">
					<AppTopbar />
					<main className="flex-1 overflow-y-auto p-6">
						<Outlet />
						<footer className="mt-10 border-t border-[var(--app-border)] pt-4 text-xs text-[var(--app-muted-fg)]">
							<NavLink
								to="/help?tab=license"
								className="text-violet-500 hover:underline"
								data-testid="footer-license"
							>
								MIT License & contributors
							</NavLink>
						</footer>
					</main>
				</div>
			</div>
		</div>
	);
}
