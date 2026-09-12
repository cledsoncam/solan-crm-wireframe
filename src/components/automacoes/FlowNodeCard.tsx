"use client";

import type { FlowNode } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<FlowNode["kind"], string> = {
  gatilho: "GATILHO",
  espera: "ESPERA",
  condicao: "CONDIÇÃO",
  acao: "AÇÃO",
};

export function FlowNodeCard({
  node,
  selected,
  onClick,
  emphasis,
  simState,
}: {
  node: FlowNode;
  selected?: boolean;
  onClick?: () => void;
  emphasis?: boolean;
  simState?: "executaria" | "falsa" | "nao_alcancado";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-surface border rounded-[3px] px-3 py-2.5 w-[220px] text-left",
        emphasis ? "border-[1.5px] border-ink" : "border-line-card",
        selected && "ring-2 ring-accent-line",
        simState === "executaria" && "border-success-line bg-success-bg",
        simState === "falsa" && "border-warning-line bg-warning-bg",
        simState === "nao_alcancado" && "opacity-50 border-dashed"
      )}
    >
      <div className="font-mono text-[8px] tracking-widest text-muted-3">{KIND_LABEL[node.kind]}</div>
      <div className="text-[11.5px] font-semibold mt-0.5">{node.title}</div>
      {node.subtitle && <div className="text-[10px] text-muted-2">{node.subtitle}</div>}
      {simState && (
        <div
          className={cn(
            "font-mono text-[8px] mt-1 tracking-wider",
            simState === "executaria" && "text-success",
            simState === "falsa" && "text-warning",
            simState === "nao_alcancado" && "text-muted-3"
          )}
        >
          {simState === "executaria" ? "EXECUTARIA" : simState === "falsa" ? "FALSA" : "NÃO ALCANÇADO"}
        </div>
      )}
    </button>
  );
}

export function FlowConnector() {
  return <div className="w-px h-3.5 bg-line-dash mx-auto" />;
}
