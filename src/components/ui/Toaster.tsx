"use client";

import { useEffect } from "react";
import { useUiStore } from "@/lib/ui-store";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 3200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-fade-in flex items-center gap-2 rounded-[3px] border px-3 py-2 text-[11px] shadow-lg bg-surface max-w-[320px]",
            t.tone === "success" && "border-success-line text-success bg-success-bg",
            t.tone === "danger" && "border-danger-line text-danger bg-danger-bg",
            (!t.tone || t.tone === "default") && "border-line-card text-ink-soft"
          )}
        >
          {t.tone === "success" ? (
            <CheckCircle2 size={14} className="flex-none" />
          ) : t.tone === "danger" ? (
            <AlertCircle size={14} className="flex-none" />
          ) : (
            <Info size={14} className="flex-none" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
