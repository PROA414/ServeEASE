# SearveEASE: Credential Setup Guide

This guide walks you through getting every API key and connection string needed to run SearveEASE in production.

---

## 1. PostgreSQL Database (Supabase)

SearveEASE uses Supabase for PostgreSQL hosting.

### Steps

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New project**
3. Choose an organization, enter a **Project name**, and set a **Database password**
4. Wait for provisioning (~30 seconds)
5. Once ready, go to **Settings → Database**
6. Under **Connection string**, select **URI** and copy the connection string
7. It will look like:
   ```
   postgresql://postgres:[password]@db.xxxxx.supabase.com:5432/postgres
   ```
8. Add `?pgbouncer=true` to the end for connection pooling:
   ```
   postgresql://postgres:[password]@db.xxxxx.supabase.com:5432/postgres?pgbouncer=true
   ```

### Where to paste it

**File:** `.env`
```env
DATABASE_URL="postgresql://postgres:[password]@db.xxxxx.supabase.com:5432/postgres?pgbouncer=true"
```

### Common pitfalls

- Don't forget the `?pgbouncer=true` suffix in production; Supabase free tier requires it for connection pooling
- If you see `connection pool is full` errors later, upgrade to Supabase Pro or add PgBouncer manually

---

## 2. Better Auth Secret

Better Auth needs a random secret to sign sessions.

### Steps

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

### Where to paste it

**File:** `.env`
```env
AUTH_SECRET="paste-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

### Common pitfalls

- Use a different secret for production
- Don't commit the real secret to git

---

## 3. Stripe (Payments)

Stripe handles credit purchases.

### Steps

1. Go to [stripe.com](https://stripe.com) and sign up
2. Activate your account (you may need to enter business details; for testing you can use personal info)
3. Go to **Developers → API keys**
4. Copy the **Secret key** (`sk_test_...`)
5. Copy the **Publishable key** (`pk_test_...`)
6. Go to **Developers → Webhooks**
7. Click **Add endpoint**
8. For local testing, use `http://localhost:3000/api/payment/webhook`
9. Select the event: `checkout.session.completed`
10. Copy the **Webhook secret** (`whsec_...`)

### Where to paste them

**File:** `.env`
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Common pitfalls

- Use test keys (`sk_test_...`, `pk_test_...`) in development
- Switch to live keys (`sk_live_...`, `pk_live_...`) only when ready to accept real payments
- The webhook secret is different from the API key; make sure you copy the right one
- For local webhook testing, install Stripe CLI:
  ```bash
  iwr https://bin.stripe.com/install.ps1 | iex
  stripe login
  stripe listen --forward-to localhost:3000/api/payment/webhook
  ```

---

## 4. Resend (Email Notifications)

Resend sends booking confirmations and alerts.

### Steps

1. Go to [resend.com](https://resend.com) and sign up
2. Go to **Domains**
3. Click **Add domain**
4. Enter your domain (e.g. `yourdomain.com`)
5. Resend will give you DNS records to add (TXT, MX, etc.)
6. Add these records to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
7. Wait for verification (~5-30 minutes)
8. Go to **API keys** and create a new key
9. Copy the key (`re_...`)

### Where to paste it

**File:** `.env`
```env
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="SearveEASE <noreply@yourdomain.com>"
```

### For development without a custom domain

Resend offers a test domain: `onboarding@resend.dev`
- You can use this temporarily
- It only allows sending to your own Resend-registered email
- Switch to your custom domain before production

### Common pitfalls

- Emails won't send until the domain is verified in Resend
- The `RESEND_FROM_EMAIL` must match the verified domain
- Check Resend dashboard logs if emails aren't arriving

---

## 5. Sentry (Error Monitoring)

Sentry tracks errors and performance issues.

### Steps

1. Go to [sentry.io](https://sentry.io) and sign up
2. Click **Create project**
3. Select **Next.js** as the platform
4. Name your project (e.g. `searveease`)
5. Copy the **DSN** (Data Source Name)
6. It looks like:
   ```
   https://xxxx@xxxx.ingest.sentry.io/xxxx
   ```

### Where to paste it

**File:** `.env`
```env
SENTRY_DSN="https://xxxx@xxxx.ingest.sentry.io/xxxx"
```

### Common pitfalls

- The DSN is public-safe; it's okay to expose it in client-side code
- Sentry config files already exist: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Check Sentry dashboard → Settings → Projects to find your DSN

---

## 6. Vercel Blob (Photo Storage)

Vercel Blob stores check-in/out photos.

### Steps

1. Deploy your app to Vercel first (or use local Vercel CLI)
2. In your Vercel project, go to **Storage → Blob**
3. Click **Create database**
4. Name it (e.g. `searveease-blob`)
5. Copy the **Read token** and **Write token**
6. Add them as Vercel environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `BLOB_READ_ONLY_TOKEN`

### Where to paste them

**Vercel Environment Variables:**
- `BLOB_READ_WRITE_TOKEN` = your write token
- `BLOB_READ_ONLY_TOKEN` = your read token

**Note:** The `@vercel/blob` SDK automatically reads `BLOB_READ_WRITE_TOKEN` from the environment. No code changes are needed.

### Common pitfalls

- Blob only works when deployed to Vercel (or using Vercel CLI locally)
- For local development without Vercel, the upload endpoint will fail unless you mock it or use a different provider

---

## 7. App URL

The app needs to know its public URL for Stripe redirects and email links.

### Where to paste it

**File:** `.env`
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production:
```env
NEXT_PUBLIC_APP_URL="https://searveease.vercel.app"
```

---

## Quick Setup Checklist

Use this checklist as you work through the guide:

- [ ] Supabase project created
- [ ] `DATABASE_URL` copied to `.env`
- [ ] `AUTH_SECRET` generated and copied to `.env`
- [ ] `BETTER_AUTH_URL` set in `.env`
- [ ] Stripe account created
- [ ] `STRIPE_SECRET_KEY` copied to `.env`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` copied to `.env`
- [ ] Stripe webhook endpoint created
- [ ] `STRIPE_WEBHOOK_SECRET` copied to `.env`
- [ ] Resend account created
- [ ] Domain added and verified in Resend
- [ ] `RESEND_API_KEY` copied to `.env`
- [ ] `RESEND_FROM_EMAIL` set to verified sender
- [ ] Sentry project created
- [ ] `SENTRY_DSN` copied to `.env`
- [ ] `NEXT_PUBLIC_APP_URL` set
- [ ] All placeholder values replaced in `.env`
- [ ] Run `npx prisma db push` to create tables
- [ ] Run `npm run seed` to add sample data
- [ ] Run `npm run dev` and verify no warnings

---

## Verification

After setting all credentials, start the dev server:

```bash
npm run dev
```

You should see:
- No yellow warning banner about missing env vars
- App loads normally at `http://localhost:3000`
- Providers page shows seeded data
- Login/signup works

If you still see warnings, double-check that no placeholder values remain in `.env`.
