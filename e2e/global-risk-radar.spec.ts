import { test, expect } from "@playwright/test";

test.describe("Global Risk Radar", () => {
  test("page loads with risk score", async ({ page }) => {
    await page.goto("/global-risk-radar");
    await expect(page).toHaveTitle(/Global Risk Radar/i);
    await expect(
      page.getByRole("heading", { name: /Global Risk Radar/i })
    ).toBeVisible();
  });

  test("displays all 5 risk categories", async ({ page }) => {
    await page.goto("/global-risk-radar");
    const main = page.locator("main");
    await expect(main.getByText("Recession Risk").first()).toBeVisible();
    await expect(main.getByText("Inflation Risk").first()).toBeVisible();
    await expect(main.getByText("Currency Crisis Risk").first()).toBeVisible();
    await expect(main.getByText("Geopolitical Risk").first()).toBeVisible();
    await expect(main.getByText("Debt Crisis Risk").first()).toBeVisible();
  });

  test("shows methodology section", async ({ page }) => {
    await page.goto("/global-risk-radar");
    await expect(page.getByText("Methodology")).toBeVisible();
  });
});
