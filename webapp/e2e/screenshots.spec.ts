import { expect, test } from "@playwright/test";

// Stable 1280x720 captures into docs/screenshots for the README Preview.
// Same run shape as the audit suite (dev-stack webServer from base config).
test.use({ viewport: { width: 1280, height: 720 } });

const shots = [
	["dashboard", "/"],
	["learn", "/learn"],
	["know", "/know"],
	["games", "/games"],
	["chat", "/chat"],
] as const;

for (const [name, route] of shots) {
	test(`shot: ${name}`, async ({ page }) => {
		await page.goto(route);
		await expect(page.getByTestId("app-title")).toBeVisible();
		await page.waitForTimeout(1500);
		await page.screenshot({ path: `../docs/screenshots/${name}.png` });
	});
}
