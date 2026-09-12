"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";

type Tab = "pessoas" | "empresas";

export default function PessoasEmpresasPage() {
  const [tab, setTab] = useState<Tab>("pessoas");
  const [query, setQuery] = useState("");
  const people = useCrmStore((s) => s.people);
  const companies = useCrmStore((s) => s.companies);
  const getCompany = useCrmStore((s) => s.getCompany);
  const openPessoaMini = useUiStore((s) => s.openPessoaMini);
  const openEmpresaMini = useUiStore((s) => s.openEmpresaMini);
  const pushToast = useUiStore((s) => s.pushToast);

  const filteredPeople = useMemo(() => {
    const q = query.toLowerCase();
    return people.filter((p) => !q || p.name.toLowerCase().includes(q) || p.phone.includes(q));
  }, [people, query]);

  const filteredCompanies = useMemo(() => {
    const q = query.toLowerCase();
    return companies.filter((c) => !q || c.name.toLowerCase().includes(q) || c.cnpj.includes(q));
  }, [companies, query]);

  return (
    <PageShell title="PESSOAS E EMPRESAS">
      <div className="flex items-center gap-2.5 h-[46px] px-4 border-b border-line flex-none bg-surface">
        <div className="flex border border-line-strong rounded-[3px] overflow-hidden text-[11px]">
          <button onClick={() => setTab("pessoas")} className={`px-2.5 py-1.5 ${tab === "pessoas" ? "bg-ink text-white" : "text-muted"}`}>
            Pessoas
          </button>
          <button onClick={() => setTab("empresas")} className={`px-2.5 py-1.5 border-l border-line-strong ${tab === "empresas" ? "bg-ink text-white" : "text-muted"}`}>
            Empresas
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="nome · telefone · WhatsApp · e-mail · CPF/CNPJ"
          className="flex-1 max-w-[300px] h-[28px] border border-line-strong bg-canvas rounded-[3px] px-2 text-[11px] outline-none focus:border-ink"
        />
        <button onClick={() => pushToast("Filtros avançados chegam na próxima versão.")} className="border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5">
          Filtros
        </button>
        <button onClick={() => pushToast("Importação em massa chega na próxima versão.")} className="ml-auto border border-line-strong rounded-[3px] text-[11px] px-2.5 py-1.5">
          Importar
        </button>
        <button
          onClick={() => (tab === "pessoas" ? openPessoaMini() : openEmpresaMini())}
          className="bg-ink text-white text-[11px] px-3 py-[7px] rounded-[3px] font-medium"
        >
          + Nova {tab === "pessoas" ? "pessoa" : "empresa"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === "pessoas" ? (
          <>
            <div className="grid grid-cols-[1.3fr_1.2fr_1fr_.8fr_.9fr_150px] gap-2 px-3.5 py-2 bg-surface border-b border-line font-mono text-[8.5px] tracking-wider text-muted-3 uppercase sticky top-0">
              <span>Nome</span>
              <span>Empresa</span>
              <span>Telefone</span>
              <span>Cidade</span>
              <span>Tags</span>
              <span>Ações</span>
            </div>
            {filteredPeople.map((p) => {
              const company = getCompany(p.primaryCompanyId);
              return (
                <div key={p.id} className="grid grid-cols-[1.3fr_1.2fr_1fr_.8fr_.9fr_150px] gap-2 px-3.5 py-2.5 border-b border-line-soft items-center text-[11px] hover:bg-canvas">
                  <Link href={`/pessoas-empresas/pessoa/${p.id}`} className="hover:text-accent truncate">
                    {p.name}
                    {p.tags.includes("2 cadastros") && (
                      <span className="ml-1.5 font-mono text-[8.5px] border border-warning-line text-warning rounded-[2px] px-1">
                        2 CADASTROS
                      </span>
                    )}
                  </Link>
                  <span className="text-muted truncate">{company?.name ?? "— sem empresa"}</span>
                  <span className="font-mono text-[10px]">{p.phone}</span>
                  <span className="text-muted">{company?.city ?? "—"}</span>
                  <span className="text-muted-2 text-[10px]">{p.tags.filter((t) => t !== "2 cadastros").join(", ") || "—"}</span>
                  <span className="flex gap-1.5 text-[10px] text-accent">
                    <button onClick={() => useUiStore.getState().openNovoNegocio({ presetPersonId: p.id, presetCompanyId: p.primaryCompanyId })}>
                      negócio
                    </button>
                    ·
                    <Link href="/tarefas">tarefa</Link>
                  </span>
                </div>
              );
            })}
            {filteredPeople.length === 0 && <div className="p-8 text-center text-[11px] text-muted-2">Nenhuma pessoa encontrada.</div>}
            <div className="px-3.5 py-2.5 font-mono text-[9px] text-muted-3 border-t border-line">
              {people.length} PESSOAS · {companies.length} EMPRESAS · DEDUPE POR IDENTIFICADOR FORTE + SIMILARIDADE
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-[1.4fr_1fr_1fr_.8fr_150px] gap-2 px-3.5 py-2 bg-surface border-b border-line font-mono text-[8.5px] tracking-wider text-muted-3 uppercase sticky top-0">
              <span>Nome</span>
              <span>CNPJ</span>
              <span>Segmento</span>
              <span>Cidade</span>
              <span>Ações</span>
            </div>
            {filteredCompanies.map((c) => (
              <div key={c.id} className="grid grid-cols-[1.4fr_1fr_1fr_.8fr_150px] gap-2 px-3.5 py-2.5 border-b border-line-soft items-center text-[11px] hover:bg-canvas">
                <Link href={`/pessoas-empresas/empresa/${c.id}`} className="hover:text-accent truncate">
                  {c.name}
                </Link>
                <span className="font-mono text-[10px] text-muted">{c.cnpj}</span>
                <span className="text-muted">{c.segment}</span>
                <span className="text-muted">
                  {c.city}/{c.uf}
                </span>
                <span className="flex gap-1.5 text-[10px] text-accent">
                  <button onClick={() => useUiStore.getState().openNovoNegocio({ presetCompanyId: c.id })}>negócio</button>
                </span>
              </div>
            ))}
            {filteredCompanies.length === 0 && <div className="p-8 text-center text-[11px] text-muted-2">Nenhuma empresa encontrada.</div>}
          </>
        )}
      </div>
    </PageShell>
  );
}
