import { test, expect } from "@playwright/test";

test.describe("Currency Pair SEO Pages", () => {
  test("USD to INR page loads correctly", async ({ page }) => {
    await page.goto("/usd-to-inr");
    await expect(page).toHaveTitle(/USD.*INR|US Dollar.*Indian Rupee/i);
    await expect(
      page.getByRole("heading", { name: /Convert.*US Dollar.*Indian Rupee/i })
    ).toBeVisible();
    // Converter widget should exist
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test("EUR to USD page renders converter", async ({ page }) => {
    await page.goto("/eur-to-usd");
    await expect(page).toHaveTitle(/EUR.*USD|Euro.*US Dollar/i);
    await expect(page.getByText("EUR/USD")).toBeVisible();
  });

  test("GBP to JPY page loads with SEO content", async ({ page }) => {
    await page.goto("/gbp-to-jpy");
    await expect(page).toHaveTitle(/GBP.*JPY/i);
    // SEO content sections
    await expect(page.getByText("Exchange Rate")).toBeVisible();
  });

  test("has reverse conversion link", async ({ page }) => {
    await page.goto("/usd-to-inr");
    const reverseLink = page.getByRole("link", { name: /Convert INR to USD/i });
    await expect(reverseLink).toBeVisible();
    await expect(reverseLink).toHaveAttribute("href", "/inr-to-usd");
  });

  test("has related currency pair links", async ({ page }) => {
    await page.goto("/usd-to-inr");
    await expect(
      page.getByText("Convert USD to Other Currencies")
    ).toBeVisible();
  });

  test("invalid pair returns 404", async ({ page }) => {
    const response = await page.goto("/abc-to-xyz");
    expect(response?.status()).toBe(404);
  });
});
