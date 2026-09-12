# Solan CRM

CRM operacional para integradores solares, construído a partir da especificação e dos wireframes do
**Solan CRM** (Negócios, Engenharia, Pós-venda, OS, Conversas, Propostas, Automações, Dashboards).

## Escopo desta versão (v1)

Esta primeira entrega reproduz com fidelidade o **fluxo comercial completo** — telas, sequências, modais,
drawers e edição ao vivo — exatamente como especificado no wireframe:

- **Shell principal** com busca global, criar rápido e notificações
- **Meu Dia** — fila de trabalho priorizada por risco/SLA
- **Negócios** — Kanban e Lista, com os 4 funis comerciais (Vendas, SDR, Reativação, Parcerias)
- **Novo Negócio** com cadastro contextual de Pessoa/Empresa em submodal (preserva contexto)
- **Detalhe do Negócio** — janela operacional unificada (contato, empresa, timeline, checklist, proposta)
- **Editar funil em modo live** — sem modal: renomear inline, arrastar colunas, tipo de etapa (Aberta/Ganho/Perdido)
- **Gate de movimentação de etapa**, **Ganhar negócio** (com handoff para Engenharia/Pós-venda) e **Perder negócio**
- **Pessoas e Empresas** — lista, fichas e formulários mini reutilizáveis
- **Automações** — central global + editor visual em canvas (gatilho → espera → condição → ações), teste e insights
- **Dashboard do Gestor** e **Tarefas**

Engenharia, Pós-venda, Ordens de Serviço, Conversas/Inbox, E-mail, Formulários, assinatura digital completa e
Configurações administrativas aparecem no menu com uma tela de "próxima versão" — a navegação inteira existe,
mas o conteúdo profundo desses módulos é a próxima rodada.

Este protótipo é **client-side**: os dados (negócios, pessoas, empresas, automações) vivem no `localStorage`
do navegador via Zustand, sem backend/banco real ainda. Ideal para validar telas e fluxos antes de investir na
API e nas integrações reais (WhatsApp, assinatura digital, e-mail).

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Zustand (estado + persistência local)
- @hello-pangea/dnd (arrastar e soltar do Kanban)
- Radix UI (modal, drawer, dropdown, tabs)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Build de produção

```bash
npm run build
npm start
```
