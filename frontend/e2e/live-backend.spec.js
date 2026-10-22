import { test, expect } from "@playwright/test";

const backend = "http://127.0.0.1:8080/api/v1";
const adminEmail = "ci-admin@example.org";
const adminPassword = "CI-Test-Admin-Password-2026";

test.describe("real backend user journeys", () => {
  test.skip(!process.env.E2E_REAL_BACKEND, "Runs only with a live Spring Boot + PostgreSQL backend");

  test("student signs up, registers for an event and cancels registration", async ({ page, request }) => {
    const suffix = Date.now().toString(36);
    const studentEmail = `e2e-student-${suffix}@example.org`;
    const adminLogin = await request.post(`${backend}/auth/login`, { data: { email: adminEmail, password: adminPassword } });
    expect(adminLogin.ok(), await adminLogin.text()).toBeTruthy();
    const adminToken = (await adminLogin.json()).data.accessToken;
    const headers = { Authorization: `Bearer ${adminToken}` };

    const clubResult = await request.post(`${backend}/clubs`, {
      headers,
      data: {
        name: `E2E Club ${suffix}`,
        description: "A campus club created during automated browser integration testing.",
        category: "TECHNOLOGY", contactEmail: "events@example.org", logoUrl: null
      }
    });
    expect(clubResult.ok(), await clubResult.text()).toBeTruthy();
    const clubId = (await clubResult.json()).data.id;

    const start = Date.now() + 7 * 86400000;
    const eventResult = await request.post(`${backend}/events`, {
      headers,
      data: {
        clubId, title: `E2E Workshop ${suffix}`,
        description: "A future-dated test workshop used to verify booking and cancellation.",
        venue: "Testing Auditorium",
        startTime: new Date(start).toISOString(),
        endTime: new Date(start + 7200000).toISOString(),
        registrationDeadline: new Date(start - 86400000).toISOString(),
        capacity: 2, category: "WORKSHOP", bannerUrl: null
      }
    });
    expect(eventResult.ok(), await eventResult.text()).toBeTruthy();
    const eventId = (await eventResult.json()).data.id;

    await page.goto("/register");
    await page.getByPlaceholder("Rishika Sharan").fill("Test Student");
    await page.getByPlaceholder("student@university.edu").fill(studentEmail);
    await page.getByPlaceholder("Minimum 8 characters").fill("StudentPass123");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto(`/events/${eventId}`);
    await expect(page.getByRole("heading", { name: `E2E Workshop ${suffix}` })).toBeVisible();
    await page.getByRole("button", { name: "Register for event" }).click();
    await expect(page.getByRole("button", { name: "Cancel registration" })).toBeVisible();
    await page.goto("/my-events");
    await expect(page.getByText(`E2E Workshop ${suffix}`)).toBeVisible();
    await page.getByRole("button", { name: "Cancel registration" }).click();
    await expect(page.getByRole("heading", { name: "No registered events yet" })).toBeVisible();

    const registrations = await request.get(`${backend}/registrations/me`, {
      headers: { Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("campusconnect_token"))}` }
    });
    expect(registrations.ok()).toBeTruthy();
    expect((await registrations.json()).data).toEqual([]);
  });

  test("administrator can create a club and publish an event in the UI", async ({ page, request }) => {
    const suffix = Date.now().toString(36);
    await page.goto("/login");
    await page.getByPlaceholder("student@university.edu").fill(adminEmail);
    await page.getByPlaceholder("Enter your password").fill(adminPassword);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/manage-events");
    await expect(page.getByRole("heading", { name: "Manage campus events" })).toBeVisible();

    const clubSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Create club" }) });
    await clubSection.getByLabel("Club name").fill(`Browser Club ${suffix}`);
    await clubSection.getByLabel("Contact email").fill("browser@example.org");
    await clubSection.getByLabel("Description").fill("A browser-created test club for full integration workflow verification.");
    await clubSection.getByRole("button", { name: "Create club" }).click();
    await expect(page.getByText("Club created successfully.")).toBeVisible();

    const eventSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Create event" }) });
    await eventSection.getByLabel("Organizing club").selectOption({ label: `Browser Club ${suffix}` });
    await eventSection.getByLabel("Title").fill(`Browser Event ${suffix}`);
    await eventSection.getByLabel("Venue").fill("Main Auditorium");
    await eventSection.getByLabel("Description").fill("A real browser test for university administrator event publishing.");
    const when = (days) => {
      const d = new Date(Date.now() + days * 86400000);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    };
    await eventSection.getByLabel("Starts").fill(when(8));
    await eventSection.getByLabel("Ends").fill(when(9));
    await eventSection.getByLabel("Registration closes").fill(when(7));
    await eventSection.getByRole("button", { name: "Publish event" }).click();
    await expect(page.getByText("Event created successfully.")).toBeVisible();

    const response = await request.get(`${backend}/events?search=${encodeURIComponent(`Browser Event ${suffix}`)}`);
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).data.content.some(e => e.title === `Browser Event ${suffix}`)).toBeTruthy();
  });
});


test("coordinator can publish only for the assigned club", async ({ request }) => {
  test.skip(!process.env.E2E_REAL_BACKEND, "Requires real API and PostgreSQL");
  const suffix = Math.random().toString(36).slice(2, 10);
  const adminLogin = await request.post(`${backend}/auth/login`, {
    data: { email: adminEmail, password: adminPassword }
  });
  expect(adminLogin.ok()).toBeTruthy();
  const adminHeaders = { Authorization: `Bearer ${(await adminLogin.json()).data.accessToken}` };

  async function createClub(name) {
    const res = await request.post(`${backend}/clubs`, {
      headers: adminHeaders,
      data: { name, description: "A campus society created for coordinator authorization testing.",
        category: "TECHNOLOGY", contactEmail: "test@example.org" }
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    return (await res.json()).data.id;
  }
  const allowedClub = await createClub(`Coordinator Club ${suffix}`);
  const otherClub = await createClub(`Different Club ${suffix}`);
  const email = `coordinator-${suffix}@example.org`;
  const registration = await request.post(`${backend}/auth/register`, {
    data: { fullName: "Integration Coordinator", email, password: "TestPassword123" }
  });
  expect(registration.ok(), await registration.text()).toBeTruthy();
  const studentData = (await registration.json()).data;
  const studentHeaders = { Authorization: `Bearer ${studentData.accessToken}` };
  const join = await request.post(`${backend}/clubs/${allowedClub}/join`, { headers: studentHeaders });
  expect(join.ok(), await join.text()).toBeTruthy();
  const assign = await request.put(`${backend}/clubs/${allowedClub}/members/${studentData.user.id}/role`, {
    headers: adminHeaders, data: { role: "COORDINATOR" }
  });
  expect(assign.ok(), await assign.text()).toBeTruthy();

  const start = Date.now() + 12 * 86400000;
  const payload = {
    clubId: allowedClub, title: `Coordinator Workshop ${suffix}`,
    description: "A real integration event testing per-club coordinator access.",
    venue: "Test Lab", startTime: new Date(start).toISOString(),
    endTime: new Date(start + 7200000).toISOString(),
    registrationDeadline: new Date(start - 86400000).toISOString(),
    capacity: 25, category: "WORKSHOP"
  };
  const ownEvent = await request.post(`${backend}/events`, { headers: studentHeaders, data: payload });
  expect(ownEvent.status(), await ownEvent.text()).toBe(201);

  const otherEvent = await request.post(`${backend}/events`, {
    headers: studentHeaders, data: { ...payload, clubId: otherClub, title: `Unauthorized ${suffix}` }
  });
  expect(otherEvent.status(), await otherEvent.text()).toBe(403);
});

test("security boundaries reject anonymous and student admin access", async ({ request }) => {
  test.skip(!process.env.E2E_REAL_BACKEND, "Requires real API and PostgreSQL");
  const suffix = Math.random().toString(36).slice(2, 10);
  const anonymous = await request.get(`${backend}/users/me`);
  expect(anonymous.status()).toBe(401);

  const registration = await request.post(`${backend}/auth/register`, {
    data: { fullName: "Security Student", email: `security-${suffix}@example.org`, password: "StudentPass123" }
  });
  expect(registration.status(), await registration.text()).toBe(201);
  const headers = { Authorization: `Bearer ${(await registration.json()).data.accessToken}` };
  const denied = await request.post(`${backend}/admin/import/events/google-sheet`, {
    headers, data: { url: "https://docs.google.com/spreadsheets/d/example/export?format=csv", source: "test" }
  });
  expect(denied.status()).toBe(403);

  const invalidRegistration = await request.post(`${backend}/auth/register`, {
    data: { fullName: "", email: "not-an-email", password: "short" }
  });
  expect(invalidRegistration.status()).toBe(400);

  const blockedOrigin = await request.fetch(`${backend}/events`, {
    method: "OPTIONS",
    headers: { Origin: "https://untrusted.example.org", "Access-Control-Request-Method": "GET" }
  });
  expect(blockedOrigin.status()).toBe(403);
});
