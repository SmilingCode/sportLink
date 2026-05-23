# SportLink

Location-based social sports platform. Find and join verified pickup games near you.

## Stack

| Layer         | Tech                                   |
| ------------- | -------------------------------------- |
| Frontend      | Next.js 14 (App Router), Tailwind, SWR |
| Backend       | Node.js, Fastify, Zod                  |
| Database      | PostgreSQL + PostGIS, Prisma ORM       |
| Cache         | Redis                                  |
| Auth          | JWT (API) + NextAuth (SSO frontend)    |
| Identity      | Stripe Identity (ID + selfie)          |
| Notifications | Resend (email) + Twilio (SMS)          |
| Maps          | Mapbox                                 |
| Monorepo      | Turborepo                              |

## Project structure

```
sportlink/
├── apps/
│   ├── web/          # Next.js frontend → deploy to Vercel
│   └── api/          # Node.js + Fastify backend → deploy to Railway
└── packages/
    └── types/        # Shared TypeScript DTOs
```

## Getting started

### 1. Prerequisites

- Node.js ≥ 20
- PostgreSQL with PostGIS extension
  - Easiest: [Supabase](https://supabase.com) free tier (PostGIS pre-installed)
- A Stripe account (for Identity verification)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Fill in DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# Frontend
cp apps/web/.env.example apps/web/.env.local
# Fill in NEXT_PUBLIC_MAPBOX_TOKEN
```

### 4. Set up the database

```bash
cd apps/api

# Enable PostGIS on your database first:
# psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run everything

```bash
# From the root — starts both apps in parallel
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Health:   http://localhost:4000/health
```

## API routes

| Method | Path             | Auth           | Description                |
| ------ | ---------------- | -------------- | -------------------------- |
| POST   | /auth/signup     | —              | Create account             |
| POST   | /auth/login      | —              | Login, get JWT             |
| GET    | /auth/me         | JWT            | Current user               |
| GET    | /games           | —              | List games (radius filter) |
| GET    | /games/:id       | —              | Game detail                |
| POST   | /games           | JWT + verified | Create game                |
| POST   | /games/:id/join  | JWT + verified | Join game                  |
| DELETE | /games/:id/leave | JWT            | Leave game                 |
| PATCH  | /users/me        | JWT            | Update profile             |
| POST   | /verify/session  | JWT            | Start Stripe Identity      |
| POST   | /verify/webhook  | Stripe sig     | Verification result        |

## Stripe Identity setup

1. Go to [Stripe Dashboard → Identity](https://dashboard.stripe.com/identity)
2. Enable the Identity product
3. Add webhook endpoint: `https://your-api.railway.app/verify/webhook`
4. Select events: `identity.verification_session.verified` and `identity.verification_session.requires_input`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

## Deployment

**Frontend (Vercel)**

```bash
vercel --cwd apps/web
```

**Backend (Railway)**

```bash
railway up --service api
```

Set env vars in Railway dashboard. Add a PostgreSQL + Redis service.

## Next steps

- [ ] Wire up Mapbox to the create game form
- [ ] Add browser geolocation to the browse page
- [ ] Implement Resend email notifications
- [ ] Add Google/Apple SSO via NextAuth
- [ ] Add Redis caching for radius queries
- [ ] Build the game detail page

## TO-DO

- [] cookie-based Auth
  Auth hardening: migrate from localStorage token to HttpOnly cookie.
  Update login/signup to set server cookie instead of storing token in browser JS.
  Update authenticated API calls to use cookie session.
  Implement logout that clears cookie.
  Add CSRF protection strategy and test login/create-game/logout flow.

- [] Save draft with "draft" Game status
    ```
    enum GameStatus {
        draft      // ← add this
        open
        full
        cancelled
        completed
    }
    ```
- [] Add email verification