import { ActiveLlmCard } from "@/components/ActiveLlmCard";
import { LlmOnboarding } from "@/components/LlmOnboarding";
import { LlmProviderCards } from "@/components/LlmProviderCards";
import { PreferencesCard } from "@/components/PreferencesCard";
import {
	type ProviderInfo,
	fetchLlmSettings,
	fetchProviders,
	loadSelection,
} from "@/lib/llm";
import { useCallback, useEffect, useState } from "react";

export default function AiSettingsPage() {
	const [providers, setProviders] = useState<ProviderInfo[]>([]);
	const [probing, setProbing] = useState(true);
	const [selected, setSelected] = useState("ollama");

	const refreshProviders = useCallback(async () => {
		try {
			const pv = await fetchProviders();
			setProviders(pv.providers);
		} catch {
			/* keep previous list */
		}
	}, []);

	useEffect(() => {
		(async () => {
			await refreshProviders();
			const prev = loadSelection();
			if (prev.provider) setSelected(prev.provider);
			try {
				const s = await fetchLlmSettings();
				if (s.provider) setSelected(s.provider);
			} catch {
				/* backend truth unavailable: local mirror stands */
			}
			setProbing(false);
		})();
	}, [refreshProviders]);

	async function handleCardsChanged() {
		await refreshProviders();
	}

	return (
		<div className="space-y-6" data-testid="ai-settings-page">
			<h2 className="text-2xl font-bold">Settings</h2>
			<PreferencesCard />
			<h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
				AI provider
			</h3>
			<LlmOnboarding mode="full" />
			<ActiveLlmCard />
			<LlmProviderCards
				providers={providers}
				probing={probing}
				selected={selected}
				onChanged={handleCardsChanged}
			/>
		</div>
	);
}
