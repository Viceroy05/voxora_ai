import { CallStatus, BookingStatus } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.ANALYTICS_READ);

    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const typeParam = url.searchParams.get("type");

    if (limit < 1 || limit > 100) {
      throw new ApiError(
        400,
        "invalid_limit",
        "Limit must be between 1 and 100."
      );
    }

    const prisma = getPrisma();

    // Get recent activities
    const [recentCalls, recentBookings, recentAIJobs] = await Promise.all([
      // Recent calls
      prisma.callLog.findMany({
        where: {
          businessId,
        },
        include: {
          bookings: {
            select: {
              id: true,
              customerName: true,
              serviceName: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),

      // Recent bookings
      prisma.bookingRecord.findMany({
        where: {
          businessId,
        },
        include: {
          callLog: {
            select: {
              id: true,
              callSid: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),

      // Recent AI jobs
      prisma.aiProcessingJob.findMany({
        where: {
          businessId,
        },
        include: {
          callLog: {
            select: {
              id: true,
              callSid: true,
              callerPhone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),
    ]);

    // Combine and format activities
    const activities = [
      ...recentCalls.map(call => ({
        id: `call-${call.id}`,
        type: 'call',
        title: `Call from ${call.callerPhone}`,
        description: call.summaryText || 'No summary available',
        time: formatRelativeTime(call.createdAt),
        timestamp: call.createdAt.toISOString(),
        status: getCallActivityStatus(call.status),
        metadata: {
          callSid: call.callSid,
          duration: call.durationSeconds,
          sentiment: (call.aiAnalysis as any)?.sentiment,
          disposition: (call.aiAnalysis as any)?.disposition,
          bookingCreated: call.bookings && call.bookings.length > 0,
        },
      })),

      ...recentBookings.map(booking => ({
        id: `booking-${booking.id}`,
        type: 'booking',
        title: `New booking: ${booking.customerName}`,
        description: `${booking.serviceName} - ${booking.status}`,
        time: formatRelativeTime(booking.createdAt),
        timestamp: booking.createdAt.toISOString(),
        status: getBookingActivityStatus(booking.status),
        metadata: {
          serviceName: booking.serviceName,
          customerPhone: booking.customerPhone,
          customerEmail: booking.customerEmail,
          amount: booking.amountCents,
          currency: booking.currency,
          notes: booking.notes,
        },
      })),

      ...recentAIJobs.map(job => ({
        id: `ai-job-${job.id}`,
        type: 'ai_job',
        title: `AI Analysis ${job.status.toLowerCase()}`,
        description: `Call ${job.callLog.callSid} - ${job.model}`,
        time: formatRelativeTime(job.createdAt),
        timestamp: job.createdAt.toISOString(),
        status: getAIJobActivityStatus(job.status),
        metadata: {
          jobId: job.id,
          model: job.model,
          jobType: job.jobType,
          callerPhone: job.callLog.callerPhone,
          errorMessage: job.errorMessage,
        },
      })),
    ];

    // Filter by type if specified
    const filteredActivities = typeParam
      ? activities.filter(a => a.type === typeParam)
      : activities;

    // Sort by timestamp and limit
    const sortedActivities = filteredActivities
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);

    return json({
      success: true,
      data: {
        activities: sortedActivities,
        total: activities.length,
        filtered: filteredActivities.length,
        filter: {
          type: typeParam,
          limit,
        },
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getCallActivityStatus(status: CallStatus): 'success' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case CallStatus.COMPLETED:
      return 'success';
    case CallStatus.RINGING:
    case CallStatus.IN_PROGRESS:
      return 'secondary';
    case CallStatus.NO_ANSWER:
      return 'warning';
    case CallStatus.FAILED:
    case CallStatus.CANCELED:
      return 'danger';
    default:
      return 'secondary';
  }
}

function getBookingActivityStatus(status: BookingStatus): 'success' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'success';
    case BookingStatus.PENDING:
      return 'warning';
    case BookingStatus.RESCHEDULED:
      return 'secondary';
    case BookingStatus.CANCELED:
      return 'danger';
    case BookingStatus.COMPLETED:
      return 'success';
    default:
      return 'secondary';
  }
}

function getAIJobActivityStatus(status: string): 'success' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
      return 'secondary';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'danger';
    default:
      return 'secondary';
  }
}
