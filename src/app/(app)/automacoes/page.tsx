"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { Badge, EmptyState } from "@/components/ui/primitives";
import type { AutomationStatus } from "@/lib/types";

const STATUS_TONE: Record<AutomationStatus, "success" | "warning" | "danger" | "neutral"> = {
  ativa: "success",
  rascunho: "neutral",
  pausada: "neutral",
  com_erro: "danger",
  arquivada: "neutral",
};

export default function AutomacoesPage() {
  const router = useRouter();
  const automations = useCrmStore((s) => s.automations);
  const toggleAutomationStatus = useCrmStore((s) => s.toggleAutomationStatus);
  const createAutomation = useCrmStore((s) => s.createAutomation);
  const [scope, setScope] = useState("todos");
  const [status, setStatus] = useState("todos");

  const scopes = useMemo(() => Array.from(new Set(automations.map((a) => a.scopeLabel))), [automations]);

  const filtered = automations.filter((a) => (scope === "todos" || a.scopeLabel === scope) && (status === "todos" || a.status === status));

  return (
    <PageShell title="AUTOMAÇÕES · CENTRAL GLOBAL">
      <div className="flex items-center gap-2 h-[46px] px-4 border-b border-line flex-none bg-surface">
        <select value={scope} onChange={(e) => setScope(e.target.value)} className="border border-line-strong rounded-[3px] text-[11px] px-2 py-1.5 bg-canvas">
          <option value="todos">Escopo: todos</option>
          {scopes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-line-strong rounded-[3px] text-[11px] px-2 py-1.5 bg-canvas">
          <option value="todos">Status: todos</option>
          {(["rascunho", "ativa", "pausada", "com_erro", "arquivada"] as AutomationStatus[]).map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            const a = createAutomation({ name: "Nova automação", scopeLabel: "Global" });
            router.push(`/automacoes/${a.id}`);
          }}
          className="ml-auto bg-ink text-white text-[11px] px-3 py-[7px] rounded-[3px] font-medium"
        >
          + Nova automação
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-canvas">
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma automação criada ainda"
            description="Comece por um follow-up de proposta ou pela distribuição de leads."
          />
        ) : (
          <>
            <div className="grid grid-cols-[1.5fr_.85fr_1fr_.45fr_.6fr_.55fr_1fr] gap-2 px-3.5 py-2 bg-surface border-b border-line font-mono text-[8px] tracking-wider text-muted-3 uppercase">
              <span>Automação</span>
              <span>Escopo</span>
              <span>Gatilho</span>
              <span>Versão</span>
              <span>Exec. 7d</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {filtered.map((a) => (
              <div
                key={a.id}
                className={`grid grid-cols-[1.5fr_.85fr_1fr_.45fr_.6fr_.55fr_1fr] gap-2 px-3.5 py-2.5 border-b border-line-soft items-center text-[11px] ${
                  a.status === "com_erro" ? "bg-danger-bg" : "bg-surface"
                }`}
              >
                <span>{a.name}</span>
                <span className="text-muted">{a.scopeLabel}</span>
                <span className="text-muted">{a.triggerLabel}</span>
                <span className="font-mono">v{a.version}</span>
                <span className="font-mono">{a.execs7d || "—"}</span>
                <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
                <span className="flex gap-1.5 flex-wrap">
                  <button className="border border-line-strong rounded-[3px] text-[9.5px] px-1.5 py-1" onClick={() => router.push(`/automacoes/${a.id}`)}>
                    Editar
                  </button>
                  <button className="border border-line-strong rounded-[3px] text-[9.5px] px-1.5 py-1" onClick={() => router.push(`/automacoes/${a.id}?tab=insights`)}>
                    {a.status === "com_erro" ? "Ver erros" : "Resultados"}
                  </button>
                  {(a.status === "ativa" || a.status === "pausada") && (
                    <button className="border border-line-strong rounded-[3px] text-[9.5px] px-1.5 py-1" onClick={() => toggleAutomationStatus(a.id)}>
                      {a.status === "ativa" ? "Pausar" : "Ativar"}
                    </button>
                  )}
                </span>
              </div>
            ))}
            <div className="px-3.5 py-2.5 font-mono text-[9px] text-muted-3 border-t border-line-soft">
              {automations.length} AUTOMAÇÕES · {automations.reduce((s, a) => s + a.execs7d, 0)} EXECUÇÕES EM 7 DIAS ·
              STATUS: RASCUNHO · ATIVA · PAUSADA · COM ERRO · ARQUIVADA
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
