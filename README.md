# CampusConnect

A modern full-stack campus community platform that enables students to discover clubs, join communities, explore campus events, and manage their student profile through a secure, responsive, and production-style web application.

---

## ✨ Highlights

- JWT-based Authentication & Authorization
- Secure Protected Routes
- Club Discovery & Membership Management
- Event Discovery, Registration & Capacity Control
- Personalized Dashboard
- Student Profile
- Responsive Modern UI
- RESTful API Architecture
- PostgreSQL Persistence

---

# Screenshots

## Dashboard

![Dashboard](docs/screenshots/dashboard.png)

---

## Clubs

![Clubs](docs/screenshots/clubs.png)

---

## Events

![Events](docs/screenshots/events.png)

---

## My Clubs

![My Clubs](docs/screenshots/my-clubs.png)

---

## Profile

![Profile](docs/screenshots/profile.png)

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
- Register for Events
- Cancel Registrations Before an Event Starts
- View Personal Event Registrations
- Capacity and Registration Deadline Enforcement
- Duplicate Registration Prevention
- Ticket-style Event Cards
- Event Information
- Empty & Loading States

Registration capacity is enforced inside a database transaction. The event row
is locked while a registration is created or cancelled, preventing concurrent
requests from overbooking the same event. A database-level unique constraint
also guarantees that a student cannot register twice.

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
├── docs
│   └── screenshots
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

```bash
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
```

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
- Event Registrations
- User Profile

---

# Future Enhancements

- Club Admin Portal
- Announcement System
- Notifications
- Calendar Integration
- QR Event Check-in
- Admin Dashboard

---

# Author

**Rishika Sharan**

B.Tech Computer Science (Artificial Intelligence)

Indira Gandhi Delhi Technical University for Women (IGDTUW)

GitHub: https://github.com/rishika150
