"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Search, Plus, Bell, ChevronDown } from "lucide-react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { cn, formatCurrency } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const searchAll = useCrmStore((s) => s.searchAll);
  const openNovoNegocio = useUiStore((s) => s.openNovoNegocio);
  const openPessoaMini = useUiStore((s) => s.openPessoaMini);
  const openEmpresaMini = useUiStore((s) => s.openEmpresaMini);
  const pushToast = useUiStore((s) => s.pushToast);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = query.trim() ? searchAll(query) : { people: [], companies: [], deals: [] };
  const hasResults = results.people.length + results.companies.length + results.deals.length > 0;

  return (
    <div className="flex items-center gap-2.5 h-[46px] px-4 border-b border-line flex-none bg-surface">
      <span className="font-mono text-[9.5px] text-muted-2 tracking-wider uppercase">{title}</span>
      <div ref={boxRef} className="relative flex-1 max-w-[320px] ml-2">
        <div className="h-[28px] border border-line-strong rounded-[3px] bg-canvas flex items-center px-2 gap-1.5 focus-within:border-ink">
          <Search size={12} className="text-muted-3 flex-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Busca global · pessoa, empresa, negócio"
            className="bg-transparent outline-none text-[11px] w-full placeholder:text-muted-3"
          />
        </div>
        {focused && query.trim() && (
          <div className="absolute top-[32px] left-0 w-[340px] bg-surface border border-line-card rounded-[3px] shadow-xl z-50 py-2 max-h-[360px] overflow-y-auto scrollbar-thin">
            {!hasResults && (
              <div className="px-3 py-4 text-[11px] text-muted-2 text-center">Nenhum resultado para “{query}”.</div>
            )}
            {results.people.length > 0 && (
              <div className="px-3 pb-1">
                <div className="font-mono text-[8px] tracking-widest text-muted-3 uppercase mt-1 mb-1">Pessoas</div>
                {results.people.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      router.push(`/pessoas-empresas/pessoa/${p.id}`);
                      setFocused(false);
                      setQuery("");
                    }}
                    className="block w-full text-left text-[11px] py-1 hover:text-accent"
                  >
                    {p.name} <span className="text-muted-2">· {p.title ?? "contato"}</span>
                  </button>
                ))}
              </div>
            )}
            {results.companies.length > 0 && (
              <div className="px-3 pb-1">
                <div className="font-mono text-[8px] tracking-widest text-muted-3 uppercase mt-1 mb-1">Empresas</div>
                {results.companies.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      router.push(`/pessoas-empresas/empresa/${c.id}`);
                      setFocused(false);
                      setQuery("");
                    }}
                    className="block w-full text-left text-[11px] py-1 hover:text-accent"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {results.deals.length > 0 && (
              <div className="px-3 pb-1">
                <div className="font-mono text-[8px] tracking-widest text-muted-3 uppercase mt-1 mb-1">
                  Negócios
                </div>
                {results.deals.slice(0, 4).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      router.push(`/negocios/${d.id}`);
                      setFocused(false);
                      setQuery("");
                    }}
                    className="block w-full text-left text-[11px] py-1 hover:text-accent"
                  >
                    {d.code} · {d.title} <span className="text-muted-2">· {formatCurrency(d.value)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="ml-auto flex items-center gap-1 border border-line-strong rounded-[3px] text-[11px] px-2.5 py-[6px] hover:border-ink">
            <Plus size={12} /> Criar <ChevronDown size={11} className="text-muted-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="bg-surface border border-line-card rounded-[3px] shadow-xl py-1.5 w-[190px] z-50 animate-fade-in"
          >
            {[
              { label: "Negócio", action: () => openNovoNegocio() },
              { label: "Pessoa", action: () => openPessoaMini() },
              { label: "Empresa", action: () => openEmpresaMini() },
              { label: "Atividade", action: () => router.push("/tarefas") },
              { label: "Ordem de serviço", action: () => pushToast("Ordens de Serviço chega na próxima versão.") },
              { label: "Proposta", action: () => pushToast("Abra um negócio e use “Gerar proposta”.") },
            ].map((item) => (
              <DropdownMenu.Item
                key={item.label}
                onSelect={item.action}
                className="text-[11.5px] px-3 py-[7px] outline-none cursor-pointer hover:bg-chip"
              >
                {item.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1.5 border border-line-strong rounded-[3px] text-[11px] px-2.5 py-[6px] hover:border-ink">
            <Bell size={12} /> Notificações
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="bg-surface border border-line-card rounded-[3px] shadow-xl py-2 w-[280px] z-50 text-[11px] animate-fade-in"
          >
            <div className="px-3 pb-2 text-muted-2">Notificações abrem o registro de origem.</div>
            <div className={cn("px-3 py-2 border-t border-line-soft")}>
              Assinatura parada há 48h · NEG #1031
            </div>
            <div className="px-3 py-2 border-t border-line-soft">Tarefa vencida · enviar ART assinada</div>
            <div className="px-3 py-2 border-t border-line-soft">Lead novo aguardando contato · 11 min</div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
