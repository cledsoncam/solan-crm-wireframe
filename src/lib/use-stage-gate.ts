"use client";

import { useCrmStore } from "./store";
import { useUiStore } from "./ui-store";

export function useAttemptMoveDeal() {
  const getStage = useCrmStore((s) => s.getStage);
  const moveDeal = useCrmStore((s) => s.moveDeal);
  const getDeal = useCrmStore((s) => s.getDeal);
  const openGanhar = useUiStore((s) => s.openGanhar);
  const openPerder = useUiStore((s) => s.openPerder);
  const openGate = useUiStore((s) => s.openGate);
  const pushToast = useUiStore((s) => s.pushToast);

  return function attemptMove(dealId: string, destStageId: string) {
    const deal = getDeal(dealId);
    if (!deal) return;
    if (deal.stageId === destStageId) return;
    const destStage = getStage(deal.pipelineId, destStageId);
    if (!destStage) return;

    if (destStage.type === "ganho") {
      openGanhar(dealId);
      return;
    }
    if (destStage.type === "perdido") {
      openPerder(dealId);
      return;
    }
    const pending = (destStage.checklist ?? []).filter(
      (c) => c.kind === "obrigatorio" && !deal.checklistState?.[c.id]
    );
    if (pending.length > 0) {
      openGate({ dealId, targetStageId: destStageId });
      return;
    }
    moveDeal(dealId, destStageId);
    pushToast(`Movido para "${destStage.name}".`, "success");
  };
}
