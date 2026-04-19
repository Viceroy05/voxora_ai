import { z } from "zod";

import { requireBusinessPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { ApiError } from "@/lib/api/errors";
import { handleRouteError, json, parseJsonBody } from "@/lib/api/http";
import { getPrisma } from "@/lib/prisma";

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"]),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ businessId: string }> }) {
  try {
    const { businessId } = await params;
    const { business, membership } = await requireBusinessPermission(
      businessId,
      PERMISSIONS.MEMBERS_WRITE
    );
    const prisma = getPrisma();

    const body = await parseJsonBody(request, inviteMemberSchema);

    // Check if the inviter is trying to invite themselves
    const authUser = await prisma.user.findUnique({
      where: { id: membership.userId },
    });

    if (authUser?.email === body.email) {
      throw new ApiError(
        400,
        "cannot_invite_self",
        "You cannot invite yourself to the business."
      );
    }

    // Check if user with this email already exists
    let targetUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    // If user doesn't exist, create a placeholder user
    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email: body.email,
          fullName: null,
          avatarUrl: null,
        },
      });
    }

    // Check if user is already a member of this business
    const existingMembership = await prisma.businessMembership.findUnique({
      where: {
        businessId_userId: {
          businessId: businessId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMembership) {
      throw new ApiError(
        409,
        "already_member",
        "This user is already a member of this business."
      );
    }

    // Create membership
    const newMembership = await prisma.businessMembership.create({
      data: {
        businessId: businessId,
        userId: targetUser.id,
        role: body.role,
      },
      include: {
        user: true,
        business: true,
      },
    });

    return json(
      {
        membership: {
          id: newMembership.id,
          businessId: newMembership.businessId,
          userId: newMembership.userId,
          role: newMembership.role,
          user: {
            id: newMembership.user.id,
            email: newMembership.user.email,
            fullName: newMembership.user.fullName,
            avatarUrl: newMembership.user.avatarUrl,
          },
          createdAt: newMembership.createdAt,
          updatedAt: newMembership.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const { business, membership } = await requireBusinessPermission(
      businessId,
      PERMISSIONS.MEMBERS_WRITE
    );
    const prisma = getPrisma();

    const body = await parseJsonBody(request, updateMemberRoleSchema);

    // Get memberId from request body or query params
    const url = new URL(request.url);
    const memberId = url.searchParams.get("memberId");

    if (!memberId) {
      throw new ApiError(
        400,
        "member_id_required",
        "Member ID is required as a query parameter."
      );
    }

    // Find the membership to update
    const targetMembership = await prisma.businessMembership.findUnique({
      where: { id: memberId },
    });

    if (!targetMembership) {
      throw new ApiError(404, "membership_not_found", "Membership not found.");
    }

    // Check if the target membership belongs to this business
    if (targetMembership.businessId !== businessId) {
      throw new ApiError(
        403,
        "forbidden",
        "You do not have permission to modify this membership."
      );
    }

    // Prevent modifying the owner's role
    if (targetMembership.role === "OWNER") {
      throw new ApiError(
        400,
        "cannot_modify_owner",
        "Cannot modify the role of the business owner."
      );
    }

    // Prevent modifying your own role if you're not the owner
    if (targetMembership.userId === membership.userId && membership.role !== "OWNER") {
      throw new ApiError(
        400,
        "cannot_modify_own_role",
        "You cannot modify your own role."
      );
    }

    // Update membership role
    const updatedMembership = await prisma.businessMembership.update({
      where: { id: memberId },
      data: { role: body.role },
      include: {
        user: true,
      },
    });

    return json({
      membership: {
        id: updatedMembership.id,
        businessId: updatedMembership.businessId,
        userId: updatedMembership.userId,
        role: updatedMembership.role,
        user: {
          id: updatedMembership.user.id,
          email: updatedMembership.user.email,
          fullName: updatedMembership.user.fullName,
          avatarUrl: updatedMembership.user.avatarUrl,
        },
        createdAt: updatedMembership.createdAt,
        updatedAt: updatedMembership.updatedAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const { business, membership } = await requireBusinessPermission(
      businessId,
      PERMISSIONS.MEMBERS_WRITE
    );
    const prisma = getPrisma();

    // Get memberId from query params
    const url = new URL(request.url);
    const memberId = url.searchParams.get("memberId");

    if (!memberId) {
      throw new ApiError(
        400,
        "member_id_required",
        "Member ID is required as a query parameter."
      );
    }

    // Find the membership to delete
    const targetMembership = await prisma.businessMembership.findUnique({
      where: { id: memberId },
    });

    if (!targetMembership) {
      throw new ApiError(404, "membership_not_found", "Membership not found.");
    }

    // Check if the target membership belongs to this business
    if (targetMembership.businessId !== businessId) {
      throw new ApiError(
        403,
        "forbidden",
        "You do not have permission to remove this member."
      );
    }

    // Prevent removing the owner
    if (targetMembership.role === "OWNER") {
      throw new ApiError(
        400,
        "cannot_remove_owner",
        "Cannot remove the business owner."
      );
    }

    // Prevent removing yourself
    if (targetMembership.userId === membership.userId) {
      throw new ApiError(
        400,
        "cannot_remove_self",
        "You cannot remove yourself from the business."
      );
    }

    // Delete membership
    await prisma.businessMembership.delete({
      where: { id: memberId },
    });

    return json({ success: true }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
