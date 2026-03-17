# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run check        # Type-check with svelte-check
npm run lint         # Prettier + ESLint
npm run format       # Auto-format with Prettier
npm run test         # Run unit tests (vitest, single run)
npm run test:unit    # Run unit tests in watch mode

# Database (requires DATABASE_URL env var)
npm run db:push      # Push schema changes directly to DB
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## Required Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Secret for better-auth
- `PUBLIC_BASE_URL` — Public base URL of the app
- Resend API key (see `src/lib/server/email.ts`)

## Architecture

**Stack:** SvelteKit 5 + Svelte 5 + TypeScript + Drizzle ORM + PostgreSQL + better-auth + Tailwind CSS v4 + bits-ui

### Key Architectural Pattern: Remote Functions

This app uses SvelteKit's **experimental remote functions** (`kit.experimental.remoteFunctions: true`). All data fetching and mutations live in `src/lib/remotes/` as server-side functions using `query`, `form`, and `command` from `$app/server`. These are called directly from Svelte components — no traditional `+page.server.ts` load functions or form actions are used.

- `query(schema?, fn)` — data fetching, can call `.refresh()` on other queries after mutations
- `form(schema, fn)` — form submissions with Zod validation
- `command(schema, fn)` — mutations without form binding

### Path Aliases

- `$db` → `src/lib/server/db` (Drizzle db instance and schemas)
- `$ui` → `src/lib/components/ui` (shadcn-style UI components)
- `$lib` → `src/lib` (standard SvelteKit alias)

### Data Model

```
user → trips → itineraries → days → activities
                                  → hotels
                                  → flights
```

Schemas are in `src/lib/server/db/schemas/` — `auth.ts` (better-auth managed) and `itinerary.ts` (app domain). Exported TypeScript types like `TripWithItineraries`, `DayWithActivities`, `ItineraryWithDays` are used throughout.

### Auth

better-auth handles auth with email/password. Auth state is attached to `event.locals.user` and `event.locals.session` in `hooks.server.ts`. The `/trips` route prefix is protected and redirects unauthenticated users to `/login`. `getCurrentUser()` remote function is used inside other remotes to get the current user.

### Route Layout

```
src/routes/
  (auth)/           # login, register, forgot-password, reset-password
  (marketing)/      # landing page
  (trips)/          # protected: /trips and /trips/[tripId]/itineraries/[itineraryId]
  api/auth/[...all] # better-auth API handler
```

### UI Components

`src/lib/components/ui/` contains shadcn-svelte style primitives built on bits-ui. App-level components are in `src/lib/components/` organized by domain (`trip/`, `itinerary/`). Components use `tailwind-variants` for variant styling and `clsx`/`tailwind-merge` for class composition.

### Svelte 5 Async Components

The app uses Svelte 5's experimental async compiler option (`compilerOptions.experimental.async: true`), enabling `await` directly inside `$derived` and component scripts when calling remote `query` functions.
