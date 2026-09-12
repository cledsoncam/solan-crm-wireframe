"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button, SectionLabel } from "@/components/ui/primitives";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function PessoaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const getPerson = useCrmStore((s) => s.getPerson);
  const person = getPerson(id);
  if (!person) notFound();

  const getCompany = useCrmStore((s) => s.getCompany);
  const deals = useCrmStore((s) => s.deals);
  const timeline = useCrmStore((s) => s.timeline);
  const pipelines = useCrmStore((s) => s.pipelines);
  const openNovoNegocio = useUiStore((s) => s.openNovoNegocio);
  const pushToast = useUiStore((s) => s.pushToast);

  const primaryCompany = getCompany(person.primaryCompanyId);
  const relatedDeals = deals.filter((d) => d.personId === id);
  const relatedTimeline = timeline
    .filter((t) => relatedDeals.some((d) => d.id === t.dealId))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return (
    <PageShell title="PESSOAS E EMPRESAS">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex gap-3.5">
        <div className="flex-1 max-w-[640px] border border-line-card bg-surface rounded-[4px]">
          <div className="flex items-center gap-2.5 p-3.5 border-b border-line">
            <div className="w-8 h-8 border border-line-strong bg-chip rounded-[3px] flex items-center justify-center text-[11px] font-semibold">
              {person.name.slice(0, 1)}
            </div>
            <div>
              <b className="text-[13.5px] tracking-tight">{person.name}</b>
              <div className="text-[10.5px] text-muted-2">
                {person.role} {primaryCompany && `· ${primaryCompany.name}`} {primaryCompany && `· ${primaryCompany.city}/${primaryCompany.uf}`}
              </div>
            </div>
            <div className="ml-auto flex gap-1.5">
              <Button onClick={() => pushToast("Abra o módulo de Conversas para continuar por WhatsApp.")}>WhatsApp</Button>
              <Button onClick={() => pushToast("Abra o módulo de E-mails para continuar por e-mail.")}>E-mail</Button>
              <Button onClick={() => pushToast("Tarefa criada a partir da ficha da pessoa.")}>Tarefa</Button>
              <Button variant="primary" onClick={() => openNovoNegocio({ presetPersonId: id, presetCompanyId: person.primaryCompanyId })}>
                + Negócio
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-3.5 border-r border-line-soft">
              <SectionLabel>Dados</SectionLabel>
              <div className="text-[11px] leading-loose text-ink-soft mt-1.5">
                CPF · {person.cpf ?? "não informado"}
                <br />
                WhatsApp · {person.whatsapp}
                <br />
                E-mail · {person.email ?? "—"}
                <br />
                Papel · {person.role ?? "—"}
                <br />
                Tags · {person.tags.filter((t) => t !== "2 cadastros").join(", ") || "—"}
              </div>
              <SectionLabel>
                <span className="block mt-3">Empresas vinculadas</span>
              </SectionLabel>
              <div className="text-[11px] leading-loose mt-1.5">
                {person.companyIds.length === 0 && <span className="text-muted-2">Nenhuma empresa vinculada.</span>}
                {person.companyIds.map((cid) => {
                  const c = getCompany(cid);
                  return (
                    <Link key={cid} href={`/pessoas-empresas/empresa/${cid}`} className="block hover:text-accent">
                      {c?.name} {cid === person.primaryCompanyId && <span className="text-muted-2">· principal</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="p-3.5">
              <SectionLabel>Negócios · {relatedDeals.length}</SectionLabel>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {relatedDeals.map((d) => (
                  <Link key={d.id} href={`/negocios/${d.id}`} className="border border-line-card rounded-[3px] p-2 text-[11px] hover:border-ink">
                    {d.title}
                    <div className="text-[10px] text-muted-2">
                      {pipelines.find((p) => p.id === d.pipelineId)?.name} · {formatCurrency(d.value)}
                    </div>
                  </Link>
                ))}
                {relatedDeals.length === 0 && <div className="text-[10.5px] text-muted-2">Nenhum negócio ainda.</div>}
              </div>
              <SectionLabel>
                <span className="block mt-3">Timeline unificada</span>
              </SectionLabel>
              <div className="text-[10.5px] text-muted leading-loose mt-1.5">
                {relatedTimeline.map((t) => (
                  <div key={t.id}>
                    {formatDateTime(t.at)} · {t.title}
                  </div>
                ))}
                {relatedTimeline.length === 0 && <span className="text-muted-2">Sem eventos ainda.</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="w-[280px] flex-none border border-line-card bg-surface rounded-[4px] p-3.5 h-fit">
          <b className="text-[12px]">Ações e permissões da ficha</b>
          <div className="text-[10.5px] leading-loose text-ink-soft mt-2.5">
            Criar negócio já vinculado
            <br />
            Criar tarefa ou atividade
            <br />
            Abrir conversa no WhatsApp
            <br />
            Registrar nota
            <br />
            Mesclar cadastros duplicados
            <br />
            Exportar dados da pessoa
          </div>
          <div className="border border-line-card rounded-[3px] p-2.5 mt-2.5 text-[10.5px] text-muted leading-relaxed">
            Campos sensíveis (CPF completo, origem do lead) seguem a permissão de campo.
          </div>
          <div className="font-mono text-[9px] text-muted-3 leading-relaxed mt-2.5">
            TIMELINE MOSTRA MENSAGENS, TAREFAS, PROPOSTAS, PROJETOS, OS E EVENTOS DE PÓS-VENDA DA MESMA IDENTIDADE.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
