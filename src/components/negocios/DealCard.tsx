"use client";

import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { formatCurrency, formatDate, daysSince } from "@/lib/utils";
import type { Deal } from "@/lib/types";
import { cn } from "@/lib/utils";

const RISK_COLOR: Record<string, string> = {
  alto: "text-danger",
  medio: "text-warning",
  baixo: "text-success",
};

export function DealCard({ deal, dragging, compactClosed }: { deal: Deal; dragging?: boolean; compactClosed?: boolean }) {
  const router = useRouter();
  const getCompany = useCrmStore((s) => s.getCompany);
  const getPerson = useCrmStore((s) => s.getPerson);
  const getUser = useCrmStore((s) => s.getUser);
  const company = getCompany(deal.companyId);
  const person = getPerson(deal.personId);
  const responsible = getUser(deal.responsibleId);

  if (compactClosed) {
    const closed = deal.wonAt ?? deal.lostAt;
    return (
      <div
        onClick={() => router.push(`/negocios/${deal.id}`)}
        className={cn(
          "bg-surface border rounded-[3px] p-2 cursor-pointer",
          deal.wonAt ? "border-success-line" : "border-danger-line",
          dragging && "shadow-lg"
        )}
      >
        <div className="text-[10.5px] font-semibold truncate">{company?.name ?? deal.title}</div>
        <div className="font-mono text-[9px] my-0.5">
          {formatCurrency(deal.value)} {closed && `· ${formatDate(closed)}`}
        </div>
        {deal.wonAt && deal.projectRef && (
          <>
            <div className="font-mono text-[8px] text-success">{deal.projectRef.code} · {deal.projectRef.stage}</div>
            {deal.postSaleRef && <div className="font-mono text-[8px] text-muted-2">{deal.postSaleRef.code} · {deal.postSaleRef.stage}</div>}
          </>
        )}
        {deal.wonAt && deal.destinationPipelineLabel && (
          <div className="font-mono text-[8px] text-success">{deal.destinationPipelineLabel}</div>
        )}
        {deal.lostAt && (
          <>
            <div className="text-[9.5px] text-danger">{deal.lossReason}{deal.lossDetail ? ` · ${deal.lossDetail}` : ""}</div>
            {deal.destinationPipelineLabel && (
              <div className="font-mono text-[8px] text-muted-2 mt-0.5">{deal.destinationPipelineLabel}</div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/negocios/${deal.id}`)}
      className={cn(
        "bg-surface border border-line-card rounded-[3px] p-2.5 cursor-pointer hover:border-line-strong",
        dragging && "border-ink shadow-lg"
      )}
    >
      <div className="text-[11px] font-semibold tracking-tight truncate">{deal.title}</div>
      <div className="text-[10px] text-muted-2 my-0.5 truncate">
        {company?.name ?? "— sem empresa"} {person && `· ${person.name}`}
      </div>
      <div className="font-mono text-[9.5px]">{formatCurrency(deal.value)}</div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {deal.tags.map((t) => (
          <span key={t} className="font-mono text-[8px] border border-line-card rounded-[2px] px-1 text-muted-2">
            {t}
          </span>
        ))}
        <span className="font-mono text-[8.5px] border border-line-card rounded-[2px] px-1 text-muted-2">
          {daysSince(deal.enteredStageAt)}D NA ETAPA
        </span>
        <span className={cn("ml-auto text-[9px] font-mono", RISK_COLOR[deal.risk])}>{deal.risk}</span>
      </div>
      <div className="border-t border-line-soft mt-2 pt-1.5 flex items-center justify-between">
        <span className="text-[9.5px]" style={{ color: deal.nextActivityAt ? "#5C5D62" : "#A33B2A" }}>
          {deal.nextActivityAt ? `▸ próx.: ${formatDate(deal.nextActivityAt)}` : "▸ sem próxima atividade"}
        </span>
        <span className="text-[9px] text-muted-3">{responsible?.name.split(" ")[0]}</span>
      </div>
    </div>
  );
}
