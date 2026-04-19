import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { processCallSchema } from "@/lib/api/schemas";
import { getPrisma } from "@/lib/prisma";
import { analyzeCallTranscript } from "@/lib/vendors/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, processCallSchema);
    const { business } = await requireBusinessPermission(
      body.businessId,
      PERMISSIONS.AI_PROCESS,
    );
    const prisma = getPrisma();
    const callLog = await prisma.callLog.findFirst({
      where: {
        id: body.callLogId,
        businessId: business.id,
      },
    });

    if (!callLog) {
      throw new ApiError(404, "call_not_found", "Call log not found.");
    }

    const transcriptText = body.transcriptText ?? callLog.transcriptText;

    if (!transcriptText) {
      throw new ApiError(
        400,
        "missing_transcript",
        "Transcript text is required for OpenAI call processing.",
      );
    }

    const job = await prisma.aiProcessingJob.create({
      data: {
        businessId: business.id,
        callLogId: callLog.id,
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        status: "RUNNING",
        startedAt: new Date(),
        inputPayload: {
          transcriptText,
        },
      },
    });

    try {
      const result = await analyzeCallTranscript({
        businessName: business.name,
        industry: business.industry,
        transcriptText,
      });

      const [updatedJob, updatedCall] = await prisma.$transaction([
        prisma.aiProcessingJob.update({
          where: {
            id: job.id,
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            outputPayload: {
              responseId: result.responseId,
              ...result.analysis,
            },
          },
        }),
        prisma.callLog.update({
          where: {
            id: callLog.id,
          },
          data: {
            transcriptText,
            summaryText: result.analysis.summary,
            aiAnalysis: result.analysis,
          },
        }),
      ]);

      return json({
        job: updatedJob,
        callLog: updatedCall,
      });
    } catch (error) {
      await prisma.aiProcessingJob.update({
        where: {
          id: job.id,
        },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "Unknown OpenAI error",
        },
      });

      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
