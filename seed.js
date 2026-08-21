const { PrismaClient } = require('@prisma/client')
const { hashPassword } = require('@better-auth/utils/password')

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'password123'
const CREDENTIAL_ISSUER = 'local:credential'

async function linkCredentialAccount(userId, passwordHash) {
  await prisma.account.upsert({
    where: {
      issuer_accountId: {
        issuer: CREDENTIAL_ISSUER,
        accountId: userId,
      },
    },
    update: { password: passwordHash },
    create: {
      userId,
      providerId: 'credential',
      issuer: CREDENTIAL_ISSUER,
      accountId: userId,
      password: passwordHash,
    },
  })
}

const PROVIDERS = [
  {
    name: 'Maria Santos',
    email: 'maria@example.com',
    category: 'cleaner',
    dailyRate: 120,
    halfDayRate: 70,
    bio: 'Experienced professional cleaner with 5 years of experience. I handle deep cleans, move-out cleans and regular maintenance.',
    experience: '5 years',
    rating: 4.8,
    totalBookings: 132,
    verified: true,
  },
  {
    name: 'Grace Okafor',
    email: 'grace@example.com',
    category: 'nanny',
    dailyRate: 150,
    halfDayRate: 85,
    bio: 'Certified nanny and early childhood educator. Loving, patient and reliable care for infants through school-age kids.',
    experience: '7 years',
    rating: 4.9,
    totalBookings: 210,
    verified: true,
  },
  {
    name: 'David Chen',
    email: 'david@example.com',
    category: 'cook',
    dailyRate: 110,
    halfDayRate: 65,
    bio: 'Professional home cook specializing in healthy, family-friendly meals. Meal prep and special-occasion cooking welcome.',
    experience: '4 years',
    rating: 4.6,
    totalBookings: 98,
    verified: true,
  },
  {
    name: 'James Miller',
    email: 'james@example.com',
    category: 'handyman',
    dailyRate: 130,
    halfDayRate: 75,
    bio: 'Reliable handyman for repairs, furniture assembly, painting and small home projects. Fully insured.',
    experience: '9 years',
    rating: 4.7,
    totalBookings: 164,
    verified: true,
  },
  {
    name: 'Aisha Bello',
    email: 'aisha@example.com',
    category: 'cleaner',
    dailyRate: 100,
    halfDayRate: 60,
    bio: 'Thorough, eco-friendly cleaning using safe products. Great with pets and detailed kitchens and bathrooms.',
    experience: '3 years',
    rating: 4.5,
    totalBookings: 76,
    verified: false,
  },
  {
    name: 'Robert Gomez',
    email: 'robert@example.com',
    category: 'handyman',
    dailyRate: 120,
    halfDayRate: 70,
    bio: 'Handyman with electrical and plumbing basics. Fast, tidy and budget-friendly.',
    experience: '6 years',
    rating: 4.4,
    totalBookings: 121,
    verified: false,
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  const demoPasswordHash = await hashPassword(DEMO_PASSWORD)

  // Buyers with credit balances
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: { password: demoPasswordHash },
    create: {
      name: 'Sarah Buyer',
      email: 'buyer@example.com',
      password: demoPasswordHash,
      emailVerified: true,
    },
  })
  await linkCredentialAccount(buyer.id, demoPasswordHash)

  const existingPurchase = await prisma.creditTransaction.findFirst({
    where: { userId: buyer.id, type: 'purchase', description: 'Initial credit purchase' },
  })
  if (!existingPurchase) {
    await prisma.creditTransaction.create({
      data: {
        userId: buyer.id,
        amount: 500,
        balance: 500,
        type: 'purchase',
        status: 'completed',
        description: 'Initial credit purchase',
      },
    })
  }

  // Providers
  for (const p of PROVIDERS) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, password: demoPasswordHash },
      create: {
        name: p.name,
        email: p.email,
        password: demoPasswordHash,
        emailVerified: true,
      },
    })
    await linkCredentialAccount(user.id, demoPasswordHash)

    await prisma.serviceProvider.upsert({
      where: { userId: user.id },
      update: {
        category: p.category,
        dailyRate: p.dailyRate,
        halfDayRate: p.halfDayRate,
        bio: p.bio,
        experience: p.experience,
        verified: p.verified,
        rating: p.rating,
        totalBookings: p.totalBookings,
      },
      create: {
        userId: user.id,
        category: p.category,
        dailyRate: p.dailyRate,
        halfDayRate: p.halfDayRate,
        bio: p.bio,
        experience: p.experience,
        verified: p.verified,
        rating: p.rating,
        totalBookings: p.totalBookings,
      },
    })
    console.log(`✅ ${p.name} (${p.category})`)
  }

  // A sample booking for the buyer to make the dashboard non-empty
  const firstProvider = await prisma.user.findUnique({
    where: { email: 'maria@example.com' },
  })
  const firstProviderProfile = await prisma.serviceProvider.findUnique({
    where: { userId: firstProvider.id },
  })

  if (firstProviderProfile) {
    await prisma.booking.upsert({
      where: { id: 'sample-booking-1' },
      update: {},
      create: {
        id: 'sample-booking-1',
        buyerId: buyer.id,
        providerId: firstProviderProfile.id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        duration: 'full',
        totalCredits: firstProviderProfile.dailyRate,
        specialInstructions: 'Please bring your own eco-friendly supplies.',
        status: 'pending',
      },
    })

    const existingHold = await prisma.creditTransaction.findFirst({
      where: { userId: buyer.id, type: 'hold', reference: 'sample-booking-1' },
    })
    if (!existingHold) {
      await prisma.creditTransaction.create({
        data: {
          userId: buyer.id,
          amount: -firstProviderProfile.dailyRate,
          balance: 500 - firstProviderProfile.dailyRate,
          type: 'hold',
          reference: 'sample-booking-1',
          description: 'Held in escrow for booking sample-booking-1',
          status: 'held',
        },
      })
    }
    console.log('✅ Sample pending booking for buyer@example.com')
  }

  // Seeded reviews (released bookings with comments) so provider cards
  // and profiles display real review snippets
  const REVIEWS = [
    {
      email: 'maria@example.com',
      comment: 'Maria did an incredible deep clean of our whole apartment. Sparkling result and very professional!',
      reviewer: 'buyer@example.com',
    },
    {
      email: 'grace@example.com',
      comment: 'Grace is wonderful with kids. My daughter asks for her every week now. So patient and caring.',
      reviewer: 'buyer@example.com',
    },
    {
      email: 'david@example.com',
      comment: 'David cooked us a delicious week of healthy meals. Great communication and attention to detail.',
      reviewer: 'buyer@example.com',
    },
    {
      email: 'james@example.com',
      comment: 'James fixed our fence and a leaking tap in record time. Reliable and clearly experienced.',
      reviewer: 'buyer@example.com',
    },
    {
      email: 'aisha@example.com',
      comment: 'Aisha left our home spotless before a big family visit. Highly recommend her cleaning service.',
      reviewer: 'buyer@example.com',
    },
    {
      email: 'robert@example.com',
      comment: 'Robert painted our living room and fixed the garage door. Fair price and tidy workmanship.',
      reviewer: 'buyer@example.com',
    },
  ]

  for (const review of REVIEWS) {
    const providerUser = await prisma.user.findUnique({
      where: { email: review.email },
    })
    if (!providerUser) continue
    const providerProfile = await prisma.serviceProvider.findUnique({
      where: { userId: providerUser.id },
    })
    if (!providerProfile) continue

    await prisma.booking.upsert({
      where: { id: `seed-review-${providerProfile.id}` },
      update: {},
      create: {
        id: `seed-review-${providerProfile.id}`,
        buyerId: buyer.id,
        providerId: providerProfile.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 'full',
        totalCredits: providerProfile.dailyRate,
        status: 'released',
        rating: 5,
        comment: review.comment,
      },
    })
    console.log(`✅ Review for ${providerUser.name}`)
  }

  console.log('🎉 Seeding complete!')
  console.log(`👤 Demo login: buyer@example.com / ${DEMO_PASSWORD} (buyer, 500 credits)`)
  console.log(`👤 Provider logins: maria@example.com, grace@example.com, david@example.com, james@example.com, aisha@example.com, robert@example.com / ${DEMO_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })