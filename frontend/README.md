# CampusConnect frontend

React 19 + Vite + Tailwind CSS interface for CampusConnect. The project contains public landing/login/registration pages and authenticated dashboard, clubs, events, registrations, profile and authorized event-management pages.

## Local development

Run `npm ci` then `npm run dev`. By default the app expects the Spring Boot API at `http://localhost:8080/api/v1`. Override with `VITE_API_BASE_URL` for other environments.

## Verification

- `npm run lint`: Oxlint.
- `npm run build`: optimized Vite production build.
- `npx playwright test`: browser checks after Playwright and Chromium are installed.

The browser tests in `e2e/app.spec.js` use stubbed responses for targeted failure behavior. The `e2e/live-backend.spec.js` tests additionally need running PostgreSQL and Spring Boot, a bootstrap admin, `E2E_REAL_BACKEND=true`, and a matching `VITE_API_BASE_URL`. See `../.github/workflows/ci.yml` for the exact CI setup. Playwright is currently installed in CI as a non-persisted test dependency; pinning it in both package manifest and lockfile is a separate reproducibility improvement.

## Scope

The browser stores a JWT in `localStorage`; authorization is enforced by the backend, not by hiding frontend controls. See the root README for deployment prerequisites and remaining security/acceptance caveats.
