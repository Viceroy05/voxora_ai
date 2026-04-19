import type { Business, BusinessMembership, User } from "@prisma/client";

import { ApiError } from "@/lib/api/errors";
import { supabaseClaimsSchema } from "@/lib/api/schemas";
import { type MembershipRole, Permission, hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isDemoMode, getDemoBusinessId } from "@/lib/env";

type AuthContext = {
  authUserId: string;
  appUser: User;
};

type BusinessContext = {
  business: Business;
  membership: BusinessMembership;
};

export async function requireAuthContext(): Promise<AuthContext> {
  // Demo mode bypass
  if (isDemoMode()) {
    const prisma = getPrisma();
    const demoUser = await prisma.user.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        email: "demo@voxora.ai",
        fullName: "Demo User",
      },
    });

    return {
      authUserId: demoUser.id,
      appUser: demoUser,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw new ApiError(401, "unauthorized", "Authentication is required.");
  }

  const claims = supabaseClaimsSchema.safeParse(data.claims);

  if (!claims.success) {
    throw new ApiError(401, "invalid_claims", "Authenticated user claims are invalid.");
  }

  const prisma = getPrisma();
  const appUser = await prisma.user.upsert({
    where: { id: claims.data.sub },
    update: {
      email: claims.data.email ?? `${claims.data.sub}@placeholder.local`,
      fullName:
        claims.data.user_metadata?.full_name ??
        claims.data.user_metadata?.name ??
        undefined,
      avatarUrl: claims.data.user_metadata?.avatar_url,
    },
    create: {
      id: claims.data.sub,
      email: claims.data.email ?? `${claims.data.sub}@placeholder.local`,
      fullName:
        claims.data.user_metadata?.full_name ??
        claims.data.user_metadata?.name ??
        undefined,
      avatarUrl: claims.data.user_metadata?.avatar_url,
    },
  });

  return {
    authUserId: claims.data.sub,
    appUser,
  };
}

export async function requireBusinessPermission(
  businessId: string,
  permission: Permission,
) {
  // Demo mode bypass
  if (isDemoMode()) {
    const auth = await requireAuthContext();
    const prisma = getPrisma();
    const business = await prisma.business.findUnique({
      where: { slug: getDemoBusinessId() },
    });

    if (!business) {
      throw new ApiError(404, "business_not_found", "Demo business not found. Run seed:demo first.");
    }

    const membership: BusinessMembership = {
      id: "demo-membership-id",
      businessId: business.id,
      userId: auth.appUser.id,
      role: "OWNER" as MembershipRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      business,
    };

    return {
      auth,
      business,
      membership,
    } satisfies { auth: AuthContext } & BusinessContext;
  }

  const auth = await requireAuthContext();
  const prisma = getPrisma();
  const membership = await prisma.businessMembership.findUnique({
    where: {
      businessId_userId: {
        businessId,
        userId: auth.appUser.id,
      },
    },
    include: {
      business: true,
    },
  });

  if (!membership) {
    throw new ApiError(404, "business_not_found", "Business not found or inaccessible.");
  }

  if (!hasPermission(membership.role as MembershipRole, permission)) {
    throw new ApiError(403, "forbidden", "You do not have permission to perform this action.");
  }

  return {
    auth,
    business: membership.business,
    membership,
  } satisfies { auth: AuthContext } & BusinessContext;
}

export async function listUserBusinesses(userId: string) {
  const prisma = getPrisma();

  return prisma.businessMembership.findMany({
    where: {
      userId,
    },
    include: {
      business: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
