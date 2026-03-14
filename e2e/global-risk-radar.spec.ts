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
    await expect(page.getByText("Recession Risk")).toBeVisible();
    await expect(page.getByText("Inflation Risk")).toBeVisible();
    await expect(page.getByText("Currency Crisis Risk")).toBeVisible();
    await expect(page.getByText("Geopolitical Risk")).toBeVisible();
    await expect(page.getByText("Debt Crisis Risk")).toBeVisible();
  });

  test("shows methodology section", async ({ page }) => {
    await page.goto("/global-risk-radar");
    await expect(page.getByText("Methodology")).toBeVisible();
  });
});
