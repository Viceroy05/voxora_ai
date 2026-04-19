import { requireAuthContext } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { z } from "zod";
import { processPendingJobs } from "@/lib/services/ai-processor";

export const runtime = "nodejs";

const processPendingSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(10),
});

export async function POST(request: Request) {
  try {
    // Authenticate user (this is an internal endpoint, so we just need basic auth)
    await requireAuthContext();

    const body = await parseJsonBody(request, processPendingSchema);

    // Process pending jobs
    const results = await processPendingJobs(body.limit);

    return json({
      processed: results.length,
      results,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
