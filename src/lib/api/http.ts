import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  ApiError,
  sanitizeErrorDetails,
  getUserFriendlyMessage,
} from "@/lib/api/errors";

/**
 * Create a JSON response with proper headers
 */
export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

/**
 * Create a 204 No Content response
 */
export function noContent() {
  return new Response(null, { status: 204 });
}

/**
 * Parse and validate JSON request body using Zod schema
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const body = await request.json().catch(() => {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  });

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.flatten();
    throw new ApiError(
      400,
      "validation_error",
      "Request body validation failed.",
      {
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      }
    );
  }

  return parsed.data;
}

/**
 * Handle route errors and return appropriate error responses
 */
export function handleRouteError(error: unknown) {
  // Log error for debugging (in production, you might want to use a proper logging service)
  console.error("[API Error]", error);

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return json(
      {
        error: {
          code: error.code,
          message: getUserFriendlyMessage(error.code, error.message),
          details: sanitizeErrorDetails(error.details),
        },
      },
      { status: error.status },
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return json(
      {
        error: {
          code: "validation_error",
          message: "Invalid data provided.",
          details: null,
        },
      },
      { status: 400 },
    );
  }

  // Handle Zod errors (in case they weren't caught in parseJsonBody)
  if (error instanceof z.ZodError) {
    const errors = error.flatten();
    return json(
      {
        error: {
          code: "validation_error",
          message: "Request validation failed.",
          details: {
            fieldErrors: errors.fieldErrors,
            formErrors: errors.formErrors,
          },
        },
      },
      { status: 400 },
    );
  }

  // Handle unknown errors
  return json(
    {
      error: {
        code: "internal_error",
        message: getUserFriendlyMessage("internal_error"),
        details: process.env.NODE_ENV === "development" ? String(error) : null,
      },
    },
    { status: 500 },
  );
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case "P2002":
      return json(
        {
          error: {
            code: "conflict",
            message: getUserFriendlyMessage("conflict"),
            details: {
              field: (error.meta?.target as string[])?.[0] || "unknown",
            },
          },
        },
        { status: 409 },
      );

    case "P2003":
      return json(
        {
          error: {
            code: "foreign_key_violation",
            message: getUserFriendlyMessage("foreign_key_violation"),
            details: {
              field: (error.meta?.field_name as string) || "unknown",
            },
          },
        },
        { status: 409 },
      );

    case "P2025":
      return json(
        {
          error: {
            code: "not_found",
            message: getUserFriendlyMessage("not_found"),
            details: null,
          },
        },
        { status: 404 },
      );

    case "P2014":
      return json(
        {
          error: {
            code: "conflict",
            message: "The change would violate a required relation.",
            details: null,
          },
        },
        { status: 409 },
      );

    case "P2000":
      return json(
        {
          error: {
            code: "validation_error",
            message: "The provided value is too long.",
            details: {
              field: (error.meta?.column_name as string) || "unknown",
            },
          },
        },
        { status: 400 },
      );

    default:
      return json(
        {
          error: {
            code: "database_error",
            message: getUserFriendlyMessage("database_error"),
            details: process.env.NODE_ENV === "development" ? { code: error.code } : null,
          },
        },
        { status: 500 },
      );
  }
}

/**
 * Create a success response with consistent structure
 */
export function successResponse<T>(data: T, status: number = 200) {
  return json({ success: true, data }, { status });
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1,
    },
  });
}
