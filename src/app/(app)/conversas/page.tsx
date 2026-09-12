import { ComingSoon } from "@/components/shell/ComingSoon";

export default function ConversasPage() {
  return (
    <ComingSoon
      eyebrow="CONVERSAS"
      title="Inbox omnichannel integrado ao CRM"
      description="Caixa compartilhada de atendimento em três regiões: filas/conversas, chat e contexto de CRM — no padrão de inbox comercial."
      bullets={[
        "Filas: esperando, minhas conversas, não respondidas, finalizadas",
        "Criar Lead/Negócio direto da conversa, sem sair do chat",
        "Contato desconhecido: criar ou vincular Pessoa sem perder a conversa",
        "Templates WhatsApp, respostas rápidas e transferência entre atendentes",
      ]}
    />
  );
}
