"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button, EmptyState, SectionLabel } from "@/components/ui/primitives";
import { formatDate, formatDateLong, formatDateTime } from "@/lib/utils";

export default function PostSaleDetailPage({ params }: { params: Promise<{ postSaleId: string }> }) {
  const { postSaleId } = use(params);
  const getPostSale = useCrmStore((s) => s.getPostSale);
  const postSale = getPostSale(postSaleId);
  if (!postSale) notFound();
  return <PostSaleDetail postSaleId={postSaleId} />;
}

function PostSaleDetail({ postSaleId }: { postSaleId: string }) {
  const postSales = useCrmStore((s) => s.postSales);
  const postSale = postSales.find((p) => p.id === postSaleId)!;
  const pipeline = useCrmStore((s) => s.getPipeline("pl_posvenda"))!;
  const stage = useCrmStore((s) => s.getStage("pl_posvenda", postSale.stageId))!;
  const company = useCrmStore((s) => s.getCompany(postSale.companyId));
  const person = useCrmStore((s) => s.getPerson(postSale.personId));
  const responsible = useCrmStore((s) => s.getUser(postSale.responsibleId));
  const deal = useCrmStore((s) => s.getDeal(postSale.sourceDealId));
  const project = useCrmStore((s) => s.getProject(postSale.projectId));
  const projectStage = useCrmStore((s) => (project ? s.getStage("pl_engenharia", project.stageId) : undefined));
  const activities = useCrmStore((s) => s.activities);
  const addActivity = useCrmStore((s) => s.addActivity);
  const currentUserId = useCrmStore((s) => s.currentUserId);
  const movePostSale = useCrmStore((s) => s.movePostSale);

  const pushToast = useUiStore((s) => s.pushToast);

  const relatedActivities = deal ? activities.filter((a) => a.dealId === deal.id) : [];

  const orderedStages = useMemo(() => [...pipeline.stages].sort((a, b) => a.order - b.order), [pipeline]);
  const currentIdx = orderedStages.findIndex((s) => s.id === stage.id);
  const nextStage = orderedStages[currentIdx + 1];

  return (
    <PageShell title="PÓS-VENDA">
      <div className="border-b border-line px-4 py-3 flex-none">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/pos-venda" className="text-muted-2 hover:text-ink flex-none text-[11px]">
            ← Pós-venda
          </Link>
          <span className="font-mono text-[9px] text-muted-3">{postSale.code}</span>
          <b className="text-[14px] tracking-tight">{company?.name ?? postSale.code}</b>
          <span className="font-mono text-[9px] border border-line-strong rounded-[2px] px-1.5 py-0.5 text-muted">
            {stage.name.toUpperCase()}
          </span>
          <div className="ml-auto flex gap-1.5">
            <Button
              onClick={() => {
                addActivity({ dealId: postSale.sourceDealId, title: `Tarefa · ${company?.name}`, type: "tarefa", at: new Date().toISOString(), responsibleId: currentUserId, done: false });
                pushToast("Tarefa criada.", "success");
              }}
            >
              Nova tarefa
            </Button>
            <Button onClick={() => pushToast("Solicitação de atualização enviada à Engenharia.")}>Solicitar atualização</Button>
          </div>
        </div>
        <div className="flex gap-[3px] mt-3">
          {orderedStages.map((s) => (
            <span
              key={s.id}
              className={`flex-1 text-center text-[10px] py-1.5 border ${
                s.id === stage.id ? "bg-ink border-ink text-white" : s.order < stage.order ? "bg-chip border-line-card text-muted-2" : "border-dashed border-line-dash text-muted-3"
              }`}
            >
              {s.order + 1} {s.name}
            </span>
          ))}
          {nextStage && (
            <button
              onClick={() => {
                movePostSale(postSaleId, nextStage.id);
                pushToast(`Movido para "${nextStage.name}".`, "success");
              }}
              className="border border-line-strong text-[10px] px-2.5 rounded-[3px] flex-none ml-1"
            >
              Avançar etapa
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 grid grid-cols-[1fr_300px] gap-4">
        <div className="flex flex-col gap-4 min-w-0">
          <Section title="Cliente / Contatos">
            <div className="text-[10.5px] text-muted leading-loose">
              Empresa: <Link href={company ? `/pessoas-empresas/empresa/${company.id}` : "#"} className="text-accent">{company?.name ?? "—"}</Link>
              <br />
              Contato: {person?.name ?? "—"}
              <br />
              Responsável de Pós-venda: {responsible?.name ?? "não definido"}
            </div>
          </Section>

          <Section title="Venda · somente leitura">
            {deal ? (
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-ink-soft">
                <div>Valor<br /><b>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deal.value)}</b></div>
                <div>Data da venda<br /><b>{formatDateLong(postSale.saleDate)}</b></div>
                <div>Vendedor<br /><b>{useCrmStore.getState().getUser(deal.responsibleId)?.name}</b></div>
                <div>Proposta<br /><b>{deal.proposal ? `${deal.proposal.code} v${deal.proposal.version}` : "—"}</b></div>
              </div>
            ) : (
              <div className="text-[10.5px] text-muted-2">Negócio de origem não encontrado.</div>
            )}
            {deal && (
              <Link href={`/negocios/${deal.id}`} className="inline-block mt-2 border border-line-strong rounded-[3px] text-[10.5px] px-2 py-1">
                Ver negócio
              </Link>
            )}
          </Section>

          <Section title="Projeto de Engenharia">
            {project ? (
              <Link href={`/engenharia/${project.id}`} className="border border-line-card rounded-[3px] p-2.5 block hover:border-ink">
                <div className="text-[11px] font-semibold">{project.code} · {project.name}</div>
                <div className="text-[10.5px] text-muted mt-1">
                  Etapa: {projectStage?.name} · Responsável: {useCrmStore.getState().getUser(project.responsibleId)?.name ?? "—"} · Prazo:{" "}
                  {project.dueDate ? formatDate(project.dueDate) : "—"}
                </div>
              </Link>
            ) : (
              <div className="text-[10.5px] text-muted-2">Nenhum projeto de Engenharia vinculado.</div>
            )}
          </Section>

          <Section title="Tarefas">
            {relatedActivities.length === 0 ? (
              <EmptyState title="Nenhuma tarefa ainda" />
            ) : (
              <div className="flex flex-col gap-1.5">
                {relatedActivities.map((a) => (
                  <div key={a.id} className="text-[10.5px] flex gap-2 items-baseline border-b border-line-soft pb-1.5">
                    <span className={a.done ? "line-through text-muted-2" : ""}>{a.title}</span>
                    <span className="font-mono text-[9px] text-muted-3 ml-auto">{formatDateTime(a.at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Documentos">
            <EmptyState title="Nenhum documento anexado" description="Contratos e comprovantes chegam com o armazenamento de arquivos." />
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Contratos">
            <div className="text-[10.5px] text-muted-2">Recorrência de O&amp;M e contratos chegam na próxima versão.</div>
          </Section>
          <Section title="Ordens de Serviço">
            <div className="text-[10.5px] text-muted-2">Módulo de OS chega na próxima versão.</div>
          </Section>
          <Section title="Relacionamento e oportunidades futuras">
            <div className="text-[10.5px] text-muted leading-loose">
              NPS/CSAT, upsell/cross-sell e indicação chegam na próxima versão.
            </div>
          </Section>
        </div>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line-card bg-surface rounded-[4px] p-3.5">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2">{children}</div>
    </div>
  );
}
