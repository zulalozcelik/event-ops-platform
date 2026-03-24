# Event Ops Platform

Full-stack event operations platform for organizers and attendees. The project focuses on event creation, registrations, waitlist handling, change tracking, and attendee notifications.

## Stack

- Frontend: Next.js 15, React 19, Tailwind CSS, React Query, Zustand
- Backend: NestJS 11, Fastify, Drizzle ORM, PostgreSQL, Socket.IO
- Monorepo: pnpm workspaces

## Setup Instructions

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker Desktop (recommended for PostgreSQL)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Backend:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Frontend:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 3. Start PostgreSQL

The quickest option is Docker:

```bash
docker compose up -d postgres
```

Important: `docker-compose.yml` exposes PostgreSQL on port `5432`, so `apps/backend/.env` should use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/event_ops
```

The current backend example file uses `5433`; update it to `5432` if you are using this Docker setup.

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Start the apps

Backend:

```bash
pnpm dev:backend
```

Frontend:

```bash
pnpm dev:frontend
```

### 6. Open the app

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:3001/api/health`
- Swagger: `http://localhost:3001/api/docs`

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | Yes | Backend port. Default local value is `3001`. |
| `NODE_ENV` | Yes | Runtime mode: `development`, `test`, or `production`. |
| `FRONTEND_URL` | Yes | Allowed frontend origin for CORS outside development. |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Drizzle and the backend. |
| `REDIS_URL` | No | Optional Redis connection string. Present in config schema, not required for current core flows. |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign access tokens. Must be at least 10 characters. |
| `JWT_ACCESS_EXPIRES_IN` | Yes | JWT lifetime, for example `7d`. |
| `COOKIE_SECRET` | Yes | Secret used to sign cookies. Must be at least 10 characters. |

### Frontend (`apps/frontend/.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Public API base URL used by the frontend Axios client. Local default: `http://localhost:3001/api`. |

## Selected Challenges

- Capacity and waitlist flow: registrations are accepted until capacity is full, then new attendees are moved to a waitlist. When a registration is cancelled, the next waitlisted attendee is promoted and notified.
- Event update propagation: event edits are diffed against a normalized snapshot, stored as change logs, and used to create attendee notifications only when meaningful fields changed.
- Role-aware access control: organizers and admins can create or update events, while attendee actions are limited to registration and notification flows. Authentication is handled with an `httpOnly` access token cookie.
- Realtime visibility: registration changes trigger Socket.IO capacity updates so event detail pages can reflect registered count, waitlist count, and remaining capacity without a full refresh.

## Brief Architecture Note

This repository is organized as a pnpm monorepo with three main packages:

- `apps/frontend`: Next.js app router UI for authentication, event browsing, dashboard, registrations, and notifications.
- `apps/backend`: NestJS backend split into domain modules such as `auth`, `events`, `registrations`, `notifications`, `users`, and `event-change-logs`.
- `packages/shared`: shared enums and types used across apps.

On the backend, each domain module follows a service and repository split, with Drizzle-based repositories handling persistence. The event and registration flows are intentionally connected: event changes can generate notifications, and registration changes can emit realtime capacity updates.

On the frontend, API access is centralized through a shared Axios client with `withCredentials: true`, server state is handled through feature-level API modules, and authentication state is kept in a small Zustand store.
