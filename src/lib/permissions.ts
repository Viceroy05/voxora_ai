export const PERMISSIONS = {
  BUSINESS_READ: "business:read",
  BUSINESS_WRITE: "business:write",
  MEMBERS_READ: "members:read",
  MEMBERS_WRITE: "members:write",
  BILLING_READ: "billing:read",
  BILLING_WRITE: "billing:write",
  CALLS_READ: "calls:read",
  CALLS_WRITE: "calls:write",
  BOOKINGS_READ: "bookings:read",
  BOOKINGS_WRITE: "bookings:write",
  ANALYTICS_READ: "analytics:read",
  AI_PROCESS: "ai:process",
  INTEGRATIONS_READ: "integrations:read",
  INTEGRATIONS_WRITE: "integrations:write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type MembershipRole = "OWNER" | "ADMIN" | "MANAGER" | "AGENT" | "VIEWER";

const ROLE_PERMISSIONS: Record<MembershipRole, Permission[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS),
  MANAGER: [
    PERMISSIONS.BUSINESS_READ,
    PERMISSIONS.BUSINESS_WRITE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.CALLS_READ,
    PERMISSIONS.CALLS_WRITE,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.BOOKINGS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AI_PROCESS,
    PERMISSIONS.INTEGRATIONS_READ,
  ],
  AGENT: [
    PERMISSIONS.BUSINESS_READ,
    PERMISSIONS.CALLS_READ,
    PERMISSIONS.CALLS_WRITE,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.BOOKINGS_WRITE,
    PERMISSIONS.AI_PROCESS,
  ],
  VIEWER: [
    PERMISSIONS.BUSINESS_READ,
    PERMISSIONS.CALLS_READ,
    PERMISSIONS.BOOKINGS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.INTEGRATIONS_READ,
    PERMISSIONS.MEMBERS_READ,
  ],
};

export function hasPermission(role: MembershipRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}
