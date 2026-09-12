import { ComingSoon } from "@/components/shell/ComingSoon";

export default function OrdensServicoPage() {
  return (
    <ComingSoon
      eyebrow="ORDENS DE SERVIÇO"
      title="Agenda e execução de serviços de campo"
      description="OS pode nascer de Engenharia, Pós-venda ou manutenção — com uma experiência dedicada de PWA para o técnico em campo."
      bullets={[
        "Lista/Kanban: Nova → Agendada → Em execução → Pendência → Concluída → Cancelada",
        "Agenda operacional por técnico/equipe",
        "PWA de campo: check-in GPS, checklist dinâmico, fotos e assinatura",
        "Funciona offline com autosave local e sincronização posterior",
      ]}
      backHref="/negocios"
      backLabel="Negócios"
    />
  );
}
