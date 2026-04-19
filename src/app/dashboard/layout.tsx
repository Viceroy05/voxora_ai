import type { ReactNode } from "react";
import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Overview | Voxora AI Dashboard",
  description: "Premium operations overview for Voxora AI voice receptionist performance.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
