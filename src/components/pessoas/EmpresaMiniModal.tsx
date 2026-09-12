"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Callout, Field, Input, Select } from "@/components/ui/primitives";

const SEGMENTS = ["Agronegócio", "Comércio", "Varejo", "Condomínio", "Engenharia", "Alimentação", "Construtora", "Outro"];
const UFS = ["RN", "PB", "CE", "PE"];

export function EmpresaMiniModal() {
  const open = useUiStore((s) => s.empresaMiniOpen);
  const ctx = useUiStore((s) => s.empresaMiniCtx);
  const close = useUiStore((s) => s.closeEmpresaMini);
  const pushToast = useUiStore((s) => s.pushToast);
  const createCompany = useCrmStore((s) => s.createCompany);
  const findDuplicateCompany = useCrmStore((s) => s.findDuplicateCompany);

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("RN");
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(ctx.query ?? "");
      setCnpj("");
      setCity("");
      setUf("RN");
      setSegment(SEGMENTS[0]);
      setError(null);
    }
  }, [open, ctx.query]);

  const duplicate = cnpj.replace(/\D/g, "").length >= 8 ? findDuplicateCompany(cnpj) : undefined;

  function handleSave() {
    if (!name.trim()) {
      setError("Informe o nome ou razão social.");
      return;
    }
    if (duplicate) {
      ctx.onSaved?.(duplicate);
      close();
      pushToast("Cadastro existente reutilizado.");
      return;
    }
    const company = createCompany({ name: name.trim(), cnpj, city, uf, segment, tags: [] });
    ctx.onSaved?.(company);
    close();
    pushToast("Empresa cadastrada.", "success");
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && close()}
      title="Cadastrar empresa"
      eyebrow={ctx.level2 ? "SUBMODAL · NÍVEL 2" : "PE-005"}
      width={420}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={close}>
            Cancelar
          </span>
          {ctx.level2 && (
            <span className="font-mono text-[9px] text-muted-3 ml-1">
              CANCELAR VOLTA SEM PERDER DADOS
            </span>
          )}
          <Button variant="primary" className="ml-auto" onClick={handleSave}>
            {duplicate ? "Usar existente" : "Salvar empresa"}
          </Button>
        </>
      }
    >
      <Field label="Nome / razão social" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Agro Boa Vista Ltda" />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="CNPJ" required hint={duplicate ? undefined : "Dedupe verificado ao salvar"}>
          <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
        </Field>
        <Field label="Segmento">
          <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
            {SEGMENTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cidade">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mossoró" />
        </Field>
        <Field label="UF">
          <Select value={uf} onChange={(e) => setUf(e.target.value)}>
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </Field>
      </div>
      {duplicate && (
        <Callout tone="warning">
          Já existe cadastro com este CNPJ.
          <div className="text-muted mt-1">
            {duplicate.name} · {duplicate.city}/{duplicate.uf}
          </div>
        </Callout>
      )}
      {error && <Callout tone="danger">{error}</Callout>}
      <div className="font-mono text-[9px] text-muted-3 leading-relaxed">
        FORMULÁRIO MINI = SÓ CAMPOS ESSENCIAIS. FICHA COMPLETA FICA NA FICHA DA EMPRESA.
      </div>
    </Modal>
  );
}
