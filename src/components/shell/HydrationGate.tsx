"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * This app's entire state (deals, people, pipelines...) lives in a Zustand
 * store persisted to localStorage. localStorage doesn't exist on the server,
 * so the very first client render must match the server's default-seed
 * render exactly, then swap in the persisted data — otherwise React throws
 * a hydration-mismatch error. Gating real content behind a mount flag keeps
 * server and first-client-paint identical (both show the loading shell).
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-2 text-muted text-[12px]">
          <div className="w-3.5 h-3.5 border-[1.5px] border-line-strong border-t-ink rounded-full animate-spin" />
          Carregando Solan CRM…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
