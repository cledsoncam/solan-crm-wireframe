import { ComingSoon } from "@/components/shell/ComingSoon";

export default function FormulariosPage() {
  return (
    <ComingSoon
      eyebrow="FORMULÁRIOS"
      title="Builder de formulários e embed"
      description="Formulários mapeados diretamente para campos do CRM, com destino configurável de Funil/Etapa e publicação via link, iframe ou script."
      bullets={[
        "Builder drag-and-drop com campos do CRM (Pessoa, Empresa, Negócio)",
        "Destino após envio: criar Pessoa, Empresa e Lead/Negócio em Funil/Etapa específicos",
        "Tracking de UTM, dedupe de contato e negócio existente",
        "LGPD: consentimento, CAPTCHA/honeypot e rate limit",
      ]}
    />
  );
}
