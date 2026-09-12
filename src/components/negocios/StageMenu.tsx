"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import type { Stage, StageType } from "@/lib/types";

const TYPE_LABEL: Record<StageType, string> = { aberta: "Aberta", ganho: "Ganho", perdido: "Perdido" };

export function StageMenu({ pipelineId, stage, dealsCount }: { pipelineId: string; stage: Stage; dealsCount: number }) {
  const duplicateStage = useCrmStore((s) => s.duplicateStage);
  const setStageType = useCrmStore((s) => s.setStageType);
  const pushToast = useUiStore((s) => s.pushToast);
  const openAutomacoesDrawer = useUiStore((s) => s.openAutomacoesDrawer);
  const openStageConfig = useUiStore((s) => s.openStageConfig);
  const openArchiveStage = useUiStore((s) => s.openArchiveStage);

  function changeType(type: StageType) {
    if (type === stage.type) return;
    if (dealsCount > 0) {
      const ok = window.confirm(
        `${dealsCount} negócio(s) passam a contar como ${TYPE_LABEL[type].toLowerCase()}. Confirmar mudança de tipo da etapa "${stage.name}"?`
      );
      if (!ok) return;
    }
    setStageType(pipelineId, stage.id, type);
    pushToast(`Tipo da etapa alterado para ${TYPE_LABEL[type]}.`, "success");
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="text-muted-2 hover:text-ink text-[12px] leading-none">•••</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="bg-surface border border-line-card rounded-[3px] shadow-xl py-1 w-[200px] z-50 text-[11px] animate-fade-in"
        >
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
            onSelect={() => pushToast('Clique no nome da etapa para renomear.')}
          >
            Renomear
          </DropdownMenu.Item>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip flex items-center">
              Tipo da etapa <span className="ml-auto text-muted-2">{TYPE_LABEL[stage.type]} ▸</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="bg-surface border border-line-card rounded-[3px] shadow-xl py-1 w-[140px] z-50 text-[11px]">
                {(["aberta", "ganho", "perdido"] as StageType[]).map((t) => (
                  <DropdownMenu.Item
                    key={t}
                    className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
                    onSelect={() => changeType(t)}
                  >
                    {TYPE_LABEL[t]} {stage.type === t && "✓"}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
            onSelect={() => {
              duplicateStage(pipelineId, stage.id);
              pushToast("Etapa duplicada.");
            }}
          >
            Duplicar etapa…
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
            onSelect={() => pushToast("Campos por etapa chegam na próxima versão (ADM-003).")}
          >
            Campos da etapa
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
            onSelect={() => openStageConfig({ pipelineId, stageId: stage.id })}
          >
            Checklist
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip flex items-center"
            onSelect={() =>
              openAutomacoesDrawer({ pipelineId, stageId: stage.id, scopeLabel: `Etapa · ${stage.name}` })
            }
          >
            Automações
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
            onSelect={() => openStageConfig({ pipelineId, stageId: stage.id })}
          >
            SLA da etapa
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-chip"
            onSelect={() => pushToast("Permissões por etapa chegam na próxima versão.")}
          >
            Permissões
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-line-soft my-1" />
          <DropdownMenu.Item
            className="px-3 py-1.5 outline-none cursor-pointer hover:bg-danger-bg text-danger"
            onSelect={() => openArchiveStage({ pipelineId, stageId: stage.id, hasDeals: dealsCount > 0 })}
          >
            Arquivar / Excluir
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
