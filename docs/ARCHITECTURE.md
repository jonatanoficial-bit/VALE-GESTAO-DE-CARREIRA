# Arquitetura do Projeto — Vale Produção

**BUILD:** BUILD 2026-03-06 12:53 -03

## Visão geral
Aplicativo **mobile-first** para cantores e bandas preencherem um questionário e receberem um relatório premium com:
- score geral e por pilares
- diagnóstico executivo
- plano 30/90/365 dias
- analytics heurístico
- plano de conteúdo
- press kit automático
- campanhas por lançamento
- histórico, comparação e admin local

## Stack atual
- Frontend estático: HTML + CSS + JS (ES Modules)
- Persistência local: `localStorage`
- PWA básica: `manifest.webmanifest` + `sw.js`
- Deploy: GitHub Pages / Vercel

## Módulos principais
- `js/data/questions.js` — motor de coleta
- `js/data/build-info.js` — build, progresso e metadados do projeto
- `js/core/report.js` — IA estratégica local v2
- `js/core/analytics.js` — leitura heurística das métricas
- `js/core/content-plan.js` — geração de 30 ideias de conteúdo
- `js/core/presskit.js` — press kit automático
- `js/core/campaigns.js` — gerador de campanha por lançamento
- `js/core/compare.js` — evolução entre relatórios
- `js/core/admin.js` — área admin local
- `js/core/storage.js` — histórico local

## Pilares estratégicos atuais
1. Produto
2. Marca
3. Conteúdo
4. Marketing
5. Audiência
6. Monetização
7. Operação

## O que já está resolvido nesta build
- Visual premium mais forte
- Correção de inconsistências na pontuação
- Relatório executivo com leitura mais inteligente
- Roadmap 90 dias
- Comparação entre relatórios diretamente na UI
- Estrutura offline-first mais pronta para instalação
- Build e progresso expostos para o time

## O que ainda falta para 100%
- Multiusuário e login
- Banco remoto
- Cobrança/planos
- PDF server-side fixo
- Internacionalização real (PT/EN/ES)
- Conectores externos (Spotify/YouTube/Meta)
- IA em nuvem / modelos avançados
- Painel de acompanhamento por equipe/consultor
