"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { Drawer } from "@/components/ui/Drawer";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button, Callout, EmptyState, Field, Input, Select, SectionLabel, Textarea } from "@/components/ui/primitives";
import { formatDate, formatDateLong, formatDateTime } from "@/lib/utils";
import type { HomologStatus } from "@/lib/types";

const HOMOLOG_LABEL: Record<HomologStatus, string> = {
  preparacao: "Preparação", enviado: "Enviado", em_analise: "Em análise", pendencia: "Pendência",
  reenvio: "Reenvio", parecer_aprovado: "Parecer aprovado", vistoria: "Vistoria",
  troca_medidor: "Troca de medidor", concluido: "Concluído",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const getProject = useCrmStore((s) => s.getProject);
  const project = getProject(projectId);
  if (!project) notFound();
  return <ProjectDetail projectId={projectId} />;
}

function ProjectDetail({ projectId }: { projectId: string }) {
  const projects = useCrmStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId)!;
  const pipeline = useCrmStore((s) => s.getPipeline(project.pipelineId))!;
  const stage = useCrmStore((s) => s.getStage(project.pipelineId, project.stageId))!;
  const company = useCrmStore((s) => s.getCompany(project.companyId));
  const person = useCrmStore((s) => s.getPerson(project.personId));
  const responsible = useCrmStore((s) => s.getUser(project.responsibleId));
  const deal = useCrmStore((s) => s.getDeal(project.sourceDealId));
  const postSale = useCrmStore((s) => s.getPostSale(project.postSaleId));
  const timelineForProject = useCrmStore((s) => s.timelineForProject);
  const timeline = timelineForProject(projectId);

  const moveProject = useCrmStore((s) => s.moveProject);
  const setProjectChecklistItem = useCrmStore((s) => s.setProjectChecklistItem);
  const addProjectDocument = useCrmStore((s) => s.addProjectDocument);
  const updateHomologacao = useCrmStore((s) => s.updateHomologacao);
  const addHomologPendencia = useCrmStore((s) => s.addHomologPendencia);
  const resolveHomologPendencia = useCrmStore((s) => s.resolveHomologPendencia);
  const addActivity = useCrmStore((s) => s.addActivity);
  const currentUserId = useCrmStore((s) => s.currentUserId);

  const pushToast = useUiStore((s) => s.pushToast);

  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [pendenciaOpen, setPendenciaOpen] = useState(false);
  const [pendTitle, setPendTitle] = useState("");
  const [pendDesc, setPendDesc] = useState("");
  const [pendPriority, setPendPriority] = useState<"baixa" | "media" | "alta">("media");
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<"projeto" | "cliente" | "distribuidora" | "instalacao">("projeto");

  const orderedStages = useMemo(() => [...pipeline.stages].sort((a, b) => a.order - b.order), [pipeline]);
  const currentIdx = orderedStages.findIndex((s) => s.id === stage.id);
  const nextStage = orderedStages[currentIdx + 1];
  const overdue = project.dueDate && new Date(project.dueDate).getTime() < Date.now();

  function handleAdvance() {
    if (!nextStage) return;
    const pending = (stage.checklist ?? []).filter((c) => c.kind === "obrigatorio" && !project.checklistState?.[c.id]);
    if (pending.length > 0) {
      pushToast(`Pendência bloqueia o avanço: ${pending.map((p) => p.label).join(", ")}`, "danger");
      return;
    }
    moveProject(projectId, nextStage.id);
    pushToast(`Movido para "${nextStage.name}".`, "success");
  }

  return (
    <PageShell title="ENGENHARIA">
      <div className="border-b border-line px-4 py-3 flex-none">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/engenharia" className="text-muted-2 hover:text-ink flex-none text-[11px]">
            ← Engenharia
          </Link>
          <span className="font-mono text-[9px] text-muted-3">{project.code}</span>
          <b className="text-[14px] tracking-tight">{project.name}</b>
          {project.power && <span className="font-mono text-[11px]">{project.power}</span>}
          <span className="font-mono text-[9px] border border-line-strong rounded-[2px] px-1.5 py-0.5 text-muted">
            {stage.name.toUpperCase()}
          </span>
          <span className={`font-mono text-[9px] ${project.priority === "alta" ? "text-danger" : project.priority === "media" ? "text-warning" : "text-success"}`}>
            {project.priority.toUpperCase()}
          </span>
          {overdue && <span className="font-mono text-[9px] text-danger border border-danger-line bg-danger-bg rounded-[2px] px-1.5 py-0.5">ATRASADO</span>}
          <div className="ml-auto flex gap-1.5 flex-wrap">
            <Button
              onClick={() => {
                addActivity({ dealId: project.sourceDealId, title: `Tarefa · ${project.name}`, type: "tarefa", at: new Date().toISOString(), responsibleId: currentUserId, done: false });
                pushToast("Tarefa criada.", "success");
              }}
            >
              Nova tarefa
            </Button>
            <Button onClick={() => pushToast("Ordens de Serviço chegam na próxima versão.")}>Criar OS</Button>
            <Button onClick={() => pushToast("Agenda de visitas chega na próxima versão.")}>Agendar visita</Button>
            <Button onClick={() => setFieldsOpen(true)}>Anexar documento</Button>
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
            <button onClick={handleAdvance} className="border border-line-strong text-[10px] px-2.5 rounded-[3px] flex-none ml-1">
              Avançar etapa
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 grid grid-cols-[1fr_300px] gap-4">
        <div className="flex flex-col gap-4 min-w-0">
          <Section title="Handoff da venda · somente leitura">
            {deal ? (
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-ink-soft">
                <div>Proposta aceita<br /><b>{deal.proposal ? `${deal.proposal.code} v${deal.proposal.version}` : "—"}</b></div>
                <div>Valor final<br /><b>{deal.value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deal.value) : "—"}</b></div>
                <div>Prazo prometido<br /><b>{deal.fields["Prazo prometido"] ?? "—"}</b></div>
                <div>Vendedor<br /><b>{useCrmStore.getState().getUser(deal.responsibleId)?.name}</b></div>
                <div className="col-span-2">Condições especiais<br /><span className="text-muted">{deal.fields["Condições especiais"] || "—"}</span></div>
                <div className="col-span-2">Observações comerciais<br /><span className="text-muted">{deal.fields["Observações para a Engenharia"] || "—"}</span></div>
              </div>
            ) : (
              <div className="text-[10.5px] text-muted-2">Negócio de origem não encontrado.</div>
            )}
            <div className="flex gap-1.5 mt-2">
              {deal && <Link href={`/negocios/${deal.id}`} className="border border-line-strong rounded-[3px] text-[10.5px] px-2 py-1">Ver negócio</Link>}
              <button onClick={() => pushToast("Solicitação de correção ao Comercial criada.")} className="border border-line-strong rounded-[3px] text-[10.5px] px-2 py-1">
                Solicitar correção ao Comercial
              </button>
            </div>
          </Section>

          <Section title="Dados técnicos" action={<button onClick={() => setFieldsOpen(true)} className="text-[10px] text-accent">editar</button>}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px] text-muted">
              {Object.entries(project.fields).length === 0 && <span className="text-muted-2">Nenhum dado técnico preenchido.</span>}
              {Object.entries(project.fields).map(([k, v]) => (
                <div key={k}>
                  <span className="text-muted-2">{k}:</span> {v}
                </div>
              ))}
            </div>
          </Section>

          {stage.checklist && stage.checklist.length > 0 && (
            <Section title={`Checklist · ${stage.name}`}>
              <div className="flex flex-col gap-1.5 text-[10.5px]">
                {stage.checklist.map((c) => {
                  const done = !!project.checklistState?.[c.id];
                  return (
                    <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={done} onChange={(e) => setProjectChecklistItem(projectId, c.id, e.target.checked)} />
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
            </Section>
          )}

          <Section title="Homologação" action={<button onClick={() => setPendenciaOpen(true)} className="text-[10px] text-accent">Registrar pendência</button>}>
            <div className="grid grid-cols-2 gap-2 text-[10.5px] mb-2">
              <div>
                <span className="text-muted-2">Distribuidora:</span> {project.homologacao.distribuidora || "—"}
              </div>
              <div>
                <span className="text-muted-2">Protocolo:</span> {project.homologacao.protocolo || "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-2">Status:</span>
                <Select
                  value={project.homologacao.status}
                  onChange={(e) => updateHomologacao(projectId, { status: e.target.value as HomologStatus })}
                  className="h-[24px] text-[10px]"
                >
                  {(Object.keys(HOMOLOG_LABEL) as HomologStatus[]).map((k) => (
                    <option key={k} value={k}>
                      {HOMOLOG_LABEL[k]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <span className="text-muted-2">Prazo:</span> {project.homologacao.prazo ? formatDateLong(project.homologacao.prazo) : "—"}
              </div>
            </div>
            <SectionLabel>Pendências</SectionLabel>
            <div className="flex flex-col gap-1.5 mt-1.5">
              {project.homologacao.pendencias.length === 0 && <span className="text-[10.5px] text-muted-2">Nenhuma pendência registrada.</span>}
              {project.homologacao.pendencias.map((p) => (
                <div key={p.id} className={`border rounded-[3px] px-2.5 py-2 text-[10.5px] ${p.status === "aberta" ? "border-warning-line bg-warning-bg" : "border-line-soft text-muted-2"}`}>
                  <div className="flex gap-2 items-baseline">
                    <b className={p.status === "resolvida" ? "line-through" : ""}>{p.title}</b>
                    <span className="font-mono text-[8px] ml-auto">{p.priority}</span>
                  </div>
                  {p.description && <div className="mt-1">{p.description}</div>}
                  {p.status === "aberta" && (
                    <button onClick={() => resolveHomologPendencia(projectId, p.id)} className="text-accent text-[10px] mt-1">
                      Marcar como resolvida
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Documentos" action={<button onClick={() => setFieldsOpen(true)} className="text-[10px] text-accent">+ Anexar</button>}>
            {project.documents.length === 0 ? (
              <EmptyState title="Nenhum documento anexado" />
            ) : (
              <div className="flex flex-col gap-1.5">
                {project.documents.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 border border-line-card rounded-[3px] px-2.5 py-1.5 text-[10.5px]">
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="font-mono text-[8.5px] text-muted-2">v{d.version}</span>
                    <span className="font-mono text-[8px] border border-line-strong rounded-[2px] px-1 text-muted-2">{d.category}</span>
                    <span className="text-muted-3 text-[9px]">{formatDate(d.at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Timeline">
            <div className="flex flex-col gap-1.5">
              {timeline.length === 0 && <span className="text-[10.5px] text-muted-2">Nenhum evento ainda.</span>}
              {timeline.map((t) => (
                <div key={t.id} className="text-[10.5px] border-b border-line-soft pb-1.5">
                  <span className="font-mono text-[9px] text-muted-3">{formatDateTime(t.at)}</span> — {t.title}
                  {t.author && <span className="text-muted-2"> · {t.author}</span>}
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Resumo">
            <div className="text-[10.5px] leading-loose text-muted">
              Cliente: <Link href={company ? `/pessoas-empresas/empresa/${company.id}` : "#"} className="text-accent">{company?.name ?? "—"}</Link>
              <br />
              Contato: {person?.name ?? "—"}
              <br />
              Responsável técnico: {responsible?.name ?? "não definido"}
              <br />
              Prazo final: {project.dueDate ? formatDateLong(project.dueDate) : "—"}
            </div>
          </Section>
          <Section title="Pós-venda relacionado">
            {postSale ? (
              <Link href={`/pos-venda/${postSale.id}`} className="border border-line-card rounded-[3px] p-2.5 block hover:border-ink text-[10.5px]">
                {postSale.code}
                <div className="text-muted-2 mt-1">{useCrmStore.getState().getStage("pl_posvenda", postSale.stageId)?.name}</div>
              </Link>
            ) : (
              <div className="text-[10.5px] text-muted-2">Nenhum acompanhamento de pós-venda vinculado.</div>
            )}
          </Section>
          <Section title="Visitas e OS relacionadas">
            <div className="text-[10.5px] text-muted-2">Módulo de Ordens de Serviço chega na próxima versão.</div>
          </Section>
        </div>
      </div>

      <Drawer
        open={fieldsOpen}
        onOpenChange={setFieldsOpen}
        title="Dados técnicos e documentos"
        width={340}
        footer={
          <Button variant="primary" className="ml-auto" onClick={() => setFieldsOpen(false)}>
            Fechar
          </Button>
        }
      >
        <FieldsEditor projectId={projectId} />
        <div className="border-t border-line-soft pt-3">
          <SectionLabel>Anexar documento</SectionLabel>
          <div className="flex flex-col gap-2 mt-2">
            <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Nome do arquivo" />
            <Select value={docCategory} onChange={(e) => setDocCategory(e.target.value as typeof docCategory)}>
              <option value="projeto">Projeto</option>
              <option value="cliente">Cliente</option>
              <option value="distribuidora">Distribuidora / Homologação</option>
              <option value="instalacao">Instalação / Entrega</option>
            </Select>
            <Button
              variant="primary"
              onClick={() => {
                if (!docName.trim()) return;
                addProjectDocument(projectId, { name: docName.trim(), category: docCategory, version: 1, at: new Date().toISOString(), responsibleId: currentUserId });
                setDocName("");
                pushToast("Documento anexado.", "success");
              }}
            >
              Anexar
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={pendenciaOpen}
        onOpenChange={setPendenciaOpen}
        title="Registrar pendência da distribuidora"
        eyebrow="WF-16"
        width={340}
        footer={
          <>
            <span className="text-[11px] text-muted cursor-pointer" onClick={() => setPendenciaOpen(false)}>
              Cancelar
            </span>
            <Button
              variant="primary"
              className="ml-auto"
              onClick={() => {
                if (!pendTitle.trim()) return;
                addHomologPendencia(projectId, { title: pendTitle.trim(), description: pendDesc, priority: pendPriority });
                setPendTitle("");
                setPendDesc("");
                setPendenciaOpen(false);
                pushToast("Pendência registrada.", "success");
              }}
            >
              Registrar
            </Button>
          </>
        }
      >
        <Field label="Descrição" required>
          <Input value={pendTitle} onChange={(e) => setPendTitle(e.target.value)} placeholder="Ex.: Falta laudo de vistoria" />
        </Field>
        <Field label="Detalhe">
          <Textarea value={pendDesc} onChange={(e) => setPendDesc(e.target.value)} />
        </Field>
        <Field label="Prioridade">
          <Select value={pendPriority} onChange={(e) => setPendPriority(e.target.value as typeof pendPriority)}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </Select>
        </Field>
        <Callout tone="warning">O reenvio mantém referência à pendência anterior — o histórico não é apagado.</Callout>
      </Drawer>
    </PageShell>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-line-card bg-surface rounded-[4px] p-3.5">
      <div className="flex items-center mb-2">
        <SectionLabel>{title}</SectionLabel>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </div>
  );
}

function FieldsEditor({ projectId }: { projectId: string }) {
  const project = useCrmStore((s) => s.projects.find((p) => p.id === projectId));
  const updateProjectFields = useCrmStore((s) => s.updateProjectFields);
  const [entries, setEntries] = useState<[string, string][]>(project ? Object.entries(project.fields) : []);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  if (!project) return null;

  return (
    <>
      <SectionLabel>Dados técnicos</SectionLabel>
      <div className="flex flex-col gap-1.5 mt-1.5">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex gap-1.5">
            <Input value={k} readOnly className="flex-1 bg-chip" />
            <Input value={v} onChange={(e) => setEntries((prev) => prev.map((entry, idx) => (idx === i ? [entry[0], e.target.value] : entry)))} className="flex-1" />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Campo" className="flex-1" />
        <Input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="Valor" className="flex-1" />
        <Button
          onClick={() => {
            if (!newKey.trim()) return;
            const next: [string, string][] = [...entries, [newKey.trim(), newVal]];
            setEntries(next);
            updateProjectFields(projectId, Object.fromEntries(next));
            setNewKey("");
            setNewVal("");
          }}
        >
          +
        </Button>
      </div>
      <Button
        size="sm"
        className="mt-2"
        onClick={() => updateProjectFields(projectId, Object.fromEntries(entries))}
      >
        Salvar alterações
      </Button>
    </>
  );
}
