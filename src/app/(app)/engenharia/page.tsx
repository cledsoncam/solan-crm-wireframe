"use client";

import { PageShell } from "@/components/shell/PageShell";
import { ProjectBoard } from "@/components/engenharia/ProjectBoard";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";

export default function EngenhariaPage() {
  const projects = useCrmStore((s) => s.projects);
  const pushToast = useUiStore((s) => s.pushToast);
  const openAutomacoesDrawer = useUiStore((s) => s.openAutomacoesDrawer);

  return (
    <PageShell title="ENGENHARIA">
      <div className="flex items-center gap-2.5 h-[46px] px-4 border-b border-line flex-none bg-surface">
        <span className="font-mono text-[9.5px] text-muted-2 tracking-wider uppercase">Engenharia</span>
        <span className="font-mono text-[9px] text-muted-3">
          {projects.length} PROJETOS · MÓDULO OPERACIONAL, GERADO A PARTIR DA VENDA GANHA
        </span>
        <button
          onClick={() => pushToast("Filtros avançados chegam na próxima versão.")}
          className="ml-auto border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5 text-muted"
        >
          Filtros
        </button>
        <button
          onClick={() => openAutomacoesDrawer({ pipelineId: "pl_engenharia", scopeLabel: "Engenharia" })}
          className="border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5"
        >
          Automações
        </button>
      </div>
      <ProjectBoard />
    </PageShell>
  );
}
