import { Link } from "react-router-dom";

type Variant = "full" | "compact" | "dashboard";

export function ToolsHarnessExplainer({
	variant = "full",
}: { variant?: Variant }) {
	if (variant === "compact") {
		return (
			<p className="text-xs text-zinc-500 border border-zinc-700 rounded-md bg-zinc-900/60 px-3 py-2">
				This is the <strong className="text-zinc-300">MCP tool harness</strong>{" "}
				— same tools and parameters Cursor or Claude use.{" "}
				<strong className="text-zinc-300">Run tool</strong> calls{" "}
				<code className="text-blue-400">POST /api/tools/…</code> on this server.
				<Link
					to="/tools#why-harness"
					className="text-blue-400 hover:underline ml-1"
				>
					Why this UX?
				</Link>
			</p>
		);
	}

	if (variant === "dashboard") {
		return (
			<div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-xs text-zinc-400 space-y-2">
				<p className="font-medium text-zinc-200">
					Why MCP Tools instead of more pages?
				</p>
				<p>
					japanophile-mcp exposes seven portmanteau tools on one server. The
					harness introspects them so the webapp never drifts from MCP.
				</p>
				<Link to="/tools#why-harness" className="text-blue-400 hover:underline">
					Read more on MCP Tools
				</Link>
			</div>
		);
	}

	return (
		<section
			id="why-harness"
			className="scroll-mt-6 rounded-lg border border-blue-900/40 bg-zinc-900/40 p-5 text-sm text-zinc-300 space-y-3"
		>
			<h3 className="text-base font-semibold text-white">What is this page?</h3>
			<p>
				Each card is one registered MCP tool.{" "}
				<strong className="text-white">Run tool</strong> builds a form from JSON
				Schema, then executes via{" "}
				<code className="text-blue-400 text-xs">
					POST /api/tools/{"{name}"}
				</code>{" "}
				— the same surface agents use.
			</p>
			<p className="text-xs text-zinc-500">
				<Link to="/language" className="text-blue-400 hover:underline">
					Language
				</Link>
				,{" "}
				<Link to="/know" className="text-blue-400 hover:underline">
					Knowledge
				</Link>
				, and Practice games are tailored browse UIs. All seven portmanteaus
				also run here with full parameter sets.
			</p>
		</section>
	);
}
