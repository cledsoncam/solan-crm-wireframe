"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button } from "@/components/ui/primitives";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function MeuDiaPage() {
  const router = useRouter();
  const deals = useCrmStore((s) => s.deals);
  const activities = useCrmStore((s) => s.activities);
  const getCompany = useCrmStore((s) => s.getCompany);
  const getPipeline = useCrmStore((s) => s.getPipeline);
  const currentUserId = useCrmStore((s) => s.currentUserId);
  const openGanhar = useUiStore((s) => s.openGanhar);

  const myOpenDeals = deals.filter(
    (d) => d.responsibleId === currentUserId && !d.wonAt && !d.lostAt && getPipeline(d.pipelineId)?.kind !== "sdr"
  );
  const noNextActivity = myOpenDeals.filter((d) => !d.nextActivityAt);
  const proposalsExpiringSoon = myOpenDeals.filter((d) => {
    if (!d.proposal) return false;
    const days = Math.ceil((new Date(d.proposal.validUntil).getTime() - Date.now()) / 86400000);
    return days <= 3 && days >= 0 && !["assinada", "aceite_registrado"].includes(d.proposal.status);
  });
  const readyToWin = myOpenDeals.filter((d) => d.proposal && ["assinada", "aceite_registrado"].includes(d.proposal.status));
  const overdueActivities = activities.filter((a) => !a.done && new Date(a.at).getTime() < Date.now());
  const todayActivities = activities
    .filter((a) => !a.done)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const vendas = getPipeline("pl_vendas");
  const myVendasDeals = deals.filter((d) => d.pipelineId === "pl_vendas" && d.responsibleId === currentUserId);
  const monthGoal = 300000;
  const wonThisMonth = myVendasDeals.filter((d) => d.wonAt).reduce((sum, d) => sum + d.value, 0);

  const totalAgora = readyToWin.length + proposalsExpiringSoon.length;

  return (
    <PageShell title="MEU DIA">
      <div className="grid grid-cols-[1.16fr_.92fr_.78fr] flex-1 min-h-0">
        {/* Fila */}
        <div className="border-r border-line p-3.5 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin min-w-0">
          <div className="flex items-baseline gap-2">
            <b className="text-[12.5px]">Agora · resolver primeiro</b>
            <span className="font-mono text-[9px] text-danger">{totalAgora} ITENS</span>
          </div>

          {readyToWin.map((d) => (
            <div key={d.id} className="border border-success-line bg-success-bg rounded-[3px] p-2.5 flex gap-2.5">
              <div className="w-[3px] bg-success flex-none rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-baseline">
                  <div className="text-[12px] font-semibold flex-1">Proposta assinada · ganhar negócio</div>
                </div>
                <div className="font-mono text-[9px] text-success my-1 tracking-wide">
                  {d.code} · {d.proposal!.code} v{d.proposal!.version} · {formatCurrency(d.value)}
                </div>
                <div className="text-[10.5px] text-muted mb-2">
                  {getCompany(d.companyId)?.name ?? d.title} · confirme o ganho para abrir o projeto e o pós-venda.
                </div>
                <Button size="sm" variant="primary" onClick={() => openGanhar(d.id)}>
                  Ganhar negócio
                </Button>
              </div>
            </div>
          ))}

          {proposalsExpiringSoon.map((d) => (
            <div key={d.id} className="border border-line-card rounded-[3px] p-2.5 flex gap-2.5">
              <div className="w-[3px] bg-warning-line flex-none rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold">Proposta vence em breve sem assinatura</div>
                <div className="font-mono text-[9px] text-muted-2 my-1 tracking-wide">
                  {d.code} · {getCompany(d.companyId)?.name ?? d.title} · {formatCurrency(d.value)}
                </div>
                <Button size="sm" variant="primary" onClick={() => router.push(`/negocios/${d.id}`)}>
                  Abrir negócio
                </Button>
              </div>
            </div>
          ))}

          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-[12.5px]">Hoje ainda</b>
            <span className="font-mono text-[9px] text-muted-3">{noNextActivity.length + overdueActivities.length} ITENS</span>
          </div>
          {overdueActivities.map((a) => (
            <div key={a.id} className="border border-line-card rounded-[3px] px-2.5 py-2 flex gap-2.5 items-center">
              <div className="w-[3px] self-stretch bg-line-strong flex-none rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold">{a.title}</div>
                <div className="font-mono text-[9px] text-muted-2 mt-0.5">
                  ATRASADA · {formatDateTime(a.at)}
                </div>
              </div>
              <Link href={a.dealId ? `/negocios/${a.dealId}` : "/tarefas"} className="border border-line-strong text-[10px] px-2 py-1 rounded-[3px] flex-none">
                Abrir
              </Link>
            </div>
          ))}
          {noNextActivity.slice(0, 5).map((d) => (
            <div key={d.id} className="border border-line-card rounded-[3px] px-2.5 py-2 flex gap-2.5 items-center">
              <div className="w-[3px] self-stretch bg-line-strong flex-none rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold">Negócio sem próxima atividade</div>
                <div className="font-mono text-[9px] text-muted-2 mt-0.5">
                  {d.code} · {getCompany(d.companyId)?.name ?? d.title}
                </div>
              </div>
              <Link href={`/negocios/${d.id}`} className="border border-line-strong text-[10px] px-2 py-1 rounded-[3px] flex-none">
                Abrir
              </Link>
            </div>
          ))}
          {noNextActivity.length === 0 && overdueActivities.length === 0 && readyToWin.length === 0 && (
            <div className="border border-dashed border-line-dash rounded-[3px] p-4 text-center text-[10.5px] text-muted-2">
              Fila vazia — ver Agenda ou Funil.
            </div>
          )}
        </div>

        {/* Agenda */}
        <div className="p-3.5 border-r border-line flex flex-col gap-2.5 overflow-y-auto scrollbar-thin min-w-0">
          <div className="flex items-baseline gap-2">
            <b className="text-[12.5px]">Agenda</b>
            <span className="font-mono text-[9px] text-muted-3">{todayActivities.length} COMPROMISSOS</span>
          </div>
          <div className="border border-line-card rounded-[3px] overflow-hidden">
            {todayActivities.length === 0 && (
              <div className="p-3 text-[10.5px] text-muted-2 text-center">Nenhum compromisso pendente.</div>
            )}
            {todayActivities.map((a) => (
              <Link
                key={a.id}
                href={a.dealId ? `/negocios/${a.dealId}` : "/tarefas"}
                className="flex gap-2.5 px-2.5 py-2 border-b border-line-soft last:border-0 text-[11px] items-baseline hover:bg-canvas"
              >
                <span className="font-mono text-muted-2 flex-none">{formatDateTime(a.at).split(" · ")[1]}</span>
                <span className="flex-1 min-w-0">
                  <b className="font-semibold">{a.title}</b>
                  <br />
                  <span className="font-mono text-[9px] text-muted-2">{a.type.toUpperCase()}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-[12.5px]">Conversas aguardando você</b>
            <span className="font-mono text-[9px] text-muted-3">3</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="border border-line-card rounded-[3px] px-2.5 py-2">
              <div className="flex gap-1.5 items-baseline">
                <b className="text-[11px] flex-1">Juliana Prado</b>
                <span className="font-mono text-[9px] text-danger">18MIN</span>
              </div>
              <div className="text-[10.5px] text-muted mt-0.5">“Consegue enviar a simulação de 12x?”</div>
            </div>
            <div className="border border-line-card rounded-[3px] px-2.5 py-2">
              <div className="flex gap-1.5 items-baseline">
                <b className="text-[11px] flex-1">Condomínio Aurora</b>
                <span className="font-mono text-[9px] text-muted-2">1H</span>
              </div>
              <div className="text-[10.5px] text-muted mt-0.5">“Recebemos a proposta, vamos avaliar.”</div>
            </div>
            <Link href="/conversas" className="border border-dashed border-line-dash rounded-[3px] py-1.5 text-center font-mono text-[9px] text-muted-3">
              VER TODAS EM CONVERSAS
            </Link>
          </div>
        </div>

        {/* Números */}
        <div className="p-3.5 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin min-w-0">
          <div className="flex items-baseline gap-1.5">
            <b className="text-[12.5px]">Meta do mês</b>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[19px]">{formatCurrency(wonThisMonth)}</span>
              <span className="text-[10px] text-muted-2">/ {formatCurrency(monthGoal)}</span>
            </div>
            <div className="h-1.5 bg-line-soft rounded-full my-2 overflow-hidden">
              <div className="h-full bg-ink" style={{ width: `${Math.min(100, (wonThisMonth / monthGoal) * 100)}%` }} />
            </div>
          </div>
          <div className="border-t border-line-soft pt-2.5">
            <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">Meu funil agora</span>
            <div className="flex flex-col gap-1.5 mt-2">
              {vendas?.stages
                .filter((s) => s.type === "aberta")
                .map((s) => {
                  const count = myVendasDeals.filter((d) => d.stageId === s.id).length;
                  const max = Math.max(1, ...vendas.stages.filter((x) => x.type === "aberta").map((x) => myVendasDeals.filter((d) => d.stageId === x.id).length));
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-[10.5px]">
                      <span className="w-[74px] flex-none text-muted">{s.name}</span>
                      <div className="flex-1 h-[9px] bg-line-soft">
                        <div className="h-full bg-line-strong" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[9.5px] w-[14px] text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="border-t border-line-soft pt-2.5">
            <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">Atenção</span>
            <div className="text-[10.5px] text-muted leading-loose mt-1.5">
              {noNextActivity.length} negócio(s) sem próxima atividade
              <br />
              {proposalsExpiringSoon.length} proposta(s) vencendo em breve
              <br />
              {overdueActivities.length} tarefa(s) atrasada(s)
            </div>
          </div>
          <div className="mt-auto border-t border-line-soft pt-2.5 font-mono text-[8.5px] text-muted-3 leading-relaxed">
            TODO NÚMERO ABRE A LISTA DE ORIGEM (DRILL-DOWN). HOME POR PERFIL: VENDEDOR/SDR ABREM AQUI; GESTOR ABRE NO
            DASHBOARD.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
