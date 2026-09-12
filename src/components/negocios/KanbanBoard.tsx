"use client";

import { useMemo, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useCrmStore } from "@/lib/store";
import { useAttemptMoveDeal } from "@/lib/use-stage-gate";
import { DealCard } from "@/components/negocios/DealCard";
import { StageMenu } from "@/components/negocios/StageMenu";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

export function KanbanBoard({ pipelineId, editMode }: { pipelineId: string; editMode: boolean }) {
  const pipeline = useCrmStore((s) => s.getPipeline(pipelineId));
  const deals = useCrmStore((s) => s.dealsByPipeline(pipelineId));
  const renameStage = useCrmStore((s) => s.renameStage);
  const reorderStages = useCrmStore((s) => s.reorderStages);
  const addStage = useCrmStore((s) => s.addStage);

  const attemptMove = useAttemptMoveDeal();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const draggedColRef = useRef<string | null>(null);

  const stages = useMemo(() => [...(pipeline?.stages ?? [])].sort((a, b) => a.order - b.order), [pipeline]);

  if (!pipeline) return null;

  function dealsFor(stageId: string) {
    return deals.filter((d) => d.stageId === stageId);
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const dealId = result.draggableId;
    const destStageId = result.destination.droppableId;
    const srcStageId = result.source.droppableId;
    if (destStageId === srcStageId) return;
    attemptMove(dealId, destStageId);
  }

  function handleAddStage(atIndex: number) {
    const stage = addStage(pipelineId, "Nova etapa", atIndex);
    setRenamingId(stage.id);
  }

  function handleColDragStart(stageId: string) {
    draggedColRef.current = stageId;
  }
  function handleColDrop(targetStageId: string) {
    const sourceId = draggedColRef.current;
    draggedColRef.current = null;
    if (!sourceId || sourceId === targetStageId) return;
    const ids = stages.map((s) => s.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetStageId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderStages(pipelineId, ids);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
    <div className="flex-1 flex overflow-x-auto scrollbar-thin bg-canvas min-h-0">
      {stages.map((stage, idx) => {
        const stageDeals = dealsFor(stage.id);
        const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
        const isClosed = stage.type !== "aberta";
        const isCollapsed = collapsed[stage.id];

        return (
          <div key={stage.id} className="flex">
            {editMode && (
              <button
                onClick={() => handleAddStage(idx)}
                className="w-2 hover:w-5 transition-all bg-transparent hover:bg-ink flex-none relative group"
                title="Inserir etapa aqui"
              >
                <span className="hidden group-hover:flex absolute inset-0 items-center justify-center text-white text-[13px]">
                  +
                </span>
              </button>
            )}
            <div
              draggable={editMode}
              onDragStart={() => handleColDragStart(stage.id)}
              onDragOver={(e) => editMode && e.preventDefault()}
              onDrop={() => editMode && handleColDrop(stage.id)}
              className={`flex-none border-r border-line-soft p-2.5 flex flex-col gap-2 ${
                isCollapsed ? "w-[54px]" : "w-[248px]"
              } ${stage.type === "ganho" ? "bg-[#F7FAF6]" : stage.type === "perdido" ? "bg-[#FCF8F7]" : ""}`}
            >
              <div className="flex items-center gap-1.5">
                {editMode && <span className="font-mono text-[9px] text-muted-3 cursor-grab">⠿</span>}
                {renamingId === stage.id ? (
                  <input
                    autoFocus
                    defaultValue={stage.name}
                    onBlur={(e) => {
                      renameStage(pipelineId, stage.id, e.target.value.trim() || stage.name);
                      setRenamingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    className="flex-1 border border-ink rounded-[3px] px-1.5 py-0.5 text-[11px] font-semibold outline-none min-w-0"
                  />
                ) : (
                  <span
                    onClick={() => editMode && setRenamingId(stage.id)}
                    className={`text-[11px] font-semibold truncate ${editMode ? "cursor-text" : ""} ${isCollapsed ? "hidden" : ""}`}
                  >
                    {idx + 1} · {stage.name}
                  </span>
                )}
                {!isCollapsed && (
                  <span className="font-mono text-[9px] text-muted-3 ml-auto flex-none">{stageDeals.length}</span>
                )}
                {editMode && !isCollapsed && renamingId !== stage.id && <StageMenu pipelineId={pipelineId} stage={stage} dealsCount={stageDeals.length} />}
              </div>
              {!isCollapsed && (
                <div className="font-mono text-[8.5px] text-muted-3">{formatCurrency(stageValue)}</div>
              )}
              {isClosed && !isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="border border-ink rounded-full text-[10px] px-2 py-0.5">Mês atual</span>
                  <button
                    onClick={() => setCollapsed((c) => ({ ...c, [stage.id]: true }))}
                    className="font-mono text-[8.5px] text-muted-3 ml-auto"
                  >
                    ◧ recolher
                  </button>
                </div>
              )}
              {isCollapsed && (
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [stage.id]: false }))}
                  className="font-mono text-[9px] text-muted-2 [writing-mode:vertical-rl] mx-auto mt-2"
                >
                  {idx + 1} · {stage.name} ({stageDeals.length})
                </button>
              )}

              {!isCollapsed && !isClosed && !editMode && (
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 min-h-[40px] flex-1">
                      {stageDeals.map((deal, i) => (
                        <Draggable draggableId={deal.id} index={i} key={deal.id}>
                          {(dragProvided, dragSnapshot) => (
                            <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                              <DealCard deal={deal} dragging={dragSnapshot.isDragging} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {stageDeals.length === 0 && (
                        <div className="border border-dashed border-line-dash rounded-[3px] py-4 text-center font-mono text-[9px] text-muted-3">
                          NENHUM NEGÓCIO · SOLTAR AQUI
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              )}

              {!isCollapsed && (isClosed || editMode) && (
                <div className="flex flex-col gap-2 flex-1">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} compactClosed={isClosed} />
                  ))}
                  {editMode && !isClosed && (
                    <div className="h-14 border border-line-card bg-surface rounded-[3px]" />
                  )}
                </div>
              )}
              {!isCollapsed && isClosed && !editMode && (
                <div className="font-mono text-[8.5px] text-muted-3 mt-auto leading-relaxed">
                  {stage.type === "ganho"
                    ? "CARD COMPACTO · SEM SLA. AÇÕES: ABRIR NEGÓCIO, PROJETO, PÓS-VENDA E REABRIR."
                    : "CARD FICA NO QUADRO. SAIR DAQUI É REABRIR: EXIGE PERMISSÃO."}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {editMode && (
        <div className="flex-none w-[200px] p-2.5">
          <button
            onClick={() => handleAddStage(stages.length)}
            className="w-full border border-dashed border-ink rounded-[3px] py-2.5 text-[11px] flex items-center justify-center gap-1"
          >
            <Plus size={13} /> Nova etapa
          </button>
        </div>
      )}
    </div>
    </DragDropContext>
  );
}
