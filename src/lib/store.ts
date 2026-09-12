"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  automations as seedAutomations,
  companies as seedCompanies,
  conversations as seedConversations,
  dealActivities as seedActivities,
  deals as seedDeals,
  messages as seedMessages,
  people as seedPeople,
  pipelines as seedPipelines,
  timeline as seedTimeline,
  users as seedUsers,
  CURRENT_USER_ID,
} from "./seed-data";
import type {
  Automation,
  AutomationFlow,
  Company,
  Conversation,
  ConversationStatus,
  Deal,
  DealActivity,
  Message,
  Person,
  Pipeline,
  Proposal,
  Stage,
  StageType,
  TimelineEvent,
  User,
} from "./types";
import { uid } from "./utils";

interface CrmState {
  users: User[];
  currentUserId: string;
  companies: Company[];
  people: Person[];
  pipelines: Pipeline[];
  deals: Deal[];
  timeline: TimelineEvent[];
  activities: DealActivity[];
  automations: Automation[];
  conversations: Conversation[];
  messages: Message[];

  // derived helpers
  getPipeline: (id: string) => Pipeline | undefined;
  getStage: (pipelineId: string, stageId: string) => Stage | undefined;
  getDeal: (id: string) => Deal | undefined;
  getCompany: (id?: string) => Company | undefined;
  getPerson: (id?: string) => Person | undefined;
  getUser: (id?: string) => User | undefined;
  dealsByPipeline: (pipelineId: string) => Deal[];
  timelineForDeal: (dealId: string) => TimelineEvent[];
  activitiesForDeal: (dealId: string) => DealActivity[];
  messagesForConversation: (conversationId: string) => Message[];

  // mutations
  createCompany: (data: Partial<Company> & { name: string }) => Company;
  createPerson: (data: Partial<Person> & { name: string }) => Person;
  createDeal: (data: {
    title: string;
    pipelineId: string;
    stageId: string;
    companyId?: string;
    personId?: string;
    value: number;
    responsibleId: string;
    fields?: Record<string, string>;
  }) => Deal;
  moveDeal: (dealId: string, newStageId: string) => void;
  winDeal: (dealId: string, opts: { paymentMethod?: string; downPayment?: string; installments?: string; institution?: string; promisedDate: string; specialConditions?: string; observations?: string }) => void;
  loseDeal: (dealId: string, reason: string, detail?: string) => void;
  reopenDeal: (dealId: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  addActivity: (activity: Omit<DealActivity, "id">) => void;
  toggleActivityDone: (activityId: string) => void;
  renameStage: (pipelineId: string, stageId: string, name: string) => void;
  reorderStages: (pipelineId: string, stageIds: string[]) => void;
  addStage: (pipelineId: string, name: string, atIndex?: number) => Stage;
  setStageType: (pipelineId: string, stageId: string, type: StageType) => void;
  updateStage: (pipelineId: string, stageId: string, patch: Partial<Stage>) => void;
  archiveStage: (pipelineId: string, stageId: string, destinationStageId?: string) => void;
  duplicateStage: (pipelineId: string, stageId: string) => void;
  toggleAutomationStatus: (automationId: string) => void;
  createAutomation: (data: Partial<Automation> & { name: string }) => Automation;
  renameAutomation: (id: string, name: string) => void;
  updateAutomationFlow: (id: string, flow: AutomationFlow) => void;
  publishAutomation: (id: string) => void;
  setDealChecklistItem: (dealId: string, itemId: string, done: boolean, note?: string) => void;
  addMessage: (message: Omit<Message, "id">) => void;
  setConversationResponsible: (conversationId: string, userId: string) => void;
  linkConversationPerson: (conversationId: string, personId: string, companyId?: string) => void;
  linkConversationDeal: (conversationId: string, dealId: string) => void;
  setConversationStatus: (conversationId: string, status: ConversationStatus) => void;
  updateDealFields: (dealId: string, fields: Record<string, string>) => void;
  patchDeal: (dealId: string, patch: Partial<Deal>) => void;
  createDraftProposal: (dealId: string) => void;
  setProposalStatus: (dealId: string, status: Proposal["status"]) => void;
  sendProposalForSignature: (dealId: string) => void;
  registerManualAcceptance: (
    dealId: string,
    data: { acceptedBy: string; date: string; evidenceType: string; justification: string }
  ) => void;
  findDuplicateCompany: (query: string) => Company | undefined;
  findDuplicatePerson: (query: string) => Person | undefined;
  searchAll: (query: string) => { people: Person[]; companies: Company[]; deals: Deal[] };
}

export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: CURRENT_USER_ID,
      companies: seedCompanies,
      people: seedPeople,
      pipelines: seedPipelines,
      deals: seedDeals,
      timeline: seedTimeline,
      activities: seedActivities,
      automations: seedAutomations,
      conversations: seedConversations,
      messages: seedMessages,

      getPipeline: (id) => get().pipelines.find((p) => p.id === id),
      getStage: (pipelineId, stageId) =>
        get()
          .pipelines.find((p) => p.id === pipelineId)
          ?.stages.find((s) => s.id === stageId),
      getDeal: (id) => get().deals.find((d) => d.id === id),
      getCompany: (id) => (id ? get().companies.find((c) => c.id === id) : undefined),
      getPerson: (id) => (id ? get().people.find((p) => p.id === id) : undefined),
      getUser: (id) => (id ? get().users.find((u) => u.id === id) : undefined),
      dealsByPipeline: (pipelineId) => get().deals.filter((d) => d.pipelineId === pipelineId),
      timelineForDeal: (dealId) =>
        get()
          .timeline.filter((t) => t.dealId === dealId)
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
      activitiesForDeal: (dealId) =>
        get()
          .activities.filter((a) => a.dealId === dealId)
          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
      messagesForConversation: (conversationId) =>
        get()
          .messages.filter((m) => m.conversationId === conversationId)
          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),

      createCompany: (data) => {
        const company: Company = {
          id: uid("comp"),
          name: data.name,
          cnpj: data.cnpj ?? "",
          segment: data.segment ?? "",
          city: data.city ?? "",
          uf: data.uf ?? "",
          address: data.address,
          tags: data.tags ?? [],
        };
        set((s) => ({ companies: [...s.companies, company] }));
        return company;
      },

      createPerson: (data) => {
        const person: Person = {
          id: uid("pes"),
          name: data.name,
          title: data.title,
          companyIds: data.companyIds ?? [],
          primaryCompanyId: data.primaryCompanyId,
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? data.phone ?? "",
          email: data.email,
          role: data.role,
          decisor: data.decisor,
          tags: data.tags ?? [],
        };
        set((s) => ({ people: [...s.people, person] }));
        return person;
      },

      createDeal: (data) => {
        const seq = get().deals.length + 1000 + Math.floor(Math.random() * 90);
        const deal: Deal = {
          id: uid("deal"),
          code: `NEG #${seq}`,
          title: data.title,
          pipelineId: data.pipelineId,
          stageId: data.stageId,
          companyId: data.companyId,
          personId: data.personId,
          otherPersonIds: [],
          value: data.value,
          responsibleId: data.responsibleId,
          enteredStageAt: new Date().toISOString(),
          tags: [],
          risk: "baixo",
          fields: data.fields ?? {},
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ deals: [...s.deals, deal] }));
        get().addTimelineEvent({
          dealId: deal.id,
          kind: "sistema",
          title: "Negócio criado",
          author: get().getUser(deal.responsibleId)?.name,
          at: new Date().toISOString(),
        });
        return deal;
      },

      moveDeal: (dealId, newStageId) => {
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId ? { ...d, stageId: newStageId, enteredStageAt: new Date().toISOString() } : d
          ),
        }));
        const deal = get().getDeal(dealId);
        const stage = deal && get().getStage(deal.pipelineId, newStageId);
        get().addTimelineEvent({
          dealId,
          kind: "etapa",
          title: `Mudança de etapa → ${stage?.name ?? ""}`,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      winDeal: (dealId, opts) => {
        const deal = get().getDeal(dealId);
        if (!deal) return;
        const pipeline = get().getPipeline(deal.pipelineId);
        const wonStage = pipeline?.stages.find((s) => s.type === "ganho");
        if (!wonStage) return;
        const projSeq = 500 + Math.floor(Math.random() * 400);
        const psSeq = 800 + Math.floor(Math.random() * 200);
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  stageId: wonStage.id,
                  wonAt: new Date().toISOString(),
                  enteredStageAt: new Date().toISOString(),
                  fields: {
                    ...d.fields,
                    "Forma de pagamento": opts.paymentMethod ?? d.fields["Forma de pagamento"] ?? "",
                    "Prazo prometido": opts.promisedDate,
                    "Condições especiais": opts.specialConditions ?? "",
                    "Observações para a Engenharia": opts.observations ?? "",
                  },
                  projectRef: wonStage.generatesProject ? { code: `PRJ ${projSeq}`, stage: "Handoff" } : d.projectRef,
                  postSaleRef: wonStage.generatesProject ? { code: `PS ${psSeq}`, stage: "Venda recebida" } : d.postSaleRef,
                }
              : d
          ),
        }));
        get().addTimelineEvent({
          dealId,
          kind: "sistema",
          title: "Negócio marcado como Ganho",
          detail: wonStage.generatesProject
            ? `Criado Projeto de Engenharia (PRJ ${projSeq}) e Pós-venda (PS ${psSeq})`
            : undefined,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      loseDeal: (dealId, reason, detail) => {
        const deal = get().getDeal(dealId);
        if (!deal) return;
        const pipeline = get().getPipeline(deal.pipelineId);
        const lostStage = pipeline?.stages.find((s) => s.type === "perdido");
        if (!lostStage) return;
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  stageId: lostStage.id,
                  lostAt: new Date().toISOString(),
                  enteredStageAt: new Date().toISOString(),
                  lossReason: reason,
                  lossDetail: detail,
                  destinationPipelineLabel: lostStage.destinationRule ? "Em Reativação" : undefined,
                }
              : d
          ),
        }));
        get().addTimelineEvent({
          dealId,
          kind: "sistema",
          title: `Negócio marcado como Perdido · ${reason}`,
          detail,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      reopenDeal: (dealId) => {
        const deal = get().getDeal(dealId);
        if (!deal) return;
        const pipeline = get().getPipeline(deal.pipelineId);
        const openStage = pipeline?.stages.find((s) => s.type === "aberta");
        if (!openStage) return;
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? { ...d, stageId: openStage.id, wonAt: undefined, lostAt: undefined, reopened: true, enteredStageAt: new Date().toISOString() }
              : d
          ),
        }));
        get().addTimelineEvent({
          dealId,
          kind: "sistema",
          title: "Negócio reaberto",
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      addTimelineEvent: (event) =>
        set((s) => ({ timeline: [...s.timeline, { ...event, id: uid("evt") }] })),

      addActivity: (activity) =>
        set((s) => ({ activities: [...s.activities, { ...activity, id: uid("act") }] })),

      toggleActivityDone: (activityId) =>
        set((s) => ({
          activities: s.activities.map((a) => (a.id === activityId ? { ...a, done: !a.done } : a)),
        })),

      renameStage: (pipelineId, stageId, name) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) =>
            p.id === pipelineId
              ? { ...p, stages: p.stages.map((st) => (st.id === stageId ? { ...st, name } : st)) }
              : p
          ),
        })),

      reorderStages: (pipelineId, stageIds) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) =>
            p.id === pipelineId
              ? {
                  ...p,
                  stages: stageIds
                    .map((id, idx) => {
                      const st = p.stages.find((x) => x.id === id)!;
                      return { ...st, order: idx };
                    })
                    .sort((a, b) => a.order - b.order),
                }
              : p
          ),
        })),

      addStage: (pipelineId, name, atIndex) => {
        const newStage: Stage = { id: uid("stage"), name, type: "aberta", order: atIndex ?? 0 };
        set((s) => ({
          pipelines: s.pipelines.map((p) => {
            if (p.id !== pipelineId) return p;
            const stages = [...p.stages];
            const insertAt = atIndex ?? stages.length;
            stages.splice(insertAt, 0, newStage);
            return { ...p, stages: stages.map((st, idx) => ({ ...st, order: idx })) };
          }),
        }));
        return newStage;
      },

      setStageType: (pipelineId, stageId, type) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) =>
            p.id === pipelineId
              ? { ...p, stages: p.stages.map((st) => (st.id === stageId ? { ...st, type } : st)) }
              : p
          ),
        })),

      updateStage: (pipelineId, stageId, patch) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) =>
            p.id === pipelineId
              ? { ...p, stages: p.stages.map((st) => (st.id === stageId ? { ...st, ...patch } : st)) }
              : p
          ),
        })),

      archiveStage: (pipelineId, stageId, destinationStageId) => {
        if (destinationStageId) {
          set((s) => ({
            deals: s.deals.map((d) => (d.stageId === stageId ? { ...d, stageId: destinationStageId } : d)),
          }));
        }
        set((s) => ({
          pipelines: s.pipelines.map((p) =>
            p.id === pipelineId ? { ...p, stages: p.stages.filter((st) => st.id !== stageId) } : p
          ),
        }));
      },

      duplicateStage: (pipelineId, stageId) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) => {
            if (p.id !== pipelineId) return p;
            const original = p.stages.find((st) => st.id === stageId);
            if (!original) return p;
            const idx = p.stages.findIndex((st) => st.id === stageId);
            const copy: Stage = { ...original, id: uid("stage"), name: `${original.name} (cópia)` };
            const stages = [...p.stages];
            stages.splice(idx + 1, 0, copy);
            return { ...p, stages: stages.map((st, i) => ({ ...st, order: i })) };
          }),
        })),

      toggleAutomationStatus: (automationId) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === automationId
              ? { ...a, status: a.status === "ativa" ? "pausada" : a.status === "pausada" ? "ativa" : a.status }
              : a
          ),
        })),

      createAutomation: (data) => {
        const triggerLabel = data.triggerLabel ?? "Selecione um gatilho";
        const automation: Automation = {
          id: uid("auto"),
          name: data.name,
          description: data.description ?? "",
          scopeLabel: data.scopeLabel ?? "Global",
          pipelineId: data.pipelineId,
          stageId: data.stageId,
          triggerLabel,
          status: "rascunho",
          version: 1,
          execs7d: 0,
          flow: { main: [{ id: uid("n"), kind: "gatilho", title: triggerLabel, subtitle: data.scopeLabel }] },
        };
        set((s) => ({ automations: [...s.automations, automation] }));
        return automation;
      },

      renameAutomation: (id, name) =>
        set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, name } : a)) })),

      updateAutomationFlow: (id, flow) =>
        set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, flow } : a)) })),

      publishAutomation: (id) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id
              ? { ...a, status: "ativa", publishedVersion: a.version, publishedAt: new Date().toISOString(), version: a.version + 1 }
              : a
          ),
        })),

      setDealChecklistItem: (dealId, itemId, done, note) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  checklistState: { ...d.checklistState, [itemId]: done },
                  checklistNotes: note !== undefined ? { ...d.checklistNotes, [itemId]: note } : d.checklistNotes,
                }
              : d
          ),
        })),

      updateDealFields: (dealId, fields) =>
        set((s) => ({
          deals: s.deals.map((d) => (d.id === dealId ? { ...d, fields: { ...d.fields, ...fields } } : d)),
        })),

      patchDeal: (dealId, patch) =>
        set((s) => ({ deals: s.deals.map((d) => (d.id === dealId ? { ...d, ...patch } : d)) })),

      addMessage: (message) =>
        set((s) => ({
          messages: [...s.messages, { ...message, id: uid("msg") }],
          conversations: s.conversations.map((c) =>
            c.id === message.conversationId ? { ...c, lastMessageAt: message.at } : c
          ),
        })),

      setConversationResponsible: (conversationId, userId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, responsibleId: userId, status: "atendendo" } : c
          ),
        })),

      linkConversationPerson: (conversationId, personId, companyId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, personId, companyId: companyId ?? c.companyId } : c
          ),
        })),

      linkConversationDeal: (conversationId, dealId) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, dealId } : c)),
        })),

      setConversationStatus: (conversationId, status) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, status } : c)),
        })),

      createDraftProposal: (dealId) => {
        const deal = get().getDeal(dealId);
        if (!deal || deal.proposal) return;
        const person = get().getPerson(deal.personId);
        const code = `P-${240 + Math.floor(Math.random() * 50)}`;
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  proposal: {
                    code,
                    version: 1,
                    value: d.value,
                    validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
                    status: "rascunho",
                    signers: [
                      { name: person?.name ?? "Contato principal", role: "signatario", status: "pendente" },
                      { name: "Representante Solan", role: "signatario", status: "pendente" },
                    ],
                  },
                }
              : d
          ),
        }));
        get().addTimelineEvent({
          dealId,
          kind: "proposta",
          title: `Proposta ${code} v1 gerada`,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      setProposalStatus: (dealId, status) => {
        const deal = get().getDeal(dealId);
        if (!deal?.proposal) return;
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId && d.proposal
              ? {
                  ...d,
                  proposal: {
                    ...d.proposal,
                    status,
                    signers:
                      status === "assinada"
                        ? d.proposal.signers.map((sg) => ({ ...sg, status: "assinou" as const }))
                        : d.proposal.signers,
                  },
                }
              : d
          ),
        }));
        const labels: Record<string, string> = {
          enviada: "proposta.enviada",
          visualizada: "proposta.visualizada",
          em_assinatura: "assinatura.iniciada",
          assinada: "assinatura.concluida",
          recusada: "proposta.recusada",
        };
        get().addTimelineEvent({
          dealId,
          kind: "proposta",
          title: labels[status] ? `Evento · ${labels[status]}` : `Proposta · ${status}`,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      sendProposalForSignature: (dealId) => {
        const deal = get().getDeal(dealId);
        if (!deal) return;
        const person = get().getPerson(deal.personId);
        const code = `P-${240 + Math.floor(Math.random() * 50)}`;
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  proposal: {
                    code,
                    version: 1,
                    value: d.value,
                    validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
                    status: "em_assinatura",
                    signers: [
                      { name: person?.name ?? "Contato principal", role: "signatario", status: "pendente" },
                      { name: "Representante Solan", role: "signatario", status: "pendente" },
                    ],
                  },
                }
              : d
          ),
        }));
        get().addTimelineEvent({
          dealId,
          kind: "proposta",
          title: `Proposta ${code} v1 enviada para assinatura (simulado)`,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      registerManualAcceptance: (dealId, data) => {
        const deal = get().getDeal(dealId);
        if (!deal) return;
        const code = deal.proposal?.code ?? `P-${240 + Math.floor(Math.random() * 50)}`;
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  proposal: {
                    code,
                    version: d.proposal?.version ?? 1,
                    value: d.value,
                    validUntil: d.proposal?.validUntil ?? new Date(Date.now() + 15 * 86400000).toISOString(),
                    status: "aceite_registrado",
                    signers: [{ name: data.acceptedBy, role: "signatario", status: "assinou" }],
                  },
                }
              : d
          ),
        }));
        get().addTimelineEvent({
          dealId,
          kind: "sistema",
          title: "Aceite manual registrado",
          detail: `${data.evidenceType} · ${data.justification}`,
          author: get().getUser(get().currentUserId)?.name,
          at: new Date().toISOString(),
        });
      },

      findDuplicateCompany: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return undefined;
        return get().companies.find(
          (c) => c.cnpj.replace(/\D/g, "") === q.replace(/\D/g, "") && q.replace(/\D/g, "").length >= 8
        );
      },
      findDuplicatePerson: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return undefined;
        return get().people.find((p) => p.phone.replace(/\D/g, "") === q.replace(/\D/g, "") && q.length >= 8);
      },

      searchAll: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return { people: [], companies: [], deals: [] };
        const people = get().people.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            (p.email ?? "").toLowerCase().includes(q)
        );
        const companies = get().companies.filter(
          (c) => c.name.toLowerCase().includes(q) || c.cnpj.includes(q)
        );
        const deals = get().deals.filter(
          (d) => d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
        );
        return { people, companies, deals };
      },
    }),
    {
      name: "solan-crm-store-v1",
      partialize: (state) => ({
        companies: state.companies,
        people: state.people,
        pipelines: state.pipelines,
        deals: state.deals,
        timeline: state.timeline,
        activities: state.activities,
        automations: state.automations,
        conversations: state.conversations,
        messages: state.messages,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
