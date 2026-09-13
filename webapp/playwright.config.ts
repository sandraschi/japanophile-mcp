import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 60000,
	retries: 1,
	use: {
		baseURL: "http://127.0.0.1:11194",
		screenshot: "only-on-failure",
	},
	webServer: {
		// Owns the whole stack: backend child + vite foreground, both reaped after.
		// Never rely on a manually started backend (tool shells reap orphans).
		command: "pwsh ./scripts/dev-stack.ps1",
		url: "http://127.0.0.1:11194",
		timeout: 120000,
		reuseExistingServer: false,
	},
});
