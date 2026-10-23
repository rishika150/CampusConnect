# CampusConnect

A full-stack campus community MVP for club membership, event discovery, registration and role-scoped event management. Built with React, Spring Boot and PostgreSQL. Public production deployment is not yet complete.

---

## ✨ Highlights

- JWT-based Authentication & Authorization
- Secure Protected Routes
- Club Discovery & Membership Management
- Event Discovery with Search & Filters
- Personalized Dashboard
- Student Profile
- Responsive Modern UI
- RESTful API Architecture
- PostgreSQL Persistence

---

# Screenshots

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Clubs

![Clubs](screenshots/clubs.png)

---

## Events

![Events](screenshots/events.png)

---

## My Clubs

![My Clubs](screenshots/my-clubs.png)

---

## Profile

![Profile](screenshots/profile.png)

---

# Tech Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- Lucide React

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven

---

# Features

## Authentication

- Secure Login
- JWT Authentication
- Protected Routes
- Persistent Login Session

---

## Dashboard

- Personalized Welcome Screen
- Club Statistics
- Upcoming Events
- Responsive Cards
- Quick Navigation

---

## Clubs

- Browse Student Clubs
- Search Communities
- Category Filters
- Join Club
- Leave Club
- Membership Status

---

## Events

- Browse Upcoming Events
- Search Events
- Category Filters
- Ticket-style Event Cards
- Event Information
- Empty & Loading States

---

## My Clubs

- View Joined Communities
- Membership Details
- Search Joined Clubs
- Leave Membership

---

## Profile

- Student Information
- Membership Summary
- Upcoming Event Summary
- Account Status

---

# Project Architecture

```
                React + Vite
                      │
                 Axios Client
                      │
                REST API Calls
                      │
             Spring Boot Backend
                      │
        Spring Security + JWT Filter
                      │
             Service Layer
                      │
          Spring Data JPA
                      │
                 PostgreSQL
```

---

# Project Structure

```
CampusConnect
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── security
│   └── config
│
├── frontend
│   ├── components
│   ├── layouts
│   ├── pages
│   ├── services
│   ├── context
│   └── assets
│
├── screenshots
│
└── README.md
```

---

# Local Setup

## Clone Repository

```bash
git clone <repository-url>
cd CampusConnect
```

---

## Backend

Set a strong Base64-encoded JWT secret before starting. For local development, copy `.env.example` to `.env` and export the values in your shell (Docker Compose reads `.env` for Postgres only). Generate a secret with `openssl rand -base64 48`. Never commit the generated secret.

```bash
export JWT_SECRET="$(openssl rand -base64 48)"
cd backend
./mvnw spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# Environment Variables

## Backend

```
JWT_SECRET=

DB_URL=

DB_USERNAME=

DB_PASSWORD=
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

The backend listens on `PORT` when supplied by the deployment platform, otherwise `SERVER_PORT` or port 8080.

## Frontend

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

# API Modules

- Authentication
- Clubs
- Club Memberships
- Events
- User Profile

---

# Future Enhancements

- Announcement System
- Notifications
- Calendar Integration
- QR Event Check-in

---

# Author

**Rishika Sharan**

B.Tech Computer Science (Artificial Intelligence)

Indira Gandhi Delhi Technical University for Women (IGDTUW)

GitHub: https://github.com/rishika150

## Interview demo data

The optional Spring profile `demo` seeds **8 fictional clubs and 32 example events** with dates relative to the first run. Run the backend with `SPRING_PROFILES_ACTIVE=demo` and your usual PostgreSQL and JWT environment settings. Seeds skip previously created club/event titles and do **not** represent actual university announcements. The normal profile does not seed any data.

## Admin event CSV import

A university administrator can upload a UTF-8 CSV at `POST /api/v1/admin/import/events/csv` (multipart field `file`) or through the management workspace. Required headers: `externalId,clubId,title,description,venue,startTime,endTime,registrationDeadline,capacity,category`. Optional: `bannerUrl`. All dates must be ISO-8601 UTC instants, e.g. `2026-12-01T10:00:00Z`. The upload is limited to 1 MB and processing is capped at 200 rows. Each row is validated and reports errors. Repeated imports skip rows matching an existing club ID, case-insensitive event title, and exact start timestamp. Imports use source-scoped external IDs and update existing records. A concurrent first import of the same previously nonexistent external ID has not been explicitly race-tested; the database uniqueness constraint prevents duplicate source keys, but graceful conflict handling still needs verification.


## Google Sheets event sync (no paid API)

University admins can publish an events spreadsheet as CSV and submit the **direct CSV export URL** to the management workspace. The backend accepts only HTTPS links at `docs.google.com/spreadsheets/d/...`, with redirects disabled, a 12-second request timeout, and a 1 MB response limit. The sheet must be publicly readable; private spreadsheets are not supported.

The CSV now requires `externalId` plus `clubId,title,description,venue,startTime,endTime,registrationDeadline,capacity,category`. Optional: `bannerUrl`. Use a permanent `externalId` per event and a consistent **source name** per spreadsheet, for example `university-events`. Repeated imports skip unchanged events and update changed event details without creating a second row. The same behavior is available for uploaded CSVs with a source name.

Sync endpoint: `POST /api/v1/admin/import/events/google-sheet`, JSON: `{"url":"https://docs.google.com/spreadsheets/d/.../export?format=csv","source":"university-events"}`. Only university admins can call it. Manual synchronization runs **on demand**; an optional in-process scheduled mode is documented below and disabled by default. Changes to event dates must satisfy normal backend validation, and cancelled events are not resurrected. This path is intended for reviewed public data, not sensitive student information.


### Optional scheduled Google Sheets synchronization

The backend can refresh a public sheet **every 30 minutes**, but scheduling is **disabled by default**. Configure `SHEET_SYNC_ENABLED=true`, `SHEET_CSV_URL` (direct publicly readable CSV export URL), and a stable `SHEET_SOURCE` value. The server waits 30 seconds after startup before its first attempt. `SHEET_SYNC_INTERVAL_MS` controls the delay after a completed run (default `1800000`). Errors are logged and do not crash the application. This in-process scheduler runs only while the backend is up; with multiple backend instances, each instance may independently synchronize, so use one scheduled instance or an external centralized scheduler in production.


## Database migrations (Flyway)

A clean PostgreSQL database now uses Flyway `V1__initial_schema.sql` to create the tables, keys and indexes. Hibernate uses `ddl-auto=validate`, so application startup checks the schema without silently modifying it. CI tests the baseline on a fresh PostgreSQL service.

**Important: databases created by the earlier `ddl-auto=update` configuration are not automatically migrated.** Back up any existing data before upgrading. Flyway's default `baseline-on-migrate=false` intentionally stops startup on nonempty, unversioned schemas rather than risking data loss. For a pre-existing installation, compare its actual schema against V1, reconcile any differences, and establish a Flyway baseline only after review. Do not delete an existing database to get the app running.


## Single-host deployment example

`compose.prod.yml` provisions PostgreSQL, the Spring Boot backend, and Nginx hosting the compiled React application. Nginx proxies `/api/` to the backend and serves SPA routes from `index.html`. The backend is internal to the Compose network; the frontend is exposed on `FRONTEND_PORT` (default 8088).

For a **new, empty database**, export `POSTGRES_PASSWORD`, a random Base64-encoded `JWT_SECRET` (at least 32 decoded bytes), and `PUBLIC_ORIGIN` (your eventual HTTPS origin), then run `docker compose -f compose.prod.yml up --build -d`. Keep secrets outside version control and back up the persistent database volume. This example does not provision TLS, a public domain, backups, alerting or a container registry. Put a secure HTTPS reverse proxy in front of port 8088 before exposing it publicly. Do not use demo or default credentials in production.

The production Spring profile validates Flyway-managed schema and disables Swagger/OpenAPI. CI validates the Compose specification, builds both production images, starts the full PostgreSQL/backend/Nginx stack, checks frontend and API availability, and verifies API recovery after a backend restart. CI does **not** provision a public HTTPS deployment. Existing databases need a reviewed Flyway baseline before switching to this configuration.


## Testing and verification

From `backend/`, run `./mvnw clean verify` with a reachable PostgreSQL database and the `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` environment variables configured. The Spring Boot integration tests use the configured database and Flyway migrations.

From `frontend/`, run `npm ci`, `npm run lint`, and `npm run build`. Browser tests run with `npx playwright test` after installing Playwright Chromium and its dependencies. The browser-integration suite additionally requires a running backend, PostgreSQL, a bootstrap administrator, and `E2E_REAL_BACKEND=true`; see `.github/workflows/ci.yml` for the exact reproducible CI configuration.

The six CI jobs are: `backend`, `frontend`, `browser`, `browser-integration`, `deployment-config`, and `stack-smoke`. Green CI is evidence of automated checks, not a guarantee of complete accessibility, mobile-device compatibility, or public HTTPS readiness.

## MVP limitations and final acceptance

- JWTs currently reside in browser `localStorage`. A production security review should assess XSS exposure and consider safer session storage.
- Simultaneous first-time imports with an identical external ID have not been explicitly tested for graceful conflict handling.
- The supplied Compose deployment has persistent PostgreSQL storage, but public TLS, domain setup, automated backups, restore drills, monitoring, and mobile/accessibility acceptance are not included.
- The `demo` profile contains fictional clubs and events, not actual university announcements.
