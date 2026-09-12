"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Field, Select, Textarea } from "@/components/ui/primitives";

export function PerderModal() {
  const open = useUiStore((s) => s.perderOpen);
  const dealId = useUiStore((s) => s.perderDealId);
  const close = useUiStore((s) => s.closePerder);
  const pushToast = useUiStore((s) => s.pushToast);

  const getDeal = useCrmStore((s) => s.getDeal);
  const getStage = useCrmStore((s) => s.getStage);
  const loseDeal = useCrmStore((s) => s.loseDeal);

  const deal = dealId ? getDeal(dealId) : undefined;

  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (open && deal) {
      const pipelineReasons = getStage(deal.pipelineId, deal.stageId)?.lossReasons;
      setReason(pipelineReasons?.[0] ?? "Outro");
      setDetail("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dealId]);

  if (!deal) return null;

  const stageReasons = getStage(deal.pipelineId, deal.stageId)?.lossReasons;
  const allReasons =
    stageReasons && stageReasons.length > 0
      ? [...stageReasons, "Outro"]
      : ["Preço", "Prazo", "Fechou com concorrente", "Adiou o projeto", "Sem retorno", "Outro"];

  function handleConfirm() {
    if (!deal) return;
    if (reason === "Outro" && !detail.trim()) {
      pushToast("Detalhe obrigatório para motivo “Outro”.", "danger");
      return;
    }
    loseDeal(deal.id, reason, detail || undefined);
    close();
    pushToast(`${deal.code} marcado como Perdido.`);
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && close()}
      title={`Perder negócio · ${deal.code}`}
      width={360}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
            Cancelar
          </span>
          <Button variant="outlineDanger" className="ml-auto" onClick={handleConfirm}>
            Confirmar perda
          </Button>
        </>
      }
    >
      <Field label="Motivo" required>
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          {allReasons.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
      </Field>
      <Field label={`Detalhe${reason === "Outro" ? " *" : ""}`}>
        <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} />
      </Field>
      <div className="text-[10.5px] text-muted">
        Sugestão de automação: enviar para o funil <b>Reativação</b> em 90 dias.
      </div>
      <div className="font-mono text-[9px] text-muted-3 leading-relaxed">
        O CARD FICA NA ETAPA DE PERDIDO DO PRÓPRIO QUADRO, EM VERSÃO COMPACTA — NÃO SOME. SAIR DAQUI É REABRIR:
        EXIGE PERMISSÃO E JUSTIFICATIVA.
      </div>
    </Modal>
  );
}
