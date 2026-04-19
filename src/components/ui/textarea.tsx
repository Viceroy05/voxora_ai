import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:bg-white/7 focus:ring-4 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
