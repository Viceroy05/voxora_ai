import { getPrisma } from "@/lib/prisma";

interface AISettings {
  businessName?: string;
  industry?: string;
  voiceTone?: string;
  greetingScript?: string;
  bookingQuestions?: any[];
  languages?: string[];
  workingHours?: any[];
}

/**
 * Get AI settings for a business
 */
export async function getAISettings(businessId: string) {
  const prisma = getPrisma();

  let settings = await prisma.businessAISettings.findUnique({
    where: { businessId },
  });

  // Create default settings if not exists
  if (!settings) {
    settings = await prisma.businessAISettings.create({
      data: {
        businessId,
        businessName: "Voxora AI",
        voiceTone: "professional",
        greetingScript: "Hello, you have reached {businessName}. How can I help you today?",
        bookingQuestions: [],
        languages: ["en"],
        workingHours: [],
      },
    });
  }

  return settings;
}

/**
 * Update AI settings for a business
 */
export async function updateAISettings(businessId: string, data: AISettings) {
  const prisma = getPrisma();

  // Check if settings exist
  const existing = await prisma.businessAISettings.findUnique({
    where: { businessId },
  });

  if (!existing) {
    // Create new settings
    const settings = await prisma.businessAISettings.create({
      data: {
        businessId,
        businessName: data.businessName || "Voxora AI",
        industry: data.industry,
        voiceTone: data.voiceTone || "professional",
        greetingScript: data.greetingScript || "Hello, you have reached {businessName}. How can I help you today?",
        bookingQuestions: data.bookingQuestions || [],
        languages: data.languages || ["en"],
        workingHours: data.workingHours || [],
      },
    });

    return {
      settings,
      created: true,
    };
  }

  // Update existing settings
  const settings = await prisma.businessAISettings.update({
    where: { businessId },
    data: {
      ...(data.businessName !== undefined && { businessName: data.businessName }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.voiceTone !== undefined && { voiceTone: data.voiceTone }),
      ...(data.greetingScript !== undefined && { greetingScript: data.greetingScript }),
      ...(data.bookingQuestions !== undefined && { bookingQuestions: data.bookingQuestions }),
      ...(data.languages !== undefined && { languages: data.languages }),
      ...(data.workingHours !== undefined && { workingHours: data.workingHours }),
    },
  });

  return {
    settings,
    created: false,
  };
}

/**
 * Validate AI settings
 */
export function validateAISettings(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate business name
  if (data.businessName && (data.businessName.length < 2 || data.businessName.length > 120)) {
    errors.push("Business name must be between 2 and 120 characters");
  }

  // Validate voice tone
  const validVoiceTones = ["professional", "friendly", "casual", "formal", "warm"];
  if (data.voiceTone && !validVoiceTones.includes(data.voiceTone)) {
    errors.push(`Invalid voice tone. Must be one of: ${validVoiceTones.join(", ")}`);
  }

  // Validate greeting script
  if (data.greetingScript && (data.greetingScript.length < 10 || data.greetingScript.length > 500)) {
    errors.push("Greeting script must be between 10 and 500 characters");
  }

  // Validate booking questions
  if (data.bookingQuestions) {
    if (!Array.isArray(data.bookingQuestions)) {
      errors.push("Booking questions must be an array");
    } else {
      data.bookingQuestions.forEach((question: any, index: number) => {
        if (!question.text || question.text.length < 5 || question.text.length > 200) {
          errors.push(`Question ${index + 1}: Text must be between 5 and 200 characters`);
        }
        if (question.type && !["text", "multiple_choice", "yes_no"].includes(question.type)) {
          errors.push(`Question ${index + 1}: Invalid type. Must be text, multiple_choice, or yes_no`);
        }
      });
    }
  }

  // Validate languages
  const validLanguages = ["en", "es", "hi", "ar", "fr", "de", "zh", "ja", "ko"];
  if (data.languages) {
    if (!Array.isArray(data.languages)) {
      errors.push("Languages must be an array");
    } else {
      data.languages.forEach((lang: string) => {
        if (!validLanguages.includes(lang)) {
          errors.push(`Invalid language code: ${lang}. Valid codes: ${validLanguages.join(", ")}`);
        }
      });
    }
  }

  // Validate working hours
  if (data.workingHours) {
    if (!Array.isArray(data.workingHours)) {
      errors.push("Working hours must be an array");
    } else {
      data.workingHours.forEach((hours: any, index: number) => {
        if (!hours.day || !hours.start || !hours.end) {
          errors.push(`Working hours entry ${index + 1}: Missing required fields (day, start, end)`);
        }
        if (hours.start && hours.end && hours.start >= hours.end) {
          errors.push(`Working hours entry ${index + 1}: Start time must be before end time`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default AI settings
 */
export function getDefaultAISettings(): AISettings {
  return {
    businessName: "Voxora AI",
    voiceTone: "professional",
    greetingScript: "Hello, you have reached {businessName}. How can I help you today?",
    bookingQuestions: [],
    languages: ["en"],
    workingHours: [],
  };
}
