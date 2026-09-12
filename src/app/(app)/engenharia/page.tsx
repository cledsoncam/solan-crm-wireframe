import { ComingSoon } from "@/components/shell/ComingSoon";

export default function EngenhariaPage() {
  return (
    <ComingSoon
      eyebrow="ENGENHARIA"
      title="Projetos vendidos e execução técnica"
      description="Módulo operacional próprio, gerado automaticamente quando um Negócio é marcado como Ganho — nunca um funil comercial."
      bullets={[
        "Quadro: Handoff → Visita → Projeto → Homologação → Suprimentos → Instalação → Comissionamento → Entrega",
        "Handoff da venda somente leitura, com proposta aceita, valor final e observações comerciais",
        "Dados técnicos, checklist com gate de avanço e pendências por responsável",
        "Documentos com versionamento (projeto, unifilar, memorial, ART, as-built)",
        "Homologação por distribuidora com protocolo, SLA e pendências",
        "Visitas técnicas e Ordens de Serviço relacionadas",
      ]}
      backHref="/negocios"
      backLabel="Negócios"
    />
  );
}
