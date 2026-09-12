"use client";

import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { daysSince, formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_COLOR: Record<string, string> = { alta: "text-danger", media: "text-warning", baixa: "text-success" };

export function ProjectCard({ project, dragging }: { project: Project; dragging?: boolean }) {
  const router = useRouter();
  const getCompany = useCrmStore((s) => s.getCompany);
  const getUser = useCrmStore((s) => s.getUser);
  const company = getCompany(project.companyId);
  const responsible = getUser(project.responsibleId);
  const overdue = project.dueDate && new Date(project.dueDate).getTime() < Date.now();

  return (
    <div
      onClick={() => router.push(`/engenharia/${project.id}`)}
      className={cn(
        "bg-surface border border-line-card rounded-[3px] p-2.5 cursor-pointer hover:border-line-strong",
        dragging && "border-ink shadow-lg"
      )}
    >
      <div className="text-[11px] font-semibold tracking-tight truncate">{company?.name ?? project.name}</div>
      <div className="text-[10px] text-muted-2 my-0.5 truncate">
        {project.city}/{project.uf} {project.power && `· ${project.power}`}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className="font-mono text-[8.5px] border border-line-card rounded-[2px] px-1 text-muted-2">
          {daysSince(project.enteredStageAt)}D NA ETAPA
        </span>
        <span className={cn("ml-auto text-[9px] font-mono", PRIORITY_COLOR[project.priority])}>{project.priority}</span>
      </div>
      <div className="border-t border-line-soft mt-2 pt-1.5 flex items-center justify-between">
        <span className={cn("text-[9.5px]", overdue ? "text-danger" : "text-muted")}>
          {project.dueDate ? `▸ prazo: ${formatDate(project.dueDate)}` : "▸ sem prazo"}
        </span>
        <span className="text-[9px] text-muted-3">{responsible?.name.split(" ")[0]}</span>
      </div>
    </div>
  );
}
