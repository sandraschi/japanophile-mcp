import { expect, test } from "@playwright/test";

test("dashboard loads with KPIs", async ({ page }) => {
	const errors: string[] = [];
	page.on("console", (m) => {
		if (m.type() === "error") errors.push(m.text());
	});
	await page.goto("/");
	await expect(page.getByTestId("app-title")).toBeVisible();
	await expect(page.getByTestId("dashboard-hero")).toBeVisible();
	await expect(page.getByTestId("kpi-grid")).toBeVisible();
	await expect(page.getByTestId("kpi-kanji")).toContainText("13,108");
	expect(errors).toEqual([]);
});

test("sidebar navigates all catch-them-all pages", async ({ page }) => {
	await page.goto("/");
	for (const route of [
		"learn",
		"know",
		"games",
		"chat",
		"skills",
		"tools",
		"settings",
		"help",
		"logs",
	]) {
		await page
			.getByTestId("sidebar")
			.getByRole("link", { name: new RegExp(route, "i") })
			.click();
		await expect(page).toHaveURL(new RegExp(`/${route}`));
	}
});

test("learn: kanji lookup renders 水", async ({ page }) => {
	await page.goto("/learn");
	await page.getByTestId("kanji-input").fill("水");
	await page.getByTestId("kanji-lookup").click();
	await expect(page.getByTestId("kanji-results")).toContainText("水");
});

test("learn: quiz round-trip records progress", async ({ page }) => {
	await page.goto("/learn");
	await page.getByTestId("tab-quiz").click();
	await page.getByTestId("quiz-next").click();
	await expect(page.getByTestId("quiz-card")).toBeVisible();
	await page.locator("[data-testid^='quiz-opt-']").first().click();
	await expect(page.getByTestId("quiz-verdict")).toBeVisible();
	await expect(page.getByTestId("quiz-score")).toContainText("/");
});

test("know: manga page opens", async ({ page }) => {
	await page.goto("/know");
	await page.getByTestId("know-manga").click();
	await expect(page.getByTestId("know-article")).not.toBeEmpty();
});

test("skills page shows japanophile-expert", async ({ page }) => {
	await page.goto("/skills");
	await expect(page.getByTestId("skill-text")).toContainText(
		"japanophile-expert",
	);
});

test("tools runner executes kanji lookup", async ({ page }) => {
	await page.goto("/tools");
	await page.getByTestId("tool-kanji lookup").click();
	await expect(page.getByTestId("tools-output")).toContainText("水");
});

test("logs diagnostics show backend data", async ({ page }) => {
	await page.goto("/logs");
	await expect(page.getByTestId("logs-output")).toContainText(
		"kanji_database.db",
	);
});
