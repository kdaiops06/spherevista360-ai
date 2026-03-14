import { test, expect } from "@playwright/test";

test.describe("Tools Pages", () => {
  test("tools index page loads with all tools", async ({ page }) => {
    await page.goto("/tools");
    await expect(page).toHaveTitle(/Financial Tools/i);
    await expect(
      page.getByRole("heading", { name: /Financial Tools/i })
    ).toBeVisible();
    // Check for key tools
    await expect(page.getByText("Currency Converter")).toBeVisible();
    await expect(page.getByText("SIP Calculator")).toBeVisible();
    await expect(page.getByText("Compound Interest")).toBeVisible();
  });

  test("currency converter page loads and has form", async ({ page }) => {
    await page.goto("/tools/currency-converter");
    await expect(page).toHaveTitle(/Currency Converter/i);
    // Should have amount input
    const amountInput = page.locator('input[type="number"]').first();
    await expect(amountInput).toBeVisible();
  });

  test("compound interest calculator works", async ({ page }) => {
    await page.goto("/tools/compound-interest");
    await expect(page).toHaveTitle(/Compound Interest/i);

    // Verify inputs exist
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
  });

  test("inflation calculator page loads", async ({ page }) => {
    await page.goto("/tools/inflation-calculator");
    await expect(page).toHaveTitle(/Inflation/i);
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
  });

  test("SIP calculator page loads and calculates", async ({ page }) => {
    await page.goto("/tools/sip-calculator");
    await expect(page).toHaveTitle(/SIP Calculator/i);
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
  });

  test("EMI calculator page loads", async ({ page }) => {
    await page.goto("/tools/emi-calculator");
    await expect(page).toHaveTitle(/EMI Calculator/i);
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
  });

  test("recession tracker page loads", async ({ page }) => {
    await page.goto("/tools/recession-tracker");
    await expect(page).toHaveTitle(/Recession/i);
  });

  test("currency strength page loads", async ({ page }) => {
    await page.goto("/tools/currency-strength");
    await expect(page).toHaveTitle(/Currency Strength/i);
  });

  test("gold vs dollar page loads", async ({ page }) => {
    await page.goto("/tools/gold-vs-dollar");
    await expect(page).toHaveTitle(/Gold vs Dollar/i);
  });

  test("investment return calculator loads", async ({ page }) => {
    await page.goto("/tools/investment-return");
    await expect(page).toHaveTitle(/Investment Return/i);
  });

  test("currency crisis tracker loads", async ({ page }) => {
    await page.goto("/tools/currency-crisis");
    await expect(page).toHaveTitle(/Currency Crisis/i);
  });

  test("purchasing power calculator loads", async ({ page }) => {
    await page.goto("/tools/purchasing-power");
    await expect(page).toHaveTitle(/Purchasing Power/i);
  });
});
