"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { Modal } from "@/components/ui/Modal";
import { Button, Callout, Field, Input, Select } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/utils";
import type { Company, Person } from "@/lib/types";

export function NovoNegocioModal() {
  const open = useUiStore((s) => s.novoNegocioOpen);
  const ctx = useUiStore((s) => s.novoNegocioCtx);
  const close = useUiStore((s) => s.closeNovoNegocio);
  const openEmpresaMini = useUiStore((s) => s.openEmpresaMini);
  const openPessoaMini = useUiStore((s) => s.openPessoaMini);
  const pushToast = useUiStore((s) => s.pushToast);
  const router = useRouter();

  const allPipelines = useCrmStore((s) => s.pipelines);
  const pipelines = useMemo(() => allPipelines.filter((p) => p.kind !== "engenharia" && p.kind !== "posvenda"), [allPipelines]);
  const users = useCrmStore((s) => s.users);
  const people = useCrmStore((s) => s.people);
  const companies = useCrmStore((s) => s.companies);
  const currentUserId = useCrmStore((s) => s.currentUserId);
  const createDeal = useCrmStore((s) => s.createDeal);
  const getCompany = useCrmStore((s) => s.getCompany);

  const [query, setQuery] = useState("");
  const [company, setCompany] = useState<Company | undefined>();
  const [person, setPerson] = useState<Person | undefined>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pipelineId, setPipelineId] = useState("pl_vendas");
  const [stageId, setStageId] = useState("");
  const [value, setValue] = useState("");
  const [responsibleId, setResponsibleId] = useState(currentUserId);
  const [dirty, setDirty] = useState(false);

  const pipeline = pipelines.find((p) => p.id === pipelineId);
  const openStages = useMemo(() => pipeline?.stages.filter((s) => s.type === "aberta") ?? [], [pipeline]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSearchOpen(false);
    setTitle("");
    setValue("");
    setDirty(false);
    setResponsibleId(currentUserId);
    setPipelineId(ctx.pipelineId ?? "pl_vendas");
    setPerson(ctx.presetPersonId ? people.find((p) => p.id === ctx.presetPersonId) : undefined);
    setCompany(ctx.presetCompanyId ? getCompany(ctx.presetCompanyId) : undefined);
  }, [open, ctx, currentUserId, getCompany, people]);

  useEffect(() => {
    if (pipeline) setStageId(ctx.stageId && pipeline.stages.some((s) => s.id === ctx.stageId) ? ctx.stageId : openStages[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineId]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { companies: [] as Company[], people: [] as Person[] };
    return {
      companies: companies.filter((c) => c.name.toLowerCase().includes(q) || c.cnpj.replace(/\D/g, "").includes(q.replace(/\D/g, "")) && q.length > 3),
      people: companies.length ? people.filter((p) => !company && (p.name.toLowerCase().includes(q) || p.phone.includes(q))) : [],
    };
  }, [query, companies, people, company]);

  const companyPeople = company ? people.filter((p) => p.companyIds.includes(company.id)) : [];
  const noResults = query.trim().length > 2 && matches.companies.length === 0 && matches.people.length === 0 && !company;

  function reset() {
    setDirty(false);
  }

  function handleClose() {
    if (dirty && !window.confirm("Descartar alterações deste negócio?")) return;
    reset();
    close();
  }

  function buildTitle() {
    if (title.trim()) return title.trim();
    if (company) return `Negócio · ${company.name}`;
    if (person) return `Negócio · ${person.name}`;
    return "Novo negócio";
  }

  function handleCreate(andOpen: boolean) {
    if (!company && !person) {
      pushToast("Selecione ou cadastre uma Empresa/Pessoa.", "danger");
      return;
    }
    if (!stageId) {
      pushToast("Selecione uma etapa.", "danger");
      return;
    }
    const deal = createDeal({
      title: buildTitle(),
      pipelineId,
      stageId,
      companyId: company?.id,
      personId: person?.id,
      value: Number(value.replace(/\D/g, "")) || 0,
      responsibleId,
    });
    close();
    reset();
    if (andOpen) {
      router.push(`/negocios/${deal.id}`);
    } else {
      pushToast(`${deal.code} criado.`, "success");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title="Novo negócio"
      eyebrow="MODAL · NÍVEL 1"
      width={480}
      footer={
        <>
          <span className="text-[11px] text-muted cursor-pointer" onClick={handleClose}>
            Cancelar
          </span>
          <Button variant="default" className="ml-auto" onClick={() => handleCreate(false)}>
            Criar e continuar
          </Button>
          <Button variant="primary" onClick={() => handleCreate(true)}>
            Criar e abrir
          </Button>
        </>
      }
    >
      <div className="relative">
        <Field label="Empresa ou Pessoa" required>
          {company || person ? (
            <div className="h-[34px] border border-ink rounded-[3px] flex items-center px-2.5 text-[11.5px]">
              {company?.name ?? person?.name}
              {company && <span className="ml-auto font-mono text-[9px] text-muted-3">CNPJ ···{company.cnpj.slice(-6)}</span>}
              <button
                className="ml-2 text-muted-2 hover:text-ink text-[10px]"
                onClick={() => {
                  setCompany(undefined);
                  setPerson(undefined);
                  setDirty(true);
                }}
              >
                trocar
              </button>
            </div>
          ) : (
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
                setDirty(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Buscar por nome, razão social, CNPJ, CPF, telefone ou e-mail"
            />
          )}
        </Field>
        {searchOpen && !company && !person && query.trim().length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-surface border border-line-card rounded-[3px] shadow-xl py-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
            {matches.companies.map((c) => (
              <button
                key={c.id}
                className="w-full text-left px-3 py-1.5 text-[11.5px] hover:bg-chip flex items-center gap-2"
                onClick={() => {
                  setCompany(c);
                  setSearchOpen(false);
                  const primary = people.find((p) => p.companyIds.includes(c.id) && p.decisor) ?? people.find((p) => p.companyIds.includes(c.id));
                  setPerson(primary);
                }}
              >
                {c.name}
                <span className="text-muted-2 font-mono text-[9px] ml-auto">EMPRESA</span>
              </button>
            ))}
            {matches.people.map((p) => (
              <button
                key={p.id}
                className="w-full text-left px-3 py-1.5 text-[11.5px] hover:bg-chip flex items-center gap-2"
                onClick={() => {
                  setPerson(p);
                  if (p.primaryCompanyId) setCompany(getCompany(p.primaryCompanyId));
                  setSearchOpen(false);
                }}
              >
                {p.name}
                <span className="text-muted-2 font-mono text-[9px] ml-auto">PESSOA</span>
              </button>
            ))}
            {noResults && (
              <div className="px-3 py-2">
                <div className="border border-dashed border-line-dash rounded-[3px] p-2.5 text-[11px] text-muted">
                  Nenhuma empresa encontrada.
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        openEmpresaMini({
                          query,
                          level2: true,
                          onSaved: (c) => {
                            setCompany(c);
                            setSearchOpen(false);
                            setDirty(true);
                          },
                        })
                      }
                    >
                      + Cadastrar nova empresa
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        openPessoaMini({
                          level2: true,
                          onSaved: (p) => {
                            setPerson(p);
                            setSearchOpen(false);
                            setDirty(true);
                          },
                        })
                      }
                    >
                      Cadastrar pessoa
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {company && (
        <Callout tone="success">
          Cadastro existente reutilizado. Pessoas vinculadas sugeridas como contato principal.
        </Callout>
      )}

      {(company || person) && (
        <Field label="Contato principal" required>
          <div className="h-[34px] border border-line-strong bg-canvas rounded-[3px] flex items-center px-2.5 text-[11.5px]">
            {person ? (
              <>
                {person.name} {person.role && <span className="text-muted-2 ml-1">· {person.role}</span>}
              </>
            ) : (
              <span className="text-muted-3">nenhum contato selecionado</span>
            )}
            <button
              className="ml-auto text-[11px] text-accent"
              onClick={() =>
                openPessoaMini({
                  presetCompanyId: company?.id,
                  level2: true,
                  onSaved: (p) => setPerson(p),
                })
              }
            >
              {person ? "trocar" : "+ Cadastrar pessoa"}
            </button>
          </div>
          {companyPeople.length > 1 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {companyPeople.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPerson(p)}
                  className={`text-[10px] px-2 py-1 rounded-full border ${
                    person?.id === p.id ? "border-ink bg-chip" : "border-line-strong text-muted"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </Field>
      )}

      <Field label="Título do negócio" hint="Opcional — gerado automaticamente se vazio">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={buildTitle()} />
      </Field>

      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Funil" required>
          <Select value={pipelineId} onChange={(e) => setPipelineId(e.target.value)}>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Etapa">
          <Select value={stageId} onChange={(e) => setStageId(e.target.value)}>
            {openStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Valor estimado">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="R$ 0"
            inputMode="numeric"
          />
          {value && <span className="text-[10px] text-muted-2">{formatCurrency(Number(value.replace(/\D/g, "")) || 0)}</span>}
        </Field>
        <Field label="Responsável">
          <Select value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="font-mono text-[9px] text-muted-3 leading-relaxed">
        CAMPOS DO FORMULÁRIO DO FUNIL ENTRAM ABAIXO CONFORME CONFIGURAÇÃO DO ADMIN.
      </div>
    </Modal>
  );
}
