import { listUserBusinesses, requireAuthContext } from "@/lib/auth";
import { handleRouteError, json } from "@/lib/api/http";
import { isDemoMode, getDemoBusinessId } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Demo mode - return demo business
    if (isDemoMode()) {
      const prisma = getPrisma();
      const auth = await requireAuthContext();
      const business = await prisma.business.findUnique({
        where: { slug: getDemoBusinessId() },
      });

      if (!business) {
        return json({
          user: auth.appUser,
          memberships: [],
        });
      }

      return json({
        user: auth.appUser,
        memberships: [{
          business: {
            id: business.id,
            name: business.name,
          },
        }],
      });
    }

    // Normal mode - authenticate user
    const auth = await requireAuthContext();
    const memberships = await listUserBusinesses(auth.appUser.id);

    return json({
      user: auth.appUser,
      memberships,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
