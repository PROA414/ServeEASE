Perfect! Here's your **complete procedural guide** to build your SearveEASE app from start to finish. Follow these steps in order, and you'll have a working MVP.

---

# 🗺️ SearveEASE App Development Procedures

---

## 📦 PHASE 1: Project Setup (COMPLETED ✅)

### Step 1.1: Install Required Software
```bash
# 1. Install Node.js (v20+)
# Download from: https://nodejs.org/

# 2. Install Git
# Download from: https://git-scm.com/download/win

# 3. Install VS Code
# Download from: https://code.visualstudio.com/download

# 4. Verify installations
node --version
npm --version
git --version
code --version
```

### Step 1.2: Create Next.js Project
```bash
# Create project folder
mkdir SearveEASE
cd SearveEASE

# Open in VS Code
code .

# In VS Code terminal (Ctrl+`):
npx create-next-app@latest . --typescript --tailwind --eslint
# Select: No, Yes, No
```

### Step 1.3: Install Database & ORM
```bash
npm install prisma @prisma/client
npm install better-auth @better-auth/prisma-adapter
npx prisma init
```

### Step 1.4: Set Up Environment
```bash
# Create .env file
New-Item -Path .env -ItemType File
```

**Add to .env:**
```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="[generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"]"
BETTER_AUTH_URL="http://localhost:3000"
```

### Step 1.5: Define Prisma Schema
Create `prisma/schema.prisma` with the full schema provided earlier.

### Step 1.6: Run Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Step 1.7: Install UI Components
```bash
npx shadcn@latest init
npx shadcn@latest add form input button card label toast dialog calendar popover radio-group badge tabs select
npm install react-hook-form @hookform/resolvers zod date-fns
```

---

## 🔐 PHASE 2: Authentication (COMPLETED ✅)

### Step 2.1: Set Up Better Auth
Create `src/lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  experimental: { joins: true },
});
```

### Step 2.2: Create Auth API Route
Create `src/app/api/auth/[...all]/route.ts`:
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Step 2.3: Create Login Page
Create `src/app/login/page.tsx` with shadcn form components.

### Step 2.4: Create Signup Page
Create `src/app/signup/page.tsx` with name, email, password, confirmPassword.

### Step 2.5: Create Middleware for Route Protection
Create `src/middleware.ts`:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("better-auth.session");
  
  const protectedPaths = ["/dashboard", "/bookings", "/providers", "/profile"];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/bookings/:path*", "/providers/:path*"] };
```

---

## 👤 PHASE 3: Provider System (NEXT UP)

### Step 3.1: Provider Registration Form
Create `src/app/become-provider/page.tsx`:
- Form fields: category (cleaner/nanny/cook/handyman), dailyRate, halfDayRate, bio, experience
- Zod validation
- Save to ServiceProvider table

**Prompt for AI:**
> *"Create a provider registration page at /become-provider. Include: category dropdown (cleaner, nanny, cook, handyman), daily rate input, half day rate input, bio textarea, experience textarea. Use Zod validation. Save to ServiceProvider table using Prisma. Redirect to /providers after success."*

### Step 3.2: Provider Dashboard
Update dashboard to show provider-specific info:
- Their bookings
- Earnings
- Check-in/out buttons

---

## 🔍 PHASE 4: Booking Flow (CURRENT PRIORITY)

### Step 4.1: Browse Providers Page
Create `src/app/providers/page.tsx`:
- List all providers with cards
- Filter by category
- Show name, category, rate, rating

### Step 4.2: Provider Detail Page
Create `src/app/providers/[id]/page.tsx`:
- Full provider profile
- Booking form with date picker
- Full/half day selector
- Credit check

### Step 4.3: Booking Logic
```typescript
// When booking is submitted:
// 1. Check user credits balance
// 2. If enough, deduct credits and hold in escrow
// 3. Create Booking record with status 'pending'
// 4. Use Prisma transaction
```

### Step 4.4: Booking Success Page
Create `src/app/bookings/[id]/success/page.tsx`:
- Show booking confirmation details
- Link to dashboard
model Booking {
  // ... existing fields ...
  
  bookingType   String   @default("single") // "single" or "combo"
  services      String?  // JSON array: ["cleaner", "nanny", "cook"]
  comboDiscount Int?     // Percentage discount for combo (e.g., 10)
  
  // ... rest of fields ...
}
### Step 4.5: My Bookings Page
Create `src/app/bookings/page.tsx`:
- List all user's bookings
- Show status badges
- Filter by status (upcoming, past)

---

## 💳 PHASE 5: Credit System

### Step 5.1: Credit Wallet
Create `src/app/wallet/page.tsx`:
- Show current balance
- Buy credits button
- Transaction history

### Step 5.2: Stripe Integration
Install Stripe:
```bash
npm install stripe @stripe/stripe-js
```

Create payment pages:
- `src/app/api/payment/create-checkout/route.ts` - Create Stripe Checkout session
- `src/app/api/payment/webhook/route.ts` - Handle Stripe webhooks
- `src/app/payment/success/page.tsx` - Success page
- `src/app/payment/cancel/page.tsx` - Cancel page

**Prompt for AI:**
> *"Set up Stripe Checkout for buying credits. Create an API route that creates a Stripe Checkout session with a custom amount based on credits purchased. On successful payment, use a webhook to add credits to the user's balance in the CreditTransaction table. Include success and cancel pages."*

---

## 📍 PHASE 6: Check-in/Check-out System

### Step 6.1: Check-in Button
Add to booking detail page:
```typescript
// Provider clicks "Start Job"
// Record: checkInAt, checkInLat, checkInLng, checkInPhoto
// GPS verification using browser geolocation API
// Update booking status to 'in_progress'
```

### Step 6.2: Check-out Button
```typescript
// Provider clicks "End Job"
// Record: checkOutAt, checkOutLat, checkOutLng, checkOutPhoto
// Update booking status to 'completed'
```

### Step 6.3: Photo Upload
```typescript
// Before and after photos
// Upload to cloud storage (Cloudinary, AWS S3, or Vercel Blob)
// Save URLs to booking
```

**Prompt for AI:**
> *"Add check-in/check-out functionality to the booking detail page. For providers: Add a 'Check In' button that records GPS location (using browser geolocation), timestamp, and allows taking a photo. Add a 'Check Out' button that does the same and updates booking status to 'completed'. Use shadcn dialog for photo capture. Store photos using Vercel Blob or Cloudinary."*

---

## 💰 PHASE 7: Payment Release System

### Step 7.1: Release Payment Button
```typescript
// Buyer clicks "Release Payment"
// Move credits from escrow to provider's balance
// Update booking status to 'released'
// Create CreditTransaction for provider
```

### Step 7.2: Rating System
```typescript
// After release, show rating modal
// 1-5 star rating
// Optional comment
// Update ServiceProvider rating
```

**Prompt for AI:**
> *"Add payment release functionality. For completed bookings, show a 'Release Payment' button to the buyer. When clicked, transfer credits from escrow to the provider's balance. After release, show a rating modal with 1-5 stars and a comment field. Update the provider's average rating."*

---

## 💬 PHASE 8: In-App Chat

### Step 8.1: Chat Model
Add to Prisma schema:
```prisma
model Message {
  id         String   @id @default(cuid())
  bookingId  String
  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  senderId   String
  sender     User     @relation(fields: [senderId], references: [id])
  content    String
  createdAt  DateTime @default(now())
}
```

### Step 8.2: Chat UI
Create `src/app/bookings/[id]/chat/page.tsx`:
- Message list
- Send message input
- Real-time updates (polling or WebSockets)

### Step 8.3: Chat API Routes
- `GET /api/bookings/[id]/messages` - Get messages
- `POST /api/bookings/[id]/messages` - Send message

**Prompt for AI:**
> *"Add in-app chat to bookings. Create a Message model in Prisma with bookingId, senderId, content, and timestamp. Create a chat UI on the booking detail page showing messages in a scrollable list with a text input at the bottom. Create API routes for getting and sending messages."*

---

## ⚙️ PHASE 9: Admin Dashboard

### Step 9.1: Admin Routes
Create `src/app/admin/page.tsx`:
- Total users, providers, bookings
- Recent bookings
- Disputes management

### Step 9.2: Admin Middleware
Update middleware to protect admin routes:
```typescript
// Check if user is admin before allowing access
if (path.startsWith("/admin") && !session?.user?.isAdmin) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

### Step 9.3: Admin Features
- View all bookings
- Cancel/refund bookings
- View all users
- Manual credit adjustments

---

## 📧 PHASE 10: Email Notifications

### Step 10.1: Set Up Email Service
```bash
npm install resend
```

### Step 10.2: Email Templates
```typescript
// Booking confirmation email
// Check-in reminder
// Payment released notification
// Provider new booking alert
```

**Prompt for AI:**
> *"Set up email notifications using Resend. Send emails for: booking confirmation to buyer, new booking alert to provider, check-in reminder 1 hour before, and payment released notification to provider. Create email templates with HTML."*

---

## 🚀 PHASE 11: Deployment

### Step 11.1: Prepare for Production
```bash
# Update .env for production
# Add production database (consider moving to PostgreSQL)
# Update BETTER_AUTH_URL to production URL
```

### Step 11.2: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub to Vercel for automatic deployments
```

### Step 11.3: Set Up Production Database
For production, consider moving from SQLite to PostgreSQL:
```bash
# Update DATABASE_URL in .env
# Run migrations on production database
npx prisma migrate deploy
```

---

## 📋 Complete Checklist

| Phase | Feature | Status |
| :--- | :--- | :--- |
| 1 | Project Setup | ✅ Complete |
| 2 | Authentication | ✅ Complete |
| 3 | Provider System | ⬜ Start This |
| 4 | Booking Flow | ⬜ Next Priority |
| 5 | Credit System | ⬜ |
| 6 | Check-in/out | ⬜ |
| 7 | Payment Release | ⬜ |
| 8 | In-App Chat | ⬜ |
| 9 | Admin Dashboard | ⬜ |
| 10 | Email Notifications | ⬜ |
| 11 | Deployment | ⬜ |

---

## 🎯 Your Next Immediate Steps

| Step | Action |
| :--- | :--- |
| **1** | Select **"Buyer booking flow"** in the AI prompt |
| **2** | Wait for AI to generate the code |
| **3** | Test the flow at `http://localhost:3000/providers` |
| **4** | Report any errors back to the AI |
| **5** | Once booking works, move to **Provider Registration** |

---

## 🛠️ Quick Reference Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npx prisma studio` | Open database visual editor |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate dev --name name` | Create migration |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npx shadcn@latest add component` | Add shadcn component |
| `git add . && git commit -m "message" && git push` | Push to GitHub |

---

**You're ready to build! Start with Phase 3 (Provider System) or Phase 4 (Booking Flow). Which one do you want to tackle first?** 🚀