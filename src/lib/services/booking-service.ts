import { BookingStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

interface CreateBookingParams {
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  startsAt: Date;
  endsAt?: Date;
  status?: BookingStatus;
  amountCents?: number;
  currency?: string;
  notes?: string;
  callLogId?: string;
  metadata?: any;
}

/**
 * Create a new booking with duplicate prevention
 */
export async function createBooking(params: CreateBookingParams) {
  const prisma = getPrisma();

  // Check for duplicate booking (same customer, same service, same time)
  const existingBooking = await prisma.bookingRecord.findFirst({
    where: {
      businessId: params.businessId,
      customerPhone: params.customerPhone,
      serviceName: params.serviceName,
      startsAt: params.startsAt,
    },
  });

  if (existingBooking) {
    return {
      booking: existingBooking,
      created: false,
      duplicate: true,
    };
  }

  // Create new booking
  const booking = await prisma.bookingRecord.create({
    data: {
      businessId: params.businessId,
      callLogId: params.callLogId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      serviceName: params.serviceName,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      status: params.status || "PENDING",
      amountCents: params.amountCents,
      currency: params.currency || "INR",
      notes: params.notes,
      metadata: params.metadata,
    },
  });

  return {
    booking,
    created: true,
    duplicate: false,
  };
}

/**
 * Create booking from AI analysis
 */
export async function createBookingFromAIAnalysis(
  businessId: string,
  callLogId: string,
  analysis: {
    summary: string;
    disposition: string;
    sentiment: string;
    callerIntent: string;
    nextAction: string;
    bookingLikely: boolean;
    extractedContact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    structuredNotes: string[];
  },
  options?: {
    serviceName?: string;
    startsAt?: Date;
  }
) {
  const prisma = getPrisma();

  // Check if booking already exists for this call
  const existingBooking = await prisma.bookingRecord.findFirst({
    where: {
      callLogId,
    },
  });

  if (existingBooking) {
    return {
      booking: existingBooking,
      created: false,
      duplicate: true,
    };
  }

  // Only create booking if AI indicates high likelihood
  if (!analysis.bookingLikely) {
    return {
      booking: null,
      created: false,
      duplicate: false,
      reason: "Low booking likelihood",
    };
  }

  // Extract customer info from analysis
  const customerName = analysis.extractedContact?.name || "Unknown";
  const customerPhone = analysis.extractedContact?.phone;
  const customerEmail = analysis.extractedContact?.email;

  if (!customerPhone) {
    return {
      booking: null,
      created: false,
      duplicate: false,
      reason: "No customer phone in analysis",
    };
  }

  // Create booking
  const booking = await prisma.bookingRecord.create({
    data: {
      businessId,
      callLogId,
      customerName,
      customerPhone,
      customerEmail,
      serviceName: options?.serviceName || "Phone Inquiry",
      startsAt: options?.startsAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: tomorrow
      status: "PENDING",
      notes: analysis.structuredNotes.join("\n"),
      metadata: {
        disposition: analysis.disposition,
        sentiment: analysis.sentiment,
        callerIntent: analysis.callerIntent,
        nextAction: analysis.nextAction,
        summary: analysis.summary,
      },
    },
  });

  return {
    booking,
    created: true,
    duplicate: false,
  };
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  const prisma = getPrisma();

  const booking = await prisma.bookingRecord.update({
    where: { id: bookingId },
    data: { status },
  });

  return booking;
}

/**
 * Get bookings for a business with filtering
 */
export async function getBusinessBookings(
  businessId: string,
  options: {
    status?: BookingStatus;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const prisma = getPrisma();

  const where: any = {
    businessId,
  };

  if (options.status) {
    where.status = options.status;
  }

  if (options.startDate || options.endDate) {
    where.startsAt = {};
    if (options.startDate) {
      where.startsAt.gte = options.startDate;
    }
    if (options.endDate) {
      where.startsAt.lte = options.endDate;
    }
  }

  const bookings = await prisma.bookingRecord.findMany({
    where,
    include: {
      callLog: {
        select: {
          id: true,
          callSid: true,
          status: true,
          durationSeconds: true,
          recordingUrl: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: options.limit || 25,
    skip: options.offset || 0,
  });

  return bookings;
}

/**
 * Get booking statistics for dashboard
 */
export async function getBookingStats(businessId: string, days: number = 30) {
  const prisma = getPrisma();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [total, byStatus, recent] = await Promise.all([
    // Total bookings in period
    prisma.bookingRecord.count({
      where: {
        businessId,
        startsAt: {
          gte: startDate,
        },
      },
    }),

    // Bookings by status
    prisma.bookingRecord.groupBy({
      by: ["status"],
      where: {
        businessId,
        startsAt: {
          gte: startDate,
        },
      },
      _count: true,
    }),

    // Recent bookings
    prisma.bookingRecord.findMany({
      where: {
        businessId,
        startsAt: {
          gte: startDate,
        },
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
        startsAt: "desc",
      },
      take: 10,
    }),
  ]);

  // Format status counts
  const statusCounts = byStatus.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    byStatus: statusCounts,
    recent,
    period: {
      start: startDate,
      end: new Date(),
      days,
    },
  };
}

/**
 * Check for duplicate booking
 */
export async function checkDuplicateBooking(
  businessId: string,
  customerPhone: string,
  serviceName: string,
  startsAt: Date
) {
  const prisma = getPrisma();

  const existing = await prisma.bookingRecord.findFirst({
    where: {
      businessId,
      customerPhone,
      serviceName,
      startsAt,
    },
  });

  return !!existing;
}
