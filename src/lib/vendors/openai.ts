import OpenAI from "openai";

import { openAICallAnalysisSchema } from "@/lib/api/schemas";
import { getOpenAIConfig } from "@/lib/env";

const callAnalysisJsonSchema = {
  name: "call_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "disposition",
      "sentiment",
      "callerIntent",
      "nextAction",
      "bookingLikely",
      "structuredNotes",
    ],
    properties: {
      summary: { type: "string" },
      disposition: {
        type: "string",
        enum: ["BOOKED", "QUALIFIED", "FOLLOW_UP", "ESCALATE", "INFO_ONLY"],
      },
      sentiment: {
        type: "string",
        enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"],
      },
      callerIntent: { type: "string" },
      nextAction: { type: "string" },
      bookingLikely: { type: "boolean" },
      extractedContact: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
        },
        required: [],
      },
      structuredNotes: {
        type: "array",
        items: { type: "string" },
        maxItems: 8,
      },
    },
  },
} as const;

let cachedOpenAI: OpenAI | null = null;

function getOpenAIClient() {
  if (!cachedOpenAI) {
    cachedOpenAI = new OpenAI({
      apiKey: getOpenAIConfig().apiKey,
    });
  }

  return cachedOpenAI;
}

export async function analyzeCallTranscript({
  businessName,
  industry,
  transcriptText,
}: {
  businessName: string;
  industry?: string | null;
  transcriptText: string;
}) {
  const openai = getOpenAIClient();
  const { model } = getOpenAIConfig();

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You analyze business phone calls for a voice receptionist SaaS. Return strict JSON only.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `Business: ${businessName}`,
              `Industry: ${industry ?? "unknown"}`,
              "Transcript:",
              transcriptText,
            ].join("\n"),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        ...callAnalysisJsonSchema,
      },
    },
  } as any);

  const rawText = response.output_text;

  if (!rawText) {
    throw new Error("OpenAI did not return structured output text.");
  }

  return {
    responseId: response.id,
    analysis: openAICallAnalysisSchema.parse(JSON.parse(rawText)),
  };
}
