"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Button, SectionLabel } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/utils";

export default function EmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const getCompany = useCrmStore((s) => s.getCompany);
  const company = getCompany(id);
  if (!company) notFound();

  const people = useCrmStore((s) => s.people);
  const deals = useCrmStore((s) => s.deals);
  const pipelines = useCrmStore((s) => s.pipelines);
  const openNovoNegocio = useUiStore((s) => s.openNovoNegocio);

  const relatedPeople = people.filter((p) => p.companyIds.includes(id));
  const relatedDeals = deals.filter((d) => d.companyId === id);
  const wonCount = relatedDeals.filter((d) => d.wonAt).length;
  const projectsCount = relatedDeals.filter((d) => d.projectRef).length;

  return (
    <PageShell title="PESSOAS E EMPRESAS">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex gap-3.5">
        <div className="flex-1 max-w-[600px] border border-line-card bg-surface rounded-[4px]">
          <div className="flex items-center gap-2.5 p-3.5 border-b border-line">
            <div className="w-8 h-8 border border-line-strong bg-chip rounded-[3px] flex items-center justify-center text-[11px] font-semibold">
              {company.name.slice(0, 1)}
            </div>
            <div>
              <b className="text-[13.5px] tracking-tight">{company.name}</b>
              <div className="text-[10.5px] text-muted-2">
                CNPJ {company.cnpj} · {company.segment} · {company.city}/{company.uf}
              </div>
            </div>
            <Button variant="primary" className="ml-auto" onClick={() => openNovoNegocio({ presetCompanyId: id })}>
              + Negócio
            </Button>
          </div>
          <div className="p-3.5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <SectionLabel>Pessoas · {relatedPeople.length}</SectionLabel>
                <div className="text-[11px] leading-loose mt-1.5">
                  {relatedPeople.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/pessoas-empresas/pessoa/${p.id}`} className="block hover:text-accent">
                      {p.name} <span className="text-muted-2">· {p.role ?? "contato"}</span>
                    </Link>
                  ))}
                  {relatedPeople.length === 0 && <span className="text-muted-2">Nenhuma pessoa vinculada.</span>}
                </div>
              </div>
              <div>
                <SectionLabel>Endereços</SectionLabel>
                <div className="text-[11px] leading-loose mt-1.5">
                  {company.address && <>Sede · {company.address}<br /></>}
                  {company.installationAddress && <>Instalação · {company.installationAddress}</>}
                  {!company.address && !company.installationAddress && <span className="text-muted-2">Não informado.</span>}
                </div>
              </div>
            </div>
            <div className="border-t border-line-soft pt-3">
              <SectionLabel>Histórico operacional</SectionLabel>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                <Stat value={relatedDeals.length} label="negócios" />
                <Stat value={wonCount} label="ganhos" />
                <Stat value={projectsCount} label="projetos" />
                <Stat value={0} label="contratos" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-[300px] flex-none border border-line-card bg-surface rounded-[4px] p-3.5 h-fit">
          <b className="text-[12px]">Registros vinculados</b>
          <div className="flex flex-col gap-2 mt-2.5">
            {relatedDeals.map((d) => (
              <Link key={d.id} href={`/negocios/${d.id}`} className="border border-line-card rounded-[3px] p-2 text-[10.5px] hover:border-ink">
                {d.code} · {pipelines.find((p) => p.id === d.pipelineId)?.name.replace("Funil de ", "")}
                <div className="text-muted-2">{formatCurrency(d.value)}</div>
              </Link>
            ))}
            {relatedDeals.length === 0 && <div className="text-[10.5px] text-muted-2">Nenhum registro ainda.</div>}
          </div>
          <div className="font-mono text-[9px] text-muted-3 leading-relaxed mt-3">
            A EMPRESA É O PONTO DE ENTRADA PARA TODO O HISTÓRICO — VENDA, ENTREGA E RELACIONAMENTO.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="border border-line-card rounded-[3px] p-2">
      <div className="font-mono text-[15px]">{value}</div>
      <div className="text-[9.5px] text-muted-2">{label}</div>
    </div>
  );
}
