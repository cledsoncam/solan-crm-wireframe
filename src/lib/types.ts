export type Role = "gestor" | "vendedor" | "sdr" | "tecnico" | "posvenda" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  unit: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  city: string;
  uf: string;
  address?: string;
  installationAddress?: string;
  site?: string;
  tags: string[];
  partner?: boolean;
}

export interface Person {
  id: string;
  name: string;
  title?: string;
  companyIds: string[];
  primaryCompanyId?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  cpf?: string;
  role?: string;
  decisor?: boolean;
  tags: string[];
}

export type StageType = "aberta" | "ganho" | "perdido";

export interface ChecklistItemDef {
  id: string;
  label: string;
  kind: "informativo" | "alerta" | "obrigatorio";
}

export interface Stage {
  id: string;
  name: string;
  type: StageType;
  order: number;
  checklist?: ChecklistItemDef[];
  slaHours?: number;
  automationsCount?: number;
  lossReasons?: string[];
  destinationRule?: string;
  generatesProject?: boolean;
}

export type PipelineKind = "sdr" | "vendas" | "reativacao" | "parcerias" | "custom";

export interface Pipeline {
  id: string;
  name: string;
  kind: PipelineKind;
  isDefault?: boolean;
  stages: Stage[];
}

export type ProposalStatus =
  | "rascunho"
  | "enviada"
  | "visualizada"
  | "ajuste_solicitado"
  | "em_assinatura"
  | "assinada"
  | "aceite_registrado"
  | "recusada"
  | "expirada"
  | "substituida"
  | "cancelada";

export interface ProposalSigner {
  name: string;
  role: "signatario" | "visualiza";
  status: "pendente" | "abriu" | "assinou" | "recusou";
  lastOpenAt?: string;
}

export interface Proposal {
  code: string;
  version: number;
  value: number;
  validUntil: string;
  status: ProposalStatus;
  signers: ProposalSigner[];
  forwardingDetected?: boolean;
}

export type DealRisk = "baixo" | "medio" | "alto";

export interface TimelineEvent {
  id: string;
  dealId: string;
  kind:
    | "nota"
    | "ligacao"
    | "email_enviado"
    | "email_recebido"
    | "whatsapp_enviado"
    | "whatsapp_recebido"
    | "reuniao"
    | "visita"
    | "tarefa"
    | "etapa"
    | "proposta"
    | "automacao"
    | "sistema";
  title: string;
  detail?: string;
  author?: string;
  at: string;
}

export interface DealActivity {
  id: string;
  dealId: string;
  title: string;
  type: "tarefa" | "ligacao" | "reuniao" | "visita" | "email";
  at: string;
  responsibleId: string;
  done: boolean;
}

export interface Deal {
  id: string;
  code: string;
  title: string;
  pipelineId: string;
  stageId: string;
  companyId?: string;
  personId?: string;
  otherPersonIds: string[];
  value: number;
  responsibleId: string;
  nextActivityAt?: string;
  enteredStageAt: string;
  tags: string[];
  risk: DealRisk;
  fields: Record<string, string>;
  proposal?: Proposal;
  createdAt: string;
  wonAt?: string;
  lostAt?: string;
  lossReason?: string;
  lossDetail?: string;
  reopened?: boolean;
  projectRef?: { code: string; stage: string };
  postSaleRef?: { code: string; stage: string };
  destinationPipelineLabel?: string;
  origin?: string;
  checklistState?: Record<string, boolean>;
  checklistNotes?: Record<string, string>;
}

export type AutomationStatus = "rascunho" | "ativa" | "pausada" | "com_erro" | "arquivada";

export interface FlowNode {
  id: string;
  kind: "gatilho" | "espera" | "condicao" | "acao";
  title: string;
  subtitle?: string;
  advanced?: boolean;
}

export interface AutomationFlow {
  main: FlowNode[];
  branchCondition?: FlowNode;
  simPath?: FlowNode[];
  noPath?: FlowNode[];
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  scopeLabel: string;
  pipelineId?: string;
  stageId?: string;
  triggerLabel: string;
  status: AutomationStatus;
  version: number;
  execs7d: number;
  failures7d?: number;
  flow?: AutomationFlow;
  publishedVersion?: number;
  publishedAt?: string;
}
