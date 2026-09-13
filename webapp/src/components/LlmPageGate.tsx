import { PageLoading } from "@/components/PageLoading";
import {
	type ProviderInfo,
	type SavedLlmSettings,
	type Selection,
	fetchLlmSettings,
	fetchProviders,
	isOnboarded,
	loadSelection,
	subscribeSelection,
} from "@/lib/llm";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

type GateState = "loading" | "ready" | "needs-setup" | "error";

type Props = {
	children: ReactNode;
	settingsPath?: string;
};

function isChatReady(
	settings: SavedLlmSettings | null,
	sel: Selection,
	providers: ProviderInfo[],
): boolean {
	if (settings?.model?.trim() || sel.model?.trim()) return true;
	if (isOnboarded()) return true;
	const pid = settings?.provider || sel.provider;
	if (!pid) return false;
	const p = providers.find((x) => x.id === pid);
	if (!p) return false;
	if (settings?.provider && p.kind === "local" && p.detected) return true;
	if (settings?.provider && p.kind === "cloud" && p.configured) return true;
	return false;
}

export function LlmPageGate({ children, settingsPath = "/settings" }: Props) {
	const [state, setState] = useState<GateState>("loading");
	const [error, setError] = useState<string | null>(null);

	const evaluate = useCallback(async () => {
		const providers = (await fetchProviders()).providers;
		const settings = await fetchLlmSettings().catch(() => null);
		const sel = loadSelection();
		return isChatReady(settings, sel, providers);
	}, []);

	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			try {
				const ok = await evaluate();
				if (!cancelled) setState(ok ? "ready" : "needs-setup");
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : String(e));
					setState("error");
				}
			}
		};
		void run();
		const unsub = subscribeSelection(() => {
			void evaluate()
				.then((ok) => {
					if (!cancelled) setState(ok ? "ready" : "needs-setup");
				})
				.catch(() => {
					/* keep prior state */
				});
		});
		return () => {
			cancelled = true;
			unsub();
		};
	}, [evaluate]);

	if (state === "loading") {
		return (
			<PageLoading
				label="Loading LLM configuration…"
				testId="llm-page-loading"
			/>
		);
	}

	if (state === "needs-setup") {
		return (
			<div
				className="mx-auto max-w-lg space-y-4 rounded-lg border border-zinc-700 bg-zinc-900/80 p-6"
				data-testid="llm-needs-setup"
			>
				<h2 className="text-lg font-semibold text-white">
					Configure an LLM first
				</h2>
				<p className="text-sm text-zinc-400">
					Pick a local engine or cloud provider in Settings, save your
					selection, then return here.
				</p>
				<Link
					to={settingsPath}
					className="inline-flex rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500"
					data-testid="llm-gate-settings-link"
				>
					Open Settings
				</Link>
			</div>
		);
	}

	if (state === "error") {
		return (
			<div className="space-y-3 rounded-lg border border-red-900/50 bg-red-950/20 p-6">
				<p className="text-sm text-red-200">
					Could not reach LLM endpoints: {error ?? "unknown error"}
				</p>
				<Link
					to={settingsPath}
					className="text-sm text-violet-400 hover:underline"
				>
					Check Settings
				</Link>
			</div>
		);
	}

	return children;
}
