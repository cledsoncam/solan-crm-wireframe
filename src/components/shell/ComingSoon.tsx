import Link from "next/link";
import { PageShell } from "@/components/shell/PageShell";

export function ComingSoon({
  title,
  eyebrow,
  description,
  bullets,
  backHref = "/meu-dia",
  backLabel = "Meu Dia",
}: {
  title: string;
  eyebrow: string;
  description: string;
  bullets: string[];
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <PageShell title={eyebrow}>
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto scrollbar-thin">
        <div className="max-w-[440px] w-full border border-line-card bg-surface rounded-[4px] p-6">
          <span className="font-mono text-[9px] tracking-widest text-muted-3 uppercase">{eyebrow} · ROADMAP</span>
          <h1 className="text-[16px] font-semibold tracking-tight mt-1.5">{title}</h1>
          <p className="text-[11.5px] text-muted mt-2 leading-relaxed">{description}</p>
          <div className="border-t border-line-soft mt-4 pt-4">
            <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">
              Previsto na especificação
            </span>
            <ul className="mt-2 flex flex-col gap-1.5">
              {bullets.map((b) => (
                <li key={b} className="text-[11px] text-ink-soft flex gap-2">
                  <span className="text-muted-3">·</span> {b}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={backHref}
            className="inline-block mt-5 text-[11px] border border-line-strong rounded-[3px] px-3 py-1.5 hover:border-ink"
          >
            ← {backLabel}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
