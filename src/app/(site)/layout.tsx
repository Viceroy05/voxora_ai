import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-x-clip">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
