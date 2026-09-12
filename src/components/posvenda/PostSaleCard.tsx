"use client";

import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { daysSince, formatDate } from "@/lib/utils";
import type { PostSale } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PostSaleCard({ postSale, dragging }: { postSale: PostSale; dragging?: boolean }) {
  const router = useRouter();
  const getCompany = useCrmStore((s) => s.getCompany);
  const getUser = useCrmStore((s) => s.getUser);
  const getProject = useCrmStore((s) => s.getProject);
  const getStage = useCrmStore((s) => s.getStage);
  const company = getCompany(postSale.companyId);
  const responsible = getUser(postSale.responsibleId);
  const project = getProject(postSale.projectId);
  const projectStage = project ? getStage("pl_engenharia", project.stageId) : undefined;

  return (
    <div
      onClick={() => router.push(`/pos-venda/${postSale.id}`)}
      className={cn(
        "bg-surface border border-line-card rounded-[3px] p-2.5 cursor-pointer hover:border-line-strong",
        dragging && "border-ink shadow-lg"
      )}
    >
      <div className="text-[11px] font-semibold tracking-tight truncate">{company?.name ?? postSale.code}</div>
      <div className="text-[10px] text-muted-2 my-0.5">Venda em {formatDate(postSale.saleDate)}</div>
      {project && (
        <div className="font-mono text-[8.5px] text-accent mt-1">
          {project.code} · {projectStage?.name}
        </div>
      )}
      <div className="border-t border-line-soft mt-2 pt-1.5 flex items-center justify-between">
        <span className="text-[9.5px] text-muted">
          {postSale.nextActivityAt ? `▸ próx.: ${formatDate(postSale.nextActivityAt)}` : "▸ sem próxima atividade"}
        </span>
        <span className="text-[9px] text-muted-3">{responsible?.name.split(" ")[0]}</span>
      </div>
      <div className="font-mono text-[8px] text-muted-3 mt-1">{daysSince(postSale.enteredStageAt)}D NA ETAPA</div>
    </div>
  );
}
