"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "default" | "danger" | "ghost" | "outlineDanger";
  size?: "sm" | "md";
}) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-[3px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";
  const sizes = size === "sm" ? "text-[10.5px] px-2.5 py-1.5" : "text-[11px] px-2.5 py-[7px]";
  const variants: Record<string, string> = {
    primary: "bg-ink text-white hover:bg-ink-soft",
    default: "border border-line-strong bg-surface text-ink-soft hover:border-ink",
    danger: "bg-danger text-white hover:opacity-90",
    outlineDanger: "border border-danger-line text-danger bg-surface hover:bg-danger-bg",
    ghost: "text-muted hover:text-ink",
  };
  return <button className={cn(base, sizes, variants[variant], className)} {...props} />;
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | "dark";
  className?: string;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "border-line-strong text-muted bg-surface",
    success: "border-success-line text-success bg-success-bg",
    warning: "border-warning-line text-warning bg-warning-bg",
    danger: "border-danger-line text-danger bg-danger-bg",
    accent: "border-accent-line text-accent bg-white",
    dark: "border-ink text-ink bg-chip",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10px] font-mono tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function MonoTag({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] tracking-wider uppercase text-muted-3 border border-line-strong rounded-[2px] px-1.5 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[8.5px] tracking-wider text-muted-3 uppercase">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="text-[10px] text-muted-2">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-[34px] border border-line-strong bg-canvas rounded-[3px] px-2.5 text-[11.5px] outline-none focus:border-ink focus:bg-surface transition-colors placeholder:text-muted-3",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "border border-line-strong bg-canvas rounded-[3px] px-2.5 py-2 text-[11.5px] outline-none focus:border-ink focus:bg-surface transition-colors min-h-[60px] resize-none placeholder:text-muted-3",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        "h-[34px] border border-line-strong bg-canvas rounded-[3px] px-2.5 text-[11.5px] outline-none focus:border-ink focus:bg-surface transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Callout({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-line-card bg-canvas text-ink-soft",
    success: "border-success-line bg-success-bg text-success",
    warning: "border-warning-line bg-warning-bg text-warning",
    danger: "border-danger-line bg-danger-bg text-danger-2",
    accent: "border-accent-line bg-white text-accent",
  };
  return (
    <div className={cn("border rounded-[3px] px-2.5 py-2 text-[10.5px] leading-relaxed", tones[tone], className)}>
      {children}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="border border-dashed border-line-dash rounded-[3px] px-6 py-5 text-center max-w-[420px]">
        <div className="text-[11.5px] font-semibold">{title}</div>
        {description && <div className="text-[10.5px] text-muted mt-1.5 leading-relaxed">{description}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">{children}</span>;
}
