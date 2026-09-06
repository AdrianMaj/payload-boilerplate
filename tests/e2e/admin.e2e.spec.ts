import { test, expect, type Page } from "@playwright/test";

import { login } from "../helpers/login";
import { seedTestUser, cleanupTestUser, testUser } from "../helpers/seedUser";

test.describe("Admin Panel", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await seedTestUser();

    const context = await browser.newContext();
    page = await context.newPage();

    await login({ page, user: testUser });
  });

  test.afterAll(async () => {
    await cleanupTestUser();
  });

  test("can navigate to dashboard", async () => {
    await page.goto("http://localhost:3000/admin");
    await expect(page).toHaveURL("http://localhost:3000/admin");
    const navArtifact = page.locator("#nav-users").first();
    await expect(navArtifact).toBeVisible();
  });
});
