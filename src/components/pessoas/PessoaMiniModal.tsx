"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Callout, Field, Input } from "@/components/ui/primitives";

export function PessoaMiniModal() {
  const open = useUiStore((s) => s.pessoaMiniOpen);
  const ctx = useUiStore((s) => s.pessoaMiniCtx);
  const close = useUiStore((s) => s.closePessoaMini);
  const pushToast = useUiStore((s) => s.pushToast);
  const createPerson = useCrmStore((s) => s.createPerson);
  const findDuplicatePerson = useCrmStore((s) => s.findDuplicatePerson);
  const getCompany = useCrmStore((s) => s.getCompany);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);

  const presetCompany = ctx.presetCompanyId ? getCompany(ctx.presetCompanyId) : undefined;

  useEffect(() => {
    if (open) {
      setName("");
      setWhatsapp("");
      setEmail("");
      setRole("");
      setError(null);
    }
  }, [open]);

  const duplicate = whatsapp.replace(/\D/g, "").length >= 8 ? findDuplicatePerson(whatsapp) : undefined;

  function handleSave() {
    if (!name.trim()) {
      setError("Informe o nome.");
      return;
    }
    if (!whatsapp.trim()) {
      setError("Informe o WhatsApp.");
      return;
    }
    if (duplicate) {
      ctx.onSaved?.(duplicate);
      close();
      pushToast("Cadastro existente reutilizado.");
      return;
    }
    const person = createPerson({
      name: name.trim(),
      whatsapp,
      phone: whatsapp,
      email: email || undefined,
      role: role || undefined,
      companyIds: ctx.presetCompanyId ? [ctx.presetCompanyId] : [],
      primaryCompanyId: ctx.presetCompanyId,
    });
    ctx.onSaved?.(person);
    close();
    pushToast("Pessoa cadastrada.", "success");
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && close()}
      title="Cadastrar pessoa"
      eyebrow={ctx.level2 ? "SUBMODAL · NÍVEL 2" : "PE-004"}
      width={400}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
            Cancelar
          </span>
          <Button variant="primary" className="ml-auto" onClick={handleSave}>
            {duplicate ? "Usar existente" : "Salvar e usar como contato"}
          </Button>
        </>
      }
    >
      {presetCompany && (
        <Field label="Empresa">
          <div className="h-[32px] border border-line-card bg-chip rounded-[3px] px-2.5 flex items-center text-[11.5px] text-muted">
            {presetCompany.name}
            <span className="ml-auto font-mono text-[8.5px] text-muted-3">PRÉ-PREENCHIDO</span>
          </div>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Nome" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Júlio Medeiros" />
        </Field>
        <Field label="Cargo / papel">
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Decisor" />
        </Field>
        <Field label="WhatsApp" required>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(84) 9 8811-0022" />
        </Field>
        <Field label="E-mail">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="opcional" />
        </Field>
      </div>
      {duplicate && (
        <Callout tone="warning">
          Já existe cadastro com este telefone: <b>{duplicate.name}</b>.
        </Callout>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="text-[10.5px] text-muted leading-relaxed">
        Usado em: Novo negócio, Inbox, ficha da empresa, criar rápido e criação de OS.
      </div>
    </Modal>
  );
}
