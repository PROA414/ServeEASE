# SearveEASE

A service marketplace platform connecting buyers with local service providers (cleaners, nannies, cooks, handymen). Built with Next.js 15, Prisma, Better Auth, Stripe, and Resend.

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (PostgreSQL)
- A [Stripe](https://stripe.com) account (test keys for dev)
- A [Resend](https://resend.com) account (for emails)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) token (for photo uploads)

## Quick Start


# 1. Clone and install
git clone <repo-url>
cd searveease
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your real credentials (see Environment Variables below)

# 3. Push the database schema
npx prisma db push

# 4. Seed demo data
npm run seed

# 5. Start the dev server
npm run dev

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Add these to your `.env` file:

```env
# Database (Supabase PostgreSQL connection string)
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true"

# Better Auth
AUTH_SECRET="<generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\">"
BETTER_AUTH_URL="http://localhost:3000"

# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend (email)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="SearveEASE <noreply@example.com>"

# Vercel Blob (photo uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Sentry (error tracking)
SENTRY_DSN="https://...@sentry.io/..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

See `DEPLOYMENT.md` for production deployment instructions.

## Demo Accounts

After running `npm run seed`, log in with any of these (password: `password123`):

| Email | Role |
|---|---|
| `buyer@example.com` | Buyer (500 credits) |
| `maria@example.com` | Provider — Cleaner |
| `grace@example.com` | Provider — Nanny |
| `david@example.com` | Provider — Cook |
| `james@example.com` | Provider — Handyman |
| `aisha@example.com` | Provider — Cleaner |
| `robert@example.com` | Provider — Handyman |

To make a user an admin, set `isAdmin = true` in Prisma Studio (`npm run studio`).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest test suite |
| `npm run seed` | Seed the database with demo data |
| `npm run studio` | Open Prisma Studio |

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (Base UI)
- **Database:** Prisma + PostgreSQL (Supabase)
- **Auth:** Better Auth (email/password, sessions)
- **Payments:** Stripe (Checkout + webhooks)
- **Email:** Resend (transactional emails)
- **Storage:** Vercel Blob (photo uploads)
- **Monitoring:** Sentry (error tracking)
- **Forms:** React Hook Form + Zod validation

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── actions/      # Server actions (bookings, admin, providers, notifications, settings)
│   ├── api/          # API routes (auth, payments, emails, uploads, chat)
│   ├── bookings/     # Booking pages (list, detail, success, chat)
│   ├── providers/    # Provider pages (browse, detail)
│   ├── admin/        # Admin dashboard
│   ├── wallet/       # Credit wallet
│   └── ...           # Other pages (login, signup, settings, notifications, etc.)
├── components/       # React components (shadcn/ui + custom)
├── emails/           # React Email templates
├── lib/              # Utilities (auth, prisma, formatting, rate limiting, etc.)
└── test/             # Test setup
```

## Key Features

- **Browse & book providers** by category, rating, price, or availability
- **Escrow-based payments** — credits held until job completion
- **Check-in/check-out** with GPS verification and photo proof
- **In-app chat** between buyer and provider
- **Dispute resolution** — file disputes, admin adjudication
- **Provider dashboard** — earnings, bookings, availability management
- **Admin dashboard** — user/booking management, refunds, credit adjustments
- **In-app notifications** — bell with unread count, notification page
- **Email notifications** — booking confirmations, cancellations, payment releases
- **Settings** — profile update, theme toggle, notification preferences
