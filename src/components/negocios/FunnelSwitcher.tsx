"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function FunnelSwitcher({ pipelineId, onChange }: { pipelineId: string; onChange: (id: string) => void }) {
  const pipelines = useCrmStore((s) => s.pipelines);
  const deals = useCrmStore((s) => s.deals);
  const pushToast = useUiStore((s) => s.pushToast);
  const current = pipelines.find((p) => p.id === pipelineId);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1.5 border border-ink rounded-[3px] text-[11.5px] font-semibold px-2.5 py-1.5">
          {current?.name} <ChevronDown size={12} className="text-muted-2" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} className="bg-surface border border-line-card rounded-[3px] shadow-xl py-1.5 w-[260px] z-50 animate-fade-in">
          {pipelines.map((p) => {
            const count = deals.filter((d) => d.pipelineId === p.id).length;
            const value = deals.filter((d) => d.pipelineId === p.id && !d.wonAt && !d.lostAt).reduce((s, d) => s + d.value, 0);
            return (
              <DropdownMenu.Item
                key={p.id}
                onSelect={() => onChange(p.id)}
                className={`flex items-center gap-2 px-3 py-2 text-[11.5px] outline-none cursor-pointer hover:bg-chip ${
                  p.id === pipelineId ? "bg-chip font-semibold" : ""
                }`}
              >
                <span className="flex-1">{p.name}</span>
                <span className="font-mono text-[9px] text-muted-2">
                  {count} {value > 0 && `· ${formatCurrency(value)}`}
                </span>
                {p.id === pipelineId && "✓"}
              </DropdownMenu.Item>
            );
          })}
          <DropdownMenu.Separator className="h-px bg-line-soft my-1" />
          <DropdownMenu.Item
            onSelect={() => pushToast("Criação de novos funis chega na próxima versão.")}
            className="px-3 py-2 text-[11px] text-accent outline-none cursor-pointer"
          >
            + Novo funil comercial
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => pushToast("Configuração avançada do funil chega na próxima versão.")}
            className="px-3 py-2 text-[11px] outline-none cursor-pointer"
          >
            Gerenciar funis
          </DropdownMenu.Item>
          <div className="font-mono text-[8.5px] text-muted-3 leading-relaxed px-3 pt-1 pb-0.5 border-t border-line-soft mt-1">
            SÓ FUNIS COMERCIAIS. ENGENHARIA E PÓS-VENDA SÃO PROCESSOS E NÃO APARECEM AQUI.
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
