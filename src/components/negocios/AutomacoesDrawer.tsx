"use client";

import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/primitives";

export function AutomacoesDrawer() {
  const open = useUiStore((s) => s.automacoesDrawerOpen);
  const ctx = useUiStore((s) => s.automacoesDrawerCtx);
  const close = useUiStore((s) => s.closeAutomacoesDrawer);
  const router = useRouter();

  const automations = useCrmStore((s) => s.automations);
  const toggleAutomationStatus = useCrmStore((s) => s.toggleAutomationStatus);
  const createAutomation = useCrmStore((s) => s.createAutomation);

  if (!ctx) return null;

  const scoped = automations.filter((a) =>
    ctx.stageId ? a.stageId === ctx.stageId : ctx.pipelineId ? a.pipelineId === ctx.pipelineId && !ctx.stageId : true
  );

  function handleNew() {
    const automation = createAutomation({
      name: "Nova automação",
      scopeLabel: ctx!.scopeLabel,
      pipelineId: ctx!.pipelineId,
      stageId: ctx!.stageId,
      triggerLabel: "Selecione um gatilho",
    });
    close();
    router.push(`/automacoes/${automation.id}`);
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && close()} title="Automações da etapa" eyebrow="DRAWER" width={340}>
      <div className="text-[10.5px] text-muted">
        {ctx.scopeLabel} · {scoped.length} regra(s)
      </div>
      <div className="flex flex-col gap-2">
        {scoped.map((a) => (
          <div key={a.id} className="border border-line-card rounded-[3px] p-2.5">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-medium">{a.name}</span>
              <Badge
                tone={a.status === "ativa" ? "success" : a.status === "com_erro" ? "danger" : "neutral"}
                className="ml-auto"
              >
                {a.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="text-[10px] text-muted-2 mt-1">{a.description}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="text-[10px] text-accent"
                onClick={() => {
                  close();
                  router.push(`/automacoes/${a.id}`);
                }}
              >
                editar
              </button>
              {(a.status === "ativa" || a.status === "pausada") && (
                <button className="text-[10px] text-accent" onClick={() => toggleAutomationStatus(a.id)}>
                  {a.status === "ativa" ? "pausar" : "ativar"}
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={handleNew}
          className="border border-dashed border-line-dash rounded-[3px] py-2 text-center text-[11px] text-accent"
        >
          + Nova automação nesta etapa
        </button>
      </div>
      <div className="font-mono text-[9px] text-muted-3 leading-relaxed">
        NASCENDO NA ETAPA, O CONTEXTO DO PRIMEIRO GATILHO JÁ VEM PREENCHIDO.
      </div>
      <button
        className="text-[11px] text-accent text-left"
        onClick={() => {
          close();
          router.push("/automacoes");
        }}
      >
        Ver todas as automações →
      </button>
    </Drawer>
  );
}
