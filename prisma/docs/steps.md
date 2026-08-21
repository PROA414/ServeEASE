# 🗺️ SearveEASE — Development Roadmap (Updated)

> **Status note (Aug 2026):** This doc was rewritten to reflect what is *actually* built.
> The original step-by-step guide listed nearly everything as incomplete, but the MVP is
> now fully implemented and verified end-to-end (see **Current State** below).
> Phase A (bug fixes) and Phase B (polish) are complete; the plan is now to finish the
> photo item and move to Phase C. **Found & fixed:** `prisma/schema.prisma` had been
> truncated to placeholder comments plus a phantom `ComboBooking` model — neither the DB
> nor the generated client had it. Rebuilt the schema from the generated DMMF; `prisma
> validate`/`generate`/`db push` now pass and stay in sync.

---

## ✅ CURRENT STATE — What's Built (verified working)

**Stack:** Next.js 15.5 (App Router, `src/`), React 19, TypeScript, Tailwind v4,
Prisma 5.22 + SQLite, Better Auth 1.7, Stripe, shadcn/ui on Base UI, RHF+zod, sonner.

**Build:** `npm run build` green — 21 routes compile; booking/escrow/chat/admin/wallet
flows verified against a production `next start` server.

| # | Feature | Status |
| :--- | :--- | :--- |
| 1 | Project setup (Next, TS, Tailwind, shadcn) | ✅ Built |
| 2 | Prisma schema + SQLite + seed | ✅ Built |
| 3 | Better Auth (signup/login, sessions, middleware) | ✅ Built |
| 4 | Browse providers + category filter + detail page | ✅ Built |
| 5 | Become-a-provider form | ✅ Built |
| 6 | Booking form (date, full/half day, escrow hold) | ✅ Built |
| 7 | Booking success + my-bookings + detail | ✅ Built |
| 8 | Wallet + Stripe Checkout + webhook + ledger | ✅ Built (keys are placeholders) |
| 9 | Check-in / check-out (photo + GPS) | ✅ Built |
| 10 | Payment release + rating (avg, 1–5 stars) | ✅ Built |
| 11 | In-app chat (5s polling, party-only) | ✅ Built |
| 12 | Admin dashboard (stats, bookings, users, refund, credit adj.) | ✅ Built |
| 13 | Dashboard (balance, active/total counts, upcoming/past) | ✅ Built |

**Routes (21):** `/`, `/login`, `/signup`, `/dashboard`, `/providers`, `/providers/[id]`,
`/become-provider`, `/bookings`, `/bookings/[id]`, `/bookings/[id]/success`,
`/bookings/[id]/chat`, `/wallet`, `/admin`, `/payment/success`, `/payment/cancel`,
`/api/auth/[...all]`, `/api/payment/create-checkout`, `/api/payment/webhook`,
`/api/ratings`, `/api/bookings/[id]/messages`, `/_not-found`.

**Domain model:** `User` (has `isAdmin`) → `ServiceProvider` (1:1). `Booking`
(status: pending → confirmed → in_progress → completed → released; plus
disputed / cancelled / refunded). `Message` (chat). `CreditTransaction` (running
balance ledger; types: purchase / hold / refund / payout). Escrow = hold on booking
creation; cancel/refund = credits back to buyer; release = payout to provider.

**Seed data:** 7 users (buyer + 6 providers), 6 providers, 1 sample booking.
Demo logins (all `password123`): `buyer@example.com`, `maria@example.com`,
`grace@example.com`, `david@example.com`, `james@example.com`, `aisha@example.com`,
`robert@example.com`. Buyer starts with 500 credits.

---

## 🐛 PHASE A — MVP BUG FIXES (NEXT UP)

> Fix correctness issues before adding anything new. Each item is small and safe.

### A1. Admin bookings table — wrong buyer name
- **Bug:** `admin-dashboard-client.tsx` lines 184–189 render `booking.provider.user.name`
  in **both** the Buyer and Provider columns — the buyer name is never shown.
- **Fix:** use `booking.buyer.name` for the Buyer cell. The query in
  `app/actions/admin.ts` (`getAdminBookings`) already includes `buyer`, so this is a
  one-line component change.

### A2. "View" button on bookings list links to the wrong place
- **Bug:** `bookings-list.tsx` line 78 links each booking to `/providers/[id]`
  (the provider's public profile) instead of the booking detail `/bookings/[id]`.
- **Fix:** link to `/bookings/${booking.id}`. This is where the user actually
  manages the booking (check-in/out, release, chat).

### A3. Providers can't see their own bookings
- **Bug:** `/bookings` page queries `where: { buyerId: session.user.id }` only.
  A provider has no list of jobs booked with them, and the dashboard is buyer-only too.
  The only way a provider sees a booking is by guessing the URL.
- **Fix (MVP):** in `app/bookings/page.tsx`, fetch bookings where the user is
  **buyer OR provider** (`provider.userId`), so both roles see their bookings.
- **Fix (polish):** see Phase B1 — provider section on the dashboard.

### A4. Dead `confirmed` status — no provider acceptance flow
- **Bug:** nothing ever sets `confirmed`; check-in accepts `pending` or `confirmed`
  and jumps straight to `in_progress`. The status enum implies an accept step that
  doesn't exist.
- **Fix (MVP, choose one):**
  - *(Recommended)* Add a small **"Accept booking"** action for providers
    (`pending → confirmed`) in the booking detail page, or
  - Simplify the enum to remove `confirmed` (bigger refactor, not recommended now).

### A5. Admin "Net revenue" is misleading
- **Bug:** `getAdminStats` sums *all* `CreditTransaction.amount`, which includes
  holds, refunds, and provider payouts — not actual Stripe revenue.
- **Fix:** count only `type: "purchase"` (or sum only purchase rows) and label it
  "Total credit purchases" instead of "Net revenue".

### A6. Seeded buyer can't log in
- **Bug:** seed creates `buyer@example.com` with 500 credits but no password hash.
- **Fix:** update `prisma/seed.ts` to create the buyer via Better Auth (or store a
  known-password hash) so demo accounts are usable. Document credentials in README.

### A7. Provider card "Verified" badge logic
- **Bug:** `provider-card.tsx` shows "Verified" when `totalBookings > 0`, but the
  real `ServiceProvider.verified` boolean exists and is only used on the detail page.
- **Fix:** drive the badge from `provider.verified` (and seed some providers as verified).

### A8. Root-level scratch files
- `server.js`, `index.ts`, `test.ts`, `queries.js` at the repo root are leftover
  scratch/debug files that aren't part of the app.
- **Fix:** move to a `scratch/` folder or delete (keep out of the app tree).

---

## ✨ PHASE B — MVP POLISH (next after A)

### B1. Provider dashboard section — ✅ DONE
- Added a provider view to `/dashboard`: total earnings (sum of `payout` txs),
  upcoming/completed job counts, and the provider's bookings in tabs (buyer names shown).
  Rendered only when the signed-in user has a `ServiceProvider` profile
  (`src/components/dashboard/provider-dashboard.tsx`). `BookingsTabs` now forwards `viewerId`.

### B2. Stripe goes live — ✅ DONE (test mode)
- Wired the real Stripe **test-mode** keys from the Stripe CLI (`stripe config --list`) into `.env`
  (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
- Started `stripe listen --forward-to http://localhost:3000/api/payment/webhook` and set the
  resulting `whsec_...` signing secret as `STRIPE_WEBHOOK_SECRET`.
- Verified end-to-end: created a real Checkout session via `/api/payment/create-checkout`
  (correct `userId` + `credits` metadata), paid with the test card `4242 4242 4242 4242`,
  the webhook fired `checkout.session.completed`, and the buyer wallet credited
  **500 → 380 → 480** credits (purchase tx recorded with the Stripe session as reference).
- To run it again: `stripe listen --forward-to http://localhost:3000/api/payment/webhook`
  (the secret in `.env` changes each run), restart the app on port 3000, then buy from the
  Wallet page.
- Go-live: swap in live-mode keys (`sk_live_...` / `pk_live_...`), register the production
  webhook endpoint in the Stripe dashboard, and remove the placeholder webhook signing secret.

### B3. Photo storage off the DB — ⏳ best with Phase C
- Check-in/out photos are stored as base64 data URLs in SQLite. Fine for MVP, will
  bloat the DB quickly. Move to Vercel Blob / S3 / Cloudinary and store URLs.
- Best done at the same time as a Postgres migration (Phase C).

### B4. Empty-state + navigation polish — ✅ DONE
- UserMenu now links to Wallet, "Become a provider" (or "My provider profile" when
  already a provider), and Admin (only for admins). Site header detects the user's
  provider/admin status server-side and passes it to the menu.
- `/bookings` empty state is role-aware ("When someone books you as a provider…" for
  providers). `BookingsList` accepts an optional `emptyState`.

### B5. Lint/typecheck hygiene — ✅ DONE
- Installed `eslint@9` + `eslint-config-next@15.5.23`; `npm run lint` → 0 errors.
  Fixed `eslint.config.mjs` (was written for a newer config format).
- Added `npm run typecheck` (`tsc --noEmit`). Cleaned all unused-import warnings.
- Made the pre-existing vitest suite green (`npm run test` → 10 passed across 3 files):
  fixed the vite config (Vite 8 uses oxc, not esbuild), mocked `next/headers` + email
  components, updated tests to future dates, added `$transaction`/`user` mocks.
- Fixed pre-existing broken work that TS 5.9 surfaced: `upload/route.ts` File
  narrowing, duplicate `provider` identifier in `bookings.ts` email block, Sentry
  config (v10 API — `NextjsTracingNode` removed), email payloads now render to HTML
  via `@react-email/render` instead of sending React elements as JSON.

### C1. Dispute flow — ✅ DONE
- New `Dispute` model (one per booking, linked to filing user) added to the schema and
  pushed to SQLite.
- Buyers/providers can file a dispute from the booking detail page (pending/confirmed/
  in_progress/completed only; one dispute per booking). Filing sets the booking to
  `disputed` and records the reason + who filed.
- Booking detail page shows a Dispute card with the reason, filer, and admin decision
  (refunded the buyer / paid the provider) once resolved.
- Admin dashboard gained a **Disputes** tab listing open/resolved disputes with the
  booking parties, reason, and a **Resolve** dialog to refund the buyer or pay the
  provider. Resolving refunds the buyer (`refund` tx, booking → `refunded`) or pays the
  provider (`payout` tx, booking → `released`) and records an optional admin note.
- Unit tests added for `fileDispute` + `resolveDispute`; full flow verified E2E
  (file → disputed → resolve → buyer refunded 480→600 → booking refunded → UI shows
  "Resolved — refunded the buyer").

### C2. Availability / calendar — ✅ DONE
- `ServiceProvider.availableDays` (comma-separated weekday numbers 0=Sun..6=Sat; null =
  any day) added to the schema and pushed to SQLite.
- **Provider dashboard** gained a **Weekly availability** editor: pick Mon–Sun chips,
  save via the `updateAvailability` server action. Selecting none = available any day.
- **Booking calendar** (`booking-form.tsx`) now disables past dates, dates not in the
  provider's selected weekdays, and dates already booked (pending/confirmed/in_progress).
- **Server-side enforcement** in `createBooking`: rejects dates on days the provider
  isn't available ("The provider isn't available on that day…") — checked before any
  credit hold.
- Provider **detail page** shows an "Available" line (e.g. "Mon, Tue, Wed, Thu, Fri" or
  "Every day").
- Shared helpers in `src/lib/availability.ts` (`parseAvailableDays`,
  `availableDaysLabel`, `WEEKDAYS`).
- Unit tests for `updateAvailability` + a `createBooking` availability rejection; 26
  tests pass; build + typecheck + lint clean; verified E2E (editor renders on dashboard,
  detail shows "Mon–Fri" label, booking form receives availability).

### C3. Provider search + sort — ✅ DONE
- Providers page gained a **search box** (filters by provider name, category or bio
  keyword) and a **sort dropdown** (highest rated / price low-high / price high-low /
  most booked), both server-rendered via URL params (`?q=`, `?sort=`).
- Implemented in `src/components/providers/search-sort.tsx` (client, keeps the URL in
  sync) and `src/app/providers/page.tsx` (server: validates params, builds Prisma
  `where`/`orderBy`). Combines with the existing category filter.
- Sort order verified E2E against seeded ratings/prices/bookings; search verified
  (`?q=Maria` shows only Maria; `?q=cook` matches the category). Build + typecheck +
  lint clean; 26 tests pass.

### C4. In-app notifications — ✅ DONE
- New `Notification` model (recipient, type, title/body, link, readAt) + index on
  `(userId, readAt)`; pushed to SQLite.
- **Header bell** with live unread badge + dropdown (polls every 30s) listing the 20
  newest notifications; opening it or clicking one marks them read (via `/api/notifications`
  POST). A dedicated **Notifications page** at `/notifications` shows all 100 recent items
  with a "Mark all read" form.
- **Booking-event alerts** wired into the booking lifecycle: new booking request (provider),
  booking confirmed (buyer), booking cancelled (provider), check-in (buyer), check-out
  (buyer), payment released (provider), dispute filed (other party + admins), dispute
  resolved (both parties) — all from the existing server actions.
- **Unread chat counters**: new messages create a `message` notification for the other
  party; the My Bookings list shows a "N new" badge per booking, and opening the chat
  marks those notifications read.
- Unit tests added for `createNotification`, `getNotifications` and
  `markAllNotificationsRead` (30 tests total); verified E2E (bell unread count,
  mark-all-read, bookings badge, notifications page, chat read-marking).

### C5. Admin pagination — ✅ DONE
- Admin bookings, users and disputes lists now paginate at 10 rows per page instead of a
  flat 100-row cap. The active tab and page are URL-driven (`?tab=`, `?page=`), so links
  are shareable and back/forward work.
- Reusable `PaginationControls` component renders a prev/next + numbered pager with a
  "Showing X–Y of Z" summary; out-of-range pages clamp to the last page; single-page lists
  hide the pager.
- Admin server actions now return `{ items, pagination }` via a shared `pagedQuery`
  helper (skip/take + count). Unit tests added for paging, zero-row and out-of-range
  behavior (34 tests total); verified E2E across tabs and pages.

---

## 🚀 PHASE C — FUTURE ROADMAP (not started)

| Feature | Notes |
| :--- | :--- |
| **PostgreSQL migration** | SQLite is fine for dev; switch to Postgres before any hosting. Prisma provider change + migrate. |
| **Deploy to Vercel** | Set `DATABASE_URL`, `BETTER_AUTH_*`, `STRIPE_*`, `RESEND_API_KEY`; fix `outputFileTracingRoot` already handled in `next.config.ts`. |
| **Email notifications** | Resend: booking confirmed (buyer), new booking (provider), check-in reminder, payment released. (Original Phase 9.) |
| **Dispute flow** | ✅ **C1** |
| **Availability / calendar** | ✅ **C2** |
| **Provider earnings payout (bank)** | Today credits pay out to the provider's balance; a real app needs Stripe Payout / Connect. |
| **Notifications in-app** | ✅ **C4** — bell with unread count + dropdown, notifications page, booking-event + message alerts, unread chat badges. |
| **Search** | ✅ **C3** — name/category/bio keyword search + sort by rating / price / most booked. |
| **Pagination** | ✅ **C5** — admin bookings/users/disputes lists are paged (10/page) via URL `?page=`/`?tab=` with prev/next + numbered pager; out-of-range pages clamp to the last page. |

---

## 📋 ACCURATE CHECKLIST

| Phase | Feature | Status |
| :--- | :--- | :--- |
| 1 | Project setup + schema + auth | ✅ |
| 2.1 | Become-a-provider | ✅ |
| 2.2 | Provider dashboard / earnings | ✅ **B1** |
| 3.1–3.5 | Browse / detail / booking / success / my-bookings | ✅ |
| 4.1 | Credit wallet + ledger | ✅ |
| 4.2 | Stripe integration | ✅ test mode verified (**B2**) |
| 5.1–5.2 | Check-in / check-out | ✅ |
| 6.1–6.2 | Release payment + rating | ✅ |
| 7.1–7.2 | Chat | ✅ |
| 8.1–8.2 | Admin | ✅ |
| 9 | Email notifications | 🟡 code added, needs `RESEND_API_KEY` (**C**) |
| 10 | Production / Postgres / deploy | ⬜ **C** |

---

## 🎯 Next Immediate Steps

1. **Phase A** — all bugs fixed and E2E-verified. ✅
2. **Phase B** — B1 (provider dashboard), B4 (nav + empty states), B5 (lint/typecheck/test)
   done and verified. ✅
3. Remaining **B3** needs a storage service (Vercel Blob/S3). Stripe test mode (**B2**) is
   verified end-to-end; go-live just needs live keys + a production webhook endpoint.
4. **Dispute flow (C1)**, **Availability/calendar (C2)**, **Search/sort (C3)**,
   **In-app notifications (C4)** and **Admin pagination (C5)** are done.
5. Optional: provider check-in/out quick links on dashboard (B1 follow-up),
   demo-login documentation in README.
6. Then rest of **Phase C**: Postgres, deploy, email keys, payouts.