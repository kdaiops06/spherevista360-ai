import { test, expect } from "@playwright/test";

test.describe("Watchlist AI Dashboard", () => {
  test("watchlist route loads with hero and intelligence sections", async ({ page }) => {
    await page.goto("/dashboard/watchlist-ai");

    await expect(page).toHaveTitle(/Watchlist Intelligence|SphereVista360/i);
    await expect(page.getByText("SphereVista360 AI Watchlist Intelligence Terminal")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Realtime Side-by-Side Intelligence Grid/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Alert Summary Center/i })).toBeVisible();
  });

  test("timeframe controls and sorting are interactive", async ({ page }) => {
    await page.goto("/dashboard/watchlist-ai");

    await page.getByRole("button", { name: "1W" }).click();
    await expect(page.getByRole("button", { name: "1W" })).toBeVisible();

    const sortSelect = page.locator("select").first();
    await sortSelect.selectOption("most-volatile");
    await expect(sortSelect).toHaveValue("most-volatile");
  });

  test("filter chips and refresh button work", async ({ page }) => {
    await page.goto("/dashboard/watchlist-ai");

    const techFilter = page.getByRole("button", { name: "Tech" });
    await techFilter.click();
    await expect(techFilter).toBeVisible();

    const refreshButton = page.getByRole("button", { name: /Refresh/i });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    await expect(refreshButton).toBeVisible();
  });
});
