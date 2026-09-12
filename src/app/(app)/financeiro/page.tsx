import { ComingSoon } from "@/components/shell/ComingSoon";

export default function FinanceiroPage() {
  return (
    <ComingSoon
      eyebrow="FINANCEIRO"
      title="Contas, cobranças e comissões"
      description="Arquitetura prevista na especificação, priorizada após a consolidação de Negócios, Engenharia, OS e Pós-venda."
      bullets={[
        "Contas a receber e a pagar",
        "Fluxo de caixa consolidado",
        "Comissões por vendedor, SDR, equipe e faixa de margem",
        "Financiamento fica fora do escopo atual do produto",
      ]}
    />
  );
}
