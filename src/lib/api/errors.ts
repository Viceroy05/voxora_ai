export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
}

// Predefined error types for common scenarios
export class AuthenticationError extends ApiError {
  constructor(message = "Authentication is required.", details?: unknown) {
    super(401, "authentication_required", message, details);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "You do not have permission to perform this action.", details?: unknown) {
    super(403, "forbidden", message, details);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, details?: unknown) {
    super(404, "not_found", `${resource} not found.`, details);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed.", details?: unknown) {
    super(400, "validation_error", message, details);
    this.name = "ValidationError";
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource conflict.", details?: unknown) {
    super(409, "conflict", message, details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Rate limit exceeded.", details?: unknown) {
    super(429, "rate_limit_exceeded", message, details);
    this.name = "RateLimitError";
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable.", details?: unknown) {
    super(503, "service_unavailable", message, details);
    this.name = "ServiceUnavailableError";
  }
}

// Error code to HTTP status mapping
export const ERROR_CODE_STATUS_MAP: Record<string, number> = {
  authentication_required: 401,
  unauthorized: 401,
  invalid_token: 401,
  token_expired: 401,
  forbidden: 403,
  insufficient_permissions: 403,
  not_found: 404,
  business_not_found: 404,
  user_not_found: 404,
  membership_not_found: 404,
  subscription_not_found: 404,
  onboarding_not_found: 404,
  validation_error: 400,
  invalid_json: 400,
  invalid_request: 400,
  conflict: 409,
  slug_taken: 409,
  already_member: 409,
  business_already_exists: 409,
  foreign_key_violation: 409,
  rate_limit_exceeded: 429,
  internal_error: 500,
  database_error: 500,
  service_unavailable: 503,
};

// User-friendly error messages
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  authentication_required: "Please sign in to continue.",
  unauthorized: "Your session has expired. Please sign in again.",
  invalid_token: "Invalid authentication token.",
  token_expired: "Your session has expired. Please sign in again.",
  forbidden: "You don't have permission to perform this action.",
  insufficient_permissions: "You need higher permissions to perform this action.",
  not_found: "The requested resource was not found.",
  business_not_found: "Business not found or you don't have access to it.",
  user_not_found: "User not found.",
  membership_not_found: "Membership not found.",
  subscription_not_found: "No subscription found for this business.",
  onboarding_not_found: "Onboarding record not found.",
  validation_error: "Please check your input and try again.",
  invalid_json: "Invalid request format. Please check your input.",
  invalid_request: "Invalid request. Please check your input.",
  conflict: "This action conflicts with existing data.",
  slug_taken: "This business slug is already taken. Please choose another one.",
  already_member: "This user is already a member of this business.",
  business_already_exists: "You already have a business.",
  foreign_key_violation: "Invalid reference to related data.",
  rate_limit_exceeded: "Too many requests. Please wait and try again.",
  internal_error: "Something went wrong. Please try again later.",
  database_error: "Database error occurred. Please try again later.",
  service_unavailable: "Service is temporarily unavailable. Please try again later.",
};

// Safe error details for client responses (removes sensitive information)
export function sanitizeErrorDetails(details: unknown): unknown {
  if (!details) return null;

  // If it's a Zod validation error, flatten it
  if (typeof details === "object" && details !== null && "fieldErrors" in details) {
    return {
      fieldErrors: (details as any).fieldErrors,
      formErrors: (details as any).formErrors,
    };
  }

  // For other objects, return a sanitized version
  if (typeof details === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(details as Record<string, unknown>)) {
      // Skip sensitive fields
      if (
        ["password", "token", "secret", "apiKey", "privateKey"].some((sensitive) =>
          key.toLowerCase().includes(sensitive)
        )
      ) {
        continue;
      }
      sanitized[key] = value;
    }
    return Object.keys(sanitized).length > 0 ? sanitized : null;
  }

  return null;
}

// Get user-friendly error message with fallback
export function getUserFriendlyMessage(code: string, defaultMessage?: string): string {
  return ERROR_CODE_MESSAGES[code] || defaultMessage || "An unexpected error occurred.";
}
