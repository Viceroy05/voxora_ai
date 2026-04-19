import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/api/http";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

// AI settings presets for different industries
const INDUSTRY_PRESETS: Record<string, any> = {
  healthcare: {
    businessName: "Medical Reception",
    industry: "Healthcare",
    voiceTone: "professional",
    greetingScript: "Hello, you have reached {businessName}. How can I help you schedule your appointment today?",
    bookingQuestions: [
      {
        text: "What type of appointment do you need?",
        type: "multiple_choice",
        options: ["General consultation", "Follow-up visit", "New patient intake", "Emergency"],
      },
      {
        text: "Do you have insurance?",
        type: "yes_no",
      },
      {
        text: "What is your preferred date and time?",
        type: "text",
      },
    ],
    languages: ["en", "es"],
    workingHours: [
      { day: "monday", start: "09:00", end: "17:00", enabled: true },
      { day: "tuesday", start: "09:00", end: "17:00", enabled: true },
      { day: "wednesday", start: "09:00", end: "17:00", enabled: true },
      { day: "thursday", start: "09:00", end: "17:00", enabled: true },
      { day: "friday", start: "09:00", end: "17:00", enabled: true },
      { day: "saturday", start: "10:00", end: "14:00", enabled: true },
      { day: "sunday", start: "10:00", end: "14:00", enabled: false },
    ],
  },
  dental: {
    businessName: "Dental Clinic",
    industry: "Dental",
    voiceTone: "warm",
    greetingScript: "Hello, thank you for calling {businessName}. How may we assist with your dental needs today?",
    bookingQuestions: [
      {
        text: "What type of dental service do you need?",
        type: "multiple_choice",
        options: ["Check-up & cleaning", "Emergency", "Cosmetic procedure", "Orthodontic consultation"],
      },
      {
        text: "Are you a new patient?",
        type: "yes_no",
      },
      {
        text: "When would you like to schedule your appointment?",
        type: "text",
      },
    ],
    languages: ["en"],
    workingHours: [
      { day: "monday", start: "08:00", end: "18:00", enabled: true },
      { day: "tuesday", start: "08:00", end: "18:00", enabled: true },
      { day: "wednesday", start: "08:00", end: "18:00", enabled: true },
      { day: "thursday", start: "08:00", end: "18:00", enabled: true },
      { day: "friday", start: "08:00", end: "18:00", enabled: true },
      { day: "saturday", start: "09:00", end: "15:00", enabled: true },
      { day: "sunday", start: "09:00", end: "15:00", enabled: false },
    ],
  },
  realty: {
    businessName: "Real Estate Agency",
    industry: "Real Estate",
    voiceTone: "professional",
    greetingScript: "Hello, you've reached {businessName}. Are you looking to buy, sell, or schedule a viewing?",
    bookingQuestions: [
      {
        text: "What type of property are you interested in?",
        type: "multiple_choice",
        options: ["Residential", "Commercial", "Land", "Rental"],
      },
      {
        text: "What's your budget range?",
        type: "text",
      },
      {
        text: "When would you like to schedule a viewing?",
        type: "text",
      },
    ],
    languages: ["en", "es"],
    workingHours: [
      { day: "monday", start: "09:00", end: "19:00", enabled: true },
      { day: "tuesday", start: "09:00", end: "19:00", enabled: true },
      { day: "wednesday", start: "09:00", end: "19:00", enabled: true },
      { day: "thursday", start: "09:00", end: "19:00", enabled: true },
      { day: "friday", start: "09:00", end: "19:00", enabled: true },
      { day: "saturday", start: "10:00", end: "17:00", enabled: true },
      { day: "sunday", start: "11:00", end: "16:00", enabled: true },
    ],
  },
  spa: {
    businessName: "Spa & Wellness",
    industry: "Spa & Wellness",
    voiceTone: "warm",
    greetingScript: "Welcome to {businessName}. How can we help you relax and rejuvenate today?",
    bookingQuestions: [
      {
        text: "What service would you like to book?",
        type: "multiple_choice",
        options: ["Massage", "Facial", "Body treatment", "Package"],
      },
      {
        text: "Do you have any preferences or special requests?",
        type: "text",
      },
      {
        text: "What date and time works best for you?",
        type: "text",
      },
    ],
    languages: ["en"],
    workingHours: [
      { day: "monday", start: "10:00", end: "20:00", enabled: true },
      { day: "tuesday", start: "10:00", end: "20:00", enabled: true },
      { day: "wednesday", start: "10:00", end: "20:00", enabled: true },
      { day: "thursday", start: "10:00", end: "20:00", enabled: true },
      { day: "friday", start: "10:00", end: "20:00", enabled: true },
      { day: "saturday", start: "09:00", end: "18:00", enabled: true },
      { day: "sunday", start: "10:00", end: "17:00", enabled: true },
    ],
  },
  automotive: {
    businessName: "Auto Service Center",
    industry: "Automotive",
    voiceTone: "friendly",
    greetingScript: "Hi there! You've reached {businessName}. How can we help with your vehicle today?",
    bookingQuestions: [
      {
        text: "What type of service do you need?",
        type: "multiple_choice",
        options: ["Oil change", "Brake service", "Engine repair", "Tire service", "General maintenance"],
      },
      {
        text: "What's your vehicle make and model?",
        type: "text",
      },
      {
        text: "When would you like to bring your vehicle in?",
        type: "text",
      },
    ],
    languages: ["en", "es"],
    workingHours: [
      { day: "monday", start: "08:00", end: "18:00", enabled: true },
      { day: "tuesday", start: "08:00", end: "18:00", enabled: true },
      { day: "wednesday", start: "08:00", end: "18:00", enabled: true },
      { day: "thursday", start: "08:00", end: "18:00", enabled: true },
      { day: "friday", start: "08:00", end: "18:00", enabled: true },
      { day: "saturday", start: "09:00", end: "16:00", enabled: true },
      { day: "sunday", start: "10:00", end: "15:00", enabled: false },
    ],
  },
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BUSINESS_WRITE);

    return json({
      success: true,
      data: {
        presets: INDUSTRY_PRESETS,
        availableIndustries: Object.keys(INDUSTRY_PRESETS),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BUSINESS_WRITE);

    const url = new URL(request.url);
    const industry = url.searchParams.get("industry");

    if (!industry) {
      throw new ApiError(
        400,
        "missing_industry",
        "Industry parameter is required."
      );
    }

    const preset = INDUSTRY_PRESETS[industry.toLowerCase()];

    if (!preset) {
      throw new ApiError(
        404,
        "preset_not_found",
        `No preset found for industry: ${industry}`
      );
    }

    return json({
      success: true,
      data: {
        preset,
        industry,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
