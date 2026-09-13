import { API_BASE } from "@/lib/api";

export { API_BASE };

function messageFromErrorBody(
	text: string,
	status: number,
	path: string,
): string {
	const trimmed = text.trim();
	if (!trimmed) return `${path}: ${status}`;
	try {
		const parsed = JSON.parse(trimmed) as {
			detail?: unknown;
			message?: unknown;
			error?: unknown;
		};
		const raw = parsed.detail ?? parsed.message ?? parsed.error;
		if (typeof raw === "string" && raw.trim()) return raw.trim();
		if (raw != null) return JSON.stringify(raw);
	} catch {
		/* plain text body */
	}
	return trimmed;
}

async function parseError(path: string, res: Response): Promise<never> {
	const text = await res.text().catch(() => "");
	throw new Error(messageFromErrorBody(text, res.status, path));
}

export async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`);
	if (!res.ok) await parseError(path, res);
	return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) await parseError(path, res);
	return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
	if (!res.ok) await parseError(path, res);
	return res.json() as Promise<T>;
}
