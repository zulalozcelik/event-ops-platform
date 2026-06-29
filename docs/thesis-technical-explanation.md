# Event Ops Platform Technical Thesis Explanation

## 1. Codebase Inspection Summary

This explanation is based on the actual repository structure and implementation of `event-ops-platform`. The inspected files include the root workspace files `package.json`, `pnpm-workspace.yaml`, `docker-compose.yml`, and `README.md`; backend files such as `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`, `apps/backend/src/config/env.schema.ts`, `apps/backend/src/core/database/database.module.ts`, `apps/backend/src/core/database/schema/*.ts`, `apps/backend/src/modules/auth/*`, `apps/backend/src/modules/events/*`, `apps/backend/src/modules/registrations/*`, `apps/backend/src/modules/event-change-logs/*`, `apps/backend/src/modules/notifications/*`, `apps/backend/Dockerfile`, `apps/backend/drizzle.config.ts`, `apps/backend/.env.example`, and `apps/backend/.env.docker`; frontend files such as `apps/frontend/src/app/*`, `apps/frontend/src/lib/api.ts`, `apps/frontend/src/lib/config/env.ts`, `apps/frontend/src/store/auth-store.ts`, `apps/frontend/src/features/*`, `apps/frontend/src/lib/realtime/event-capacity-socket.ts`, `apps/frontend/Dockerfile`, `apps/frontend/package.json`, `apps/frontend/next.config.ts`, and `apps/frontend/.env.example`; and the shared package file `packages/shared/src/index.ts`.

The inspected code confirms that Event Ops Platform is a TypeScript monorepo using a NestJS 11 backend with Fastify, a Next.js 15 frontend using the App Router, PostgreSQL as the relational database, Drizzle ORM for database access, cookie-based JWT authentication, TanStack Query for frontend server state, Zustand for frontend authentication state, Tailwind CSS and shadcn-style UI components, Swagger/OpenAPI documentation, Dockerfiles, and Docker Compose. The current `docker-compose.yml` defines `postgres`, `backend`, and `frontend` services. Redis is present as an optional environment variable in backend configuration and as a package dependency, but it is not part of the current Compose file and is not required for the inspected core flows.

One important configuration caveat was found. In `docker-compose.yml`, PostgreSQL listens inside the Docker network on port `5432` and is exposed to the host as `5433:5432`. However, `apps/backend/.env.docker` currently uses `postgres:5433`. For a backend container connecting to the Compose service named `postgres`, the internal address should normally be `postgres:5432`. The README also discusses this port distinction. This should be corrected before relying on the Docker production-like setup.

## 2. Detailed Technical Explanation

### 2.1 Project Overview

Event Ops Platform is a full stack event operations and registration platform. It is designed for two main types of users: organizers and attendees. The code also contains an `ADMIN` role in the database schema and authorization checks, although the public registration form only allows users to register as `ATTENDEE` or `ORGANIZER`.

The main real-world problem solved by the system is the coordination of event information, attendance capacity, waiting lists, and change communication. In a normal event management process, organizers need to publish event details such as title, description, location, start time, end time, and capacity. Attendees need to browse available events, register if there is space, join a waitlist if the event is full, cancel their registration if they can no longer attend, and receive notifications if an event changes. The system also records event change logs so that important updates are not lost.

The main workflow is implemented as follows. A user registers or logs in through the frontend. An organizer creates an event. The backend stores the event as `PUBLISHED`. Attendees browse published events and open an event detail page. If capacity is available, the attendee is inserted into the `registrations` table. If capacity is full, the attendee is inserted into the separate `waitlists` table. When an attendee cancels a registration, the backend promotes the earliest waitlisted user into the `registrations` table and sends that promoted user a notification. When an organizer updates or cancels an event, the backend stores a permanent event change log and creates notifications for registered attendees.

The academic goal of the project is to demonstrate a modern full stack architecture rather than only a simple CRUD application. The project includes authentication, authorization, role-based access control, relational database design, transactions, typed backend and frontend code, API documentation, Docker support, and deployment readiness.

### 2.2 Overall Architecture

The project uses a monorepo structure:

```text
event-ops-platform/
  apps/
    backend/
    frontend/
  packages/
    shared/
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
```

The root `package.json` defines workspace-level scripts such as `dev:backend`, `dev:frontend`, `db:migrate`, `db:generate`, `build`, `lint`, and `typecheck`. The workspace is managed by `pnpm-workspace.yaml`, which includes `apps/*` and `packages/*`. A monorepo is useful here because the backend, frontend, shared code, and infrastructure files remain in one repository. This makes development easier for a graduation project because the full system can be versioned, installed, built, and explained together.

The backend layer is located in `apps/backend`. It is a NestJS API that uses Fastify as its HTTP server adapter. The backend is organized into modules: authentication, users, events, registrations, notifications, and event change logs. The backend follows a controller-service-repository pattern. Controllers receive HTTP requests. Services contain business rules. Repositories contain Drizzle database queries.

The frontend layer is located in `apps/frontend`. It is a Next.js 15 application using the App Router. Route files are placed under `apps/frontend/src/app`. The frontend communicates with the backend through the Axios instance in `apps/frontend/src/lib/api.ts`. This Axios client uses `withCredentials: true`, which allows browser cookies to be sent with API requests.

The database layer is PostgreSQL. Schema definitions are written in TypeScript with Drizzle ORM under `apps/backend/src/core/database/schema`. Database migrations are stored under `apps/backend/src/core/database/migrations`.

The shared layer is `packages/shared`. It currently exports role and status constants such as `UserRole`, `EventStatus`, `RegistrationStatus`, and `WaitlistStatus`. The `UserRole` values match the backend role schema. One limitation is that the shared `EventStatus` currently contains `ACTIVE`, `CANCELLED`, and `COMPLETED`, while the backend event table uses `DRAFT`, `PUBLISHED`, and `CANCELLED`. Therefore, the shared package is present and useful, but not all shared enums are perfectly aligned with the current backend implementation.

The infrastructure layer includes `apps/backend/Dockerfile`, `apps/frontend/Dockerfile`, and `docker-compose.yml`. The current Compose file starts PostgreSQL, the backend, and the frontend. There is no populated `infra/` folder in the inspected repository.

### 2.3 Request Flow

A typical request begins in the browser. The user interacts with a Next.js page such as `apps/frontend/src/app/events/[id]/page.tsx`. That page calls a feature API function, for example `createRegistration` from `apps/frontend/src/features/registrations/registrations.api.ts`. The feature API uses the shared Axios client from `apps/frontend/src/lib/api.ts`. Axios sends the HTTP request to the backend base URL from `NEXT_PUBLIC_API_URL`.

The backend receives the request under the global `/api` prefix configured in `apps/backend/src/main.ts`. If the endpoint is protected, `JwtAuthGuard` from `apps/backend/src/common/guards/jwt-auth.guard.ts` verifies the JWT from the `access_token` cookie or from a bearer token. The controller calls the service. The service checks business rules such as roles, event status, ownership, duplicate registration, and capacity. The service calls a repository. The repository executes a typed Drizzle query against PostgreSQL. The backend returns JSON. The frontend stores or refreshes the result using TanStack Query and updates authentication state with Zustand when needed.

## 3. Backend Architecture

### 3.1 NestJS and Fastify

NestJS is a Node.js backend framework that organizes code into modules, controllers, services, providers, and dependency injection. It is suitable for this project because the system has multiple domains: authentication, users, events, registrations, notifications, and audit logs. NestJS makes each domain easier to isolate.

Fastify is a high-performance HTTP framework for Node.js. In `apps/backend/src/main.ts`, the application is created with `new FastifyAdapter()`, so NestJS runs on top of Fastify instead of Express. Fastify was chosen because it is production-ready, efficient, and integrates well with NestJS.

The backend startup process is defined in `apps/backend/src/main.ts`. The application registers `@fastify/cookie` with a cookie secret, sets the global prefix to `/api`, enables a Socket.IO WebSocket adapter, configures CORS with credentials enabled, configures Swagger/OpenAPI, and listens on the configured port. CORS is especially important because the frontend runs on `http://localhost:3000` while the backend runs on `http://localhost:3001` during local development.

The root backend module is `apps/backend/src/app.module.ts`. It imports `ConfigModule`, `DatabaseModule`, `UsersModule`, `AuthModule`, `EventsModule`, `NotificationsModule`, and `RegistrationsModule`. `EventChangeLogsModule` is not imported directly in `AppModule`; it is imported by `EventsModule`, which means the event change log functionality is still part of the running application through the events module.

### 3.2 Backend Folder Structure

`apps/backend/src/common` contains shared backend utilities and request-related helpers. The inspected files include `JwtAuthGuard`, `OptionalJwtAuthGuard`, `parseZodSchema`, and authenticated request types.

`apps/backend/src/config` contains environment validation. `env.schema.ts` uses Zod to require and validate variables such as `PORT`, `NODE_ENV`, `FRONTEND_URL`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, and `COOKIE_SECRET`. `REDIS_URL` is optional.

`apps/backend/src/core/database` contains the database module, Drizzle database types, constants, seed file, migrations, and schema definitions. `database.module.ts` creates a postgres client from `DATABASE_URL` and exposes a Drizzle database provider through the `DRIZZLE_DB` token.

`apps/backend/src/modules/auth` implements registration, login, logout, `/auth/me`, JWT signing, JWT validation, password hashing, and credential persistence.

`apps/backend/src/modules/users` contains user lookup and persistence logic. It includes a user entity, mapper, repository interface, repository token, repository implementation, service, and an email value object.

`apps/backend/src/modules/events` implements event creation, listing, detail, update, cancellation, participant viewing, change detection, notification creation after updates, and WebSocket capacity broadcasting infrastructure.

`apps/backend/src/modules/registrations` implements attendee registration, waitlist insertion, registration cancellation, waitlist promotion, participant summaries, dashboard summary data, and registration count summaries.

`apps/backend/src/modules/event-change-logs` stores and exposes permanent audit logs for event updates. The route `GET /api/events/:eventId/change-logs` is protected and only available to the event organizer or an admin.

`apps/backend/src/modules/notifications` stores user-facing notifications and allows authenticated users to list their own notifications and mark them as read.

## 4. Database Design Explanation

PostgreSQL is a relational database management system. It stores structured data in tables, supports foreign keys, indexes, transactions, constraints, and reliable persistence. It is appropriate for this project because event operations naturally involve relationships: users create events, users register for events, events have waitlists, events have change logs, and users receive notifications.

The database schema is defined with Drizzle ORM in `apps/backend/src/core/database/schema`.

The `users` table is defined in `users.schema.ts`. It has a UUID primary key, `name`, unique `email`, `role`, `createdAt`, and `updatedAt`. The `user_role` enum supports `ADMIN`, `ORGANIZER`, and `ATTENDEE`.

The `auth_credentials` table is defined in `auth-credentials.schema.ts`. It stores `id`, `userId`, `passwordHash`, `createdAt`, and `updatedAt`. The `userId` column is unique and references `users.id` with cascade delete. This separates profile data from password credentials, which is cleaner than storing password hashes directly in the user profile row.

The `events` table is defined in `events.schema.ts`. It stores `id`, `title`, `description`, `location`, `startDate`, `endDate`, `capacity`, `status`, `organizerId`, `createdAt`, and `updatedAt`. The event status enum supports `DRAFT`, `PUBLISHED`, and `CANCELLED`. `organizerId` references `users.id`, so every event belongs to one organizer.

The `registrations` table is defined in `registrations.schema.ts`. It stores confirmed registrations only. It has `id`, `eventId`, `userId`, `createdAt`, and `updatedAt`. It has indexes for `eventId` and `userId`, and a unique index on `(eventId, userId)` to prevent duplicate confirmed registrations for the same event.

The `waitlists` table is defined in `waitlists.schema.ts`. This project uses a separate table for waitlisted users, not a `WAITING` status inside the `registrations` table. It has `id`, `eventId`, `userId`, `createdAt`, and `updatedAt`, with indexes and a unique event-user index. This design cleanly separates confirmed capacity from users waiting for a spot.

The `notifications` table is defined in `notifications.schema.ts`. It stores `id`, `userId`, optional `eventId`, `type`, `title`, `message`, `isRead`, and `createdAt`. Notifications are persistent, so users can view them later instead of losing them after a page refresh.

The `event_change_logs` table is defined in `event-change-logs.schema.ts`. It stores `id`, `eventId`, `changedByUserId`, `beforeData`, `afterData`, `changedFields`, `notificationCreated`, and `createdAt`. The snapshot fields use JSONB, which is useful because the stored audit data is structured but not exactly the same shape as a normal relational table.

UUIDs are used as primary keys. UUIDs are harder to guess than sequential integer IDs, avoid exposing row counts, and are common in public APIs.

## 5. Drizzle ORM and Repository Pattern

Drizzle ORM is a TypeScript ORM and query builder. It allows the database schema to be described in TypeScript and provides typed query construction. It was chosen because it is explicit, close to SQL, and type-friendly. This is useful in an academic project because the database design remains visible and understandable.

The Drizzle configuration is in `apps/backend/drizzle.config.ts`. It points Drizzle Kit to schema files under `./src/core/database/schema/*.ts` and writes migrations to `./src/core/database/migrations`. The `DatabaseModule` in `apps/backend/src/core/database/database.module.ts` creates the Drizzle client and makes it injectable.

The backend uses the repository pattern. A repository is responsible for data access. A service is responsible for business rules. This separation appears in repositories such as `DrizzleEventsRepository`, `DrizzleRegistrationsRepository`, `DrizzleNotificationRepository`, and `DrizzleEventChangeLogRepository`. For example, `EventsService` decides whether a user is allowed to update an event, while `DrizzleEventsRepository` performs the actual `update(events)` query.

This pattern improves maintainability because database queries are not scattered throughout controllers. It also makes the service layer easier to read: services describe what should happen, while repositories describe how data is stored or retrieved.

## 6. Authentication and Authorization

Authentication answers the question: who is this user? The implementation is in `apps/backend/src/modules/auth`.

During registration, `AuthController.register` parses the request body with `registerSchema`. `AuthService.register` normalizes the email through the `Email` value object, checks if the email already exists, hashes the password with `bcryptjs`, creates a user row, creates an auth credential row, signs a JWT, and returns the user object. The token itself is not returned in the response body. It is stored in an `access_token` cookie.

During login, `AuthService.login` finds the user by email, loads the stored password hash from the credential repository, compares the submitted password with `bcrypt.compare`, and creates a JWT if the credentials are valid.

During logout, `AuthController.logout` clears the `access_token` cookie.

During session checking, `GET /api/auth/me` uses `JwtAuthGuard`. The `JwtStrategy` reads the token from either the `access_token` cookie or the `Authorization: Bearer` header. The normal application flow uses the cookie. The bearer option exists so Swagger can still describe and test protected endpoints manually.

Cookie-based authentication is used instead of localStorage token storage. The cookie is `httpOnly`, so frontend JavaScript cannot read it. This reduces the risk of token theft through many cross-site scripting scenarios. The cookie uses `sameSite: 'lax'`, `path: '/'`, and `secure` is enabled when `FRONTEND_URL` starts with `https://`. This means local HTTP development can work, while HTTPS deployments can use secure cookies.

Authorization answers the question: what is this user allowed to do? The code uses `JwtAuthGuard` for protected endpoints and service-level role and ownership checks. There is no separate `RolesGuard` file in the inspected repository. Instead, role rules are implemented directly inside services such as `EventsService` and `RegistrationsService`.

Examples of authorization rules include: only `ADMIN` and `ORGANIZER` users can create or update events; non-admin organizers can update only their own events; event participants and change logs are visible only to the event owner or admin; attendees cannot register for an event they organize; and notifications can only be marked as read by their owner because the update query filters by both notification ID and user ID.

## 7. Validation and Type Safety

The project uses TypeScript across the backend, frontend, and shared package. TypeScript helps catch type mistakes during development and makes request/response shapes easier to understand.

The backend uses Zod for environment validation in `apps/backend/src/config/env.schema.ts`. If required variables are missing or invalid, the backend should fail early instead of running with broken configuration. Zod is also used for authentication request validation. `register.dto.ts`, `login.dto.ts`, and `password.schema.ts` enforce email format, password length, maximum password length, uppercase letters, and special characters for registration.

The helper `apps/backend/src/common/utils/parse-zod-schema.ts` converts Zod errors into NestJS `BadRequestException` responses. Auth routes and event listing query parameters use this runtime parsing. The event create and update DTO schemas exist in `apps/backend/src/modules/events/dto/create-event.dto.ts` and `update-event.dto.ts`, but the inspected controller does not currently call `parseZodSchema` for create and update bodies. Therefore, event body validation is partially implemented at the schema/type level but should be strengthened by parsing those schemas at runtime in the controller or with a validation pipe.

The frontend also uses Zod for form validation in `apps/frontend/src/features/auth/auth-form.schema.ts` and `auth-password.schema.ts`. The registration form validates password rules while typing and prevents submission when password rules fail.

## 8. Swagger and OpenAPI

Swagger/OpenAPI documentation is configured in `apps/backend/src/main.ts`. The document title is `Event Ops Platform API`, version `1.0.0`, and the docs are served at `/api/docs`. The configuration includes both bearer authentication and cookie authentication. This matches the implementation because normal browser authentication uses an `httpOnly` cookie, but protected routes can also be tested manually with a bearer token.

Swagger is useful in this project because it documents available endpoints, expected request bodies, authentication requirements, and response descriptions. It also allows the professor or developer to inspect the backend API without reading every controller file first.

## 9. Frontend Architecture

The frontend is a Next.js 15 application using React 19. Next.js is a React framework that provides routing, layouts, build tooling, and production serving. This project uses the App Router, where route segments are folders under `apps/frontend/src/app`.

Important routes include the home page at `src/app/page.tsx`, login at `src/app/login/page.tsx`, register at `src/app/register/page.tsx`, event listing at `src/app/events/page.tsx`, event creation at `src/app/events/create/page.tsx`, event detail at `src/app/events/[id]/page.tsx`, event editing at `src/app/events/[id]/edit/page.tsx`, organizer dashboard at `src/app/dashboard/page.tsx`, notifications at `src/app/notifications/page.tsx`, and attendee registrations at `src/app/registrations/page.tsx`.

The frontend API layer is split by feature. `features/auth/auth.api.ts` contains login, register, logout, and current-user requests. `features/events/events.api.ts` contains event queries and mutations. `features/registrations/registrations.api.ts` contains registration, waitlist, participant, and dashboard requests. `features/notifications/notifications.api.ts` contains notification requests.

The Axios client in `apps/frontend/src/lib/api.ts` uses `baseURL: clientEnv.NEXT_PUBLIC_API_URL` and `withCredentials: true`. `withCredentials` is required because the backend stores the JWT in a cookie and the browser must include that cookie in cross-origin API requests.

TanStack Query is used for server state. It fetches data, caches it, exposes loading and error states, and invalidates stale data after mutations. For example, after event updates the code invalidates event lists, event detail, change logs, notifications, and dashboard queries. Zustand is used for global authentication state in `apps/frontend/src/store/auth-store.ts`, storing `user`, `isAuthenticated`, and `initialized`.

The UI uses Tailwind CSS and shadcn-style components under `apps/frontend/src/components/ui`. Components such as `Button`, `Card`, `Input`, and `Badge` provide consistent interface elements. The design uses a warm light interface rather than a purely default framework look.

## 10. Feature Flow Explanations

### 10.1 Register User

The user fills the registration form in `apps/frontend/src/components/auth/register-form.tsx`. The form validates name, email, password, and role with Zod. The frontend sends `POST /api/auth/register` through Axios. The backend parses the body, checks for duplicate email, hashes the password, inserts a row into `users`, inserts a password hash into `auth_credentials`, signs a JWT, sets the `access_token` cookie, and returns the user profile. The frontend stores the user in Zustand and redirects organizers to the dashboard or attendees to the normal application flow.

### 10.2 Login

The login form sends `POST /api/auth/login`. The backend finds the user by email, loads the password hash, compares the password, signs a JWT, sets the cookie, and returns the user profile. The frontend stores the authenticated user and updates the navbar.

### 10.3 Session Bootstrap

When the frontend starts, `apps/frontend/src/app/providers.tsx` calls `useAuthBootstrap`. This hook checks a local session hint and then calls `/auth/me` if a previous session is expected. If the cookie is valid, the backend returns the current user and Zustand becomes authenticated. If not, the frontend clears auth state.

### 10.4 Create Event

An organizer or admin opens the create event page. The frontend submits title, description, location, start date, end date, and capacity. `POST /api/events` is protected by `JwtAuthGuard`. `EventsService.createEvent` rejects users who are not organizers or admins, converts dates to `Date` objects, sets `organizerId` to the current user, and stores the event as `PUBLISHED`.

### 10.5 Browse and View Event

The event listing page calls `GET /api/events`, which returns published events. Filters for search, location, and date are supported by `getEventsQuerySchema` and implemented in `DrizzleEventsRepository.findAllPublishedOrVisible`. The event detail page calls `GET /api/events/:id`. It uses `OptionalJwtAuthGuard`, so anonymous users can view details while logged-in users can also receive personalized registration state such as `REGISTERED`, `WAITLISTED`, or `NONE`.

### 10.6 Register, Waitlist, Cancel, and Promote

An attendee clicks join on the event detail page. The frontend sends `POST /api/registrations`. `RegistrationsService.createRegistration` loads the event, checks that it is `PUBLISHED`, checks capacity is positive, and prevents the organizer from registering for their own event. The repository then runs a transaction. It locks the event row with `select id from events where id = ... for update`, checks whether the user is already registered or waitlisted, counts confirmed registrations, and either inserts into `registrations` or `waitlists`.

When a user cancels with `DELETE /api/registrations/:eventId`, the repository again uses a transaction and locks the event row. If a confirmed registration is deleted, the earliest waitlist row is selected, removed from `waitlists`, and inserted into `registrations`. The promoted user receives a `WAITLIST_PROMOTED` notification. This is an important data integrity feature because the capacity check, cancellation, and promotion happen as one consistent database operation.

### 10.7 Update Event and Notify Attendees

When an organizer updates an event, `PATCH /api/events/:id` calls `EventsService.updateEvent`. The service checks role and ownership, reads the current event, builds a before snapshot, merges the update payload, builds an after snapshot, and calculates changed fields with `calculateChangedFields` in `apps/backend/src/modules/events/helpers/event-change.helper.ts`.

If no fields changed, the existing event is returned. If fields changed, the repository updates the event row. The service then creates an event change log through `EventChangeLogsService`. It finds registered attendees, builds a human-readable notification message, creates notifications for registered attendees except the user who made the change, and marks the log as having created notifications when applicable.

### 10.8 Cancel Event

The delete route is implemented as a soft delete. `DELETE /api/events/:id` does not physically remove the event row. It changes the status to `CANCELLED`. The service also creates a change log and sends an `EVENT_DELETED` notification to registered attendees. The controller description calls this delete, but the implementation is more accurately event cancellation.

### 10.9 Notifications

Authenticated users can call `GET /api/notifications/my` to retrieve their notifications. They can call `PATCH /api/notifications/:id/read` to mark one notification as read. The repository filters the update by both notification ID and user ID, so one user cannot mark another user's notification as read. The navbar uses `useMyNotifications` to show an unread indicator when any notification has `isRead === false`.

### 10.10 WebSocket Capacity Updates

The backend defines `EventCapacityGateway` in `apps/backend/src/modules/events/realtime/event-capacity.gateway.ts`. Clients can subscribe to `event.capacity.subscribe` and unsubscribe with `event.capacity.unsubscribe`. The backend emits `event.capacity.updated` through `EventCapacityRealtimeService` after registration or cancellation changes. The frontend file `apps/frontend/src/lib/realtime/event-capacity-socket.ts` loads the Socket.IO client script from the backend and connects with credentials. The event detail page subscribes to the current event room and updates the TanStack Query cache when capacity changes arrive. Therefore, the real-time capacity feature is implemented for event detail pages.

## 11. Technology Justification Table

| Technology | Where Used | Reason |
| --- | --- | --- |
| TypeScript | Backend, frontend, shared package | Provides static typing, safer refactoring, and clearer data contracts. |
| pnpm workspace | Root `package.json`, `pnpm-workspace.yaml` | Efficient monorepo dependency management for backend, frontend, and shared package. |
| NestJS 11 | `apps/backend` | Provides modular architecture, dependency injection, controllers, services, guards, and Swagger integration. |
| Fastify | `apps/backend/src/main.ts` | Production-ready HTTP adapter with strong performance. |
| PostgreSQL | Docker Compose and Drizzle schema | Reliable relational database for users, events, registrations, waitlists, logs, and notifications. |
| Drizzle ORM | `core/database` and repositories | Type-safe schema and explicit SQL-like queries. |
| Zod | Backend config/auth validation and frontend forms | Runtime validation with TypeScript inference. |
| JWT | Auth module | Stateless signed identity token containing user ID, email, and role. |
| httpOnly cookies | `AuthController` | Keeps the token unavailable to frontend JavaScript. |
| Swagger/OpenAPI | `main.ts`, controllers | Interactive backend API documentation. |
| Next.js 15 | `apps/frontend` | Modern React framework with App Router and production build support. |
| Axios | `src/lib/api.ts` | Centralized HTTP client with credential support. |
| TanStack Query | Feature API hooks | Fetching, caching, loading states, and query invalidation. |
| Zustand | `src/store/auth-store.ts` | Simple global authentication state. |
| Tailwind CSS | Frontend styles | Utility-first styling for a consistent UI. |
| Socket.IO | Backend gateway and frontend realtime client | Pushes capacity updates to event detail pages. |
| Docker | Dockerfiles and Compose | Repeatable local/deployment environment for frontend, backend, and database. |

## 12. Security and Data Integrity Explanation

Security is addressed through multiple layers. Passwords are hashed with bcrypt before storage. JWTs are signed with `JWT_ACCESS_SECRET`. Tokens are stored in `httpOnly` cookies rather than localStorage. CORS is configured with credentials enabled and a controlled frontend origin. Protected endpoints use `JwtAuthGuard`. Role and ownership checks are performed in services. Notification updates are filtered by authenticated user ID. Environment variables keep secrets outside source code.

Data integrity is a central part of the project. The registration repository uses transactions and row locking to prevent over-capacity registrations when multiple users register at nearly the same time. Duplicate registration and duplicate waitlist entries are prevented by both service/repository checks and unique indexes. Waitlist promotion occurs in the same transaction as cancellation. Event updates produce permanent audit logs in `event_change_logs`, and registered attendees receive persistent notifications.

Current limitations should also be stated honestly. Event create and update Zod schemas exist but are not currently parsed in the controller. A production deployment should use HTTPS so `secure` cookies are enabled. Swagger is publicly available at `/api/docs` in the current configuration and should be restricted or disabled for stricter production environments. The Docker backend environment currently appears to use the wrong internal PostgreSQL port and should be corrected.

## 13. Deployment Explanation

The project is Docker-ready. `apps/backend/Dockerfile` installs workspace dependencies, copies the backend and shared package, builds `@event-ops/shared`, builds the backend, exposes port `3001`, runs Drizzle migrations, and starts the backend. `apps/frontend/Dockerfile` installs dependencies, accepts `NEXT_PUBLIC_API_URL` as a build argument, builds the Next.js app, exposes port `3000`, and runs `next start`.

`docker-compose.yml` defines three services. `postgres` uses the `postgres:16-alpine` image, stores data in a named volume called `postgres_data`, exposes host port `5433`, and includes a healthcheck. `backend` builds from `apps/backend/Dockerfile`, uses `apps/backend/.env.docker`, waits for PostgreSQL to be healthy, and exposes port `3001`. `frontend` builds from `apps/frontend/Dockerfile`, receives `NEXT_PUBLIC_API_URL`, depends on the backend, and exposes port `3000`.

For local development without full Compose, the README recommends installing dependencies, configuring backend and frontend env files, running PostgreSQL with Docker, applying migrations with `pnpm db:migrate`, and starting backend and frontend with `pnpm dev:backend` and `pnpm dev:frontend`.

For a cloud deployment such as AWS EC2 or another VPS, the general process is to create a virtual machine, install Docker and Docker Compose, clone the repository, create production environment files, set `NEXT_PUBLIC_API_URL` to the public backend URL, set `FRONTEND_URL` to the public frontend URL, build and start containers, open required firewall ports, and optionally configure Nginx and HTTPS with Certbot. The repository does not contain a detailed AWS-specific deployment script, so AWS EC2 should be described as the deployment environment used during the project process only if supported by project documentation or presentation evidence outside this inspected codebase.

## 14. Possible Professor Questions and Answers

**What is NestJS and why did you use it?** NestJS is a Node.js backend framework that organizes code into modules, controllers, services, and providers. It was used because the project has multiple domains and needs a clean, maintainable backend architecture.

**What is Fastify and why not Express?** Fastify is an HTTP server framework for Node.js. It is used as the NestJS adapter in `main.ts`. It is known for performance and modern plugin support.

**What is PostgreSQL and why did you choose it?** PostgreSQL is a relational database. It was chosen because the project has structured relational data: users, events, registrations, waitlists, notifications, and logs.

**What is Drizzle ORM?** Drizzle is a TypeScript ORM and query builder. It defines schemas in TypeScript and allows typed SQL-like queries.

**What is a migration?** A migration is a versioned database change. Drizzle migration files under `apps/backend/src/core/database/migrations` keep the database structure consistent across machines.

**What is the repository pattern?** It separates database access from business logic. Services make decisions, while repositories execute database queries.

**Why use httpOnly cookies instead of localStorage?** An `httpOnly` cookie cannot be read by frontend JavaScript, reducing token theft risk from many XSS attacks. Axios sends it automatically with `withCredentials: true`.

**What is RBAC?** Role-based access control means permissions depend on the user's role. This project uses `ATTENDEE`, `ORGANIZER`, and `ADMIN` roles.

**How do you prevent over-capacity registration?** The registration repository uses a database transaction, locks the event row, counts current registrations, and only inserts a registration if count is below capacity.

**How does the waitlist work?** The project uses a separate `waitlists` table. When capacity is full, the user is inserted into `waitlists`. When a confirmed attendee cancels, the earliest waitlisted user is promoted into `registrations`.

**How do change logs work?** Before an event update, the backend builds a before snapshot. It merges the update into an after snapshot, calculates changed fields, stores a row in `event_change_logs`, and creates attendee notifications when needed.

**What is WebSocket used for?** Socket.IO is used to send event capacity updates to users viewing an event detail page. Clients subscribe to event-specific rooms.

**What would you improve next?** Strong improvements would include runtime Zod parsing for event create/update bodies, correcting Docker internal database port configuration, protecting Swagger in production, adding automated tests, aligning shared enums with backend enums, and adding detailed deployment scripts.

## 15. Thesis Ready Final Section

Event Ops Platform is a full stack event operations and registration system developed as a TypeScript monorepo. The system supports organizers who create and manage events and attendees who browse events, register for available events, join waitlists when events are full, and receive notifications when important event details change. The project demonstrates not only basic CRUD operations, but also authentication, authorization, relational database design, data integrity, audit logging, real-time updates, and Docker-based deployment readiness.

The backend is implemented with NestJS 11 and Fastify. NestJS provides a structured architecture based on modules, controllers, services, and dependency injection. Fastify is used as the HTTP adapter to provide a production-ready server layer. The backend entry point in `apps/backend/src/main.ts` creates the Nest application with `FastifyAdapter`, registers cookie support, enables CORS with credentials, configures a global `/api` prefix, enables Socket.IO support, and exposes Swagger documentation at `/api/docs`.

The frontend is implemented with Next.js 15 and React. It uses the App Router, where each route is represented by a folder under `apps/frontend/src/app`. The frontend contains pages for authentication, event listing, event detail, event creation, event editing, organizer dashboard, registrations, and notifications. Axios is configured in `apps/frontend/src/lib/api.ts` with `withCredentials: true`, which allows the browser to send the backend authentication cookie with API requests. TanStack Query manages server state, caching, loading states, and invalidation after mutations. Zustand stores global authentication state.

The database is PostgreSQL and is accessed through Drizzle ORM. PostgreSQL is suitable for this project because event management data is relational. Users organize events, attendees register for events, events have waitlists, users receive notifications, and event updates create audit logs. Drizzle ORM allows these tables to be defined in TypeScript and queried with typed database code.

The authentication system uses JWTs stored in `httpOnly` cookies. During registration or login, the backend validates the request, hashes passwords with bcrypt, signs a JWT, and stores it in the `access_token` cookie. The frontend does not store the token in localStorage. Protected backend routes use `JwtAuthGuard`, and the JWT strategy reads the token from the cookie or from a bearer header. Authorization is handled through role and ownership checks in service methods. Organizers and admins can create and manage events, while attendees use registration and notification features.

The event registration system is one of the strongest data integrity parts of the project. Confirmed attendees are stored in `registrations`, while waitlisted users are stored in a separate `waitlists` table. The repository uses database transactions and row locking when registering, cancelling, and promoting users. This prevents inconsistent capacity counts when multiple users interact with the same event at the same time.

The event change log and notification system addresses the project's data integrity challenge. When an organizer updates an event, the backend compares a before snapshot and an after snapshot, calculates changed fields, updates the event, stores a permanent audit record in `event_change_logs`, and creates persistent notifications for registered attendees. Change logs are internal audit records visible only to the event owner or admin, while notifications are user-facing messages visible to attendees.

The system also includes real-time capacity updates with Socket.IO. The backend defines event capacity rooms, and the frontend event detail page subscribes to updates for the current event. When registration or cancellation changes the capacity summary, the backend emits `event.capacity.updated`, and the frontend updates the displayed registered count, waitlist count, and remaining capacity without requiring a full page refresh.

Docker support is provided through separate backend and frontend Dockerfiles and a root `docker-compose.yml`. Compose defines PostgreSQL, backend, and frontend services with a persistent PostgreSQL volume. This makes the project easier to run consistently across machines and prepares it for VPS-style deployment. For production deployment, the environment variables must be configured carefully, especially `DATABASE_URL`, `FRONTEND_URL`, `JWT_ACCESS_SECRET`, `COOKIE_SECRET`, and `NEXT_PUBLIC_API_URL`. HTTPS should be used in production so secure cookies can be enabled.

Overall, Event Ops Platform demonstrates a complete modern web application architecture. It combines a typed frontend, modular backend, relational database, secure authentication, role-aware authorization, transaction-based capacity control, event audit logging, persistent notifications, Swagger documentation, and Docker deployment support. The implementation is appropriate for a graduation thesis because it shows how multiple software engineering concepts work together in one practical system.
