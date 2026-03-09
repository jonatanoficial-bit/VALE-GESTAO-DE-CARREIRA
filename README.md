# Vale Produção — Gestão de Carreira Musical

**BUILD:** BUILD 2026-03-06 12:53 -03

Aplicativo web estático para diagnóstico de carreira musical com **IA estratégica local**, relatório executivo, plano de 30/90/365 dias, campanhas, press kit, comparação de evolução e área admin local.

## Status atual do produto
- **Conclusão estimada:** 64%
- **Marco atual:** Etapa 3 de 7 · Premium Beta Offline
- **Deploy alvo:** GitHub Pages + Vercel
- **Perfil do produto:** SaaS/consultoria híbrida offline-first, sem custo inicial obrigatório

## O que esta build entrega
- Relatório premium com score geral e por pilares
- Diagnóstico executivo com forças, riscos, oportunidades e quick wins
- Plano de 90 dias e cronograma mensal/anual
- Analytics heurístico com metas e insights
- Plano de conteúdo com 30 ideias
- Press kit automático
- Campanhas por lançamento
- Histórico local, área admin e comparação entre relatórios
- Manifesto PWA, service worker e suporte básico a instalação
- Estrutura pronta para GitHub Pages e Vercel

## Rodar localmente
Abra `index.html` no navegador.

Para um servidor local simples:
- VSCode Live Server, ou
- `python -m http.server 8080`

## Publicar no GitHub Pages
1. Suba a pasta do projeto para a raiz do repositório
2. GitHub → Settings → Pages
3. Source: Deploy from a branch → `main` → `/root`
4. Aguarde a URL pública

## Publicar na Vercel
1. Importe o repositório na Vercel
2. Framework preset: **Other**
3. Build command: vazio
4. Output directory: `.`
5. Deploy

## Documentação para equipe
- `docs/PROJECT-STATUS.md`
- `docs/PROJECT-STATUS.json`
- `docs/BUILD-2026-03-06-1253.md`
- `docs/EVOLUTION-ROADMAP.md`
- `docs/ARCHITECTURE.md`

## Próxima fase recomendada
Backend leve (Supabase/Firebase), autenticação, multiusuário, cobrança e exportação PDF server-side.

## Créditos
Criado por Jonatan Vale • Direitos reservados
