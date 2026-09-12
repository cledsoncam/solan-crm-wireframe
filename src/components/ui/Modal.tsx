"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Modal({
  open,
  onOpenChange,
  title,
  eyebrow,
  width = 460,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  eyebrow?: string;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/25 z-40 animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-surface border border-line-card rounded-md shadow-2xl flex flex-col max-h-[88vh] animate-fade-in"
          style={{ width }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-line flex-none">
            <Dialog.Title asChild>
              <b className="text-[13px] tracking-tight">{title}</b>
            </Dialog.Title>
            {eyebrow && (
              <span className="ml-auto font-mono text-[9px] tracking-wider text-muted-3 uppercase">
                {eyebrow}
              </span>
            )}
            <Dialog.Close className="ml-1 text-muted-2 hover:text-ink">
              <X size={14} />
            </Dialog.Close>
          </div>
          <div className="px-4 py-3.5 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin">
            {children}
          </div>
          {footer && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-line bg-canvas flex-none rounded-b-md">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalStackHint({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className={cn("opacity-40 scale-95 blur-[1px] pointer-events-none")}>{children}</div>
    </div>
  );
}
