import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageLoading } from "@/components/PageLoading";
import { useLlm } from "@/store/llm";

type Props = {
	children: ReactNode;
	settingsPath?: string;
};

export function LlmPageGate({ children, settingsPath = "/settings" }: Props) {
	const endpoint = useLlm((s) => s.endpoint);
	const model = useLlm((s) => s.model);
	const hydrated = useLlm((s) => s.hydrated);

	if (!hydrated) {
		return (
			<PageLoading label="Loading LLM settings…" testId="llm-page-loading" />
		);
	}

	if (!endpoint.trim() || !model.trim()) {
		return (
			<div
				className="mx-auto max-w-lg space-y-4 rounded-lg border border-zinc-700 bg-zinc-900/80 p-6"
				data-testid="llm-needs-setup"
			>
				<h2 className="text-lg font-semibold text-white">
					Set a local LLM first
				</h2>
				<p className="text-sm text-zinc-400">
					Chat needs an Ollama-compatible endpoint and model name. Open Settings,
					save your choices, then return here.
				</p>
				<Link
					to={settingsPath}
					className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
					data-testid="llm-gate-settings-link"
				>
					Open Settings
				</Link>
			</div>
		);
	}

	return children;
}
