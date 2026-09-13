import {
	JLPT_LEVELS,
	type JlptLevel,
	type UserPrefs,
	fetchUserPrefs,
	saveUserPrefs,
} from "@/lib/prefs";
import { useEffect, useState } from "react";

export function PreferencesCard() {
	const [prefs, setPrefs] = useState<UserPrefs | null>(null);
	const [msg, setMsg] = useState("");
	const [err, setErr] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchUserPrefs()
			.then(({ prefs: p }) => setPrefs(p))
			.catch(() => setPrefs(null));
	}, []);

	if (!prefs) {
		return (
			<section
				className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4"
				data-testid="prefs-loading"
			>
				<p className="text-sm text-zinc-500">Loading preferences…</p>
			</section>
		);
	}

	const save = async () => {
		setSaving(true);
		setMsg("");
		setErr("");
		try {
			const { prefs: saved } = await saveUserPrefs(prefs);
			setPrefs(saved);
			setMsg("Saved. Learn quiz uses your study level only.");
		} catch (e) {
			setErr(e instanceof Error ? e.message : String(e));
		} finally {
			setSaving(false);
		}
	};

	return (
		<section
			className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4 space-y-4"
			data-testid="prefs-card"
		>
			<div>
				<h3 className="text-lg font-semibold text-zinc-100">
					Learning preferences
				</h3>
				<p className="mt-1 text-sm text-zinc-500">
					Your JLPT study level controls which quiz levels appear (e.g. N2 hides
					N5–N3). Progress is stored under one session id across Learn,
					Dashboard, and Diary.
				</p>
			</div>
			<label className="block text-sm">
				<span className="text-zinc-400">Display name (optional)</span>
				<input
					data-testid="prefs-display-name"
					value={prefs.display_name}
					onChange={(e) => setPrefs({ ...prefs, display_name: e.target.value })}
					className="mt-1 w-full max-w-md rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
					placeholder="Sandra"
				/>
			</label>
			<label className="block text-sm">
				<span className="text-zinc-400">JLPT study level</span>
				<select
					data-testid="prefs-jlpt-level"
					value={prefs.default_jlpt_level}
					onChange={(e) =>
						setPrefs({
							...prefs,
							default_jlpt_level: e.target.value as JlptLevel,
						})
					}
					className="mt-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
				>
					{JLPT_LEVELS.map((l) => (
						<option key={l} value={l}>
							{l}
						</option>
					))}
				</select>
				<p className="mt-1 text-xs text-zinc-500">
					Quiz levels offered:{" "}
					{JLPT_LEVELS.slice(
						JLPT_LEVELS.indexOf(prefs.default_jlpt_level),
					).join(", ")}
				</p>
			</label>
			<label className="block text-sm">
				<span className="text-zinc-400">Progress session id</span>
				<input
					data-testid="prefs-session-id"
					value={prefs.progress_session_id}
					onChange={(e) =>
						setPrefs({ ...prefs, progress_session_id: e.target.value })
					}
					className="mt-1 w-full max-w-md rounded border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs"
				/>
			</label>
			<div className="flex flex-wrap items-center gap-3">
				<button
					type="button"
					data-testid="prefs-save"
					disabled={saving}
					onClick={save}
					className="rounded bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500 disabled:opacity-50"
				>
					{saving ? "Saving…" : "Save preferences"}
				</button>
				{msg ? (
					<span className="text-sm text-emerald-400" data-testid="prefs-msg">
						{msg}
					</span>
				) : null}
				{err ? (
					<span className="text-sm text-red-400" data-testid="prefs-error">
						{err}
					</span>
				) : null}
			</div>
		</section>
	);
}
