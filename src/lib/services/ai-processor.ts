import { getPrisma } from "@/lib/prisma";
import { analyzeCallTranscript } from "@/lib/vendors/openai";
import { createBookingFromAIAnalysis } from "@/lib/services/booking-service";

/**
 * Process AI job for call analysis
 */
export async function processAIJob(jobId: string) {
  const prisma = getPrisma();

  // Get the job
  const job = await prisma.aiProcessingJob.findUnique({
    where: { id: jobId },
    include: {
      callLog: true,
      business: true,
    },
  });

  if (!job) {
    throw new Error(`AI job not found: ${jobId}`);
  }

  // Check if job is already completed or failed
  if (job.status === "COMPLETED" || job.status === "FAILED") {
    return { job, callLog: job.callLog };
  }

  // Update job status to RUNNING
  await prisma.aiProcessingJob.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    // Get transcript from job input or call log
    const transcriptText = job.inputPayload.transcriptText || job.callLog.transcriptText;

    if (!transcriptText) {
      throw new Error("No transcript available for AI processing");
    }

    // Analyze call transcript
    const result = await analyzeCallTranscript({
      businessName: job.business.name,
      industry: job.business.industry,
      transcriptText,
    });

    // Update job and call log with results
    const [updatedJob, updatedCall] = await prisma.$transaction([
      prisma.aiProcessingJob.update({
        where: { id: jobId },
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
        where: { id: job.callLogId },
        data: {
          transcriptText,
          summaryText: result.analysis.summary,
          aiAnalysis: result.analysis,
        },
      }),
    ]);

    // Check if booking should be created based on analysis
    if (result.analysis.bookingLikely && result.analysis.extractedContact?.phone) {
      const bookingResult = await createBookingFromAIAnalysis(
        job.business.id,
        job.callLogId,
        result.analysis
      );

      if (bookingResult.created) {
        console.log(`[AI Processor] Booking created from call ${job.callLogId}`);
      } else if (bookingResult.duplicate) {
        console.log(`[AI Processor] Booking already exists for call ${job.callLogId}`);
      } else {
        console.log(`[AI Processor] Booking not created: ${bookingResult.reason}`);
      }
    }

    return { job: updatedJob, callLog: updatedCall };
  } catch (error) {
    // Update job status to FAILED
    await prisma.aiProcessingJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}



/**
 * Process pending AI jobs
 */
export async function processPendingJobs(limit: number = 10) {
  const prisma = getPrisma();

  // Get pending jobs
  const jobs = await prisma.aiProcessingJob.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      callLog: true,
      business: true,
    },
    take: limit,
    orderBy: {
      createdAt: "asc",
    },
  });

  const results = [];

  for (const job of jobs) {
    try {
      const result = await processAIJob(job.id);
      results.push({ jobId: job.id, status: "COMPLETED", result });
    } catch (error) {
      console.error(`[AI Processor] Failed to process job ${job.id}:`, error);
      results.push({
        jobId: job.id,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const prisma = getPrisma();

  const job = await prisma.aiProcessingJob.findUnique({
    where: { id: jobId },
    include: {
      callLog: true,
    },
  });

  if (!job) {
    throw new Error(`AI job not found: ${jobId}`);
  }

  return {
    id: job.id,
    businessId: job.businessId,
    callLogId: job.callLogId,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    errorMessage: job.errorMessage,
    hasOutput: !!job.outputPayload,
  };
}
