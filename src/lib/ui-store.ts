"use client";

import { create } from "zustand";
import { uid } from "./utils";
import type { Company, Person } from "./types";

export interface Toast {
  id: string;
  message: string;
  tone?: "default" | "success" | "danger";
}

interface NovoNegocioCtx {
  presetCompanyId?: string;
  presetPersonId?: string;
  pipelineId?: string;
  stageId?: string;
}

interface PessoaMiniCtx {
  presetCompanyId?: string;
  onSaved?: (person: Person) => void;
  level2?: boolean;
}

interface EmpresaMiniCtx {
  query?: string;
  onSaved?: (company: Company) => void;
  level2?: boolean;
}

interface GateCtx {
  dealId: string;
  targetStageId: string;
}

interface AutomacoesDrawerCtx {
  pipelineId?: string;
  stageId?: string;
  scopeLabel: string;
}

interface StageConfigCtx {
  pipelineId: string;
  stageId: string;
}

interface ArchiveStageCtx {
  pipelineId: string;
  stageId: string;
  hasDeals: boolean;
}

interface UiState {
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;

  novoNegocioOpen: boolean;
  novoNegocioCtx: NovoNegocioCtx;
  openNovoNegocio: (ctx?: NovoNegocioCtx) => void;
  closeNovoNegocio: () => void;

  pessoaMiniOpen: boolean;
  pessoaMiniCtx: PessoaMiniCtx;
  openPessoaMini: (ctx?: PessoaMiniCtx) => void;
  closePessoaMini: () => void;

  empresaMiniOpen: boolean;
  empresaMiniCtx: EmpresaMiniCtx;
  openEmpresaMini: (ctx?: EmpresaMiniCtx) => void;
  closeEmpresaMini: () => void;

  ganharOpen: boolean;
  ganharDealId?: string;
  openGanhar: (dealId: string) => void;
  closeGanhar: () => void;

  perderOpen: boolean;
  perderDealId?: string;
  openPerder: (dealId: string) => void;
  closePerder: () => void;

  gateOpen: boolean;
  gateCtx?: GateCtx;
  openGate: (ctx: GateCtx) => void;
  closeGate: () => void;

  automacoesDrawerOpen: boolean;
  automacoesDrawerCtx?: AutomacoesDrawerCtx;
  openAutomacoesDrawer: (ctx: AutomacoesDrawerCtx) => void;
  closeAutomacoesDrawer: () => void;

  stageConfigOpen: boolean;
  stageConfigCtx?: StageConfigCtx;
  openStageConfig: (ctx: StageConfigCtx) => void;
  closeStageConfig: () => void;

  archiveStageOpen: boolean;
  archiveStageCtx?: ArchiveStageCtx;
  openArchiveStage: (ctx: ArchiveStageCtx) => void;
  closeArchiveStage: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (message, tone = "default") =>
    set((s) => ({ toasts: [...s.toasts, { id: uid("toast"), message, tone }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  novoNegocioOpen: false,
  novoNegocioCtx: {},
  openNovoNegocio: (ctx = {}) => set({ novoNegocioOpen: true, novoNegocioCtx: ctx }),
  closeNovoNegocio: () => set({ novoNegocioOpen: false }),

  pessoaMiniOpen: false,
  pessoaMiniCtx: {},
  openPessoaMini: (ctx = {}) => set({ pessoaMiniOpen: true, pessoaMiniCtx: ctx }),
  closePessoaMini: () => set({ pessoaMiniOpen: false }),

  empresaMiniOpen: false,
  empresaMiniCtx: {},
  openEmpresaMini: (ctx = {}) => set({ empresaMiniOpen: true, empresaMiniCtx: ctx }),
  closeEmpresaMini: () => set({ empresaMiniOpen: false }),

  ganharOpen: false,
  openGanhar: (dealId) => set({ ganharOpen: true, ganharDealId: dealId }),
  closeGanhar: () => set({ ganharOpen: false }),

  perderOpen: false,
  openPerder: (dealId) => set({ perderOpen: true, perderDealId: dealId }),
  closePerder: () => set({ perderOpen: false }),

  gateOpen: false,
  openGate: (ctx) => set({ gateOpen: true, gateCtx: ctx }),
  closeGate: () => set({ gateOpen: false }),

  automacoesDrawerOpen: false,
  openAutomacoesDrawer: (ctx) => set({ automacoesDrawerOpen: true, automacoesDrawerCtx: ctx }),
  closeAutomacoesDrawer: () => set({ automacoesDrawerOpen: false }),

  stageConfigOpen: false,
  openStageConfig: (ctx) => set({ stageConfigOpen: true, stageConfigCtx: ctx }),
  closeStageConfig: () => set({ stageConfigOpen: false }),

  archiveStageOpen: false,
  openArchiveStage: (ctx) => set({ archiveStageOpen: true, archiveStageCtx: ctx }),
  closeArchiveStage: () => set({ archiveStageOpen: false }),
}));
