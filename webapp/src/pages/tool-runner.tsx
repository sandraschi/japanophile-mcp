import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import {
	cleanArgs,
	emptyArgs,
	relatedPage,
	schemaType,
	toolCategory,
	type JsonSchema,
	type ToolMeta,
} from "@/lib/tool-schema";
import { PageLoading } from "@/components/PageLoading";
import { ToolsHarnessExplainer } from "@/components/tools-harness-explainer";

function fieldValue(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "string") return value;
	if (typeof value === "boolean" || typeof value === "number") return String(value);
	return JSON.stringify(value);
}

export default function ToolRunner() {
	const { name } = useParams();
	const toolName = name ? decodeURIComponent(name) : "";
	const [searchParams] = useSearchParams();
	const [tool, setTool] = useState<ToolMeta | null>(null);
	const [values, setValues] = useState<Record<string, unknown>>({});
	const [loading, setLoading] = useState(true);
	const [running, setRunning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<unknown>(null);

	const load = useCallback(async () => {
		if (!toolName) return;
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/api/tools/${encodeURIComponent(toolName)}`);
			const json = await res.json();
			if (!res.ok) throw new Error(json.detail || `HTTP ${res.status}`);
			const meta = json.tool as ToolMeta;
			const initial = emptyArgs(meta.parameters);
			for (const [key, val] of searchParams.entries()) {
				if (
					key in initial ||
					(meta.parameters?.properties && key in meta.parameters.properties)
				) {
					initial[key] = val;
				}
			}
			setTool(meta);
			setValues(initial);
			setError(null);
			setResult(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load tool");
			setTool(null);
		} finally {
			setLoading(false);
		}
	}, [toolName, searchParams]);

	useEffect(() => {
		load();
	}, [load]);

	const properties = useMemo(
		() => Object.entries(tool?.parameters?.properties || {}),
		[tool],
	);
	const required = useMemo(() => new Set(tool?.parameters?.required || []), [tool]);
	const related = tool ? relatedPage(tool.name) : null;

	const run = async () => {
		if (!tool) return;
		setRunning(true);
		setError(null);
		try {
			const arguments_ = cleanArgs(tool.parameters, values);
			const res = await fetch(`${API_BASE}/api/tools/${encodeURIComponent(tool.name)}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ arguments: arguments_ }),
			});
			const json = await res.json();
			if (!res.ok)
				throw new Error(typeof json.detail === "string" ? json.detail : `HTTP ${res.status}`);
			setResult(json.result);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Invoke failed");
			setResult(null);
		} finally {
			setRunning(false);
		}
	};

	if (loading) {
		return <PageLoading testId="tool-runner-loading" label="Loading tool schema…" />;
	}

	if (!tool) {
		return (
			<div className="space-y-4">
				<Link to="/tools" className="text-sm text-blue-400 hover:underline">
					← Tools
				</Link>
				<p className="text-red-400">{error ?? "Tool not found"}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<Link to="/tools" className="text-sm text-blue-400 hover:underline">
						← Tools
					</Link>
					<h2 className="mt-2 font-mono text-2xl font-bold">{tool.name}</h2>
					<p className="text-sm text-zinc-500">{toolCategory(tool.name)}</p>
				</div>
				{related ? (
					<Link to={related} className="rounded bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
						Related page
					</Link>
				) : null}
			</div>

			<ToolsHarnessExplainer variant="compact" />

			<div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 space-y-4">
				<p className="text-sm text-zinc-400 whitespace-pre-wrap">
					{(tool.description || "No description").slice(0, 600)}
				</p>
				{properties.length === 0 ? (
					<p className="text-sm text-zinc-500">No parameters.</p>
				) : (
					properties.map(([key, schema]) => (
						<Field
							key={key}
							name={key}
							schema={schema}
							required={required.has(key)}
							value={values[key]}
							onChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
						/>
					))
				)}
				<button
					type="button"
					onClick={() => void run()}
					disabled={running}
					className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
					data-testid="tool-runner-run"
				>
					{running ? "Running…" : "Run tool"}
				</button>
				{error ? <p className="text-sm text-red-400">{error}</p> : null}
			</div>

			<div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
				<h3 className="mb-2 font-medium text-white">Result</h3>
				{result == null ? (
					<p className="text-sm text-zinc-500">Not run yet</p>
				) : (
					<pre
						className="max-h-[32rem] overflow-auto rounded border border-zinc-800 bg-zinc-950 p-4 text-xs whitespace-pre-wrap"
						data-testid="tool-runner-result"
					>
						{typeof result === "string" ? result : JSON.stringify(result, null, 2)}
					</pre>
				)}
			</div>
		</div>
	);
}

function Field({
	name,
	schema,
	required,
	value,
	onChange,
}: {
	name: string;
	schema: JsonSchema;
	required: boolean;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const kind = schemaType(schema);
	const label = `${name}${required ? " *" : ""}`;
	if (kind === "boolean") {
		return (
			<label className="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					checked={Boolean(value)}
					onChange={(e) => onChange(e.target.checked)}
				/>
				<span>{label}</span>
			</label>
		);
	}

	if (schema.enum && schema.enum.length > 0) {
		return (
			<label className="block text-sm">
				<span className="text-zinc-400">{label}</span>
				<select
					value={fieldValue(value)}
					onChange={(e) => onChange(e.target.value)}
					className="mt-1 block w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
				>
					{!required ? <option value="">—</option> : null}
					{schema.enum.map((item) => (
						<option key={String(item)} value={String(item)}>
							{String(item)}
						</option>
					))}
				</select>
			</label>
		);
	}

	if (kind === "object" || kind === "array") {
		return (
			<label className="block text-sm">
				<span className="text-zinc-400">{label}</span>
				<textarea
					value={fieldValue(value)}
					onChange={(e) => onChange(e.target.value)}
					rows={kind === "object" ? 4 : 3}
					className="mt-1 block w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs"
				/>
			</label>
		);
	}

	return (
		<label className="block text-sm">
			<span className="text-zinc-400">{label}</span>
			<input
				type={kind === "integer" || kind === "number" ? "number" : "text"}
				value={fieldValue(value)}
				onChange={(e) => onChange(e.target.value)}
				className="mt-1 block w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
			/>
		</label>
	);
}
