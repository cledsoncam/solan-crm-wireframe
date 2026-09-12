"use client";

import { useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Callout, Field, Select } from "@/components/ui/primitives";

export function ArchiveStageModal() {
  const open = useUiStore((s) => s.archiveStageOpen);
  const ctx = useUiStore((s) => s.archiveStageCtx);
  const close = useUiStore((s) => s.closeArchiveStage);
  const pushToast = useUiStore((s) => s.pushToast);

  const getPipeline = useCrmStore((s) => s.getPipeline);
  const archiveStage = useCrmStore((s) => s.archiveStage);

  const pipeline = ctx ? getPipeline(ctx.pipelineId) : undefined;
  const otherStages = pipeline?.stages.filter((s) => s.id !== ctx?.stageId) ?? [];
  const [destination, setDestination] = useState(otherStages[0]?.id ?? "");

  if (!ctx || !pipeline) return null;
  const stage = pipeline.stages.find((s) => s.id === ctx.stageId);

  function handleConfirm() {
    if (ctx!.hasDeals && !destination) {
      pushToast("Selecione a etapa de destino dos negócios.", "danger");
      return;
    }
    archiveStage(ctx!.pipelineId, ctx!.stageId, ctx!.hasDeals ? destination : undefined);
    close();
    pushToast(`Etapa "${stage?.name}" arquivada.`);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && close()}
      title={`Arquivar etapa "${stage?.name}"`}
      width={360}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
            Cancelar
          </span>
          <Button variant="danger" className="ml-auto" onClick={handleConfirm}>
            Arquivar
          </Button>
        </>
      }
    >
      {ctx.hasDeals ? (
        <>
          <Callout tone="warning">Esta etapa tem negócios. Escolha para onde eles vão antes de arquivar.</Callout>
          <Field label="Etapa de destino" required>
            <Select value={destination} onChange={(e) => setDestination(e.target.value)}>
              {otherStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </>
      ) : (
        <div className="text-[11px] text-muted">Esta etapa não tem negócios. Pode arquivar diretamente.</div>
      )}
    </Modal>
  );
}
