import { BookingStatus } from "@prisma/client";

import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { parseJsonBody, handleRouteError, json } from "@/lib/api/http";
import { createBookingSchema } from "@/lib/api/schemas";
import {
  createBooking,
  getBusinessBookings,
  getBookingStats,
  checkDuplicateBooking,
} from "@/lib/services/booking-service";

type RouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_READ);

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const limitParam = Number(url.searchParams.get("limit") ?? "25");
    const offsetParam = Number(url.searchParams.get("offset") ?? "0");
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const includeStats = url.searchParams.get("includeStats") === "true";

    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 25;
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;
    const status =
      statusParam && Object.values(BookingStatus).includes(statusParam as BookingStatus)
        ? (statusParam as BookingStatus)
        : undefined;

    if (statusParam && !status) {
      throw new ApiError(400, "invalid_status", "Unsupported booking status filter.");
    }

    const bookings = await getBusinessBookings(businessId, {
      status,
      limit,
      offset,
      startDate: startDateParam ? new Date(startDateParam) : undefined,
      endDate: endDateParam ? new Date(endDateParam) : undefined,
    });

    // Include statistics if requested
    let stats = null;
    if (includeStats) {
      stats = await getBookingStats(businessId);
    }

    return json({
      success: true,
      data: {
        bookings,
        stats,
        pagination: {
          limit,
          offset,
          total: bookings.length,
        },
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_WRITE);
    const body = await parseJsonBody(request, createBookingSchema);

    // Check for duplicate booking
    const isDuplicate = await checkDuplicateBooking(
      businessId,
      body.customerPhone,
      body.serviceName,
      body.startsAt
    );

    if (isDuplicate) {
      throw new ApiError(
        409,
        "duplicate_booking",
        "A booking with the same details already exists."
      );
    }

    // Create booking
    const result = await createBooking({
      businessId,
      callLogId: body.callLogId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      serviceName: body.serviceName,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      status: body.status,
      amountCents: body.amountCents,
      currency: body.currency,
      notes: body.notes,
    });

    return json(
      {
        success: true,
        data: {
          booking: result.booking,
          created: result.created,
          duplicate: result.duplicate,
        },
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
