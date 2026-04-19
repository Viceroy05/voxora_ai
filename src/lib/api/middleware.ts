import { NextRequest } from "next/server";

import { requireAuthContext } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";

/**
 * Middleware to authenticate API requests
 * Throws 401 if user is not authenticated
 */
export async function withAuth() {
  try {
    const auth = await requireAuthContext();
    return auth;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "authentication_failed", "Authentication failed.");
  }
}

/**
 * Middleware to validate business access
 * Throws 403 if user doesn't have required permission
 */
export async function withBusinessAuth(businessId: string, permission: string) {
  try {
    const { requireBusinessPermission } = await import("@/lib/auth");
    return await requireBusinessPermission(businessId, permission);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(403, "authorization_failed", "Authorization failed.");
  }
}

/**
 * Extract and validate business ID from request
 */
export function extractBusinessId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");

  // Look for [businessId] in the path
  const businessIdIndex = pathSegments.findIndex(
    (segment) => segment === "businesses" || segment === "api"
  );

  if (businessIdIndex !== -1 && pathSegments[businessIdIndex + 1]) {
    const potentialId = pathSegments[businessIdIndex + 1];
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(potentialId)) {
      return potentialId;
    }
  }

  return null;
}
