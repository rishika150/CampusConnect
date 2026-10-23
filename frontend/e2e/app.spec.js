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
  let recover = false;
  await page.route("**/api/v1/registrations/me", route => {
    return route.fulfill({
      status: recover ? 200 : 503, contentType: "application/json",
      body: recover ? JSON.stringify({ data: [] }) : JSON.stringify({ message: "Service unavailable" })
    });
  });
  await page.goto("/my-events");
  await expect(page.getByRole("button", { name: "Retry loading registrations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No registered events yet" })).toHaveCount(0);
  recover = true;
  await page.getByRole("button", { name: "Retry loading registrations" }).click();
  await expect(page.getByRole("heading", { name: "No registered events yet" })).toBeVisible();
});

test("student navigation has accurate headings and no inactive global controls", async ({ page }) => {
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
  await page.route("**/api/v1/clubs/me", route => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ data: [] })
  }));
  await page.route("**/api/v1/registrations/me", route => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ data: [] })
  }));
  await page.goto("/my-events");
  await expect(page.locator("header").first().locator("h1")).toHaveText("My Events");
  await expect(page.getByPlaceholder("Search clubs and events")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Manage events" })).toHaveCount(0);
  await page.goto("/events/123");
  await expect(page.locator("header").first().locator("h1")).toHaveText("Event Details");
});

test("Google Forms event opens securely with authenticated user prefill", async ({ page }) => {
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
  await page.route("**/api/v1/registrations/me", route => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ data: [] })
  }));
  await page.route("**/api/v1/clubs/me", route => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ data: [] })
  }));
  await page.route("**/api/v1/events/55", route => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ data: {
      id: 55, title: "External Registration Workshop", description: "Test event with an organizer managed form.",
      startTime: "2030-01-20T10:00:00Z", endTime: "2030-01-20T12:00:00Z",
      registrationDeadline: "2030-01-19T10:00:00Z", status: "UPCOMING",
      venue: "Campus Hall", capacity: 50,
      registrationFormUrl: "https://docs.google.com/forms/d/e/demo/viewform",
      formNameEntryId: "entry.123", formEmailEntryId: "entry.456",
    } })
  }));
  await page.goto("/events/55");
  const formLink = page.getByRole("link", { name: /Register via Google Forms/ });
  await expect(formLink).toHaveAttribute("target", "_blank");
  await expect(formLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(formLink).toHaveAttribute("href", /entry\.123=Test\+Student/);
  await expect(formLink).toHaveAttribute("href", /entry\.456=student%40example.org/);
});
