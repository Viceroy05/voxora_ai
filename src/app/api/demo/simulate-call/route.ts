import { CallStatus, AIJobStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { createBookingFromAIAnalysis } from "@/lib/services/booking-service";
import {
  processIncomingVoiceWebhook,
  processCallStatusWebhook,
  processRecordingWebhook,
  triggerAIProcessing,
  createWebhookEvent,
} from "@/lib/services/call-handling";
import { requireAuthContext } from "@/lib/auth";
import { json } from "@/lib/api/http";

const DEMO_SCENARIOS = [
  {
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    customerEmail: "priya.sharma@example.com",
    serviceName: "Haircut & Styling",
    durationSeconds: 180,
    transcript: `Customer: Hi, I'd like to book an appointment for tomorrow morning.
Agent: Good morning! I'd be happy to help you schedule an appointment. What service are you looking for?
Customer: I need a haircut and styling.
Agent: Perfect. We have slots available at 10 AM and 11:30 AM tomorrow. Which would you prefer?
Customer: 10 AM works great for me.
Agent: Excellent! I've booked you for 10 AM tomorrow for a haircut and styling. Is there anything else you'd like to add?
Customer: No, that's all. Thank you!`,
    summary: "Customer called to book a haircut and styling appointment for tomorrow morning at 10 AM.",
    aiAnalysis: {
      summary: "Customer booked haircut and styling for tomorrow 10 AM",
      disposition: "BOOKED",
      sentiment: "positive",
      callerIntent: "book_appointment",
      nextAction: "confirm_booking",
      bookingLikely: true,
      extractedContact: {
        name: "Priya Sharma",
        phone: "+91 98765 43210",
        email: "priya.sharma@example.com",
      },
      structuredNotes: [
        "Customer requested appointment for tomorrow morning",
        "Preferred service: Haircut & Styling",
        "Available slots: 10 AM and 11:30 AM",
        "Customer confirmed 10 AM slot",
        "Booking confirmed successfully",
      ],
    },
  },
  {
    customerName: "Rahul Verma",
    customerPhone: "+91 98765 43211",
    customerEmail: "rahul.verma@example.com",
    serviceName: "Spa Treatment",
    durationSeconds: 240,
    transcript: `Customer: Hello, I'm interested in your spa treatments.
Agent: Hello! We offer various spa treatments including massages, facials, and body treatments. What are you looking for?
Customer: I'd like to know about your massage packages and prices.
Agent: We have several packages ranging from ₹2000 to ₹5000. Our most popular is the full body massage for ₹3500.
Customer: That sounds good. Can I book for this weekend?
Agent: Certainly! We have Saturday afternoon at 2 PM or Sunday morning at 11 AM available.
Customer: Let me go with Saturday at 2 PM.
Agent: Perfect! I've scheduled your full body massage for Saturday at 2 PM.`,
    summary: "Customer inquired about spa treatments and booked a full body massage for Saturday at 2 PM.",
    aiAnalysis: {
      summary: "Customer booked full body massage for Saturday 2 PM",
      disposition: "BOOKED",
      sentiment: "positive",
      callerIntent: "inquire_service",
      nextAction: "send_confirmation",
      bookingLikely: true,
      extractedContact: {
        name: "Rahul Verma",
        phone: "+91 98765 43211",
        email: "rahul.verma@example.com",
      },
      structuredNotes: [
        "Customer inquired about spa treatments",
        "Interested in massage packages",
        "Price range: ₹2000 - ₹5000",
        "Selected full body massage at ₹3500",
        "Booked for Saturday 2 PM",
      ],
    },
  },
  {
    customerName: "Anita Patel",
    customerPhone: "+91 98765 43212",
    customerEmail: "anita.patel@example.com",
    serviceName: "Bridal Package Consultation",
    durationSeconds: 300,
    transcript: `Customer: Hi, I'm getting married next month and need information about your bridal packages.
Agent: Congratulations! We have comprehensive bridal packages starting from ₹50,000. Would you like to schedule a consultation?
Customer: Yes, I'd like to discuss the options.
Agent: Great! Our bridal specialist is available this Thursday at 3 PM or Friday at 11 AM. When would work for you?
Customer: Thursday at 3 PM works best.
Agent: Excellent! I've booked your bridal consultation for Thursday at 3 PM. Our specialist will walk you through all our packages.`,
    summary: "Bride-to-be scheduled a consultation for bridal package discussion on Thursday at 3 PM.",
    aiAnalysis: {
      summary: "Bridal consultation scheduled for Thursday 3 PM",
      disposition: "BOOKED",
      sentiment: "positive",
      callerIntent: "inquire_bridal",
      nextAction: "prepare_consultation",
      bookingLikely: true,
      extractedContact: {
        name: "Anita Patel",
        phone: "+91 98765 43212",
        email: "anita.patel@example.com",
      },
      structuredNotes: [
        "Customer getting married next month",
        "Inquired about bridal packages",
        "Packages start from ₹50,000",
        "Consultation scheduled for Thursday 3 PM",
        "Bridal specialist will discuss options",
      ],
    },
  },
  {
    customerName: "Vikram Singh",
    customerPhone: "+91 98765 43213",
    customerEmail: "vikram.singh@example.com",
    serviceName: "Hair Color Treatment",
    durationSeconds: 210,
    transcript: `Customer: Hi, I'm interested in getting my hair colored. What options do you have?
Agent: Hello! We offer various hair coloring services including highlights, full color, and balayage. What are you looking for?
Customer: I'm thinking about trying balayage. How much would it cost?
Agent: Our balayage starts from ₹4000 depending on hair length. Would you like to schedule an appointment?
Customer: Yes, that sounds good. When do you have availability?
Agent: We have openings this Friday at 11 AM or 3 PM. Which works better for you?
Customer: 3 PM would be perfect.
Agent: Great! I've booked your balayage appointment for Friday at 3 PM.`,
    summary: "Customer inquired about hair coloring and scheduled a balayage treatment for Friday at 3 PM.",
    aiAnalysis: {
      summary: "Customer booked balayage treatment for Friday 3 PM",
      disposition: "BOOKED",
      sentiment: "positive",
      callerIntent: "inquire_service",
      nextAction: "confirm_appointment",
      bookingLikely: true,
      extractedContact: {
        name: "Vikram Singh",
        phone: "+91 98765 43213",
        email: "vikram.singh@example.com",
      },
      structuredNotes: [
        "Customer interested in hair coloring",
        "Inquired about balayage",
        "Price starts from ₹4000",
        "Available slots: Friday 11 AM and 3 PM",
        "Booked for Friday 3 PM",
      ],
    },
  },
  {
    customerName: "Meera Krishnan",
    customerPhone: "+91 98765 43214",
    customerEmail: "meera.krishnan@example.com",
    serviceName: "Facial Treatment",
    durationSeconds: 150,
    transcript: `Customer: Hi, I'd like to book a facial treatment.
Agent: Hello! We offer different types of facials including hydrating, anti-aging, and deep cleansing. Which one interests you?
Customer: I think the hydrating facial would be perfect for my skin.
Agent: Excellent choice! The hydrating facial is 60 minutes and costs ₹2500. When would you like to come in?
Customer: Do you have any slots this weekend?
Agent: Yes, we have Saturday at 10 AM or Sunday at 2 PM.
Customer: Sunday at 2 PM works best.
Agent: Perfect! I've scheduled your hydrating facial for Sunday at 2 PM.`,
    summary: "Customer booked a hydrating facial treatment for Sunday at 2 PM.",
    aiAnalysis: {
      summary: "Customer booked hydrating facial for Sunday 2 PM",
      disposition: "BOOKED",
      sentiment: "positive",
      callerIntent: "book_appointment",
      nextAction: "send_reminder",
      bookingLikely: true,
      extractedContact: {
        name: "Meera Krishnan",
        phone: "+91 98765 43214",
        email: "meera.krishnan@example.com",
      },
      structuredNotes: [
        "Customer requested facial treatment",
        "Selected hydrating facial",
        "Duration: 60 minutes, Price: ₹2500",
        "Available: Saturday 10 AM or Sunday 2 PM",
        "Booked for Sunday 2 PM",
      ],
    },
  },
];

export async function POST() {
  try {
    const auth = await requireAuthContext();
    const prisma = getPrisma();

    // Get the first business for the user
    const business = await prisma.business.findFirst({
      where: {
        memberships: {
          some: {
            userId: auth.appUser.id,
          },
        },
      },
    });

    if (!business) {
      return json({ error: "No business found" }, { status: 404 });
    }

    // Select a random scenario
    const scenario = DEMO_SCENARIOS[Math.floor(Math.random() * DEMO_SCENARIOS.length)];

    // Generate realistic Twilio Call SID
    const callSid = `CA${Date.now()}${Math.random().toString(36).substring(2, 15)}`;

    // Step 1: Process voice webhook (incoming call)
    const voiceParams = {
      CallSid: callSid,
      From: scenario.customerPhone,
      To: business.twilioPhoneNumber || "+91 98765 43200",
      Direction: "inbound",
      CallerName: scenario.customerName,
      CallStatus: "ringing",
    };

    await processIncomingVoiceWebhook(voiceParams);
    await createWebhookEvent(
      business.id,
      "TWILIO",
      "voice.incoming",
      `voice:${callSid}`,
      "demo_signature",
      voiceParams,
      "PROCESSED"
    );

    // Step 2: Process status webhook (call answered)
    await new Promise(resolve => setTimeout(resolve, 500));
    const statusParams = {
      ...voiceParams,
      CallStatus: "in-progress",
      CallDuration: "0",
    };

    await processCallStatusWebhook(statusParams);
    await createWebhookEvent(
      business.id,
      "TWILIO",
      "call.status",
      `status:${callSid}`,
      "demo_signature",
      statusParams,
      "PROCESSED"
    );

    // Step 3: Process recording webhook (transcript available)
    await new Promise(resolve => setTimeout(resolve, 500));
    const recordingParams = {
      ...voiceParams,
      RecordingUrl: `https://demo.twilio.com/recording/${callSid}.mp3`,
      RecordingStatus: "completed",
      TranscriptionText: scenario.transcript,
      CallStatus: "completed",
      CallDuration: scenario.durationSeconds.toString(),
    };

    const { callLog } = await processRecordingWebhook(recordingParams);
    await createWebhookEvent(
      business.id,
      "TWILIO",
      "recording.completed",
      `recording:${callSid}`,
      "demo_signature",
      recordingParams,
      "PROCESSED"
    );

    // Step 4: Trigger AI processing
    await new Promise(resolve => setTimeout(resolve, 500));
    const { job: aiJob } = await triggerAIProcessing(
      business.id,
      callLog.id,
      scenario.transcript
    );

    // Step 5: Simulate AI job completion
    await new Promise(resolve => setTimeout(resolve, 500));
    await prisma.aiProcessingJob.update({
      where: { id: aiJob.id },
      data: {
        status: AIJobStatus.COMPLETED,
        outputPayload: scenario.aiAnalysis,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Update call log with AI analysis
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        aiAnalysis: scenario.aiAnalysis,
        summaryText: scenario.summary,
        status: CallStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Step 6: Create booking from AI analysis
    const bookingResult = await createBookingFromAIAnalysis(
      business.id,
      callLog.id,
      scenario.aiAnalysis,
      {
        serviceName: scenario.serviceName,
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      }
    );

    return json({
      success: true,
      callLog,
      booking: bookingResult.booking,
      bookingCreated: bookingResult.created,
      aiJob,
      scenario: {
        customerName: scenario.customerName,
        serviceName: scenario.serviceName,
        disposition: scenario.aiAnalysis.disposition,
      },
      steps: [
        { step: 1, name: "Incoming Call", status: "completed" },
        { step: 2, name: "Call Answered", status: "completed" },
        { step: 3, name: "Transcript Generated", status: "completed" },
        { step: 4, name: "AI Analysis", status: "completed" },
        { step: 5, name: "Booking Created", status: bookingResult.created ? "completed" : "skipped" },
      ],
    });
  } catch (error) {
    console.error("Demo simulation error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to simulate call" },
      { status: 500 }
    );
  }
}
