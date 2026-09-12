"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/primitives";

type StatusFilter = "abertos" | "ganhos" | "perdidos" | "todos";

export function ListView({ pipelineId }: { pipelineId: string }) {
  const router = useRouter();
  const pipeline = useCrmStore((s) => s.getPipeline(pipelineId));
  const deals = useCrmStore((s) => s.dealsByPipeline(pipelineId));
  const getCompany = useCrmStore((s) => s.getCompany);
  const users = useCrmStore((s) => s.users);
  const patchDeal = useCrmStore((s) => s.patchDeal);
  const loseDeal = useCrmStore((s) => s.loseDeal);
  const pushToast = useUiStore((s) => s.pushToast);

  const [status, setStatus] = useState<StatusFilter>("abertos");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStageId, setBulkStageId] = useState("");
  const [bulkResponsible, setBulkResponsible] = useState("");

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      if (status === "abertos") return !d.wonAt && !d.lostAt;
      if (status === "ganhos") return !!d.wonAt;
      if (status === "perdidos") return !!d.lostAt;
      return true;
    });
  }, [deals, status]);

  function stageName(stageId: string) {
    return pipeline?.stages.find((s) => s.id === stageId)?.name ?? "—";
  }

  function toggleAll() {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((d) => d.id));
  }

  function toggleOne(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const openStages = pipeline?.stages.filter((s) => s.type === "aberta") ?? [];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-canvas">
      <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-line-soft flex-wrap">
        <span className="font-mono text-[8.5px] tracking-wider text-muted-3 uppercase">Status</span>
        {(["abertos", "ganhos", "perdidos", "todos"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setSelected([]);
            }}
            className={`text-[10px] rounded-full border px-2 py-1 capitalize ${
              status === s ? "border-ink text-ink" : "border-line-strong text-muted"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto font-mono text-[8.5px] text-muted-3">
          “MOVER PARA PERDIDO” EM MASSA COM MOTIVO ÚNICO · “MOVER PARA GANHO” EM MASSA NÃO É PERMITIDO
        </span>
      </div>

      <div className="grid grid-cols-[24px_1.5fr_1.1fr_.8fr_.9fr_.8fr_.7fr] gap-2 px-3.5 py-2 bg-surface border-b border-line font-mono text-[8.5px] tracking-wider text-muted-3 uppercase sticky top-0">
        <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
        <span>Negócio</span>
        <span>Empresa</span>
        <span>Etapa</span>
        <span>Valor</span>
        <span>Próx. ativ.</span>
        <span>Risco</span>
      </div>
      {filtered.map((d) => (
        <div
          key={d.id}
          className="grid grid-cols-[24px_1.5fr_1.1fr_.8fr_.9fr_.8fr_.7fr] gap-2 px-3.5 py-2.5 border-b border-line-soft items-center text-[11px] hover:bg-surface cursor-pointer"
          onClick={() => router.push(`/negocios/${d.id}`)}
        >
          <input
            type="checkbox"
            onClick={(e) => e.stopPropagation()}
            checked={selected.includes(d.id)}
            onChange={() => toggleOne(d.id)}
          />
          <span className="truncate">
            {d.code} · {d.title}
          </span>
          <span className="text-muted truncate">{getCompany(d.companyId)?.name ?? "—"}</span>
          <span className="text-muted">{stageName(d.stageId)}</span>
          <span className="font-mono">{formatCurrency(d.value)}</span>
          <span className={d.nextActivityAt ? "text-muted" : "text-danger"}>
            {d.nextActivityAt ? formatDate(d.nextActivityAt) : "atrasada"}
          </span>
          <span className={d.risk === "alto" ? "text-danger" : d.risk === "medio" ? "text-warning" : "text-success"}>
            {d.risk}
          </span>
        </div>
      ))}
      {filtered.length === 0 && <div className="p-8 text-center text-[11px] text-muted-2">Nenhum negócio neste filtro.</div>}

      {selected.length > 0 && (
        <div className="sticky bottom-0 flex items-center gap-2.5 px-3.5 py-2.5 bg-chip border-t border-line text-[11px] flex-wrap">
          <b>{selected.length} selecionados</b>
          <Select value={bulkResponsible} onChange={(e) => setBulkResponsible(e.target.value)} className="h-[28px] text-[10.5px] w-[150px]">
            <option value="">Alterar responsável…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          {bulkResponsible && (
            <button
              className="border border-line-strong bg-surface rounded-[3px] px-2 py-1"
              onClick={() => {
                selected.forEach((id) => patchDeal(id, { responsibleId: bulkResponsible }));
                pushToast(`Responsável atualizado em ${selected.length} negócio(s).`, "success");
                setSelected([]);
                setBulkResponsible("");
              }}
            >
              aplicar
            </button>
          )}
          <Select value={bulkStageId} onChange={(e) => setBulkStageId(e.target.value)} className="h-[28px] text-[10.5px] w-[150px]">
            <option value="">Mover etapa…</option>
            {openStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {bulkStageId && (
            <button
              className="border border-line-strong bg-surface rounded-[3px] px-2 py-1"
              onClick={() => {
                pushToast(`${selected.length} negócio(s) movidos (gate aplicado individualmente na etapa).`, "success");
                selected.forEach((id) => patchDeal(id, { stageId: bulkStageId }));
                setSelected([]);
                setBulkStageId("");
              }}
            >
              aplicar
            </button>
          )}
          <button
            className="border border-danger-line bg-danger-bg text-danger rounded-[3px] px-2 py-1"
            onClick={() => {
              const reason = window.prompt("Motivo único para o lote:", "Sem retorno") ?? "";
              if (!reason) return;
              selected.forEach((id) => loseDeal(id, reason));
              pushToast(`${selected.length} negócio(s) movidos para Perdido.`);
              setSelected([]);
            }}
          >
            Mover para Perdido
          </button>
          <button
            className="border border-line-strong bg-surface rounded-[3px] px-2 py-1"
            onClick={() => pushToast("Edição de tags em massa chega na próxima versão.")}
          >
            Tags
          </button>
        </div>
      )}
    </div>
  );
}
