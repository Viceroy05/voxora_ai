import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardTableColumn<T> = {
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type DashboardTableProps<T extends { id: string }> = {
  title: string;
  description: string;
  columns: DashboardTableColumn<T>[];
  rows: T[];
  className?: string;
};

export function DashboardTable<T extends { id: string }>({
  title,
  description,
  columns,
  rows,
  className,
}: DashboardTableProps<T>) {
  return (
    <Card className={cn("rounded-[2rem]", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-[1.5rem] border border-white/8 bg-slate-950/45">
          <table className="min-w-full divide-y divide-white/8 text-left">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.label}
                    className={cn(
                      "px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
                      column.className,
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  {columns.map((column) => (
                    <td key={column.label} className={cn("px-4 py-4 text-sm text-white", column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
