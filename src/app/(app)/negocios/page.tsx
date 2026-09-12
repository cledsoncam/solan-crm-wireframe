"use client";

import { useState } from "react";
import { PageShell } from "@/components/shell/PageShell";
import { FunnelSwitcher } from "@/components/negocios/FunnelSwitcher";
import { KanbanBoard } from "@/components/negocios/KanbanBoard";
import { ListView } from "@/components/negocios/ListView";
import { useUiStore } from "@/lib/ui-store";
import { useCrmStore } from "@/lib/store";

type View = "kanban" | "lista";

export default function NegociosPage() {
  const [pipelineId, setPipelineId] = useState("pl_vendas");
  const [view, setView] = useState<View>("kanban");
  const [editMode, setEditMode] = useState(false);
  const openNovoNegocio = useUiStore((s) => s.openNovoNegocio);
  const openAutomacoesDrawer = useUiStore((s) => s.openAutomacoesDrawer);
  const pushToast = useUiStore((s) => s.pushToast);
  const pipeline = useCrmStore((s) => s.getPipeline(pipelineId));

  return (
    <PageShell title="NEGÓCIOS">
      {editMode ? (
        <div className="flex items-center gap-2.5 h-[46px] px-4 border-b border-ink bg-ink text-white flex-none">
          <span className="font-mono text-[9px] tracking-wider border border-[#4A4C52] rounded-[2px] px-1.5 py-0.5">
            MODO EDIÇÃO
          </span>
          <b className="text-[12.5px]">Editando: {pipeline?.name}</b>
          <span className="font-mono text-[9px] text-[#9EA0A6] ml-1.5">✓ SALVO</span>
          <div className="ml-auto flex gap-1.5">
            <button
              className="border border-[#4A4C52] rounded-[3px] text-[10.5px] px-2.5 py-1.5"
              onClick={() => pushToast("Pré-visualização como usuário chega na próxima versão.")}
            >
              Visualizar como usuário
            </button>
            <button
              className="border border-[#4A4C52] rounded-[3px] text-[10.5px] px-2.5 py-1.5"
              onClick={() => pushToast("Configurações avançadas do funil chegam na próxima versão (NEG-008).")}
            >
              Configurações avançadas
            </button>
            <button className="bg-white text-ink rounded-[3px] text-[10.5px] px-2.5 py-1.5 font-medium" onClick={() => setEditMode(false)}>
              Sair da edição
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 h-[46px] px-4 border-b border-line flex-none bg-surface">
          <span className="font-mono text-[9.5px] text-muted-2 tracking-wider uppercase">Negócios</span>
          <FunnelSwitcher pipelineId={pipelineId} onChange={setPipelineId} />
          <div className="flex border border-line-strong rounded-[3px] overflow-hidden text-[11px]">
            <button
              onClick={() => setView("kanban")}
              className={`px-2.5 py-1.5 ${view === "kanban" ? "bg-ink text-white" : "text-muted"}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("lista")}
              className={`px-2.5 py-1.5 border-l border-line-strong ${view === "lista" ? "bg-ink text-white" : "text-muted"}`}
            >
              Lista
            </button>
          </div>
          <button
            onClick={() => pushToast("Busca e filtros avançados chegam na próxima versão.")}
            className="border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5 text-muted"
          >
            Filtros
          </button>
          <button onClick={() => setEditMode(true)} className="ml-auto border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5">
            Editar funil
          </button>
          <button
            onClick={() => openAutomacoesDrawer({ pipelineId, scopeLabel: pipeline?.name ?? "" })}
            className="border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5"
          >
            Automações
          </button>
          <button
            onClick={() => openNovoNegocio({ pipelineId })}
            className="bg-ink text-white text-[11px] px-3 py-[7px] rounded-[3px] font-medium"
          >
            + Novo negócio
          </button>
        </div>
      )}

      {view === "kanban" || editMode ? (
        <KanbanBoard pipelineId={pipelineId} editMode={editMode} />
      ) : (
        <ListView pipelineId={pipelineId} />
      )}
    </PageShell>
  );
}
