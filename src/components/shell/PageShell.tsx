"use client";

import { Topbar } from "@/components/shell/Topbar";
import type { ReactNode } from "react";

export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Topbar title={title} />
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </>
  );
}
