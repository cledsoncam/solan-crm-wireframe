"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  tag?: string;
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Início",
    items: [
      { label: "Dashboards", href: "/dashboard" },
      { label: "Meu Dia", href: "/meu-dia" },
    ],
  },
  {
    label: "Operação",
    items: [
      { label: "Negócios", href: "/negocios" },
      { label: "Pessoas e Empresas", href: "/pessoas-empresas" },
      { label: "Conversas", href: "/conversas" },
      { label: "Formulários", href: "/formularios" },
      { label: "Tarefas / Agenda", href: "/tarefas" },
    ],
  },
  {
    label: "Entrega",
    items: [
      { label: "Engenharia", href: "/engenharia", tag: "P1" },
      { label: "Ordens de Serviço", href: "/ordens-de-servico", tag: "P1" },
      { label: "Pós-venda", href: "/pos-venda", tag: "P1" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { label: "Propostas", href: "/propostas" },
      { label: "Automações", href: "/automacoes" },
      { label: "Financeiro", href: "/financeiro", tag: "ROAD" },
      { label: "Configurações", href: "/configuracoes" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUserId = useCrmStore((s) => s.currentUserId);
  const user = useCrmStore((s) => s.getUser(currentUserId));

  return (
    <div className="w-[196px] flex-none bg-sidebar border-r border-line flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-3 border-b border-line flex-none">
        <div className="w-[18px] h-[18px] border-[1.5px] border-ink rounded-[2px]" />
        <span className="text-[12.5px] font-semibold tracking-tight">Solan CRM</span>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="font-mono text-[8.5px] tracking-widest uppercase text-muted-3 px-3 pt-3.5 pb-1">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-[7px] text-[11.5px] tracking-tight",
                    active
                      ? "bg-white font-semibold text-ink shadow-[inset_2px_0_0_#16181B] border-y border-line"
                      : "text-muted hover:text-ink hover:bg-white/60"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {item.tag && (
                    <span className="ml-auto font-mono text-[8px] text-muted-3 border border-line-strong rounded-[2px] px-[3px] py-px flex-none">
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 px-3 py-2.5 border-t border-line flex-none">
        <div className="w-[22px] h-[22px] rounded-[2px] bg-chip border border-line-strong flex items-center justify-center text-[9px] font-semibold">
          {user?.name.slice(0, 1) ?? "?"}
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[10.5px] truncate">{user?.name ?? "Usuário"}</span>
          <span className="font-mono text-[9px] text-muted-2 uppercase truncate">
            {user?.role} · {user?.unit}
          </span>
        </div>
      </div>
    </div>
  );
}
