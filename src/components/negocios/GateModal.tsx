"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Callout, Textarea } from "@/components/ui/primitives";

export function GateModal() {
  const open = useUiStore((s) => s.gateOpen);
  const ctx = useUiStore((s) => s.gateCtx);
  const close = useUiStore((s) => s.closeGate);
  const pushToast = useUiStore((s) => s.pushToast);

  const getDeal = useCrmStore((s) => s.getDeal);
  const getStage = useCrmStore((s) => s.getStage);
  const moveDeal = useCrmStore((s) => s.moveDeal);
  const setDealChecklistItem = useCrmStore((s) => s.setDealChecklistItem);

  const deal = ctx ? getDeal(ctx.dealId) : undefined;
  const targetStage = ctx && deal ? getStage(deal.pipelineId, ctx.targetStageId) : undefined;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setChecked({});
      setNotes({});
    }
  }, [open]);

  if (!ctx || !deal || !targetStage) {
    return null;
  }

  const obrigatorios = (targetStage.checklist ?? []).filter(
    (c) => c.kind === "obrigatorio" && !deal.checklistState?.[c.id]
  );
  const alertas = (targetStage.checklist ?? []).filter((c) => c.kind === "alerta" && !deal.checklistState?.[c.id]);

  const allObrigatoriosChecked = obrigatorios.every((c) => checked[c.id]);

  function handleResolve() {
    if (!deal || !targetStage) return;
    obrigatorios.forEach((c) => setDealChecklistItem(deal.id, c.id, true));
    alertas.forEach((c) => setDealChecklistItem(deal.id, c.id, true, notes[c.id]));
    moveDeal(deal.id, targetStage.id);
    close();
    pushToast(`Movido para "${targetStage.name}".`, "success");
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && close()}
      title={`Mover para "${targetStage.name}"`}
      eyebrow="MODAL"
      width={420}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
            Cancelar
          </span>
          <Button variant="primary" className="ml-auto" disabled={!allObrigatoriosChecked} onClick={handleResolve}>
            Resolver e mover
          </Button>
        </>
      }
    >
      {obrigatorios.length > 0 && (
        <Callout tone="danger">
          <b>{obrigatorios.length} pendência(s) bloqueiam a movimentação</b>
          <div className="flex flex-col gap-2 mt-2">
            {obrigatorios.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[c.id]}
                  onChange={(e) => setChecked((prev) => ({ ...prev, [c.id]: e.target.checked }))}
                />
                {c.label}
              </label>
            ))}
          </div>
        </Callout>
      )}
      {alertas.map((c) => (
        <div key={c.id} className="flex flex-col gap-1.5">
          <Callout tone="warning">Alerta não bloqueia: “{c.label}” pede justificativa.</Callout>
          <Textarea
            placeholder="Justificativa (opcional)"
            value={notes[c.id] ?? ""}
            onChange={(e) => setNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
          />
        </div>
      ))}
      {obrigatorios.length === 0 && alertas.length === 0 && (
        <div className="text-[11px] text-muted">Nenhuma pendência para esta etapa. Pode mover.</div>
      )}
      <div className="font-mono text-[9px] text-muted-3">
        CANCELAR DEVOLVE O CARD À ETAPA DE ORIGEM, SEM REGISTRAR MOVIMENTAÇÃO.
      </div>
    </Modal>
  );
}
