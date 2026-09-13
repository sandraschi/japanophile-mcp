import { API_BASE } from "@/lib/api";

export interface LogEntry {
	id: string;
	timestamp: string;
	level: string;
	kind: string;
	detail: string;
	meta?: Record<string, unknown>;
}

export interface LogsQueryResponse {
	entries: LogEntry[];
	total: number;
	limit: number;
	offset: number;
	max_entries: number;
	sort: string;
}

export interface LogStats {
	total: number;
	max_entries: number;
	rotation: string;
	by_level: Record<string, number>;
	by_kind: Record<string, number>;
	oldest: string | null;
	newest: string | null;
}

export interface LogQueryParams {
	limit?: number;
	offset?: number;
	level?: string;
	kind?: string;
	search?: string;
	sort?: "asc" | "desc";
	after_id?: string;
}

function buildLogParams(params: LogQueryParams): string {
	const q = new URLSearchParams();
	if (params.limit != null) q.set("limit", String(params.limit));
	if (params.offset != null) q.set("offset", String(params.offset));
	if (params.level) q.set("level", params.level);
	if (params.kind) q.set("kind", params.kind);
	if (params.search) q.set("search", params.search);
	if (params.sort) q.set("sort", params.sort);
	if (params.after_id) q.set("after_id", params.after_id);
	return q.toString();
}

export async function queryLogs(
	params: LogQueryParams = {},
): Promise<LogsQueryResponse> {
	const qs = buildLogParams(params);
	const r = await fetch(`${API_BASE}/api/logs${qs ? `?${qs}` : ""}`);
	if (!r.ok) throw new Error(`Logs query failed: ${r.status}`);
	return r.json() as Promise<LogsQueryResponse>;
}

export async function getLogStats(): Promise<LogStats> {
	const r = await fetch(`${API_BASE}/api/logs/stats`);
	if (!r.ok) throw new Error(`Log stats failed: ${r.status}`);
	return r.json() as Promise<LogStats>;
}

export async function clearLogs(): Promise<void> {
	const r = await fetch(`${API_BASE}/api/logs`, { method: "DELETE" });
	if (!r.ok) throw new Error(`Clear logs failed: ${r.status}`);
}

export async function downloadLogsExport(
	format: "json" | "csv",
	filters: Omit<LogQueryParams, "limit" | "offset" | "after_id"> = {},
): Promise<void> {
	const q = buildLogParams({ ...filters, limit: undefined, offset: undefined });
	const r = await fetch(
		`${API_BASE}/api/logs/export?format=${format}${q ? `&${q}` : ""}`,
	);
	if (!r.ok) throw new Error(`Export failed: ${r.status}`);
	const blob = await r.blob();
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `japanophile-mcp-logs.${format}`;
	anchor.click();
	URL.revokeObjectURL(url);
}
