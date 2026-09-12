import type {
  Automation,
  Company,
  Conversation,
  Deal,
  DealActivity,
  Message,
  Person,
  Pipeline,
  TimelineEvent,
  User,
} from "./types";

export const users: User[] = [
  { id: "u_cledson", name: "Cledson C.", role: "gestor", unit: "Natal" },
  { id: "u_iara", name: "Iara F.", role: "sdr", unit: "Natal" },
  { id: "u_bruno", name: "Bruno T.", role: "vendedor", unit: "Natal" },
  { id: "u_paulo", name: "Paulo S.", role: "tecnico", unit: "Natal" },
  { id: "u_claudia", name: "Cláudia S.", role: "posvenda", unit: "Natal" },
];

export const CURRENT_USER_ID = "u_cledson";

export const companies: Company[] = [
  { id: "c_solarvale", name: "Solar Vale S/A", cnpj: "12.345.678/0001-90", segment: "Comércio", city: "Natal", uf: "RN", address: "Av. Eng. Roberto Freire, 1200", installationAddress: "Parnamirim/RN", tags: ["cliente"] },
  { id: "c_agroboavista", name: "Agro Boa Vista Ltda", cnpj: "22.456.789/0001-11", segment: "Agronegócio", city: "Mossoró", uf: "RN", tags: [] },
  { id: "c_mercadosul", name: "Mercado Sul Ltda", cnpj: "33.111.222/0001-45", segment: "Varejo", city: "Natal", uf: "RN", tags: [] },
  { id: "c_pontanegra", name: "Adm. Ponta Negra", cnpj: "44.222.333/0001-77", segment: "Condomínio", city: "Natal", uf: "RN", tags: [] },
  { id: "c_ribeiro", name: "Ribeiro Engenharia", cnpj: "55.333.444/0001-22", segment: "Engenharia", city: "Parnamirim", uf: "RN", tags: [] },
  { id: "c_padaria", name: "Padaria Central", cnpj: "66.444.555/0001-33", segment: "Alimentação", city: "Natal", uf: "RN", tags: ["cliente"] },
  { id: "c_aurora", name: "Condomínio Aurora", cnpj: "77.555.666/0001-44", segment: "Condomínio", city: "Natal", uf: "RN", tags: [] },
  { id: "c_valeagro", name: "Vale Agro ME", cnpj: "88.666.777/0001-55", segment: "Agronegócio", city: "Mossoró", uf: "RN", tags: [] },
  { id: "c_construtoraDunas", name: "Construtora Dunas", cnpj: "91.777.888/0001-66", segment: "Construtora", city: "Natal", uf: "RN", tags: ["parceiro"], partner: true },
  { id: "c_eletricaNorte", name: "Elétrica Norte", cnpj: "92.888.999/0001-77", segment: "Instaladora elétrica", city: "Natal", uf: "RN", tags: ["parceiro"], partner: true },
  { id: "c_imobiliariaPonta", name: "Imobiliária Ponta", cnpj: "93.999.111/0001-88", segment: "Imobiliária", city: "Natal", uf: "RN", tags: ["parceiro"], partner: true },
  { id: "c_eletricaSol", name: "Elétrica Sol", cnpj: "94.111.222/0001-99", segment: "Instaladora elétrica", city: "Natal", uf: "RN", tags: ["parceiro"], partner: true },
];

export const people: Person[] = [
  { id: "p_marcos", name: "Marcos Andrade", title: "Diretor", companyIds: ["c_solarvale"], primaryCompanyId: "c_solarvale", phone: "(84) 9 9911-2233", whatsapp: "(84) 9 9911-2233", email: "marcos@solarvale.com.br", cpf: "022.***.***-11", role: "decisor", decisor: true, tags: ["frio-quente", "indicação"] },
  { id: "p_claudia_sena", name: "Cláudia Sena", title: "Financeiro", companyIds: ["c_solarvale"], primaryCompanyId: "c_solarvale", phone: "(84) 9 9911-4400", whatsapp: "(84) 9 9911-4400", email: "claudia@solarvale.com.br", role: "financeiro", tags: [] },
  { id: "p_julio", name: "Júlio Medeiros", title: "Sócio", companyIds: ["c_agroboavista"], primaryCompanyId: "c_agroboavista", phone: "(84) 9 8811-0022", whatsapp: "(84) 9 8811-0022", email: "julio@agroboavista.com.br", role: "decisor", decisor: true, tags: [] },
  { id: "p_ana", name: "Ana Ribeiro", title: "Sócia", companyIds: ["c_ribeiro"], primaryCompanyId: "c_ribeiro", phone: "(84) 9 9700-1188", whatsapp: "(84) 9 9700-1188", email: "ana@ribeiroeng.com.br", role: "decisor", decisor: true, tags: ["2 cadastros"] },
  { id: "p_renata", name: "Renata Lopes", companyIds: [], phone: "(84) 9 9432-7711", whatsapp: "(84) 9 9432-7711", tags: [] },
  { id: "p_rita", name: "Rita S.", companyIds: [], phone: "(84) 9 8123-4455", whatsapp: "(84) 9 8123-4455", tags: [] },
  { id: "p_marcela", name: "Marcela Dias", companyIds: [], phone: "(84) 9 8222-9911", whatsapp: "(84) 9 8222-9911", tags: [] },
  { id: "p_joao", name: "João P.", companyIds: [], phone: "(84) 9 9000-1122", whatsapp: "(84) 9 9000-1122", tags: [] },
  { id: "p_juliana", name: "Juliana Prado", companyIds: [], phone: "(84) 9 9555-2233", whatsapp: "(84) 9 9555-2233", email: "juliana@solarvale.com.br", role: "só visualiza", tags: [] },
];

export const pipelines: Pipeline[] = [
  {
    id: "pl_vendas",
    name: "Funil de Vendas",
    kind: "vendas",
    isDefault: true,
    stages: [
      { id: "st_v_diagnostico", name: "Diagnóstico", type: "aberta", order: 0 },
      { id: "st_v_levantamento", name: "Levantamento", type: "aberta", order: 1 },
      {
        id: "st_v_proposta",
        name: "Proposta",
        type: "aberta",
        order: 2,
        checklist: [
          { id: "cl1", label: "Levantamento anexado", kind: "informativo" },
          { id: "cl2", label: "Proposta enviada", kind: "informativo" },
          { id: "cl3", label: "Retorno registrado", kind: "obrigatorio" },
          { id: "cl4", label: "Concorrente mapeado", kind: "alerta" },
        ],
      },
      { id: "st_v_negociacao", name: "Negociação", type: "aberta", order: 3 },
      { id: "st_v_ganho", name: "Ganho", type: "ganho", order: 4, generatesProject: true },
      {
        id: "st_v_perdido",
        name: "Perdido",
        type: "perdido",
        order: 5,
        lossReasons: ["Preço", "Prazo", "Fechou com concorrente", "Adiou o projeto", "Sem retorno"],
        destinationRule: "Enviar para Reativação após 90 d",
      },
    ],
  },
  {
    id: "pl_sdr",
    name: "Funil de SDR",
    kind: "sdr",
    stages: [
      { id: "st_s_entrada", name: "Entrada", type: "aberta", order: 0 },
      { id: "st_s_contato", name: "Contato", type: "aberta", order: 1, slaHours: 24 },
      {
        id: "st_s_qualificacao",
        name: "Qualificação",
        type: "aberta",
        order: 2,
        checklist: [
          { id: "cl1", label: "Consumo médio", kind: "obrigatorio" },
          { id: "cl2", label: "Tipo de imóvel", kind: "obrigatorio" },
          { id: "cl3", label: "Decisor identificado", kind: "obrigatorio" },
          { id: "cl4", label: "Prazo", kind: "informativo" },
          { id: "cl5", label: "Orçamento", kind: "alerta" },
        ],
      },
      { id: "st_s_reuniao_agendada", name: "Reunião agendada", type: "aberta", order: 3 },
      { id: "st_s_noshow", name: "No-show / Reagendamento", type: "aberta", order: 4 },
      { id: "st_s_reuniao_realizada", name: "Reunião realizada", type: "ganho", order: 5 },
      {
        id: "st_s_desqualificado",
        name: "Desqualificado",
        type: "perdido",
        order: 6,
        lossReasons: ["Sem resposta", "Fora do perfil", "Sem orçamento", "Duplicado", "Sem interesse"],
        destinationRule: "Enviar para Reativação",
      },
    ],
  },
  {
    id: "pl_reativacao",
    name: "Funil de Reativação",
    kind: "reativacao",
    stages: [
      { id: "st_r_base", name: "Base elegível", type: "aberta", order: 0 },
      { id: "st_r_abordagem", name: "Abordagem", type: "aberta", order: 1 },
      { id: "st_r_reengajado", name: "Reengajado", type: "aberta", order: 2 },
      { id: "st_r_volta", name: "Volta ao pipeline", type: "aberta", order: 3, destinationRule: "Move para o Funil de Vendas" },
      { id: "st_r_encerrado", name: "Encerrado", type: "aberta", order: 4 },
    ],
  },
  {
    id: "pl_parcerias",
    name: "Funil de Parcerias",
    kind: "parcerias",
    stages: [
      { id: "st_p_prospeccao", name: "Prospecção", type: "aberta", order: 0 },
      { id: "st_p_negociacao", name: "Negociação", type: "aberta", order: 1 },
      { id: "st_p_ativacao", name: "Ativação", type: "aberta", order: 2 },
      { id: "st_p_indicando", name: "Indicando", type: "aberta", order: 3 },
      { id: "st_p_inativo", name: "Inativo", type: "aberta", order: 4 },
    ],
  },
];

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(now + n * 86400000).toISOString();

export const deals: Deal[] = [
  // Funil de Vendas
  {
    id: "d_ribeiro_res", code: "NEG #1041", title: "Residencial · A. Ribeiro", pipelineId: "pl_vendas", stageId: "st_v_diagnostico",
    companyId: "c_ribeiro", personId: "p_ana", otherPersonIds: [], value: 62400, responsibleId: "u_cledson",
    nextActivityAt: daysAhead(1), enteredStageAt: daysAgo(3), tags: [], risk: "baixo", fields: { origem: "Indicação" }, createdAt: daysAgo(6),
  },
  {
    id: "d_mercadosul_1", code: "NEG #1002", title: "Comercial · Mercado Sul", pipelineId: "pl_vendas", stageId: "st_v_diagnostico",
    companyId: "c_mercadosul", personId: undefined, otherPersonIds: [], value: 96000, responsibleId: "u_bruno",
    nextActivityAt: undefined, enteredStageAt: daysAgo(9), tags: [], risk: "alto", fields: {}, createdAt: daysAgo(12),
  },
  {
    id: "d_boavista", code: "NEG #1044", title: "Usina Boa Vista", pipelineId: "pl_vendas", stageId: "st_v_levantamento",
    companyId: "c_agroboavista", personId: "p_julio", otherPersonIds: [], value: 210000, responsibleId: "u_cledson",
    nextActivityAt: daysAgo(1), enteredStageAt: daysAgo(14), tags: ["usina"], risk: "alto", fields: { checklist: "2/4" }, createdAt: daysAgo(20),
  },
  {
    id: "d_solarvale_expansao", code: "NEG #1031", title: "Solar Vale · expansão 96 kWp", pipelineId: "pl_vendas", stageId: "st_v_proposta",
    companyId: "c_solarvale", personId: "p_marcos", otherPersonIds: ["p_claudia_sena", "p_juliana"], value: 148900, responsibleId: "u_cledson",
    nextActivityAt: new Date(now + 5 * 3600000).toISOString(), enteredStageAt: daysAgo(6),
    tags: ["expansão"], risk: "medio",
    fields: {
      "Consumo médio": "8.400 kWh",
      Concessionária: "Neoenergia",
      "Tipo de telhado": "Metálico",
      Origem: "Meta Lead Ads",
    },
    proposal: {
      code: "P-238", version: 2, value: 148900, validUntil: daysAhead(3), status: "em_assinatura",
      signers: [
        { name: "Marcos A.", role: "signatario", status: "assinou", lastOpenAt: daysAgo(0) },
        { name: "Repr. Solar Vale", role: "signatario", status: "pendente" },
        { name: "Juliana P.", role: "visualiza", status: "abriu", lastOpenAt: daysAgo(1) },
      ],
      forwardingDetected: true,
    },
    createdAt: daysAgo(18),
  },
  {
    id: "d_pontanegra", code: "NEG #1052", title: "Condomínio Ponta Negra", pipelineId: "pl_vendas", stageId: "st_v_negociacao",
    companyId: "c_pontanegra", personId: undefined, otherPersonIds: [], value: 189000, responsibleId: "u_bruno",
    nextActivityAt: daysAhead(2), enteredStageAt: daysAgo(2), tags: [], risk: "baixo", fields: {}, createdAt: daysAgo(25),
  },
  {
    id: "d_solarvale_ganho", code: "NEG #1024", title: "Solar Vale S/A", pipelineId: "pl_vendas", stageId: "st_v_ganho",
    companyId: "c_solarvale", personId: "p_marcos", otherPersonIds: [], value: 148900, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(2), tags: [], risk: "baixo", fields: {}, wonAt: daysAgo(2),
    projectRef: { code: "PRJ 554", stage: "Homologação" }, postSaleRef: { code: "PS 887", stage: "Onboarding" },
    createdAt: daysAgo(40),
  },
  {
    id: "d_padaria_ganho", code: "NEG #1019", title: "Padaria Central", pipelineId: "pl_vendas", stageId: "st_v_ganho",
    companyId: "c_padaria", personId: undefined, otherPersonIds: [], value: 64200, responsibleId: "u_bruno",
    enteredStageAt: daysAgo(7), tags: [], risk: "baixo", fields: {}, wonAt: daysAgo(7),
    projectRef: { code: "PRJ 549", stage: "Projeto" }, createdAt: daysAgo(50),
  },
  {
    id: "d_mercadosul_perdido", code: "NEG #1002", title: "Mercado Sul", pipelineId: "pl_vendas", stageId: "st_v_perdido",
    companyId: "c_mercadosul", personId: undefined, otherPersonIds: [], value: 96000, responsibleId: "u_bruno",
    enteredStageAt: daysAgo(9), tags: [], risk: "baixo", fields: {}, lostAt: daysAgo(9),
    lossReason: "Preço", lossDetail: "Fechou com concorrente X", destinationPipelineLabel: "Em Reativação", createdAt: daysAgo(30),
  },
  {
    id: "d_aurora_perdido", code: "NEG #1006", title: "Cond. Aurora", pipelineId: "pl_vendas", stageId: "st_v_perdido",
    companyId: "c_aurora", personId: undefined, otherPersonIds: [], value: 54000, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(13), tags: [], risk: "baixo", fields: {}, lostAt: daysAgo(13),
    lossReason: "Adiou o projeto", createdAt: daysAgo(45),
  },

  // Funil de SDR
  {
    id: "d_sdr_joao", code: "NEG #2001", title: "Lead Meta · João P.", pipelineId: "pl_sdr", stageId: "st_s_entrada",
    companyId: undefined, personId: "p_joao", otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: new Date(now - 12 * 60000).toISOString(), tags: [], risk: "alto", fields: { cidade: "Natal/RN", conta: "R$ 780" }, createdAt: daysAgo(0),
  },
  {
    id: "d_sdr_marcela", code: "NEG #2002", title: "Site · Marcela D.", pipelineId: "pl_sdr", stageId: "st_s_entrada",
    companyId: undefined, personId: "p_marcela", otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(0), tags: [], risk: "medio", fields: {}, createdAt: daysAgo(0),
  },
  {
    id: "d_sdr_rita", code: "NEG #2003", title: "Lead Meta · Rita S.", pipelineId: "pl_sdr", stageId: "st_s_contato",
    companyId: undefined, personId: "p_rita", otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(2), tags: [], risk: "medio", fields: { tentativas: "3" }, createdAt: daysAgo(4),
  },
  {
    id: "d_sdr_padaria", code: "NEG #2004", title: "Padaria Central", pipelineId: "pl_sdr", stageId: "st_s_qualificacao",
    companyId: "c_padaria", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(1), tags: [], risk: "baixo", fields: { consumo: "2.100 kWh" }, createdAt: daysAgo(5),
  },
  {
    id: "d_sdr_mercadosul", code: "NEG #2005", title: "Mercado Sul", pipelineId: "pl_sdr", stageId: "st_s_reuniao_agendada",
    companyId: "c_mercadosul", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(1), tags: [], risk: "baixo", fields: {}, nextActivityAt: daysAhead(2), createdAt: daysAgo(6),
  },
  {
    id: "d_sdr_boavista", code: "NEG #2006", title: "Agro Boa Vista", pipelineId: "pl_sdr", stageId: "st_s_reuniao_agendada",
    companyId: "c_agroboavista", personId: "p_julio", otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(1), tags: [], risk: "alto", fields: {}, createdAt: daysAgo(6),
  },
  {
    id: "d_sdr_padaria_noshow", code: "NEG #2007", title: "Padaria Central", pipelineId: "pl_sdr", stageId: "st_s_noshow",
    companyId: "c_padaria", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(4), tags: [], risk: "medio", fields: { tentativas: "2" }, createdAt: daysAgo(9),
  },
  {
    id: "d_sdr_solarvale_realizada", code: "NEG #2008", title: "Solar Vale S/A", pipelineId: "pl_sdr", stageId: "st_s_reuniao_realizada",
    companyId: "c_solarvale", personId: "p_marcos", otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(7), tags: [], risk: "baixo", fields: {}, wonAt: daysAgo(7),
    destinationPipelineLabel: "Em Vendas · etapa 3", createdAt: daysAgo(15),
  },
  {
    id: "d_sdr_pontanegra_realizada", code: "NEG #2009", title: "Cond. Ponta Negra", pipelineId: "pl_sdr", stageId: "st_s_reuniao_realizada",
    companyId: "c_pontanegra", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(3), tags: [], risk: "baixo", fields: {}, wonAt: daysAgo(3),
    destinationPipelineLabel: "Em Vendas · etapa 1", createdAt: daysAgo(11),
  },
  {
    id: "d_sdr_desq1", code: "NEG #2010", title: "Site · Renata L.", pipelineId: "pl_sdr", stageId: "st_s_desqualificado",
    companyId: undefined, personId: "p_renata", otherPersonIds: [], value: 0, responsibleId: "u_iara",
    enteredStageAt: daysAgo(10), tags: [], risk: "baixo", fields: {}, lostAt: daysAgo(10),
    lossReason: "Fora do perfil", createdAt: daysAgo(16),
  },

  // Funil de Reativação
  {
    id: "d_reat_mercadosul", code: "NEG #1002", title: "Mercado Sul", pipelineId: "pl_reativacao", stageId: "st_r_base",
    companyId: "c_mercadosul", personId: undefined, otherPersonIds: [], value: 96000, responsibleId: "u_bruno",
    enteredStageAt: daysAgo(9), tags: [], risk: "baixo", fields: { motivo: "preço" }, createdAt: daysAgo(30),
  },
  {
    id: "d_reat_ribeiro", code: "NEG #1058", title: "Ribeiro Engenharia", pipelineId: "pl_reativacao", stageId: "st_r_abordagem",
    companyId: "c_ribeiro", personId: "p_ana", otherPersonIds: [], value: 0, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(4), tags: [], risk: "medio", fields: { template: "Nova condição" }, createdAt: daysAgo(50),
  },
  {
    id: "d_reat_valeagro", code: "NEG #1061", title: "Vale Agro ME", pipelineId: "pl_reativacao", stageId: "st_r_reengajado",
    companyId: "c_valeagro", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(2), tags: [], risk: "baixo", fields: {}, createdAt: daysAgo(60),
  },

  // Funil de Parcerias
  {
    id: "d_par_dunas", code: "NEG #3001", title: "Construtora Dunas", pipelineId: "pl_parcerias", stageId: "st_p_prospeccao",
    companyId: "c_construtoraDunas", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(5), tags: [], risk: "baixo", fields: { potencial: "6 obras/ano" }, createdAt: daysAgo(20),
  },
  {
    id: "d_par_eletricanorte", code: "NEG #3002", title: "Elétrica Norte", pipelineId: "pl_parcerias", stageId: "st_p_negociacao",
    companyId: "c_eletricaNorte", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(8), tags: [], risk: "medio", fields: { comissao: "em discussão" }, createdAt: daysAgo(25),
  },
  {
    id: "d_par_imobiliaria", code: "NEG #3003", title: "Imobiliária Ponta", pipelineId: "pl_parcerias", stageId: "st_p_ativacao",
    companyId: "c_imobiliariaPonta", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(15), tags: [], risk: "baixo", fields: {}, createdAt: daysAgo(60),
  },
  {
    id: "d_par_eletricasol", code: "NEG #3004", title: "Elétrica Sol", pipelineId: "pl_parcerias", stageId: "st_p_indicando",
    companyId: "c_eletricaSol", personId: undefined, otherPersonIds: [], value: 0, responsibleId: "u_cledson",
    enteredStageAt: daysAgo(30), tags: [], risk: "baixo", fields: { indicacoes: "4 no mês" }, createdAt: daysAgo(120),
  },
];

export const timeline: TimelineEvent[] = [
  { id: "t1", dealId: "d_solarvale_expansao", kind: "automacao", title: "Automação · lembrete de follow-up criado", detail: "Regra: proposta vista 3× sem resposta em 48 h", author: "sistema", at: new Date(now - 3600000 * 3).toISOString() },
  { id: "t2", dealId: "d_solarvale_expansao", kind: "email_enviado", title: "E-mail enviado · Proposta P-238 v2", detail: "Anexo · Proposta_P-238_v2.pdf · entregue · aberto 3× · 1 clique", author: "Cledson C.", at: new Date(now - 3600000 * 3.5).toISOString() },
  { id: "t3", dealId: "d_solarvale_expansao", kind: "email_recebido", title: "E-mail recebido · Marcos Andrade", detail: "“Recebi a proposta revisada. Vou levar pro meu sócio e te retorno até sexta.”", at: new Date(now - 3600000 * 4).toISOString() },
  { id: "t4", dealId: "d_solarvale_expansao", kind: "proposta", title: "Proposta P-238 v2 enviada por WhatsApp", detail: "R$ 148.900 · válida até " + new Date(daysAhead(3)).toLocaleDateString("pt-BR") + " · visualizada 3× · aceite pendente", author: "Cledson C.", at: daysAgo(4) },
  { id: "t5", dealId: "d_solarvale_expansao", kind: "etapa", title: "Mudança de etapa · Levantamento → Proposta", detail: "por Cledson C.", author: "Cledson C.", at: daysAgo(6) },
  { id: "t6", dealId: "d_solarvale_expansao", kind: "visita", title: "Visita técnica concluída", detail: "6 fotos · checklist 12/12 · OS #431", at: daysAgo(7) },
  { id: "t7", dealId: "d_solarvale_expansao", kind: "whatsapp_recebido", title: "WhatsApp recebido", detail: "“Podem me mandar o orçamento?”", at: daysAgo(11) },
];

export const dealActivities: DealActivity[] = [
  { id: "a1", dealId: "d_solarvale_expansao", title: "Follow-up proposta · ligação", type: "ligacao", at: new Date(now + 3600000 * 5).toISOString(), responsibleId: "u_cledson", done: false },
  { id: "a2", dealId: "d_solarvale_expansao", title: "Enviar comparativo", type: "tarefa", at: daysAhead(0), responsibleId: "u_cledson", done: false },
  { id: "a3", dealId: "d_solarvale_expansao", title: "Confirmar ART", type: "tarefa", at: daysAhead(3), responsibleId: "u_cledson", done: false },
];

export const automations: Automation[] = [
  {
    id: "au_followup", name: "Follow-up de proposta sem retorno", description: "proposta enviada → espera 2 d úteis → tarefa + WhatsApp se não respondeu",
    scopeLabel: "Vendas / Proposta", pipelineId: "pl_vendas", stageId: "st_v_proposta", triggerLabel: "Proposta enviada",
    status: "ativa", version: 5, publishedVersion: 4, publishedAt: daysAgo(9), execs7d: 128, failures7d: 9,
    flow: {
      main: [
        { id: "n1", kind: "gatilho", title: "Proposta enviada", subtitle: "funil Vendas · etapa Proposta" },
        { id: "n2", kind: "espera", title: "2 dias úteis" },
      ],
      branchCondition: { id: "n3", kind: "condicao", title: "Cliente respondeu?", subtitle: "E · proposta não aceita" },
      simPath: [{ id: "n4", kind: "acao", title: "Mover para Negociação" }],
      noPath: [
        { id: "n5", kind: "acao", title: "Criar tarefa de follow-up" },
        { id: "n6", kind: "acao", title: "Enviar template WhatsApp" },
        { id: "n7", kind: "acao", title: "Notificar gestor se sem resposta 5 d" },
      ],
    },
  },
  {
    id: "au_gestor", name: "Aviso ao gestor", description: "proposta > R$ 200 mil",
    scopeLabel: "Vendas / Proposta", pipelineId: "pl_vendas", stageId: "st_v_proposta", triggerLabel: "Proposta enviada",
    status: "ativa", version: 1, execs7d: 6,
  },
  {
    id: "au_recusa", name: "Recusa → reativação", description: "proposta recusada → cria negócio em Reativação",
    scopeLabel: "Vendas / Proposta", pipelineId: "pl_vendas", stageId: "st_v_proposta", triggerLabel: "Proposta recusada",
    status: "rascunho", version: 1, execs7d: 0,
  },
  {
    id: "au_handoff", name: "Handoff de venda ganha", description: "negócio ganho → cria Projeto de Engenharia e Pós-venda",
    scopeLabel: "Global", pipelineId: "pl_vendas", stageId: "st_v_ganho", triggerLabel: "Negócio ganho",
    status: "ativa", version: 2, execs7d: 14,
  },
  {
    id: "au_homolog", name: "Alerta de atraso de homologação", description: "tempo na etapa > 20 dias → notifica gestor",
    scopeLabel: "Engenharia", triggerLabel: "Tempo na etapa > 20 d",
    status: "com_erro", version: 1, execs7d: 31, failures7d: 9,
  },
  {
    id: "au_entrega", name: "Entrega concluída → onboarding", description: "projeto mudou de etapa → libera Pós-venda",
    scopeLabel: "Eng. → Pós-venda", triggerLabel: "Projeto mudou de etapa",
    status: "ativa", version: 3, execs7d: 9,
  },
  {
    id: "au_roundrobin", name: "Distribuição round-robin SDR", description: "negócio criado → distribui para o próximo SDR disponível",
    scopeLabel: "SDR / Entrada", pipelineId: "pl_sdr", stageId: "st_s_entrada", triggerLabel: "Negócio criado",
    status: "pausada", version: 6, execs7d: 0,
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv_juliana", channel: "whatsapp", contactLabel: "Juliana Prado", personId: "p_juliana",
    companyId: "c_solarvale", dealId: "d_solarvale_expansao", responsibleId: "u_cledson",
    status: "esperando", lastMessageAt: new Date(now - 18 * 60000).toISOString(), tags: ["proposta"],
  },
  {
    id: "conv_aurora", channel: "whatsapp", contactLabel: "Condomínio Aurora", companyId: "c_aurora",
    responsibleId: "u_cledson", status: "esperando", lastMessageAt: new Date(now - 3600000).toISOString(), tags: [],
  },
  {
    id: "conv_novolead", channel: "whatsapp", contactLabel: "(84) 9 9123-4477",
    status: "esperando", lastMessageAt: new Date(now - 8 * 60000).toISOString(), tags: ["desconhecido"],
  },
  {
    id: "conv_julio", channel: "whatsapp", contactLabel: "Júlio Medeiros", personId: "p_julio",
    companyId: "c_agroboavista", dealId: "d_sdr_boavista", responsibleId: "u_iara",
    status: "atendendo", lastMessageAt: new Date(now - 2 * 3600000).toISOString(), tags: [],
  },
  {
    id: "conv_padaria", channel: "email", contactLabel: "Padaria Central", companyId: "c_padaria",
    responsibleId: "u_bruno", status: "finalizada", lastMessageAt: daysAgo(2), tags: [],
  },
];

export const messages: Message[] = [
  { id: "m1", conversationId: "conv_juliana", from: "cliente", body: "Recebi a proposta revisada, vou levar pro meu sócio.", at: daysAgo(1) },
  { id: "m2", conversationId: "conv_juliana", from: "atendente", authorName: "Cledson C.", body: "Perfeito! Fico no aguardo, qualquer dúvida me chama.", at: new Date(now - 20 * 3600000).toISOString() },
  { id: "m3", conversationId: "conv_juliana", from: "cliente", body: "Consegue enviar a simulação de 12x?", at: new Date(now - 18 * 60000).toISOString() },

  { id: "m4", conversationId: "conv_aurora", from: "cliente", body: "Boa tarde! Recebemos a proposta, vamos avaliar internamente.", at: new Date(now - 3600000).toISOString() },

  { id: "m5", conversationId: "conv_novolead", from: "cliente", body: "Oi, vi o anúncio de vocês. Quanto custa uma instalação de 5kWp?", at: new Date(now - 8 * 60000).toISOString() },

  { id: "m6", conversationId: "conv_julio", from: "atendente", authorName: "Iara F.", body: "Júlio, tudo certo pra reunião de amanhã às 15h?", at: new Date(now - 3 * 3600000).toISOString() },
  { id: "m7", conversationId: "conv_julio", from: "cliente", body: "Sim! Vamos precisar reagendar pra 15h30, pode ser?", at: new Date(now - 2 * 3600000).toISOString() },

  { id: "m8", conversationId: "conv_padaria", from: "atendente", authorName: "Bruno T.", body: "Segue o contrato assinado, obrigado pela parceria!", at: daysAgo(2) },
  { id: "m9", conversationId: "conv_padaria", from: "cliente", body: "Recebido, muito obrigado!", at: daysAgo(2) },
];

export const QUICK_REPLIES = [
  { label: "Saudação", text: "Olá! Tudo bem? Como posso ajudar hoje?" },
  { label: "Enviar proposta", text: "Segue a proposta em anexo. Qualquer dúvida, estou à disposição!" },
  { label: "Follow-up", text: "Oi! Passando para saber se conseguiu avaliar a proposta. Posso ajudar em algo?" },
  { label: "Agradecimento", text: "Muito obrigado pelo seu tempo! Qualquer coisa, é só chamar." },
];
