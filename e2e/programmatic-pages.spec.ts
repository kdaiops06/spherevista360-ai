import { test, expect } from "@playwright/test";

test.describe("Comparison Pages", () => {
  test("comparison index page loads", async ({ page }) => {
    await page.goto("/compare");
    await expect(page).toHaveTitle(/Comparison/i);
    await expect(
      page.getByRole("heading", { name: /Investment Comparisons/i })
    ).toBeVisible();
  });

  test("gold vs dollar comparison page loads", async ({ page }) => {
    await page.goto("/compare/gold-vs-dollar");
    await expect(page).toHaveTitle(/Gold vs Dollar/i);
    await expect(page.getByText("Investment Comparison")).toBeVisible();
  });

  test("gold vs bitcoin comparison page loads", async ({ page }) => {
    await page.goto("/compare/gold-vs-bitcoin");
    await expect(page).toHaveTitle(/Gold vs Bitcoin/i);
  });

  test("comparison has related comparisons section", async ({ page }) => {
    await page.goto("/compare/gold-vs-dollar");
    await expect(page.getByText("Related Comparisons")).toBeVisible();
  });
});

test.describe("Inflation Pages", () => {
  test("US inflation page loads", async ({ page }) => {
    await page.goto("/inflation/united-states-inflation-rate");
    await expect(page).toHaveTitle(/United States.*Inflation/i);
    await expect(page.getByText("Current Rate")).toBeVisible();
    await expect(page.getByText("Target Rate")).toBeVisible();
  });

  test("India inflation page loads", async ({ page }) => {
    await page.goto("/inflation/india-inflation-rate");
    await expect(page).toHaveTitle(/India.*Inflation/i);
  });
});

test.describe("Investment Guide Pages", () => {
  test("how to start investing page loads", async ({ page }) => {
    await page.goto("/investment/how-to-start-investing");
    await expect(page).toHaveTitle(/Start Investing/i);
    await expect(page.getByText("Risk Level")).toBeVisible();
    await expect(page.getByText("Minimum Investment")).toBeVisible();
  });

  test("bitcoin investing guide loads", async ({ page }) => {
    await page.goto("/investment/how-to-invest-in-bitcoin");
    await expect(page).toHaveTitle(/Bitcoin/i);
  });
});
