"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Drawer({
  open,
  onOpenChange,
  title,
  eyebrow,
  width = 360,
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
        <Dialog.Overlay className="fixed inset-0 bg-black/20 z-40 animate-fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 bottom-0 z-50 bg-surface border-l border-line-card shadow-2xl flex flex-col"
          style={{ width }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-line flex-none">
            <Dialog.Title asChild>
              <b className="text-[12.5px]">{title}</b>
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
          <div className="px-4 py-3.5 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin flex-1">
            {children}
          </div>
          {footer && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-line bg-canvas flex-none">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
