"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { formatCurrency, daysSince } from "@/lib/utils";

const TABS = ["Geral", "Comercial", "Engenharia", "Operações", "Pós-venda", "Financeiro", "Diretoria"];

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Geral");
  const pushToast = useUiStore((s) => s.pushToast);
  const deals = useCrmStore((s) => s.deals);
  const users = useCrmStore((s) => s.users);
  const getCompany = useCrmStore((s) => s.getCompany);
  const vendas = useCrmStore((s) => s.getPipeline("pl_vendas"));

  const vendasDeals = deals.filter((d) => d.pipelineId === "pl_vendas");
  const openDeals = vendasDeals.filter((d) => !d.wonAt && !d.lostAt);
  const wonDeals = vendasDeals.filter((d) => d.wonAt);
  const lostDeals = vendasDeals.filter((d) => d.lostAt);
  const totalValue = openDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);
  const winRate = vendasDeals.length ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length || 1)) * 100) : 0;

  const funnelStages = vendas?.stages.filter((s) => s.type !== "perdido") ?? [];
  const maxCount = Math.max(1, ...funnelStages.map((s) => vendasDeals.filter((d) => d.stageId === s.id).length));

  const ranking = users
    .filter((u) => u.role === "vendedor" || u.role === "gestor")
    .map((u) => ({ user: u, value: wonDeals.filter((d) => d.responsibleId === u.id).reduce((s, d) => s + d.value, 0) }))
    .sort((a, b) => b.value - a.value);
  const maxRanking = Math.max(1, ...ranking.map((r) => r.value));

  const stuckDeals = [...openDeals].sort((a, b) => daysSince(b.enteredStageAt) - daysSince(a.enteredStageAt)).slice(0, 4);
  const noReturnProposals = openDeals.filter((d) => d.proposal && !["assinada", "aceite_registrado"].includes(d.proposal.status));

  return (
    <PageShell title="DASHBOARDS">
      <div className="flex items-center gap-2 px-3.5 pt-2 border-b border-line bg-canvas overflow-x-auto scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[11px] px-2.5 py-1.5 rounded-t-[3px] border border-b-0 -mb-px whitespace-nowrap ${
              tab === t ? "bg-surface border-line font-semibold" : "border-transparent text-muted"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => pushToast("Criação de dashboards personalizados chega na próxima versão.")}
          className="ml-auto text-[10.5px] text-accent py-1.5"
        >
          + Novo dashboard
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3.5 bg-canvas flex flex-col gap-2.5">
        {tab !== "Geral" && tab !== "Comercial" ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-dashed border-line-dash rounded-[3px] p-6 text-center max-w-[380px]">
              <div className="text-[11.5px] font-semibold">Visão “{tab}” prevista na especificação</div>
              <div className="text-[10.5px] text-muted mt-1.5">
                Chega junto com os módulos de Engenharia, OS, Pós-venda e Financeiro.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-2">
              <Kpi label="Negócios abertos" value={String(openDeals.length)} sub={formatCurrency(totalValue)} />
              <Kpi label="Ganhos" value={String(wonDeals.length)} sub={`win rate ${winRate}%`} />
              <Kpi label="Valor ganho" value={formatCurrency(wonValue)} sub="mês atual" />
              <Kpi label="Perdidos" value={String(lostDeals.length)} sub="mês atual" />
              <Kpi label="Ticket médio" value={formatCurrency(openDeals.length ? totalValue / openDeals.length : 0)} sub="negócios abertos" />
              <Kpi label="Alertas" value={String(noReturnProposals.length)} sub="propostas sem retorno" tone="danger" />
            </div>

            <div className="grid grid-cols-[1.45fr_1fr] gap-2.5">
              <Panel title="Funil de vendas · negócios por etapa">
                <div className="flex flex-col gap-1.5">
                  {funnelStages.map((s) => {
                    const count = vendasDeals.filter((d) => d.stageId === s.id).length;
                    return (
                      <div key={s.id} className="flex items-center gap-2 text-[10px]">
                        <span className="w-[86px] flex-none text-muted">{s.name}</span>
                        <div className="flex-1 h-[10px] bg-line-soft">
                          <div
                            className={s.type === "ganho" ? "h-full bg-success" : "h-full bg-ink-soft"}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[9px] w-[24px] text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="font-mono text-[8px] text-muted-3 mt-2">
                  CONVERSÃO GERAL {winRate}% · CLIQUE NA BARRA ABRE OS NEGÓCIOS DA ETAPA
                </div>
              </Panel>
              <Panel title="Meta x realizado">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[20px]">{formatCurrency(wonValue)}</span>
                  <span className="text-[10px] text-muted-2">/ {formatCurrency(500000)}</span>
                </div>
                <div className="h-[7px] bg-line-soft rounded-full my-2 overflow-hidden">
                  <div className="h-full bg-ink" style={{ width: `${Math.min(100, (wonValue / 500000) * 100)}%` }} />
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <Panel title="Ranking de vendedores">
                <div className="flex flex-col gap-1.5">
                  {ranking.map((r) => (
                    <div key={r.user.id} className="flex items-center gap-2 text-[10px]">
                      <span className="w-[70px] flex-none text-muted">{r.user.name}</span>
                      <div className="flex-1 h-[10px] bg-line-soft">
                        <div className="h-full bg-ink-soft" style={{ width: `${(r.value / maxRanking) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[9px] w-[62px] text-right">{formatCurrency(r.value)}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Negócios parados">
                {stuckDeals.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => router.push(`/negocios/${d.id}`)}
                    className="flex gap-2 text-[10px] py-1 border-b border-line-soft last:border-0 w-full text-left"
                  >
                    <span className="flex-1 truncate">{getCompany(d.companyId)?.name ?? d.title}</span>
                    <span className="text-muted-2">{formatCurrency(d.value)}</span>
                    <span className="font-mono text-danger">{daysSince(d.enteredStageAt)} d</span>
                  </button>
                ))}
              </Panel>
              <Panel title="Propostas sem retorno">
                {noReturnProposals.length === 0 && <div className="text-[10px] text-muted-2">Nenhuma no momento.</div>}
                {noReturnProposals.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => router.push(`/negocios/${d.id}`)}
                    className="flex gap-2 text-[10px] py-1 border-b border-line-soft last:border-0 w-full text-left"
                  >
                    <span className="flex-1 truncate">
                      {d.proposal!.code} · {getCompany(d.companyId)?.name ?? d.title}
                    </span>
                    <span className="text-muted-2">{formatCurrency(d.value)}</span>
                  </button>
                ))}
              </Panel>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "danger" }) {
  return (
    <div className={`border rounded-[3px] px-2.5 py-2 ${tone === "danger" ? "border-danger-line bg-danger-bg" : "border-line-card bg-surface"}`}>
      <span className={`font-mono text-[7.5px] tracking-wider uppercase ${tone === "danger" ? "text-danger-2" : "text-muted-3"}`}>
        {label}
      </span>
      <div className={`font-mono text-[17px] mt-1 ${tone === "danger" ? "text-danger" : ""}`}>{value}</div>
      <div className={`text-[9px] ${tone === "danger" ? "text-danger-2" : "text-muted-2"}`}>{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line-card rounded-[3px] bg-surface flex flex-col">
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-line-soft">
        <span className="text-muted-3 text-[10px]">⠿</span>
        <b className="text-[11px] flex-1 min-w-0">{title}</b>
        <span className="text-muted-3 text-[11px]">•••</span>
      </div>
      <div className="p-2.5 flex-1">{children}</div>
    </div>
  );
}
