"use client";

import { NovoNegocioModal } from "@/components/negocios/NovoNegocioModal";
import { GanharModal } from "@/components/negocios/GanharModal";
import { PerderModal } from "@/components/negocios/PerderModal";
import { GateModal } from "@/components/negocios/GateModal";
import { AutomacoesDrawer } from "@/components/negocios/AutomacoesDrawer";
import { StageConfigDrawer } from "@/components/negocios/StageConfigDrawer";
import { ArchiveStageModal } from "@/components/negocios/ArchiveStageModal";
import { PessoaMiniModal } from "@/components/pessoas/PessoaMiniModal";
import { EmpresaMiniModal } from "@/components/pessoas/EmpresaMiniModal";
import { Toaster } from "@/components/ui/Toaster";

export function GlobalModals() {
  return (
    <>
      <NovoNegocioModal />
      <PessoaMiniModal />
      <EmpresaMiniModal />
      <GanharModal />
      <PerderModal />
      <GateModal />
      <AutomacoesDrawer />
      <StageConfigDrawer />
      <ArchiveStageModal />
      <Toaster />
    </>
  );
}
