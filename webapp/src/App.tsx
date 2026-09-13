import { NavLink, Outlet } from "react-router-dom";

const links = [
	["Dashboard", "/"],
	["Learn", "/learn"],
	["Know", "/know"],
	["Games", "/games"],
	["Chat", "/chat"],
	["Skills", "/skills"],
	["Tools", "/tools"],
	["Settings", "/settings"],
	["Help", "/help"],
	["Logs", "/logs"],
];

export default function App() {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-200">
			<header className="border-b border-zinc-800 px-6 py-4">
				<h1 className="text-xl font-bold" data-testid="app-title">
					japanophile-mcp{" "}
					<span className="text-sm font-normal text-zinc-500">
						Learn · Know · Plan · Remember
					</span>
				</h1>
			</header>
			<div className="flex">
				<nav
					className="w-44 shrink-0 border-r border-zinc-800 p-3"
					data-testid="sidebar"
				>
					{links.map(([label, to]) => (
						<NavLink
							key={to + label}
							to={to}
							end={to === "/"}
							className={({ isActive }) =>
								`block rounded px-3 py-2 text-sm ${isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`
							}
						>
							{label}
						</NavLink>
					))}
				</nav>
				<main className="flex-1 p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
