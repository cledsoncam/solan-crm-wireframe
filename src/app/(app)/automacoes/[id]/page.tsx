"use client";

import { Suspense, use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { FlowConnector, FlowNodeCard } from "@/components/automacoes/FlowNodeCard";
import { formatDateTime, uid } from "@/lib/utils";
import type { AutomationFlow, FlowNode } from "@/lib/types";

const LIBRARY: { kind: FlowNode["kind"]; label: string; advanced?: boolean }[] = [
  { kind: "gatilho", label: "Gatilho" },
  { kind: "condicao", label: "Condição" },
  { kind: "acao", label: "Ação · negócio" },
  { kind: "acao", label: "Ação · atividade" },
  { kind: "acao", label: "Comunicação" },
  { kind: "acao", label: "Processos" },
  { kind: "acao", label: "Distribuição" },
  { kind: "espera", label: "Espera" },
];

export default function AutomacaoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const getAutomation = (autoId: string) => useCrmStore.getState().automations.find((a) => a.id === autoId);
  const automation = getAutomation(id);
  if (!automation) notFound();
  return (
    <Suspense fallback={null}>
      <Editor id={id} />
    </Suspense>
  );
}

function Editor({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const automations = useCrmStore((s) => s.automations);
  const automation = automations.find((a) => a.id === id)!;
  const updateAutomationFlow = useCrmStore((s) => s.updateAutomationFlow);
  const renameAutomation = useCrmStore((s) => s.renameAutomation);
  const publishAutomation = useCrmStore((s) => s.publishAutomation);
  const toggleAutomationStatus = useCrmStore((s) => s.toggleAutomationStatus);
  const deals = useCrmStore((s) => s.deals);
  const pushToast = useUiStore((s) => s.pushToast);

  const [tab, setTab] = useState<"editor" | "insights">(searchParams.get("tab") === "insights" ? "insights" : "editor");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testDealId, setTestDealId] = useState(deals[0]?.id ?? "");
  const [showSim, setShowSim] = useState(false);

  const flow: AutomationFlow = automation.flow ?? { main: [] };
  const allNodes = [...flow.main, ...(flow.branchCondition ? [flow.branchCondition] : []), ...(flow.simPath ?? []), ...(flow.noPath ?? [])];
  const selected = allNodes.find((n) => n.id === selectedId);

  function patchFlow(mutator: (f: AutomationFlow) => AutomationFlow) {
    updateAutomationFlow(id, mutator(structuredClone(flow)));
  }

  function updateNode(nodeId: string, patch: Partial<FlowNode>) {
    patchFlow((f) => {
      f.main = f.main.map((n) => (n.id === nodeId ? { ...n, ...patch } : n));
      if (f.branchCondition?.id === nodeId) f.branchCondition = { ...f.branchCondition, ...patch };
      f.simPath = f.simPath?.map((n) => (n.id === nodeId ? { ...n, ...patch } : n));
      f.noPath = f.noPath?.map((n) => (n.id === nodeId ? { ...n, ...patch } : n));
      return f;
    });
  }

  function addNode(kind: FlowNode["kind"], label: string) {
    if (flow.branchCondition) {
      pushToast("Este fluxo já tem uma ramificação — edição de topologia chega na próxima versão.");
      return;
    }
    const defaults: Record<FlowNode["kind"], string> = {
      gatilho: "Novo gatilho",
      espera: "1 dia",
      condicao: "Nova condição",
      acao: label,
    };
    const node: FlowNode = { id: uid("n"), kind, title: defaults[kind] };
    patchFlow((f) => {
      f.main = [...f.main, node];
      return f;
    });
    setSelectedId(node.id);
  }

  function deleteNode(nodeId: string) {
    patchFlow((f) => {
      f.main = f.main.filter((n) => n.id !== nodeId);
      return f;
    });
    setSelectedId(null);
  }

  const relatedDeals = automation.pipelineId ? deals.filter((d) => d.pipelineId === automation.pipelineId) : deals;

  return (
    <PageShell title={`AUTOMAÇÃO · ${automation.name}`}>
      <div className="flex items-center gap-2.5 h-[46px] px-4 border-b border-line flex-none bg-surface">
        <Link href="/automacoes" className="text-[11px] text-muted hover:text-ink">
          ← Automações
        </Link>
        <input
          value={automation.name}
          onChange={(e) => renameAutomation(id, e.target.value)}
          className="text-[12.5px] font-semibold tracking-tight outline-none bg-transparent border-b border-transparent focus:border-line-strong min-w-[140px]"
        />
        <span className="font-mono text-[9px] border border-warning-line bg-warning-bg text-warning rounded-[2px] px-1.5 py-0.5">
          {automation.status === "ativa" ? "ATIVA" : automation.status.toUpperCase().replace("_", " ")} v{automation.version}
        </span>
        {automation.publishedVersion && (
          <span className="font-mono text-[9px] text-muted-3">
            PUBLICADA v{automation.publishedVersion} · {formatDateTime(automation.publishedAt!)}
          </span>
        )}
        <div className="flex border border-line-strong rounded-[3px] overflow-hidden text-[11px] ml-2">
          <button onClick={() => setTab("editor")} className={`px-2.5 py-1.5 ${tab === "editor" ? "bg-ink text-white" : "text-muted"}`}>
            Editor
          </button>
          <button onClick={() => setTab("insights")} className={`px-2.5 py-1.5 border-l border-line-strong ${tab === "insights" ? "bg-ink text-white" : "text-muted"}`}>
            Insights
          </button>
        </div>
        <button
          onClick={() => {
            setTab("editor");
            setShowSim(true);
          }}
          className="ml-auto border border-ink rounded-[3px] text-[11px] px-2.5 py-1.5"
        >
          Testar
        </button>
        <button
          onClick={() => {
            publishAutomation(id);
            pushToast("Automação publicada.", "success");
          }}
          className="bg-ink text-white rounded-[3px] text-[11px] px-3 py-[7px] font-medium"
        >
          Publicar
        </button>
      </div>

      {tab === "editor" ? (
        <div className="flex flex-1 min-h-0">
          <div className="w-[190px] border-r border-line p-3 flex flex-col gap-1.5 overflow-y-auto scrollbar-thin flex-none">
            <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase mb-1">Biblioteca</span>
            {LIBRARY.map((item, i) => (
              <button
                key={i}
                onClick={() => addNode(item.kind, item.label)}
                className="border border-line-card rounded-[3px] px-2 py-1.5 text-[10.5px] text-left hover:border-ink"
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-line-soft mt-1 pt-2 flex flex-col gap-1.5">
              <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">Avançado</span>
              {["HTTP / API", "Webhook", "Código"].map((a) => (
                <button
                  key={a}
                  onClick={() => pushToast("Blocos avançados (API/Webhook/Código) exigem permissão de administrador — chegam na próxima versão.")}
                  className="border border-dashed border-line-dash rounded-[3px] px-2 py-1.5 text-[10.5px] text-muted-2 text-left"
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="font-mono text-[9px] text-muted-3 mt-auto pt-3 leading-relaxed">
              CLIQUE PARA ADICIONAR AO FINAL DO FLUXO.
            </div>
          </div>

          <div
            className="flex-1 overflow-auto scrollbar-thin p-6 flex flex-col items-center gap-0"
            style={{ background: "#F6F4EF", backgroundImage: "radial-gradient(#DFDCD4 1px, transparent 1px)", backgroundSize: "16px 16px" }}
          >
            {flow.main.map((node, i) => (
              <div key={node.id} className="flex flex-col items-center">
                <FlowNodeCard
                  node={node}
                  emphasis={i === 0}
                  selected={selectedId === node.id}
                  onClick={() => setSelectedId(node.id)}
                  simState={showSim ? "executaria" : undefined}
                />
                <FlowConnector />
              </div>
            ))}
            {flow.branchCondition && (
              <>
                <FlowNodeCard
                  node={flow.branchCondition}
                  selected={selectedId === flow.branchCondition.id}
                  onClick={() => setSelectedId(flow.branchCondition!.id)}
                  simState={showSim ? "falsa" : undefined}
                />
                <div className="flex gap-8 mt-3.5">
                  <div className="flex flex-col items-center gap-0 w-[220px]">
                    <span className="font-mono text-[8.5px] text-muted-2 bg-transparent">SIM</span>
                    <FlowConnector />
                    {(flow.simPath ?? []).map((n) => (
                      <div key={n.id} className="flex flex-col items-center">
                        <FlowNodeCard node={n} selected={selectedId === n.id} onClick={() => setSelectedId(n.id)} simState={showSim ? "nao_alcancado" : undefined} />
                        <FlowConnector />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-0 w-[220px]">
                    <span className="font-mono text-[8.5px] text-muted-2">NÃO</span>
                    <FlowConnector />
                    {(flow.noPath ?? []).map((n) => (
                      <div key={n.id} className="flex flex-col items-center">
                        <FlowNodeCard node={n} selected={selectedId === n.id} onClick={() => setSelectedId(n.id)} simState={showSim ? "executaria" : undefined} />
                        <FlowConnector />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {!flow.branchCondition && flow.main.length === 0 && (
              <div className="border border-dashed border-line-dash rounded-[3px] p-6 text-center text-[11px] text-muted-2 mt-4">
                Arraste um gatilho da biblioteca para começar.
              </div>
            )}
          </div>

          <div className="w-[260px] border-l border-line p-3.5 flex flex-col gap-2.5 flex-none overflow-y-auto scrollbar-thin">
            {selected ? (
              <>
                <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">
                  Bloco selecionado · {selected.kind}
                </span>
                <Field label="Título">
                  <Input value={selected.title} onChange={(e) => updateNode(selected.id, { title: e.target.value })} />
                </Field>
                <Field label="Subtítulo / detalhe">
                  <Input value={selected.subtitle ?? ""} onChange={(e) => updateNode(selected.id, { subtitle: e.target.value })} />
                </Field>
                {selected.kind === "condicao" && (
                  <div className="flex gap-1.5 text-[10.5px]">
                    <span className="border border-ink rounded-[3px] px-2 py-1">E</span>
                    <span className="border border-line-strong rounded-[3px] px-2 py-1 text-muted">OU</span>
                    <span className="border border-line-strong rounded-[3px] px-2 py-1 text-muted">+ grupo</span>
                  </div>
                )}
                {flow.main.includes(selected) && flow.main[flow.main.length - 1]?.id === selected.id && flow.main.length > 1 && (
                  <button onClick={() => deleteNode(selected.id)} className="text-[10.5px] text-danger text-left">
                    Excluir bloco
                  </button>
                )}
                <div className="border-t border-line-soft pt-2.5 font-mono text-[9px] text-muted-3 leading-relaxed">
                  AÇÃO AGENDADA REVALIDA O REGISTRO ANTES DE EXECUTAR.
                </div>
              </>
            ) : (
              <div className="text-[10.5px] text-muted-2">Selecione um bloco no canvas para configurar.</div>
            )}
            <div className="mt-auto font-mono text-[9px] text-muted-3 leading-relaxed border-t border-line-soft pt-2.5">
              SEM CÓDIGO PARA GATILHOS, CONDIÇÕES, TAREFAS, MENSAGENS, MOVIMENTAÇÃO, DISTRIBUIÇÃO, PROPOSTAS E
              PROCESSOS.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-3.5 max-w-[700px]">
          <div className="border border-line-card bg-surface rounded-[4px] p-3.5">
            <span className="font-mono text-[9px] tracking-widest text-muted-3 uppercase">Teste / simulação</span>
            <Field label="Registro real">
              <Select value={testDealId} onChange={(e) => setTestDealId(e.target.value)}>
                {relatedDeals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} · {d.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Button variant="primary" className="mt-2" onClick={() => setShowSim(true)}>
              Simular sem executar
            </Button>
            {showSim && (
              <div className="font-mono text-[9px] text-muted-3 mt-2">
                O CANVAS MARCA OS ESTADOS NOS NÓS · VOLTE AO EDITOR PARA VER.
              </div>
            )}
          </div>

          <div className="border border-line-card bg-surface rounded-[4px] p-3.5">
            <span className="font-mono text-[9px] tracking-widest text-muted-3 uppercase">Insights e execuções</span>
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              <Kpi label="execuções 7d" value={automation.execs7d} />
              <Kpi label="sucesso" value={automation.execs7d - (automation.failures7d ?? 0)} tone="success" />
              <Kpi label="falhas" value={automation.failures7d ?? 0} tone={automation.failures7d ? "danger" : undefined} />
              <Kpi label="tempo médio" value="1.4s" />
            </div>
            {!!automation.failures7d && (
              <div className="border border-danger-line bg-danger-bg rounded-[3px] p-2.5 mt-3 text-[10.5px] text-danger-2">
                <b>Erro no bloco &quot;Enviar template WhatsApp&quot;</b>
                <div className="text-muted mt-1 leading-relaxed">
                  Provedor retornou 429 · {automation.failures7d} registros afetados · retry 3/3 · fila dead-letter
                </div>
                <div className="flex gap-1.5 mt-2">
                  <Button variant="primary" size="sm" onClick={() => pushToast("Reprocessamento enfileirado.", "success")}>
                    Reprocessar
                  </Button>
                  <Button size="sm" onClick={() => toggleAutomationStatus(id)}>
                    Pausar automação
                  </Button>
                  <Button size="sm" onClick={() => relatedDeals[0] && router.push(`/negocios/${relatedDeals[0].id}`)}>
                    Abrir execução
                  </Button>
                </div>
              </div>
            )}
            <div className="text-[10.5px] text-muted mt-3 leading-relaxed">
              Execuções já iniciadas continuam na versão de origem. Publicar uma nova versão não altera o que está em
              andamento.
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string | number; tone?: "success" | "danger" }) {
  return (
    <div className={`border rounded-[3px] p-2 ${tone === "danger" ? "border-danger-line bg-danger-bg" : "border-line-card"}`}>
      <div className={`font-mono text-[16px] ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : ""}`}>{value}</div>
      <div className="text-[9.5px] text-muted-2">{label}</div>
    </div>
  );
}
