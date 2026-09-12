"use client";

import { useMemo } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { ProjectCard } from "@/components/engenharia/ProjectCard";

export function ProjectBoard() {
  const pipeline = useCrmStore((s) => s.getPipeline("pl_engenharia"));
  const allProjects = useCrmStore((s) => s.projects);
  const projects = useMemo(() => allProjects.filter((p) => !p.archived), [allProjects]);
  const moveProject = useCrmStore((s) => s.moveProject);
  const pushToast = useUiStore((s) => s.pushToast);

  const stages = useMemo(() => [...(pipeline?.stages ?? [])].sort((a, b) => a.order - b.order), [pipeline]);

  if (!pipeline) return null;

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const projectId = result.draggableId;
    const destStageId = result.destination.droppableId;
    if (destStageId === result.source.droppableId) return;
    moveProject(projectId, destStageId);
    const stage = stages.find((s) => s.id === destStageId);
    pushToast(`Movido para "${stage?.name}".`, "success");
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex-1 flex overflow-x-auto scrollbar-thin bg-canvas min-h-0">
        {stages.map((stage, idx) => {
          const stageProjects = projects.filter((p) => p.stageId === stage.id);
          return (
            <div key={stage.id} className="flex-none w-[240px] border-r border-line-soft p-2.5 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold truncate">
                  {idx + 1} · {stage.name}
                </span>
                <span className="font-mono text-[9px] text-muted-3 ml-auto flex-none">{stageProjects.length}</span>
              </div>
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 min-h-[40px] flex-1">
                    {stageProjects.map((project, i) => (
                      <Draggable draggableId={project.id} index={i} key={project.id}>
                        {(dragProvided, dragSnapshot) => (
                          <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                            <ProjectCard project={project} dragging={dragSnapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {stageProjects.length === 0 && (
                      <div className="border border-dashed border-line-dash rounded-[3px] py-4 text-center font-mono text-[9px] text-muted-3">
                        NENHUM PROJETO
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
