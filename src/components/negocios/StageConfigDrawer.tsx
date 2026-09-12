"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Drawer } from "@/components/ui/Drawer";
import { Button, Input, Select, SectionLabel } from "@/components/ui/primitives";
import { uid } from "@/lib/utils";
import type { ChecklistItemDef } from "@/lib/types";

export function StageConfigDrawer() {
  const open = useUiStore((s) => s.stageConfigOpen);
  const ctx = useUiStore((s) => s.stageConfigCtx);
  const close = useUiStore((s) => s.closeStageConfig);
  const pushToast = useUiStore((s) => s.pushToast);

  const getStage = useCrmStore((s) => s.getStage);
  const updateStage = useCrmStore((s) => s.updateStage);

  const stage = ctx ? getStage(ctx.pipelineId, ctx.stageId) : undefined;

  const [items, setItems] = useState<ChecklistItemDef[]>([]);
  const [sla, setSla] = useState<string>("");
  const [newLabel, setNewLabel] = useState("");
  const [newKind, setNewKind] = useState<ChecklistItemDef["kind"]>("informativo");

  useEffect(() => {
    if (open && stage) {
      setItems(stage.checklist ?? []);
      setSla(stage.slaHours ? String(stage.slaHours) : "");
    }
  }, [open, stage]);

  if (!ctx || !stage) return null;

  function save() {
    updateStage(ctx!.pipelineId, ctx!.stageId, {
      checklist: items,
      slaHours: sla ? Number(sla) : undefined,
    });
    pushToast("✓ Salvo", "success");
    close();
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && close()}
      title={`Configurar etapa · ${stage.name}`}
      eyebrow="NEG-009/010"
      width={360}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
            Cancelar
          </span>
          <Button variant="primary" className="ml-auto" onClick={save}>
            Salvar
          </Button>
        </>
      }
    >
      <SectionLabel>Checklist da etapa</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 border border-line-card rounded-[3px] px-2 py-1.5">
            <span className="text-[11px] flex-1">{it.label}</span>
            <Select
              value={it.kind}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((p) => (p.id === it.id ? { ...p, kind: e.target.value as ChecklistItemDef["kind"] } : p))
                )
              }
              className="h-[26px] text-[10px] w-[110px]"
            >
              <option value="informativo">Informativo</option>
              <option value="alerta">Alerta</option>
              <option value="obrigatorio">Obrigatório</option>
            </Select>
            <button
              className="text-muted-2 hover:text-danger text-[10px]"
              onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
            >
              remover
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-[10.5px] text-muted-2">Nenhum item de checklist.</div>}
      </div>
      <div className="flex gap-1.5">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Novo item"
          className="flex-1"
        />
        <Select value={newKind} onChange={(e) => setNewKind(e.target.value as ChecklistItemDef["kind"])} className="w-[110px]">
          <option value="informativo">Informativo</option>
          <option value="alerta">Alerta</option>
          <option value="obrigatorio">Obrigatório</option>
        </Select>
        <Button
          onClick={() => {
            if (!newLabel.trim()) return;
            setItems((prev) => [...prev, { id: uid("cl"), label: newLabel.trim(), kind: newKind }]);
            setNewLabel("");
          }}
        >
          +
        </Button>
      </div>
      <div className="font-mono text-[9px] text-muted-3 leading-relaxed">
        INFORMATIVO NÃO BLOQUEIA · ALERTA PEDE JUSTIFICATIVA · OBRIGATÓRIO BLOQUEIA O AVANÇO.
      </div>

      <div className="border-t border-line-soft pt-3 mt-1">
        <SectionLabel>SLA da etapa</SectionLabel>
        <div className="flex items-center gap-2 mt-2">
          <Input
            value={sla}
            onChange={(e) => setSla(e.target.value.replace(/\D/g, ""))}
            placeholder="horas"
            className="w-[100px]"
          />
          <span className="text-[10.5px] text-muted">horas esperadas nesta etapa</span>
        </div>
      </div>
    </Drawer>
  );
}
