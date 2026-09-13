import { NavLink, Outlet } from "react-router-dom";

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
	return (
		<div className="min-h-screen bg-[#0c0c0f] text-zinc-50">
			<header className="border-b border-zinc-600 bg-zinc-900 px-6 py-4">
				<h1 className="text-xl font-bold" data-testid="app-title">
					japanophile-mcp{" "}
					<span className="text-sm font-normal text-zinc-300">
						Learn · Know · Plan · Remember
					</span>
				</h1>
			</header>
			<div className="flex">
				<nav
					className="w-48 shrink-0 border-r border-zinc-600 bg-zinc-900 p-3"
					data-testid="sidebar"
				>
					{links.map(([label, to]) => (
						<NavLink
							key={to + label}
							to={to}
							end={to === "/"}
							className={({ isActive }) =>
								`mb-1 block rounded px-3 py-2.5 text-base ${isActive ? "bg-zinc-600 font-semibold text-white" : "text-zinc-200 hover:bg-zinc-800"}`
							}
						>
							{label}
						</NavLink>
					))}
				</nav>
				<main className="flex-1 bg-[#0c0c0f] p-6 text-zinc-100">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
