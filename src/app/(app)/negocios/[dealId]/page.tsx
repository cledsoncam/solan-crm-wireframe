"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { useAttemptMoveDeal } from "@/lib/use-stage-gate";
import { Badge, Button, EmptyState, Input, SectionLabel } from "@/components/ui/primitives";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, formatDateLong, formatDateTime } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";
import {
  Mail,
  MessageCircle,
  StickyNote,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";

const TABS = ["Atividades", "Propostas", "Arquivos", "Processos", "Auditoria"] as const;
type Tab = (typeof TABS)[number];

const TIMELINE_ICON: Record<TimelineEvent["kind"], string> = {
  nota: "❝",
  ligacao: "☎",
  email_enviado: "✉",
  email_recebido: "✉",
  whatsapp_enviado: "✆",
  whatsapp_recebido: "✆",
  reuniao: "◍",
  visita: "⚑",
  tarefa: "◷",
  etapa: "→",
  proposta: "▤",
  automacao: "✓",
  sistema: "●",
};

export default function DealDetailPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = use(params);
  const getDeal = useCrmStore((s) => s.getDeal);
  const deal = getDeal(dealId);
  if (!deal) notFound();
  return <DealDetail dealId={dealId} />;
}

function DealDetail({ dealId }: { dealId: string }) {
  const getDeal = useCrmStore((s) => s.getDeal);
  const getPipeline = useCrmStore((s) => s.getPipeline);
  const getStage = useCrmStore((s) => s.getStage);
  const getCompany = useCrmStore((s) => s.getCompany);
  const getPerson = useCrmStore((s) => s.getPerson);
  const getUser = useCrmStore((s) => s.getUser);
  const timelineForDeal = useCrmStore((s) => s.timelineForDeal);
  const activitiesForDeal = useCrmStore((s) => s.activitiesForDeal);
  const addTimelineEvent = useCrmStore((s) => s.addTimelineEvent);
  const addActivity = useCrmStore((s) => s.addActivity);
  const toggleActivityDone = useCrmStore((s) => s.toggleActivityDone);
  const setDealChecklistItem = useCrmStore((s) => s.setDealChecklistItem);
  const createDraftProposal = useCrmStore((s) => s.createDraftProposal);
  const setProposalStatus = useCrmStore((s) => s.setProposalStatus);
  const currentUserId = useCrmStore((s) => s.currentUserId);

  const openGanhar = useUiStore((s) => s.openGanhar);
  const openPerder = useUiStore((s) => s.openPerder);
  const pushToast = useUiStore((s) => s.pushToast);
  const attemptMove = useAttemptMoveDeal();

  const deal = getDeal(dealId)!;
  const pipeline = getPipeline(deal.pipelineId)!;
  const stage = getStage(deal.pipelineId, deal.stageId)!;
  const company = getCompany(deal.companyId);
  const person = getPerson(deal.personId);
  const responsible = getUser(deal.responsibleId);
  const timeline = timelineForDeal(dealId);
  const activities = activitiesForDeal(dealId);
  const openActivities = activities.filter((a) => !a.done);
  const nextActivity = openActivities[0];

  const orderedStages = useMemo(() => [...pipeline.stages].sort((a, b) => a.order - b.order), [pipeline]);
  const currentIdx = orderedStages.findIndex((s) => s.id === stage.id);
  const nextStage = orderedStages[currentIdx + 1];
  const isClosed = stage.type !== "aberta";

  const [tab, setTab] = useState<Tab>("Atividades");
  const [composerType, setComposerType] = useState<TimelineEvent["kind"]>("nota");
  const [composerText, setComposerText] = useState("");
  const [fieldsOpen, setFieldsOpen] = useState(false);

  function handleAddInteraction() {
    if (!composerText.trim()) return;
    addTimelineEvent({
      dealId,
      kind: composerType,
      title: labelForKind(composerType),
      detail: composerText.trim(),
      author: getUser(currentUserId)?.name,
      at: new Date().toISOString(),
    });
    setComposerText("");
    pushToast("Interação registrada.", "success");
  }

  function proposalActionLabel() {
    if (!deal.proposal) return "Gerar proposta";
    const map: Record<string, string> = {
      rascunho: "Enviar proposta",
      enviada: "Acompanhar proposta",
      visualizada: "Acompanhar proposta",
      ajuste_solicitado: "Ver ajuste pedido",
      em_assinatura: "Acompanhar assinatura",
      assinada: "Ver proposta assinada",
      aceite_registrado: "Ver aceite",
      recusada: "Nova versão",
      expirada: "Nova versão",
    };
    return map[deal.proposal.status] ?? "Ver proposta";
  }

  function handleProposalAction() {
    if (!deal.proposal) {
      createDraftProposal(dealId);
      pushToast("Proposta gerada (rascunho).", "success");
      setTab("Propostas");
      return;
    }
    if (deal.proposal.status === "rascunho") {
      setProposalStatus(dealId, "enviada");
      pushToast("Proposta enviada.", "success");
    }
    setTab("Propostas");
  }

  return (
    <PageShell title="NEGÓCIOS">
      <div className="border-b border-line px-4 py-3 flex-none">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/negocios" className="text-muted-2 hover:text-ink flex-none">
            <ArrowLeft size={15} />
          </Link>
          <span className="font-mono text-[9px] text-muted-3">{deal.code}</span>
          <b className="text-[14px] tracking-tight">{deal.title}</b>
          <span className="font-mono text-[9px] border border-line-strong rounded-[2px] px-1.5 py-0.5 text-muted">
            {pipeline.name.replace("Funil de ", "").toUpperCase()} / {currentIdx + 1} · {stage.name.toUpperCase()}
          </span>
          <span className="font-mono text-[12px] ml-1">{formatCurrency(deal.value)}</span>
          <div className="ml-auto flex gap-1.5 flex-wrap">
            <Button onClick={() => pushToast("Abra o módulo de Conversas para continuar por WhatsApp.")}>
              <MessageCircle size={12} /> WhatsApp
            </Button>
            <Button onClick={() => pushToast("Abra o módulo de E-mails para continuar por e-mail.")}>
              <Mail size={12} /> E-mail
            </Button>
            <Button
              onClick={() => {
                addActivity({ dealId, title: "Nova tarefa", type: "tarefa", at: new Date().toISOString(), responsibleId: currentUserId, done: false });
                pushToast("Tarefa criada.", "success");
              }}
            >
              <CalendarClock size={12} /> Tarefa
            </Button>
            <Button
              onClick={() => {
                setTab("Atividades");
                setComposerType("nota");
              }}
            >
              <StickyNote size={12} /> Nota
            </Button>
            <Button variant="default" className="border-ink" onClick={handleProposalAction}>
              {proposalActionLabel()}
            </Button>
            <Button variant="primary" disabled={!!deal.wonAt || !!deal.lostAt} onClick={() => openGanhar(dealId)}>
              Ganhar
              {deal.proposal && (
                <span className="font-mono text-[8px] opacity-70">
                  {deal.proposal.status === "assinada" || deal.proposal.status === "aceite_registrado" ? "ASSINADA" : ""}
                </span>
              )}
            </Button>
            <Button variant="outlineDanger" disabled={!!deal.wonAt || !!deal.lostAt} onClick={() => openPerder(dealId)}>
              Perder
            </Button>
          </div>
        </div>

        <div className="flex gap-[3px] mt-3">
          {orderedStages
            .filter((s) => s.type === "aberta" || s.id === stage.id)
            .map((s) => (
              <span
                key={s.id}
                className={`flex-1 text-center text-[10px] py-1.5 border ${
                  s.id === stage.id
                    ? "bg-ink border-ink text-white"
                    : s.order < stage.order
                    ? "bg-chip border-line-card text-muted-2"
                    : "border-dashed border-line-dash text-muted-3"
                }`}
              >
                {s.order + 1} {s.name}
              </span>
            ))}
          {nextStage && !isClosed && (
            <button
              onClick={() => attemptMove(dealId, nextStage.id)}
              className="border border-line-strong text-[10px] px-2.5 rounded-[3px] flex-none ml-1"
            >
              Avançar etapa
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[270px_1fr_280px] flex-1 min-h-0">
        {/* LEFT */}
        <div className="border-r border-line p-3.5 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
          <div>
            <SectionLabel>Contato principal</SectionLabel>
            {person ? (
              <>
                <div className="text-[12px] font-semibold mt-1.5">{person.name}</div>
                <div className="text-[10.5px] text-muted leading-relaxed">
                  {person.role && <>{person.role} · decisor</>}
                  <br />
                  {person.phone}
                  <br />
                  {person.email}
                </div>
              </>
            ) : (
              <div className="text-[10.5px] text-muted-2 mt-1.5">Nenhum contato definido.</div>
            )}
            {deal.otherPersonIds.length > 0 && (
              <div className="text-[10.5px] text-accent mt-1.5">+ {deal.otherPersonIds.length} outros contatos</div>
            )}
          </div>
          {company && (
            <div className="border-t border-line-soft pt-3">
              <SectionLabel>Empresa</SectionLabel>
              <Link href={`/pessoas-empresas/empresa/${company.id}`} className="text-[12px] font-semibold mt-1.5 block hover:text-accent">
                {company.name}
              </Link>
              <div className="text-[10.5px] text-muted leading-relaxed">
                CNPJ ···{company.cnpj.slice(-6)}
                <br />
                {company.segment} · {company.city}/{company.uf}
                {company.address && (
                  <>
                    <br />
                    {company.address}
                  </>
                )}
              </div>
            </div>
          )}
          <div className="border-t border-line-soft pt-3">
            <div className="flex items-center">
              <SectionLabel>Campos do funil / etapa</SectionLabel>
              <button className="ml-auto text-[10px] text-accent" onClick={() => setFieldsOpen(true)}>
                editar
              </button>
            </div>
            <div className="text-[10.5px] text-muted leading-loose mt-1.5">
              {Object.entries(deal.fields).length === 0 && <span className="text-muted-2">Nenhum campo preenchido.</span>}
              {Object.entries(deal.fields).map(([k, v]) => (
                <div key={k}>
                  {k} · {v}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto font-mono text-[9px] text-muted-3 leading-relaxed pt-3">
            DADOS DE PESSOA/EMPRESA SÃO EDITÁVEIS AQUI CONFORME PERMISSÃO DE CAMPO.
          </div>
        </div>

        {/* MIDDLE */}
        <div className="border-r border-line flex flex-col min-w-0">
          <div className="flex gap-3.5 px-3.5 border-b border-line text-[11px] flex-none">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-2.5 border-b-2 -mb-px ${
                  tab === t ? "border-ink font-semibold" : "border-transparent text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {tab === "Atividades" && (
              <>
                <div className="p-3.5 bg-canvas border-b border-line-soft">
                  <div className="flex gap-1.5 flex-wrap mb-2.5">
                    {(
                      [
                        ["nota", "Nota"],
                        ["visita", "Visita"],
                        ["ligacao", "Ligação"],
                        ["email_enviado", "E-mail"],
                        ["reuniao", "Reunião"],
                        ["whatsapp_enviado", "WhatsApp"],
                      ] as [TimelineEvent["kind"], string][]
                    ).map(([kind, label]) => (
                      <button
                        key={kind}
                        onClick={() => setComposerType(kind)}
                        title={label}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] border ${
                          composerType === kind ? "bg-ink text-white border-ink" : "bg-chip text-muted border-line-card"
                        }`}
                      >
                        {TIMELINE_ICON[kind]}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder={`Registrar ${labelForKind(composerType).toLowerCase()}…`}
                    className="w-full border border-line-card rounded-[3px] p-2.5 text-[11.5px] min-h-[52px] outline-none focus:border-ink bg-surface"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="primary" onClick={handleAddInteraction}>
                      Salvar
                    </Button>
                    <Button onClick={() => setComposerText("")}>Cancelar</Button>
                    <span className="font-mono text-[8.5px] text-muted-3 ml-auto">
                      O QUE FOR AGENDADO ENTRA NO CALENDÁRIO E EM TAREFAS
                    </span>
                  </div>
                </div>
                <div className="p-3.5 flex flex-col gap-2">
                  {timeline.length === 0 && <EmptyState title="Nenhuma atividade ainda" />}
                  {timeline.map((t) => (
                    <div key={t.id} className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full border border-muted-2 bg-surface flex items-center justify-center text-[10px] flex-none">
                        {TIMELINE_ICON[t.kind]}
                      </div>
                      <div className="flex-1 min-w-0 border border-line-card rounded-[3px] bg-surface px-2.5 py-2">
                        <div className="flex gap-2 items-baseline">
                          <b className="text-[11px] flex-1 min-w-0">{t.title}</b>
                          <span className="font-mono text-[8.5px] text-muted-3">{formatDateTime(t.at)}</span>
                        </div>
                        {t.detail && <div className="text-[10.5px] text-muted mt-1 leading-relaxed">{t.detail}</div>}
                        {t.author && <div className="text-[9.5px] text-muted-2 mt-1">por {t.author}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "Propostas" && (
              <div className="p-3.5">
                {!deal.proposal ? (
                  <EmptyState
                    title="Nenhuma proposta gerada"
                    description="O gerador de propostas já existe na versão oficial do CRM."
                    action={
                      <Button variant="primary" onClick={() => createDraftProposal(dealId)}>
                        Gerar proposta
                      </Button>
                    }
                  />
                ) : (
                  <div className="border border-line-card rounded-[3px] bg-surface p-3">
                    <div className="flex items-center gap-2">
                      <b className="text-[12px]">
                        {deal.proposal.code} v{deal.proposal.version}
                      </b>
                      <Badge tone={statusTone(deal.proposal.status)}>{deal.proposal.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="text-[11px] text-muted mt-1.5">
                      {formatCurrency(deal.proposal.value)} · válida até {formatDateLong(deal.proposal.validUntil)}
                    </div>
                    <div className="mt-2.5 flex flex-col gap-1">
                      {deal.proposal.signers.map((sg, i) => (
                        <div key={i} className="text-[10.5px] text-muted flex gap-2">
                          <span className="flex-1">
                            {sg.name} <span className="text-muted-2">· {sg.role === "signatario" ? "assina" : "só visualiza"}</span>
                          </span>
                          <span className="font-mono text-[9px]">{sg.status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-line-soft mt-3 pt-3">
                      <span className="font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">
                        Simular progresso (demonstração)
                      </span>
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        <Button size="sm" onClick={() => setProposalStatus(dealId, "enviada")}>
                          Enviar
                        </Button>
                        <Button size="sm" onClick={() => setProposalStatus(dealId, "visualizada")}>
                          Cliente visualizou
                        </Button>
                        <Button size="sm" onClick={() => setProposalStatus(dealId, "em_assinatura")}>
                          Iniciar assinatura
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => setProposalStatus(dealId, "assinada")}>
                          Concluir assinatura
                        </Button>
                        <Button size="sm" variant="outlineDanger" onClick={() => setProposalStatus(dealId, "recusada")}>
                          Recusar
                        </Button>
                      </div>
                      <div className="font-mono text-[8.5px] text-muted-3 leading-relaxed mt-2">
                        O MOTOR REAL DE ENVIO E ASSINATURA DIGITAL (PRO-004 A PRO-009) CHEGA NA PRÓXIMA VERSÃO.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "Arquivos" && (
              <div className="p-3.5">
                <EmptyState
                  title="Nenhum arquivo anexado"
                  description="Upload e versionamento de documentos chegam com o armazenamento de arquivos."
                />
              </div>
            )}

            {tab === "Processos" && (
              <div className="p-3.5 flex flex-col gap-2.5">
                {!deal.projectRef && !deal.postSaleRef ? (
                  <div className="border border-dashed border-line-dash rounded-[3px] p-4 text-[10.5px] text-muted-2 text-center">
                    Projeto e Pós-venda são criados quando o negócio for ganho.
                  </div>
                ) : (
                  <>
                    {deal.projectRef && (
                      <Link href="/engenharia" className="border border-line-card rounded-[3px] p-2.5 text-[11px] hover:border-ink block">
                        {deal.projectRef.code} · Engenharia / {deal.projectRef.stage}
                      </Link>
                    )}
                    {deal.postSaleRef && (
                      <Link href="/pos-venda" className="border border-line-card rounded-[3px] p-2.5 text-[11px] hover:border-ink block">
                        {deal.postSaleRef.code} · Pós-venda / {deal.postSaleRef.stage}
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}

            {tab === "Auditoria" && (
              <div className="p-3.5 flex flex-col gap-1.5">
                {timeline
                  .filter((t) => t.kind === "sistema" || t.kind === "etapa")
                  .map((t) => (
                    <div key={t.id} className="text-[10.5px] border-b border-line-soft pb-1.5">
                      <span className="font-mono text-[9px] text-muted-3">{formatDateTime(t.at)}</span> — {t.title}
                      {t.author && <span className="text-muted-2"> · {t.author}</span>}
                    </div>
                  ))}
                <div className="font-mono text-[9px] text-muted-3 mt-2">
                  LOG COMPLETO DE AUDITORIA (ADM-005) CHEGA NA PRÓXIMA VERSÃO.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-3.5 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
          <div>
            <SectionLabel>Próxima atividade</SectionLabel>
            {nextActivity ? (
              <div className="border border-line-card rounded-[3px] p-2.5 mt-1.5 text-[11px]">
                {nextActivity.title}
                <div className="text-[10px] text-muted-2 mt-1">
                  {responsible?.name} · {nextActivity.type}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-accent-line bg-white rounded-[3px] p-2.5 mt-1.5 text-[10.5px] text-accent">
                Planeje o próximo passo — sem atividade agendada este negócio entra na fila do Meu Dia.
              </div>
            )}
          </div>

          <div className="border-t border-line-soft pt-3">
            <SectionLabel>Proposta atual</SectionLabel>
            {deal.proposal ? (
              <div className="border border-success-line bg-success-bg rounded-[3px] p-2.5 mt-1.5">
                <div className="flex gap-1.5 items-baseline">
                  <b className="text-[11px] text-success flex-1">{deal.proposal.status.replace(/_/g, " ")}</b>
                </div>
                <div className="text-[10.5px] text-ink-soft mt-1 leading-relaxed">
                  {deal.proposal.code} v{deal.proposal.version} · {formatCurrency(deal.proposal.value)}
                  <br />
                  Validade {formatDateLong(deal.proposal.validUntil)}
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  <Button size="sm" variant="primary" onClick={() => setTab("Propostas")}>
                    Acompanhar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-line-dash rounded-[3px] p-2.5 mt-1.5 text-[10px] text-muted-2">
                Sem proposta enviada — mostra <b>Gerar proposta</b>.
              </div>
            )}
          </div>

          {stage.checklist && stage.checklist.length > 0 && (
            <div className="border-t border-line-soft pt-3">
              <SectionLabel>Checklist da etapa</SectionLabel>
              <div className="flex flex-col gap-1 mt-1.5 text-[10.5px]">
                {stage.checklist.map((c) => {
                  const done = !!deal.checklistState?.[c.id];
                  return (
                    <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={done} onChange={(e) => setDealChecklistItem(dealId, c.id, e.target.checked)} />
                      <span className={done ? "line-through text-muted-2" : ""}>{c.label}</span>
                      {c.kind !== "informativo" && (
                        <span className={`font-mono text-[8px] ${c.kind === "obrigatorio" ? "text-danger" : "text-warning"}`}>
                          {c.kind === "obrigatorio" ? "OBRIG." : "ALERTA"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-line-soft pt-3">
            <SectionLabel>Tarefas abertas · {openActivities.length}</SectionLabel>
            <div className="flex flex-col gap-1 mt-1.5 text-[10.5px]">
              {openActivities.length === 0 && <span className="text-muted-2">Nenhuma tarefa aberta.</span>}
              {openActivities.map((a) => (
                <label key={a.id} className="flex items-center gap-1.5 cursor-pointer text-muted">
                  <input type="checkbox" onChange={() => toggleActivityDone(a.id)} />
                  {a.title}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-line-soft pt-3">
            <SectionLabel>Processos relacionados</SectionLabel>
            {!deal.projectRef ? (
              <div className="border border-dashed border-line-dash rounded-[3px] p-2.5 mt-1.5 text-[10.5px] text-muted-2">
                Projeto e Pós-venda são criados quando o negócio for ganho.
              </div>
            ) : (
              <div className="text-[10.5px] text-muted mt-1.5 leading-relaxed">
                {deal.projectRef.code} · {deal.projectRef.stage}
                {deal.postSaleRef && (
                  <>
                    <br />
                    {deal.postSaleRef.code} · {deal.postSaleRef.stage}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-auto font-mono text-[9px] text-muted-3 leading-relaxed pt-3">
            DRAWER LATERAL PARA EDIÇÃO CURTA · PÁGINA PARA EDITORES COMPLEXOS.
          </div>
        </div>
      </div>

      <FieldsDrawer dealId={dealId} open={fieldsOpen} onOpenChange={setFieldsOpen} />
    </PageShell>
  );
}

function labelForKind(kind: TimelineEvent["kind"]) {
  const map: Record<string, string> = {
    nota: "Nota",
    visita: "Visita",
    ligacao: "Ligação",
    email_enviado: "E-mail",
    reuniao: "Reunião",
    whatsapp_enviado: "WhatsApp",
  };
  return map[kind] ?? "Interação";
}

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (["assinada", "aceite_registrado"].includes(status)) return "success";
  if (["em_assinatura", "visualizada", "ajuste_solicitado"].includes(status)) return "warning";
  if (["recusada", "expirada"].includes(status)) return "danger";
  return "neutral";
}

function FieldsDrawer({ dealId, open, onOpenChange }: { dealId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const getDeal = useCrmStore((s) => s.getDeal);
  const updateDealFields = useCrmStore((s) => s.updateDealFields);
  const pushToast = useUiStore((s) => s.pushToast);
  const deal = getDeal(dealId);
  const [entries, setEntries] = useState<[string, string][]>(deal ? Object.entries(deal.fields) : []);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  if (!deal) return null;

  function save() {
    const fields: Record<string, string> = {};
    entries.forEach(([k, v]) => {
      if (k.trim()) fields[k.trim()] = v;
    });
    updateDealFields(dealId, fields);
    pushToast("Campos atualizados.", "success");
    onOpenChange(false);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        if (v) setEntries(Object.entries(deal.fields));
        onOpenChange(v);
      }}
      title="Campos do funil / etapa"
      width={320}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancelar
          </span>
          <Button variant="primary" className="ml-auto" onClick={save}>
            Salvar
          </Button>
        </>
      }
    >
      {entries.map(([k, v], i) => (
        <div key={i} className="flex gap-1.5">
          <Input value={k} readOnly className="flex-1 bg-chip" />
          <Input
            value={v}
            onChange={(e) =>
              setEntries((prev) => prev.map((entry, idx) => (idx === i ? [entry[0], e.target.value] : entry)))
            }
            className="flex-1"
          />
        </div>
      ))}
      <div className="border-t border-line-soft pt-2.5 flex gap-1.5">
        <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Campo" className="flex-1" />
        <Input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="Valor" className="flex-1" />
        <Button
          onClick={() => {
            if (!newKey.trim()) return;
            setEntries((prev) => [...prev, [newKey.trim(), newVal]]);
            setNewKey("");
            setNewVal("");
          }}
        >
          +
        </Button>
      </div>
    </Drawer>
  );
}
