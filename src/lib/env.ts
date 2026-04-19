import { z } from "zod";

const nonEmptyString = z.string().min(1);

function readEnv(name: string) {
  return process.env[name];
}

function required(name: string, schema: z.ZodType<string> = nonEmptyString) {
  const value = readEnv(name);
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }

  return parsed.data;
}

export function getAppUrl() {
  return readEnv("APP_URL") ?? "http://localhost:3000";
}

export function getDatabaseUrl() {
  return required("DATABASE_URL");
}

export function getDirectDatabaseUrl() {
  return required("DIRECT_URL");
}

export function getSupabasePublicConfig() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", z.string().url()),
    publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseAdminConfig() {
  return {
    ...getSupabasePublicConfig(),
    secretKey: required("SUPABASE_SECRET_KEY"),
  };
}

export function getOpenAIConfig() {
  return {
    apiKey: required("OPENAI_API_KEY"),
    model: readEnv("OPENAI_MODEL") ?? "gpt-4.1-mini",
  };
}

export function getTwilioConfig() {
  return {
    accountSid: required("TWILIO_ACCOUNT_SID"),
    authToken: required("TWILIO_AUTH_TOKEN"),
    phoneNumber: required("TWILIO_PHONE_NUMBER"),
    webhookBaseUrl: readEnv("TWILIO_WEBHOOK_BASE_URL") ?? getAppUrl(),
  };
}

export function getRazorpayConfig() {
  return {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    webhookSecret: required("RAZORPAY_WEBHOOK_SECRET"),
  };
}

export function isDemoMode() {
  return readEnv("DEMO_MODE") === "true";
}

export function getDemoBusinessId() {
  return readEnv("DEMO_BUSINESS_ID") ?? "demo-voxora-ai";
}
