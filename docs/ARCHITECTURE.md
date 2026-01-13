# Arquitetura do Projeto — Gerenciador de Carreira (Vale Produção)

## Objetivo
Construir um **site/app mobile-first** (responsivo) que permite a cantores e bandas preencherem um questionário e, ao final, receberem um **relatório completo** com:
- status/estágio de carreira
- análise por pilares (streaming, marketing, monetização etc.)
- recomendações personalizadas (baseadas nas respostas)
- cronograma mensal (4 semanas) e anual (12 meses)
- checklist executável
- opção de **imprimir / salvar em PDF**

## Princípios de Produto (Premium AAA)
1. **UX de alto padrão**: fluxo simples, telas limpas, feedback rápido, linguagem objetiva.
2. **Performance**: sem frameworks no MVP. HTML/CSS/JS puro, modular (ES Modules).
3. **Mobile-first real**: layout pensado para toque e telas pequenas; desktop é “upgrade”.
4. **Dados no dispositivo**: MVP sem login; usa `localStorage` para salvar progresso.
5. **Evolutivo**: arquitetura preparada para:
   - autenticação por usuário
   - painel de métricas (APIs de Spotify/YouTube/Meta)
   - exportação PDF real (geração server-side)
   - módulos premium por assinatura/contrato

---

## Escopo (Fases)

### Fase 1 — MVP (já iniciado no repositório)
- Landing premium com marca (logo Vale Produção)
- Wizard multi-etapas com perguntas
- Motor de pontuação por pilares + estágio
- Relatório com:
  - score geral e por pilares
  - prioridades (30 dias), checklist
  - cronograma mensal e anual
  - recomendações personalizadas
  - impressão / PDF via `window.print()`
- Persistência local (localStorage)

### Fase 2 — V1 (produção)
- Biblioteca de perguntas “expandível” (JSON versionado)
- Perguntas condicionais (branching)
- Perfis de estratégia (por objetivo: viral, shows, internacional etc.)
- Exportação PDF “real” (layout fixo) e compartilhamento
- i18n (PT/EN/ES) para internacionalização

### Fase 3 — V2 (métricas e automações)
- Conectores:
  - Spotify for Artists (quando possível via APIs e permissões)
  - YouTube Data API
  - Meta (Instagram/Facebook) insights
- Painel de evolução e metas
- Alertas (tarefas semanais/mensais)
- Biblioteca de templates de lançamento (checklists)

---

## Arquitetura Técnica

### Stack
- **Frontend**: HTML + CSS + JS (ES Modules)
- **Build**: nenhum (MVP). Compatível com GitHub Pages.
- **Persistência**: `localStorage` (MVP)
- **Assets**: `assets/logo.png` (marca Vale Produção)

### Pastas
- `/index.html`  
  Estrutura de telas (Landing, Wizard, Report) e carregamento do app.
- `/css/styles.css`  
  Tema premium, mobile-first, print styles para PDF.
- `/js/app.js`  
  Orquestra o fluxo: navegação, render do wizard, geração do relatório.
- `/js/data/questions.js`  
  Base de perguntas (fácil de ampliar sem mexer em lógica).
- `/js/core/report.js`  
  Motor: pontuação por pilares, estágio, recomendações e cronogramas.
- `/js/utils.js`  
  Funções utilitárias (toast, clamp etc.)
- `/docs/ARCHITECTURE.md`  
  Este documento.

### Fluxo de dados
1. `QUESTIONS` define perguntas e options com scores
2. `app.js` renderiza uma pergunta por vez e salva respostas no `localStorage`
3. Ao finalizar, `report.js` calcula:
   - `pillarScores` (0–100)
   - `overall` (média ponderada)
   - `stage` (iniciante → pro)
   - `plans` (prioridades/checklist/timelines/recs)
4. `app.js` injeta o resultado na UI do relatório

### Estratégia de Pontuação
- `single`: usa score do option (0–100)
- `multi`: soma opções e normaliza para não dominar
- `text/textarea`: contribui levemente como “completude” estratégica (ajustável)
- pesos por pilar podem ser calibrados conforme uso real.

---

## Segurança e Integridade do Projeto
- Sem dependências externas no MVP.
- Sem armazenamento remoto e sem coleta de dados.
- Sem dados sensíveis (não solicitamos senha).
- Código modular e legível; fácil auditoria.

---

## Experiência Premium (Design System)
- Paleta: **preto + dourado** alinhada ao logo.
- Componentes: cards, chips, progress, choice, timelines.
- Microinterações: hover/active, transições suaves, toasts.
- Impressão/PDF: layout limpo, sem topbar/ações.

---

## Publicação no GitHub Pages
1. Suba a pasta do projeto no repositório (raiz)
2. GitHub → Settings → Pages
3. Source: Deploy from a branch → `main` → `/root`
4. Acesse a URL gerada

---

## Próximos passos imediatos (após MVP)
1. Aumentar banco de perguntas (mais granularidade)
2. Branching (perguntas condicionais)
3. Módulo “Métricas” com estrutura de campos (mesmo sem API inicialmente)
4. Exportação PDF melhorada (layout A4 + capa)
