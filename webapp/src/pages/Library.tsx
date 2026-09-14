import { PageTabs } from "@/components/PageTabs";
import type { LibraryBook, MediaResult } from "@/lib/api";
import { api } from "@/lib/api";
import { useState } from "react";

type Tab = "read" | "watch";

export default function LibraryPage() {
	const [tab, setTab] = useState<Tab>("read");
	return (
		<div>
			<h2 className="mb-2 text-2xl font-bold">Library</h2>
			<p className="mb-4 text-sm text-zinc-500">
				Sandra's own Calibre and Plex libraries, searched live via the{" "}
				<code className="text-zinc-400">crossconnect</code> MCP tool — nothing
				vendored here, just a thin proxy. Either server can be offline; that
				shows as a message below, not an error page.
			</p>
			<PageTabs
				tabs={[
					{ id: "read", label: "Read (calibre-mcp)" },
					{ id: "watch", label: "Watch (plex-mcp)" },
				]}
				active={tab}
				onChange={(id) => setTab(id as Tab)}
				testId="library-tabs"
			/>
			{tab === "read" ? <ReadPanel /> : <WatchPanel />}
		</div>
	);
}

function ReadPanel() {
	const [q, setQ] = useState("japanese literature");
	const [tag, setTag] = useState("");
	const [msg, setMsg] = useState("");
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState<LibraryBook[]>([]);

	const run = async () => {
		if (!q.trim() && !tag.trim()) {
			setMsg("Enter a query or a tag.");
			return;
		}
		setMsg("");
		setLoading(true);
		try {
			const r = await api.librarySearch(q, tag, 20);
			if (!r.success) {
				setMsg(r.message);
				setRows([]);
				return;
			}
			setRows(r.data ?? []);
			if ((r.data ?? []).length === 0) setMsg("No matches in your library.");
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="mb-3 flex flex-wrap gap-2">
				<input
					data-testid="library-read-query"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && run()}
					placeholder="title, author..."
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				/>
				<input
					data-testid="library-read-tag"
					value={tag}
					onChange={(e) => setTag(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && run()}
					placeholder="tag (e.g. Japanese Literature)"
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				/>
				<button
					type="button"
					data-testid="library-read-search"
					onClick={run}
					disabled={loading}
					className="rounded bg-zinc-100 px-4 py-2 text-sm text-black disabled:opacity-50"
				>
					{loading ? "Searching…" : "Search"}
				</button>
			</div>
			{msg && (
				<p className="text-amber-400" data-testid="library-read-msg">
					{msg}
				</p>
			)}
			<ul data-testid="library-read-results" className="grid gap-2">
				{rows.map((b) => (
					<li key={b.id} className="rounded border border-zinc-800 p-3 text-sm">
						<div className="font-medium">{b.title}</div>
						{b.authors.length > 0 && (
							<div className="text-zinc-400">{b.authors.join(", ")}</div>
						)}
						{b.tags.length > 0 && (
							<div className="mt-1 flex flex-wrap gap-1">
								{b.tags.map((t) => (
									<span
										key={t}
										className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
									>
										{t}
									</span>
								))}
							</div>
						)}
						{b.rating != null && (
							<div className="mt-1 text-xs text-zinc-500">
								Rating: {b.rating}/10
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

const MEDIA_TYPES = [
	"",
	"movie",
	"show",
	"episode",
	"artist",
	"album",
	"track",
	"photo",
];

function WatchPanel() {
	const [q, setQ] = useState("anime");
	const [mediaType, setMediaType] = useState("show");
	const [msg, setMsg] = useState("");
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState<MediaResult[]>([]);

	const run = async () => {
		if (!q.trim()) {
			setMsg("Enter a query.");
			return;
		}
		setMsg("");
		setLoading(true);
		try {
			const r = await api.mediaSearch(q, mediaType, 20);
			if (!r.success) {
				setMsg(r.message);
				setRows([]);
				return;
			}
			setRows(r.data ?? []);
			if ((r.data ?? []).length === 0) setMsg("No matches in your library.");
		} catch (e) {
			setMsg(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="mb-3 flex flex-wrap gap-2">
				<input
					data-testid="library-watch-query"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && run()}
					placeholder="title, theme..."
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				/>
				<select
					data-testid="library-watch-type"
					value={mediaType}
					onChange={(e) => setMediaType(e.target.value)}
					className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				>
					{MEDIA_TYPES.map((t) => (
						<option key={t || "any"} value={t}>
							{t || "any type"}
						</option>
					))}
				</select>
				<button
					type="button"
					data-testid="library-watch-search"
					onClick={run}
					disabled={loading}
					className="rounded bg-zinc-100 px-4 py-2 text-sm text-black disabled:opacity-50"
				>
					{loading ? "Searching…" : "Search"}
				</button>
			</div>
			{msg && (
				<p className="text-amber-400" data-testid="library-watch-msg">
					{msg}
				</p>
			)}
			<ul data-testid="library-watch-results" className="grid gap-2">
				{rows.map((m) => (
					<li key={m.id} className="rounded border border-zinc-800 p-3 text-sm">
						<div className="flex items-center gap-2">
							<span className="font-medium">{m.title}</span>
							<span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
								{m.type}
							</span>
						</div>
						{m.summary && <p className="mt-1 text-zinc-400">{m.summary}</p>}
					</li>
				))}
			</ul>
		</div>
	);
}
