"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Callout, Field, Input, Select, Textarea, SectionLabel } from "@/components/ui/primitives";
import { formatCurrency, formatDateLong } from "@/lib/utils";

type View = "blocked" | "manual-accept" | "form" | "success";

export function GanharModal() {
  const open = useUiStore((s) => s.ganharOpen);
  const dealId = useUiStore((s) => s.ganharDealId);
  const close = useUiStore((s) => s.closeGanhar);
  const pushToast = useUiStore((s) => s.pushToast);
  const router = useRouter();

  const getDeal = useCrmStore((s) => s.getDeal);
  const winDeal = useCrmStore((s) => s.winDeal);
  const sendProposalForSignature = useCrmStore((s) => s.sendProposalForSignature);
  const registerManualAcceptance = useCrmStore((s) => s.registerManualAcceptance);
  const updateDealFields = useCrmStore((s) => s.updateDealFields);

  const deal = dealId ? getDeal(dealId) : undefined;
  const qualifies = deal?.proposal && ["assinada", "aceite_registrado"].includes(deal.proposal.status);

  const [view, setView] = useState<View>("blocked");
  const [paymentMethod, setPaymentMethod] = useState("À vista");
  const [downPayment, setDownPayment] = useState("");
  const [installments, setInstallments] = useState("");
  const [institution, setInstitution] = useState("");
  const [promisedDate, setPromisedDate] = useState("");
  const [specialConditions, setSpecialConditions] = useState("");
  const [observations, setObservations] = useState("");
  const [roofType, setRoofType] = useState(deal?.fields["Tipo de telhado"] ?? "");

  const [acceptedBy, setAcceptedBy] = useState("");
  const [acceptDate, setAcceptDate] = useState(new Date().toISOString().slice(0, 10));
  const [evidenceType, setEvidenceType] = useState("Contrato físico digitalizado");
  const [justification, setJustification] = useState("");

  const projects = useCrmStore((s) => s.projects);
  const postSales = useCrmStore((s) => s.postSales);

  useEffect(() => {
    if (open) {
      setView(qualifies ? "form" : "blocked");
      setPromisedDate("");
      setSpecialConditions("");
      setObservations("");
      setRoofType(deal?.fields["Tipo de telhado"] ?? "");
      setAcceptedBy("");
      setJustification("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dealId]);

  if (!deal) return null;

  const missingRoof = !roofType;

  function handleConfirm() {
    if (!deal) return;
    if (!promisedDate) {
      pushToast("Informe o prazo prometido.", "danger");
      return;
    }
    if (missingRoof) {
      pushToast("Preencha o tipo de telhado para continuar.", "danger");
      return;
    }
    updateDealFields(deal.id, { "Tipo de telhado": roofType });
    winDeal(deal.id, {
      paymentMethod,
      downPayment,
      installments,
      institution,
      promisedDate: formatDateLong(new Date(promisedDate).toISOString()),
      specialConditions,
      observations,
    });
    setView("success");
  }

  const createdProject = projects.find((p) => p.sourceDealId === deal.id);
  const createdPostSale = postSales.find((p) => p.sourceDealId === deal.id);

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && close()}
      title={`Ganhar negócio · ${deal.code}`}
      eyebrow={view === "success" ? "HANDOFF CRIADO" : "MODAL EM SEÇÕES"}
      width={480}
      footer={
        view === "blocked" ? undefined : view === "manual-accept" ? (
          <>
            <span className="text-[11px] text-muted cursor-pointer" onClick={() => setView("blocked")}>
              Voltar
            </span>
            <Button
              variant="primary"
              className="ml-auto"
              onClick={() => {
                if (!acceptedBy || !justification) {
                  pushToast("Preencha quem aceitou e a justificativa.", "danger");
                  return;
                }
                registerManualAcceptance(deal.id, { acceptedBy, date: acceptDate, evidenceType, justification });
                pushToast("Aceite manual registrado.", "success");
                setView("form");
              }}
            >
              Registrar
            </Button>
          </>
        ) : view === "form" ? (
          <>
            <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
              Cancelar
            </span>
            <Button variant="primary" className="ml-auto" onClick={handleConfirm}>
              Confirmar ganho
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                close();
                router.push(createdProject ? `/engenharia/${createdProject.id}` : "/engenharia");
              }}
            >
              Abrir projeto
            </Button>
            <Button
              onClick={() => {
                close();
                router.push(createdPostSale ? `/pos-venda/${createdPostSale.id}` : "/pos-venda");
              }}
            >
              Abrir pós-venda
            </Button>
            <Button variant="primary" className="ml-auto" onClick={close}>
              Fechar
            </Button>
          </>
        )
      }
    >
      {view === "blocked" && (
        <>
          <Callout tone="neutral">
            <div className="text-center py-1">
              <span className="inline-block bg-line-strong text-muted-3 rounded-[3px] text-[11px] px-3.5 py-1.5">
                Ganhar
              </span>
              <div className="text-muted mt-2 leading-relaxed text-left">
                Este negócio {deal.proposal ? `tem a proposta apenas ${statusLabel(deal.proposal.status)}` : "ainda não tem proposta enviada"}.
                Só é possível ganhar com proposta <b>Assinada</b> ou <b>Aceite registrado</b>.
              </div>
            </div>
          </Callout>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="primary"
              onClick={() => {
                sendProposalForSignature(deal.id);
                pushToast("Proposta enviada para assinatura (simulado).", "success");
                close();
              }}
            >
              Enviar para assinatura
            </Button>
            <Button onClick={() => setView("manual-accept")}>Registrar aceite manual</Button>
          </div>
          <div className="font-mono text-[9px] text-muted-3">
            ATALHOS PARA PRO-004 E PRO-008 · A PERMISSÃO DO ACEITE MANUAL VEM DAS CONFIGURAÇÕES.
          </div>
        </>
      )}

      {view === "manual-accept" && (
        <>
          <SectionLabel>Registrar aceite fora do sistema · exceção</SectionLabel>
          <Field label="Quem aceitou" required>
            <Input value={acceptedBy} onChange={(e) => setAcceptedBy(e.target.value)} placeholder="Nome do contato" />
          </Field>
          <Field label="Data do aceite" required>
            <Input type="date" value={acceptDate} onChange={(e) => setAcceptDate(e.target.value)} />
          </Field>
          <Field label="Tipo de evidência" required>
            <Select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
              <option>Contrato físico digitalizado</option>
              <option>E-mail do cliente</option>
              <option>Documento assinado em outra plataforma</option>
              <option>Outro</option>
            </Select>
          </Field>
          <Field label="Anexo" required hint="Upload de arquivo chega na próxima versão">
            <Button disabled>Anexar arquivo</Button>
          </Field>
          <Field label="Justificativa" required>
            <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} />
          </Field>
          <div className="font-mono text-[9px] text-muted-3">
            O REGISTRO É IMUTÁVEL E APARECE NA AUDITORIA.
          </div>
        </>
      )}

      {view === "form" && deal.proposal && (
        <>
          <Callout tone="success">
            <SectionLabel>1 · Proposta {statusLabel(deal.proposal.status)} · somente leitura</SectionLabel>
            <div className="grid grid-cols-2 gap-2 mt-2 text-ink-soft">
              <div>
                Versão
                <br />
                <b>{deal.proposal.code} v{deal.proposal.version}</b>
              </div>
              <div>
                Valor final
                <br />
                <b className="text-[13px]">{formatCurrency(deal.proposal.value)}</b>
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              <Button size="sm" onClick={() => pushToast("Documento disponível quando o módulo de assinatura completo estiver ativo.")}>
                Ver documento
              </Button>
              <Button size="sm" onClick={() => pushToast("Certificado disponível quando o módulo de assinatura completo estiver ativo.")}>
                Ver certificado
              </Button>
            </div>
          </Callout>

          <SectionLabel>2 · Condição comercial</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Forma de pagamento">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>À vista</option>
                <option>Financiamento</option>
                <option>Cartão</option>
                <option>Boleto parcelado</option>
              </Select>
            </Field>
            <Field label="Entrada">
              <Input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="R$ 0" />
            </Field>
            <Field label="Parcelamento">
              <Input value={installments} onChange={(e) => setInstallments(e.target.value)} placeholder="36x" />
            </Field>
            <Field label="Instituição">
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="opcional" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Prazo prometido" required>
              <Input type="date" value={promisedDate} onChange={(e) => setPromisedDate(e.target.value)} />
            </Field>
            <Field label="Responsável técnico">
              <Input disabled placeholder="definir na Engenharia" />
            </Field>
          </div>

          <Field label="Condições especiais">
            <Textarea value={specialConditions} onChange={(e) => setSpecialConditions(e.target.value)} placeholder="Ex.: estrutura extra sem custo" />
          </Field>
          <Field label="Observações para a Engenharia">
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} />
          </Field>

          <SectionLabel>6 · Checklist de dados mínimos</SectionLabel>
          <div className="text-[10.5px] leading-loose">
            <div>✓ Pessoa/Empresa e endereço de instalação</div>
            <div>✓ Produtos e potência</div>
            <div>✓ Documentos obrigatórios (2/2)</div>
          </div>
          {missingRoof && (
            <Callout tone="danger">
              <div>◻ Dados técnicos mínimos — falta o tipo de telhado</div>
              <Field label="Tipo de telhado" required>
                <Select value={roofType} onChange={(e) => setRoofType(e.target.value)}>
                  <option value="">selecione</option>
                  <option>Cerâmico</option>
                  <option>Metálico</option>
                  <option>Fibrocimento</option>
                  <option>Laje</option>
                  <option>Solo</option>
                </Select>
              </Field>
            </Callout>
          )}

          <Callout tone="success">
            <b>7 · Ao confirmar:</b> etapa muda para Ganho · cria Projeto de Engenharia · cria Acompanhamento de
            Pós-venda · leva valor final, condições especiais e observações para o handoff.
          </Callout>
          <div className="font-mono text-[9px] text-muted-3 leading-relaxed">
            O VALOR FINAL NÃO É EDITÁVEL AQUI. IDEMPOTENTE: REPROCESSAR NÃO DUPLICA PROJETO/PÓS-VENDA.
          </div>
        </>
      )}

      {view === "success" && (
        <div className="flex flex-col gap-2">
          <RefRow tag="NEG" code={deal.code} label="Negócio ganho" />
          <div className="h-[14px] border-l border-line-dash ml-3" />
          <RefRow tag="PRJ" code={createdProject?.code ?? deal.projectRef?.code ?? ""} label="Projeto de Engenharia" hint={`source_deal ${deal.code}`} />
          <div className="h-[14px] border-l border-line-dash ml-3" />
          <RefRow tag="PS" code={createdPostSale?.code ?? deal.postSaleRef?.code ?? ""} label="Pós-venda" hint={`+ ${createdProject?.code ?? ""}`} />
        </div>
      )}
    </Modal>
  );
}

function RefRow({ tag, code, label, hint }: { tag: string; code: string; label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="font-mono text-[9px] border border-line-strong rounded-[2px] px-1.5 py-0.5">
        {tag} {code}
      </span>
      {label}
      {hint && <span className="font-mono text-[8.5px] text-muted-3 ml-1">{hint}</span>}
    </div>
  );
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    rascunho: "Rascunho",
    enviada: "Enviada",
    visualizada: "Visualizada",
    ajuste_solicitado: "Ajuste solicitado",
    em_assinatura: "Em assinatura",
    assinada: "Assinada",
    aceite_registrado: "Aceite registrado",
    recusada: "Recusada",
    expirada: "Expirada",
  };
  return map[status] ?? status;
}
