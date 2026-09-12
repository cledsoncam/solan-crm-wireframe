import { ComingSoon } from "@/components/shell/ComingSoon";

export default function PosVendaPage() {
  return (
    <ComingSoon
      eyebrow="PÓS-VENDA"
      title="Acompanhamento do cliente desde a venda"
      description="Criado no momento da venda ganha (não após a Engenharia terminar). Sem telemetria ou monitoramento de geração de energia."
      bullets={[
        "Quadro: Venda recebida → Acompanhando implantação → Preparar onboarding → Onboarding → Acompanhamento inicial → Carteira ativa",
        "Visão do Projeto de Engenharia relacionado, sem editar dados técnicos",
        "Contratos, recorrência de O&M, renovação, upsell/cross-sell e indicação",
        "Sincronização por automação com eventos de Engenharia (entrega, atraso)",
      ]}
      backHref="/negocios"
      backLabel="Negócios"
    />
  );
}
