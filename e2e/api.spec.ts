import { test, expect } from "@playwright/test";

test.describe("API Routes", () => {
  test("currency conversion API returns valid data", async ({ request }) => {
    const response = await request.get(
      "/api/convert?from=USD&to=INR&amount=100"
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("result");
    expect(data).toHaveProperty("rate");
    expect(typeof data.result).toBe("number");
    expect(data.result).toBeGreaterThan(0);
  });

  test("API rejects missing parameters", async ({ request }) => {
    const response = await request.get("/api/convert?from=USD");
    expect(response.status()).toBe(400);
  });

  test("API rejects invalid currency codes", async ({ request }) => {
    const response = await request.get(
      "/api/convert?from=INVALID&to=USD&amount=100"
    );
    expect(response.status()).toBe(400);
  });
});
