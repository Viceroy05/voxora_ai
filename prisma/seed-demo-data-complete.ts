import { PrismaClient, AIJobStatus, WebhookProvider, WebhookStatus } from "@prisma/client";
import { CallStatus, BookingStatus, SubscriptionPlan, SubscriptionStatus, MembershipRole, CallDirection } from "@prisma/client";

// Demo data helpers
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)];
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomBetween(8, 18));
  date.setMinutes(randomBetween(0, 59));
  return date;
};

const indianNames = [
  "Aarav Sharma", "Priya Patel", "Rahul Kumar", "Ananya Singh", "Vikram Reddy",
  "Sneha Gupta", "Arjun Mehta", "Kavita Nair", "Rohan Joshi",
  "Deepak Verma", "Nisha Agarwal", "Karthik Rajan", "Lakshmi Menon", "Suresh Yadav",
  "Divya Krishnan", "Mohan Das", "Kavita Rao", "Rajesh Pillai", "Sunita Kapoor",
  "Anil Sharma", "Geeta Devi", "Sunil Kumar", "Pooja Verma", "Rakesh Singh",
];

const industries = ["Healthcare", "Dental", "Real Estate", "Spa & Wellness", "Automotive", "Legal", "Education", "Hospitality"];

const serviceNames = [
  "Consultation", "Follow-up visit", "New patient intake", "Emergency service",
  "Property viewing", "Listing inquiry", "Rental application", "Maintenance request",
  "Massage", "Facial treatment", "Body treatment", "Package booking",
  "Oil change", "Brake service", "Engine repair", "Tire service", "General maintenance",
];

const callDispositions = ["BOOKED", "QUALIFIED", "FOLLOW_UP", "ESCALATE", "INFO_ONLY"];
const callSentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"];

export async function seedDemoData(prisma: PrismaClient) {
  console.log("🌱 Starting demo data seeding...");

  // Get or create demo business
  const business = await getOrCreateDemoBusiness(prisma);

  // Seed call logs
  await seedCallLogs(prisma, business.id);

  // Seed bookings
  await seedBookings(prisma, business.id);

  // Seed AI jobs
  await seedAIJobs(prisma, business.id);

  // Seed webhook events
  await seedWebhookEvents(prisma, business.id);

  console.log("✅ Demo data seeding complete!");
}

async function getOrCreateDemoBusiness(prisma: PrismaClient) {
  let business = await prisma.business.findFirst({
    where: { slug: "demo-voxora-ai" },
  });

  // Create demo user first if it doesn't exist
  const demoUserId = "00000000-0000-0000-0000-000000000001";
  const demoUser = await prisma.user.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      email: "demo@voxora.ai",
      fullName: "Demo Owner",
    },
  });

  if (!business) {
    // Create demo business
    business = await prisma.business.create({
      data: {
        slug: "demo-voxora-ai",
        name: "Voxora AI Demo",
        industry: "Healthcare",
        timezone: "Asia/Kolkata",
        websiteUrl: "https://voxora.ai",
        twilioPhoneNumber: "+91987654321",
        createdById: "00000000-0000-0000-0000-000000000001",
        memberships: {
          create: {
            userId: "00000000-0000-0000-0000-000000000001",
            role: MembershipRole.OWNER,
          },
        },
        subscriptions: {
          create: {
            provider: "RAZORPAY",
            plan: SubscriptionPlan.GROWTH,
            status: SubscriptionStatus.ACTIVE,
            amountCents: 34900,
            currency: "INR",
            seats: 10,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        onboarding: {
          create: {
            profileComplete: true,
            billingComplete: true,
            teamComplete: true,
          },
        },
      },
    });

    console.log("✅ Created demo business");
  }

  return business;
}

async function seedCallLogs(prisma: PrismaClient, businessId: string) {
  console.log("📞 Seeding call logs...");

  const callLogs = [];

  // Create 50 call logs with mixed statuses
  for (let i = 0; i < 50; i++) {
    const isAnswered = Math.random() > 0.3;
    const status = isAnswered 
      ? randomItem([CallStatus.COMPLETED, CallStatus.IN_PROGRESS, CallStatus.RINGING])
      : CallStatus.NO_ANSWER;

    const hasBooking = isAnswered && Math.random() > 0.6;
    const callDate = randomDate(randomBetween(0, 30));

    const callLog = {
      businessId,
      callSid: `CA${Date.now()}${i}`,
      direction: randomItem([CallDirection.INBOUND, CallDirection.OUTBOUND]),
      status,
      callerPhone: `+91${randomBetween(7000000000, 9999999999)}`,
      recipientPhone: "+91987654321",
      customerName: randomItem(indianNames),
      durationSeconds: isAnswered ? randomBetween(30, 600) : null,
      startedAt: callDate,
      answeredAt: isAnswered ? new Date(callDate.getTime() + randomBetween(5, 30) * 1000) : null,
      completedAt: isAnswered ? new Date(callDate.getTime() + randomBetween(60, 600) * 1000) : null,
      recordingUrl: isAnswered ? `https://storage.voxora.ai/recordings/${i}.mp3` : null,
      transcriptText: isAnswered ? generateTranscript() : null,
      summaryText: isAnswered ? generateSummary() : null,
      aiAnalysis: isAnswered ? generateAIAnalysis(hasBooking) : null,
      rawPayload: {
        source: "demo_seed",
        generatedAt: new Date().toISOString(),
      },
    };

    callLogs.push(callLog);
  }

  await prisma.callLog.createMany({
    data: callLogs,
  });

  console.log(`✅ Created ${callLogs.length} call logs`);
}

async function seedBookings(prisma: PrismaClient, businessId: string) {
  console.log("📅 Seeding bookings...");

  const bookings = [];

  // Create 20 bookings
  for (let i = 0; i < 20; i++) {
    const status = randomItem([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED]);
    const serviceName = randomItem(serviceNames);
    const amountCents = randomBetween(2000, 50000);
    const bookingDate = randomDate(randomBetween(0, 14));

    const booking = {
      businessId,
      customerName: randomItem(indianNames),
      customerPhone: `+91${randomBetween(7000000000, 9999999999)}`,
      customerEmail: `customer${i}@example.com`,
      serviceName,
      startsAt: bookingDate,
      endsAt: new Date(bookingDate.getTime() + randomBetween(30, 120) * 60000),
      status,
      amountCents,
      currency: "INR",
      notes: generateBookingNotes(serviceName),
      metadata: {
        source: "demo_seed",
        generatedAt: new Date().toISOString(),
      },
    };

    bookings.push(booking);
  }

  await prisma.bookingRecord.createMany({
    data: bookings,
  });

  console.log(`✅ Created ${bookings.length} bookings`);
}

async function seedAIJobs(prisma: PrismaClient, businessId: string) {
  console.log("🤖 Seeding AI jobs...");

  const aiJobs = [];

  // Fetch call logs to get their IDs
  const callLogs = await prisma.callLog.findMany({
    where: { businessId },
    take: 30,
  });

  // Create 30 AI processing jobs
  for (let i = 0; i < 30; i++) {
    const status = randomItem(["COMPLETED", "RUNNING", "PENDING"]);
    const jobDate = randomDate(randomBetween(0, 7));
    const callLogId = callLogs[i]?.id || `demo-call-log-${i}`;

    const aiJob = {
      businessId,
      callLogId,
      jobType: "CALL_ANALYSIS",
      model: "gpt-4.1-mini",
      status: status as AIJobStatus,
      promptVersion: "v1",
      inputPayload: {
        transcriptText: generateTranscript(),
        recordingUrl: `https://storage.voxora.ai/recordings/${i}.mp3`,
      },
      outputPayload: status === "COMPLETED" ? generateAIAnalysis(true) : null,
      errorMessage: status === "FAILED" ? "Processing timeout" : null,
      startedAt: status !== "PENDING" ? new Date(jobDate.getTime() + randomBetween(1, 5) * 1000) : null,
      completedAt: status === "COMPLETED" ? new Date(jobDate.getTime() + randomBetween(10, 60) * 1000) : null,
      createdAt: jobDate,
    } as const;

    aiJobs.push(aiJob);
  }

  await prisma.aiProcessingJob.createMany({
    data: aiJobs,
  });

  console.log(`✅ Created ${aiJobs.length} AI jobs`);
}

async function seedWebhookEvents(prisma: PrismaClient, businessId: string) {
  console.log("🪝 Seeding webhook events...");

  const webhookEvents = [];

  // Create 40 webhook events
  for (let i = 0; i < 40; i++) {
    const eventType = randomItem(["voice.incoming", "voice.status", "voice.recording", "subscription.charged"]);
    const eventDate = randomDate(randomBetween(0, 7));

    const webhookEvent = {
      businessId,
      provider: "TWILIO" as WebhookProvider,
      eventType,
      externalEventId: `${eventType}_${Date.now()}_${i}`,
      signature: `demo_signature_${i}`,
      payload: {
        source: "demo_seed",
        generatedAt: new Date().toISOString(),
      },
      status: "PROCESSED" as WebhookStatus,
      receivedAt: eventDate,
      processedAt: new Date(eventDate.getTime() + randomBetween(1, 10) * 1000),
    } as const;

    webhookEvents.push(webhookEvent);
  }

  await prisma.webhookEvent.createMany({
    data: webhookEvents,
  });

  console.log(`✅ Created ${webhookEvents.length} webhook events`);
}

// Helper functions for generating realistic demo data
function generateTranscript(): string {
  const transcripts = [
    "Hello, I'd like to schedule a consultation for next week.",
    "Hi, I'm calling about the dental cleaning service you offer.",
    "Good morning, I need to book an appointment for a routine checkup.",
    "Hi there, I'm interested in your premium spa package.",
    "Hello, I have an emergency and need immediate assistance.",
    "Hi, I'd like to inquire about your property listing services.",
    "Good afternoon, I need to schedule a vehicle maintenance appointment.",
    "Hello, I want to book a facial treatment session.",
    "Hi, I'm calling to reschedule my appointment from last week.",
    "Good morning, I need information about your membership plans.",
    "Hello, I'd like to book a consultation for my family.",
    "Hi, I have a question about your services and pricing.",
    "Good afternoon, I need to schedule a follow-up visit.",
    "Hello, I'm interested in your annual wellness package.",
    "Hi, I need to book an urgent appointment today.",
    "Good morning, I'd like to know more about your services.",
  ];

  return randomItem(transcripts);
}

function generateSummary(): string {
  const summaries = [
    "Customer requested consultation for next week. Interested in premium services.",
    "Caller inquired about dental cleaning services. Needs follow-up.",
    "Patient scheduled routine checkup. No urgency indicated.",
    "Interested in spa premium package. Wants pricing details.",
    "Emergency call received. Immediate assistance required.",
    "Property listing inquiry. Wants to schedule viewing.",
    "Vehicle maintenance appointment requested. Standard service.",
    "Facial treatment booking. Regular customer.",
    "Appointment reschedule requested. Flexible with timing.",
    "Membership inquiry. Interested in plans and benefits.",
    "Services and pricing question. Needs detailed information.",
    "Follow-up visit scheduled. Previous consultation completed.",
    "Annual wellness package interest. Long-term commitment.",
    "Urgent appointment needed. Same-day service requested.",
    "General services inquiry. Multiple service areas of interest.",
  ];

  return randomItem(summaries);
}

function generateAIAnalysis(hasBooking: boolean): any {
  return {
    summary: generateSummary(),
    disposition: hasBooking ? randomItem(["BOOKED", "QUALIFIED"]) : randomItem(["FOLLOW_UP", "INFO_ONLY"]),
    sentiment: randomItem(callSentiments),
    callerIntent: generateCallerIntent(),
    nextAction: generateNextAction(),
    bookingLikely: hasBooking,
    extractedContact: hasBooking ? {
      name: randomItem(indianNames),
      phone: `+91${randomBetween(7000000000, 9999999999)}`,
      email: `customer${randomBetween(1, 100)}@example.com`,
    } : null,
    structuredNotes: generateStructuredNotes(),
  };
}

function generateCallerIntent(): string {
  const intents = [
    "Schedule appointment",
    "Inquire about services",
    "Emergency assistance",
    "Reschedule appointment",
    "Membership inquiry",
    "Pricing information",
    "Book consultation",
    "General inquiry",
    "Property viewing",
    "Service request",
    "Technical support",
    "Complaint",
    "Feedback",
    "Partnership inquiry",
    "Bulk booking",
  ];
  return randomItem(intents);
}

function generateNextAction(): string {
  const actions = [
    "Schedule callback",
    "Send confirmation SMS",
    "Transfer to specialist",
    "Send pricing information",
    "Create booking",
    "Update CRM",
    "Send email confirmation",
    "Schedule follow-up call",
    "Escalate to manager",
    "Request payment",
    "Process refund",
    "Send documentation",
    "Schedule demo",
    "Update customer profile",
  ];
  return randomItem(actions);
}

function generateStructuredNotes(): string[] {
  const notes = [
    "Customer interested in premium services",
    "Requested pricing for multiple seats",
    "Urgent appointment needed",
    "Regular customer, high lifetime value",
    "New customer, needs onboarding",
    "Price-sensitive, negotiate carefully",
    "Prefers morning appointments",
    "Requires follow-up in 24 hours",
    "Interested in annual contract",
    "Wants to see all service options",
    "Previous positive experience with competitor",
    "Needs technical support for setup",
    "Referral from existing customer",
    "Corporate inquiry - bulk booking",
  ];

  // Return 3-5 random notes
  const count = randomBetween(3, 5);
  const shuffled = notes.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateBookingNotes(serviceName: string): string {
  const notes = [
    `Customer requested ${serviceName.toLowerCase()} service`,
    "Preferred morning time slot",
    "Urgent - same day if possible",
    "Flexible with timing",
    "Regular customer",
    "Referred by friend",
    "Saw online promotion",
    "Price comparison with competitors",
    "Wants package deal",
    "Needs reminder call",
    "Interested in add-on services",
  ];
  return randomItem(notes);
}
