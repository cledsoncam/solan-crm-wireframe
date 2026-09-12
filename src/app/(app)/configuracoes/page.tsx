import { PageShell } from "@/components/shell/PageShell";

const AREAS = [
  { title: "Usuários e equipes", desc: "Usuários, equipes, funções, disponibilidade e unidades.", id: "ADM-001" },
  { title: "Perfis e permissões", desc: "Módulo, registro, campo, ação, unidade e administração.", id: "ADM-002" },
  { title: "Campos e formulários", desc: "Motor de campos e formulário por funil/processo.", id: "ADM-003" },
  { title: "Pessoas e Empresas", desc: "Formulários completos e mini, campos e regras de duplicidade.", id: "—" },
  { title: "Negócios e funis", desc: "Campos, motivos de perda, regras globais e parâmetros.", id: "—" },
  { title: "Engenharia / Pós-venda / OS", desc: "Processos, campos, checklists e permissões.", id: "—" },
  { title: "Integrações", desc: "WhatsApp, agenda, e-mail, assinatura, financeiro, webhooks e API.", id: "ADM-004" },
  { title: "Auditoria", desc: "Logs de alteração, exportação e acessos relevantes.", id: "ADM-005" },
];

export default function ConfiguracoesPage() {
  return (
    <PageShell title="CONFIGURAÇÕES">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <h1 className="text-[14px] font-semibold tracking-tight mb-1">Configurações administrativas</h1>
        <p className="text-[11px] text-muted mb-4">
          Área de administração completa prevista na especificação — nesta versão, o essencial já está embutido nas
          próprias telas (editar funil ao vivo, checklist e tipo de etapa, tipos de automação).
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {AREAS.map((a) => (
            <div key={a.title} className="border border-line-card bg-surface rounded-[3px] p-3">
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-medium">{a.title}</span>
                <span className="ml-auto font-mono text-[8px] text-muted-3 border border-line-strong rounded-[2px] px-1 py-px">
                  {a.id}
                </span>
              </div>
              <div className="text-[10.5px] text-muted mt-1.5 leading-relaxed">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
