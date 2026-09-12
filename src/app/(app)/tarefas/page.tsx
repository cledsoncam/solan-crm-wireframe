"use client";

import Link from "next/link";
import { PageShell } from "@/components/shell/PageShell";
import { useCrmStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export default function TarefasPage() {
  const activities = useCrmStore((s) => s.activities);
  const deals = useCrmStore((s) => s.deals);
  const toggleActivityDone = useCrmStore((s) => s.toggleActivityDone);

  const withDeal = activities
    .map((a) => ({ activity: a, deal: deals.find((d) => d.id === a.dealId) }))
    .sort((a, b) => new Date(a.activity.at).getTime() - new Date(b.activity.at).getTime());

  const pending = withDeal.filter((x) => !x.activity.done);
  const done = withDeal.filter((x) => x.activity.done);

  return (
    <PageShell title="TAREFAS / AGENDA">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 max-w-[720px]">
        <h1 className="text-[14px] font-semibold tracking-tight mb-1">Tarefas</h1>
        <p className="text-[11px] text-muted mb-4">
          Atividades relacionadas a Negócios. Visão de agenda diária/semanal e de equipe chegam na próxima versão.
        </p>

        <div className="mb-2 font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">
          Pendentes · {pending.length}
        </div>
        <div className="flex flex-col gap-1.5 mb-5">
          {pending.length === 0 && <EmptyState title="Nenhuma tarefa pendente" />}
          {pending.map(({ activity, deal }) => (
            <div key={activity.id} className="flex items-center gap-2.5 border border-line-card bg-surface rounded-[3px] px-3 py-2.5">
              <button onClick={() => toggleActivityDone(activity.id)} className="text-muted-2 hover:text-success">
                <Circle size={15} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px]">{activity.title}</div>
                <div className="text-[10px] text-muted-2 font-mono">{formatDateTime(activity.at)} · {activity.type}</div>
              </div>
              {deal && (
                <Link href={`/negocios/${deal.id}`} className="text-[10.5px] text-accent flex-none">
                  {deal.code}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mb-2 font-mono text-[8.5px] tracking-widest text-muted-3 uppercase">
          Concluídas · {done.length}
        </div>
        <div className="flex flex-col gap-1.5">
          {done.map(({ activity, deal }) => (
            <div key={activity.id} className="flex items-center gap-2.5 border border-line-soft bg-canvas rounded-[3px] px-3 py-2 opacity-70">
              <button onClick={() => toggleActivityDone(activity.id)} className="text-success">
                <CheckCircle2 size={15} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] line-through">{activity.title}</div>
              </div>
              {deal && (
                <Link href={`/negocios/${deal.id}`} className="text-[10.5px] text-accent flex-none">
                  {deal.code}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
