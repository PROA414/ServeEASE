# SearveEASE Deployment Guide

## Prerequisites

- [Supabase](https://supabase.com) project with PostgreSQL database
- [Stripe](https://stripe.com) account with test/live keys
- [Resend](https://resend.com) account with verified sending domain
- [Sentry](https://sentry.io) project for error monitoring
- GitHub repository with this codebase
- [Vercel](https://vercel.com) account

---

## 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database**
3. Copy the **Connection string** (URI format)
4. It will look like:
   ```
   postgresql://postgres:[password]@db.xxxxx.supabase.com:5432/postgres
   ```
5. Add `?pgbouncer=true` to the end for connection pooling:
   ```
   postgresql://postgres:[password]@db.xxxxx.supabase.com:5432/postgres?pgbouncer=true
   ```

---

## 2. Environment Variables

Add these to your local `.env` for development:

```env
DATABASE_URL="postgresql://postgres:[password]@db.xxxxx.supabase.com:5432/postgres?pgbouncer=true"
AUTH_SECRET="your-auth-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
RESEND_API_KEY="re_..."
SENTRY_DSN="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_FROM_EMAIL="SearveEASE <noreply@yourdomain.com>"
```

### Vercel Environment Variables

When deploying to Vercel, add the same variables in **Settings → Environment Variables**:

- `DATABASE_URL` — Supabase connection string with `?pgbouncer=true`
- `AUTH_SECRET` — Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `BETTER_AUTH_URL` — Your production URL (e.g. `https://searveease.vercel.app`)
- `STRIPE_SECRET_KEY` — From Stripe Dashboard → Developers → API keys
- `STRIPE_WEBHOOK_SECRET` — From Stripe Dashboard → Developers → Webhooks
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — From Stripe Dashboard
- `RESEND_API_KEY` — From Resend dashboard
- `SENTRY_DSN` — From Sentry project settings
- `NEXT_PUBLIC_APP_URL` — Your production URL
- `RESEND_FROM_EMAIL` — Verified sender email

---

## 3. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or create a migration (recommended for production)
npx prisma migrate dev --name init
```

### Production Migration

For production, run:
```bash
npx prisma migrate deploy
```

---

## 4. Seed Database

```bash
npm run seed
```

This creates:
- 6 sample providers (cleaners, nannies, cooks, handymen)
- 1 buyer account with 500 credits
- 1 sample booking

### Seeded Accounts

| Email | Password | Role |
|-------|----------|------|
| `buyer@example.com` | None (create via signup) | Buyer with 500 credits |
| `maria@example.com` | None | Provider (cleaner) |
| `grace@example.com` | None | Provider (nanny) |
| `david@example.com` | None | Provider (cook) |
| `james@example.com` | None | Provider (handyman) |
| `aisha@example.com` | None | Provider (cleaner) |
| `robert@example.com` | None | Provider (handyman) |

---

## 5. Stripe Webhook Setup

### Local Development

1. Install Stripe CLI:
   ```bash
   iwr https://bin.stripe.com/install.ps1 | iex
   ```

2. Login and forward webhooks:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/payment/webhook
   ```

3. Copy the webhook secret (starts with `whsec_...`) into your `.env`

### Production

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payment/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret into Vercel environment variables

---

## 6. Resend Email Setup

1. Sign up at [resend.com](https://resend.com)
2. Go to **Domains** and add your sending domain
3. Verify the domain by adding DNS records
4. Copy the API key into `.env` / Vercel env vars
5. Set `RESEND_FROM_EMAIL` to your verified sender (e.g. `SearveEASE <noreply@yourdomain.com>`)

### For Development

Use Resend's test domain: `onboarding@resend.dev` (limited to sending to your own email)

---

## 7. Sentry Setup

1. Create a project at [sentry.io](https://sentry.io)
2. Select **Next.js** as the platform
3. Copy the DSN
4. Add to `.env` / Vercel env vars as `SENTRY_DSN`

The Sentry config files are already created:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

---

## 8. Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for production"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### Step 3: Add Environment Variables

In Vercel project settings, add all environment variables from step 2.

### Step 4: Deploy

Click **Deploy**. Vercel will build and deploy your app.

### Step 5: Run Production Migration

After first deploy, run:
```bash
npx prisma migrate deploy
```

### Step 6: Seed Production Database

```bash
npm run seed
```

---

## 9. Post-Deployment Checklist

- [ ] App loads at production URL
- [ ] Login/signup works
- [ ] Providers page loads with seeded data
- [ ] Booking flow works end-to-end
- [ ] Stripe test payment succeeds
- [ ] Webhook adds credits to wallet
- [ ] Emails are received (booking confirmation, etc.)
- [ ] Sentry captures test error
- [ ] Admin dashboard accessible (set `isAdmin = true` on a user via Prisma Studio)
- [ ] Custom domain connected (if applicable)

---

## 10. Setting Admin User

To make a user an admin, use Prisma Studio:

```bash
npx prisma studio
```

Then update the `User` table:
- Find your user by email
- Set `isAdmin` to `true`

Or run this SQL in Supabase SQL Editor:
```sql
UPDATE "User" SET isAdmin = true WHERE email = 'your-email@example.com';
```

---

## 11. Troubleshooting

### Prisma Migrate Fails in CI

Use `prisma migrate deploy` instead of `prisma migrate dev` in CI/CD.

### Webhook Not Receiving Events

- Ensure webhook endpoint is publicly accessible
- Check Stripe Dashboard → Developers → Webhooks for event logs
- Verify webhook secret matches `.env`

### Emails Not Sending

- Verify domain in Resend dashboard
- Check Resend logs for error messages
- Ensure `RESEND_FROM_EMAIL` matches verified domain

### Sentry Not Capturing Events

- Verify `SENTRY_DSN` is set correctly
- Check Sentry project settings for allowed domains
- Ensure source maps are uploading (check Vercel build logs)

---

## 12. Next Steps

- [ ] Add custom domain in Vercel
- [ ] Set up Vercel Blob for photo uploads
- [ ] Configure Stripe for production (live keys)
- [ ] Add rate limiting to API routes
- [ ] Set up backup strategy for Supabase database
- [ ] Add monitoring/uptime checks (e.g. UptimeRobot)
