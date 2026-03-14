import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads correctly with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SphereVista360/i);
    await expect(
      page.getByRole("heading", { name: /Financial Intelligence/i })
    ).toBeVisible();
  });

  test("displays dashboard preview cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Market Overview")).toBeVisible();
    await expect(page.getByText("Currency Strength")).toBeVisible();
  });

  test("has working navigation links", async ({ page }) => {
    await page.goto("/");
    const dashboardLink = page.getByRole("link", { name: /View Dashboard/i });
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const toolsLink = page.getByRole("link", { name: /Explore Tools/i });
    await expect(toolsLink).toBeVisible();
    await expect(toolsLink).toHaveAttribute("href", "/tools");
  });

  test("displays Global Risk Radar widget", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Global Risk Radar")).toBeVisible();
  });
});
