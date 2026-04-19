import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  label?: string;
  status?: string;
};

function getVariant(label: string) {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("paid") ||
    normalized.includes("connected") ||
    normalized.includes("healthy") ||
    normalized.includes("confirmed") ||
    normalized.includes("online") ||
    normalized.includes("available") ||
    normalized.includes("active") ||
    normalized.includes("enabled") ||
    normalized.includes("booked")
  ) {
    return "success" as const;
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("busy") ||
    normalized.includes("assigned") ||
    normalized.includes("upcoming") ||
    normalized.includes("follow-up") ||
    normalized.includes("optimized")
  ) {
    return "warning" as const;
  }

  if (normalized.includes("offline") || normalized.includes("escalated") || normalized.includes("urgent")) {
    return "danger" as const;
  }

  return "secondary" as const;
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const displayLabel = label ?? status ?? "Unknown";
  return <Badge variant={getVariant(displayLabel)}>{displayLabel}</Badge>;
}
