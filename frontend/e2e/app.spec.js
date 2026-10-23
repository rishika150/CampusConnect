import { test, expect } from "@playwright/test";

test("public landing page links to sign-in and registration", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Discover clubs.")).toBeVisible();
  await page.getByRole("link", { name: "Sign in" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("anonymous users cannot open event management", async ({ page }) => {
  await page.goto("/manage-events");
  await expect(page).toHaveURL(/\/login$/);
});

test("login validation displays API rejection without navigating", async ({ page }) => {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Invalid credentials" }),
    });
  });
  await page.goto("/login");
  await page.getByPlaceholder("student@university.edu").fill("student@example.org");
  await page.getByPlaceholder("Enter your password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("failed My Events request offers retry without showing an empty account", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("campusconnect_token", "test-token");
    localStorage.setItem("campusconnect_user", JSON.stringify({
      id: 123, fullName: "Test Student", email: "student@example.org", role: "STUDENT"
    }));
  });
  await page.route("**/api/v1/users/me", route => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ data: { id: 123, fullName: "Test Student", email: "student@example.org", role: "STUDENT" } })
  }));
  let requests = 0;
  await page.route("**/api/v1/registrations/me", route => {
    requests += 1;
    return route.fulfill({
      status: requests === 1 ? 503 : 200, contentType: "application/json",
      body: requests === 1 ? JSON.stringify({ message: "Service unavailable" }) : JSON.stringify({ data: [] })
    });
  });
  await page.goto("/my-events");
  await expect(page.getByRole("button", { name: "Retry loading registrations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No registered events yet" })).toHaveCount(0);
  await page.getByRole("button", { name: "Retry loading registrations" }).click();
  await expect(page.getByRole("heading", { name: "No registered events yet" })).toBeVisible();
});
