import { BookingStatus } from "@prisma/client";
import { z } from "zod";

import { ApiError } from "@/lib/api/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/auth";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { updateBookingStatus } from "@/lib/services/booking-service";
import { getPrisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    businessId: string;
    bookingId: string;
  }>;
};

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "RESCHEDULED", "CANCELED", "COMPLETED"]).optional(),
  customerName: z.string().min(1).max(120).optional(),
  customerPhone: z.string().min(7).max(24).optional(),
  customerEmail: z.string().email().optional(),
  serviceName: z.string().min(1).max(160).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { businessId, bookingId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_READ);
    const prisma = getPrisma();

    const booking = await prisma.bookingRecord.findFirst({
      where: {
        id: bookingId,
        businessId,
      },
      include: {
        callLog: {
          select: {
            id: true,
            callSid: true,
            status: true,
            durationSeconds: true,
            recordingUrl: true,
            transcriptText: true,
            summaryText: true,
            aiAnalysis: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ApiError(404, "booking_not_found", "Booking not found.");
    }

    return json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { businessId, bookingId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_WRITE);
    const prisma = getPrisma();

    const body = await parseJsonBody(request, updateBookingSchema);

    // Check if at least one field is being updated
    if (Object.keys(body).length === 0) {
      throw new ApiError(
        400,
        "no_fields_provided",
        "At least one field must be provided."
      );
    }

    // Verify booking exists and belongs to business
    const existingBooking = await prisma.bookingRecord.findFirst({
      where: {
        id: bookingId,
        businessId,
      },
    });

    if (!existingBooking) {
      throw new ApiError(404, "booking_not_found", "Booking not found.");
    }

    // Update booking
    const booking = await prisma.bookingRecord.update({
      where: { id: bookingId },
      data: body,
      include: {
        callLog: {
          select: {
            id: true,
            callSid: true,
            status: true,
          },
        },
      },
    });

    return json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { businessId, bookingId } = await context.params;
    await requireBusinessPermission(businessId, PERMISSIONS.BOOKINGS_WRITE);
    const prisma = getPrisma();

    // Verify booking exists and belongs to business
    const existingBooking = await prisma.bookingRecord.findFirst({
      where: {
        id: bookingId,
        businessId,
      },
    });

    if (!existingBooking) {
      throw new ApiError(404, "booking_not_found", "Booking not found.");
    }

    // Delete booking
    await prisma.bookingRecord.delete({
      where: { id: bookingId },
    });

    return json({
      success: true,
      data: {
        message: "Booking deleted successfully.",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
