"use client";

import { useState } from "react";
import Link from "next/link";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button, Input, SectionLabel } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/utils";

export function ContextPanel({ conversationId }: { conversationId: string | null }) {
  const conversations = useCrmStore((s) => s.conversations);
  const conversation = conversationId ? conversations.find((c) => c.id === conversationId) : undefined;

  const getPerson = useCrmStore((s) => s.getPerson);
  const getCompany = useCrmStore((s) => s.getCompany);
  const getUser = useCrmStore((s) => s.getUser);
  const deals = useCrmStore((s) => s.deals);
  const activities = useCrmStore((s) => s.activities);
  const searchAll = useCrmStore((s) => s.searchAll);
  const linkConversationPerson = useCrmStore((s) => s.linkConversationPerson);
  const linkConversationDeal = useCrmStore((s) => s.linkConversationDeal);
  const addActivity = useCrmStore((s) => s.addActivity);
  const currentUserId = useCrmStore((s) => s.currentUserId);

  const openNovoNegocio = useUiStore((s) => s.openNovoNegocio);
  const openPessoaMini = useUiStore((s) => s.openPessoaMini);
  const pushToast = useUiStore((s) => s.pushToast);

  const [linkQuery, setLinkQuery] = useState("");

  if (!conversationId || !conversation) {
    return <div className="w-[280px] flex-none border-l border-line" />;
  }

  const person = getPerson(conversation.personId);
  const company = getCompany(conversation.companyId ?? person?.primaryCompanyId);
  const responsible = getUser(conversation.responsibleId);
  const personDeals = person ? deals.filter((d) => d.personId === person.id && !d.wonAt && !d.lostAt) : [];
  const linkedDeal = conversation.dealId ? deals.find((d) => d.id === conversation.dealId) : undefined;
  const nextActivity = person
    ? activities.filter((a) => !a.done && deals.some((d) => d.id === a.dealId && d.personId === person.id))[0]
    : undefined;

  const linkResults = linkQuery.trim() ? searchAll(linkQuery).people : [];

  return (
    <div className="w-[280px] flex-none border-l border-line p-3.5 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
      {!person ? (
        <>
          <SectionLabel>Contato desconhecido</SectionLabel>
          <div className="text-[10.5px] text-muted leading-relaxed">
            {conversation.contactLabel} ainda não tem cadastro vinculado a esta conversa.
          </div>
          <Button
            variant="primary"
            onClick={() =>
              openPessoaMini({
                onSaved: (p) => {
                  linkConversationPerson(conversation.id, p.id, p.primaryCompanyId);
                  pushToast("Pessoa criada e vinculada à conversa.", "success");
                },
              })
            }
          >
            Criar pessoa
          </Button>
          <div className="border-t border-line-soft pt-2.5">
            <SectionLabel>Vincular existente</SectionLabel>
            <Input
              value={linkQuery}
              onChange={(e) => setLinkQuery(e.target.value)}
              placeholder="Buscar por nome ou telefone"
              className="mt-1.5"
            />
            {linkResults.length > 0 && (
              <div className="flex flex-col mt-1.5 border border-line-card rounded-[3px] overflow-hidden">
                {linkResults.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      linkConversationPerson(conversation.id, p.id, p.primaryCompanyId);
                      setLinkQuery("");
                      pushToast("Conversa vinculada.", "success");
                    }}
                    className="text-left px-2.5 py-1.5 text-[11px] hover:bg-chip border-b border-line-soft last:border-0"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <SectionLabel>Pessoa</SectionLabel>
            <Link href={`/pessoas-empresas/pessoa/${person.id}`} className="block text-[12px] font-semibold mt-1 hover:text-accent">
              {person.name}
            </Link>
            <div className="text-[10.5px] text-muted">{person.phone}</div>
          </div>
          {company && (
            <div>
              <SectionLabel>Empresa</SectionLabel>
              <Link href={`/pessoas-empresas/empresa/${company.id}`} className="block text-[12px] font-semibold mt-1 hover:text-accent">
                {company.name}
              </Link>
            </div>
          )}
          <div>
            <SectionLabel>Negócios ativos</SectionLabel>
            <div className="flex flex-col gap-1 mt-1">
              {personDeals.length === 0 && <span className="text-[10.5px] text-muted-2">Nenhum negócio ativo.</span>}
              {personDeals.map((d) => (
                <Link key={d.id} href={`/negocios/${d.id}`} className="border border-line-card rounded-[3px] px-2 py-1.5 text-[10.5px] hover:border-ink">
                  {d.title} <span className="text-muted-2">· {formatCurrency(d.value)}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Próxima atividade</SectionLabel>
            <div className="text-[10.5px] text-muted mt-1">
              {nextActivity ? nextActivity.title : "Nenhuma agendada."}
            </div>
          </div>
          {linkedDeal?.proposal && (
            <div>
              <SectionLabel>Proposta</SectionLabel>
              <div className="text-[10.5px] text-muted mt-1">
                {linkedDeal.proposal.code} v{linkedDeal.proposal.version} · {linkedDeal.proposal.status.replace(/_/g, " ")}
              </div>
            </div>
          )}
          <div>
            <SectionLabel>Responsável</SectionLabel>
            <div className="text-[10.5px] text-muted mt-1">{responsible?.name ?? "Sem responsável"}</div>
          </div>

          <div className="border-t border-line-soft pt-2.5 flex flex-col gap-1.5">
            <Button onClick={() => openNovoNegocio({ pipelineId: "pl_sdr", presetPersonId: person.id, presetCompanyId: person.primaryCompanyId })}>
              + Lead
            </Button>
            <Button onClick={() => openNovoNegocio({ presetPersonId: person.id, presetCompanyId: person.primaryCompanyId })}>+ Negócio</Button>
            {!conversation.dealId && personDeals.length > 0 && (
              <Button onClick={() => { linkConversationDeal(conversation.id, personDeals[0].id); pushToast("Negócio vinculado."); }}>
                Vincular negócio existente
              </Button>
            )}
            <Button
              onClick={() => {
                addActivity({
                  dealId: personDeals[0]?.id ?? "",
                  title: `Tarefa · ${person.name}`,
                  type: "tarefa",
                  at: new Date().toISOString(),
                  responsibleId: currentUserId,
                  done: false,
                });
                pushToast("Tarefa criada.", "success");
              }}
            >
              Criar tarefa
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
