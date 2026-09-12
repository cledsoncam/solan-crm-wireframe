"use client";

import Link from "next/link";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { formatCurrency, formatDateLong } from "@/lib/utils";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  assinada: "success",
  aceite_registrado: "success",
  em_assinatura: "warning",
  visualizada: "warning",
  enviada: "neutral",
  recusada: "danger",
  expirada: "danger",
};

export default function PropostasPage() {
  const deals = useCrmStore((s) => s.deals);
  const getCompany = useCrmStore((s) => s.getCompany);
  const withProposal = deals.filter((d) => d.proposal);

  return (
    <PageShell title="PROPOSTAS">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="mb-3">
          <h1 className="text-[14px] font-semibold tracking-tight">Propostas</h1>
          <p className="text-[11px] text-muted mt-1">
            O gerador de propostas já existe na versão oficial do CRM — esta lista mostra apenas o vínculo com os
            Negócios. Envio e assinatura digital completos (PRO-004 a PRO-009) chegam na próxima versão.
          </p>
        </div>
        {withProposal.length === 0 ? (
          <EmptyState title="Nenhuma proposta ainda" description="Gere uma proposta a partir de um negócio." />
        ) : (
          <div className="border border-line-card rounded-[3px] bg-surface overflow-hidden">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 bg-canvas border-b border-line font-mono text-[8.5px] tracking-wider text-muted-3 uppercase">
              <span>Negócio</span>
              <span>Proposta</span>
              <span>Valor</span>
              <span>Validade</span>
              <span>Status</span>
            </div>
            {withProposal.map((d) => (
              <Link
                key={d.id}
                href={`/negocios/${d.id}`}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-2 px-3 py-2.5 border-b border-line-soft last:border-0 text-[11px] items-center hover:bg-canvas"
              >
                <span className="truncate">
                  {d.code} · {getCompany(d.companyId)?.name ?? d.title}
                </span>
                <span className="font-mono text-[10px]">
                  {d.proposal!.code} v{d.proposal!.version}
                </span>
                <span className="font-mono text-[10px]">{formatCurrency(d.proposal!.value)}</span>
                <span className="text-muted">{formatDateLong(d.proposal!.validUntil)}</span>
                <Badge tone={STATUS_TONE[d.proposal!.status] ?? "neutral"}>{d.proposal!.status.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
