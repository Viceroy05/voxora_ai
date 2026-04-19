import { requireBusinessPermission } from "@/lib/auth";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json } from "@/lib/api/http";
import { getJobStatus, processAIJob } from "@/lib/services/ai-processor";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const jobStatus = await getJobStatus(jobId);

    return json({
      job: jobStatus,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const result = await processAIJob(jobId);

    return json({
      job: result.job,
      callLog: result.callLog,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
