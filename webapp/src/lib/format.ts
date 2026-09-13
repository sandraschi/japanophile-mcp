export function formatCount(n: number | null | undefined): string {
	if (n == null || Number.isNaN(n)) return "—";
	return new Intl.NumberFormat().format(n);
}

export function dataReady(statusLine: string | undefined): boolean {
	return !!statusLine && !statusLine.includes("MISSING");
}
