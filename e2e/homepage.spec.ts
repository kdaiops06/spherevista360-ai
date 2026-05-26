import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads correctly with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SphereVista360/i);
    await expect(
      page
        .getByRole("heading", {
          name: "Understand Global Markets Through Data and Macro Intelligence",
        })
        .first()
    ).toBeVisible();
  });

  test("displays market pulse and briefing sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Macro Signals at a Glance").first()).toBeVisible();
    await expect(page.getByText("AI Morning Briefing").first()).toBeVisible();
  });

  test("has working navigation links", async ({ page }) => {
    await page.goto("/");
    const dashboardLink = page.getByRole("link", { name: /Open Dashboard/i });
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const marketsLink = page.getByRole("link", { name: "Explore Markets", exact: true });
    await expect(marketsLink).toBeVisible();
    await expect(marketsLink).toHaveAttribute("href", "/currencies");
  });

  test("displays Global Market Stress Radar widget", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Global Market Stress Radar").first()).toBeVisible();
  });
});
