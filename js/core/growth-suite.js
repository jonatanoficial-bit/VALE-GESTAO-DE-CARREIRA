import { safeText, formatNumber } from "../utils.js";

function n(v){ return (typeof v === "number" && Number.isFinite(v)) ? v : 0; }
function t(v){ return safeText(v || "").trim(); }
function clamp(v, min=0, max=100){ return Math.max(min, Math.min(max, Math.round(v))); }

function genreLabel(v){
  const map = {
    gospel: "gospel", sertanejo: "sertanejo", funk: "urbano", pop: "pop", rap: "rap", rock: "rock", pagode: "pagode", eletronica: "eletrônica", outros: "híbrida"
  };
  return map[v] || "musical";
}

function benchmarkBand(score){
  if(score >= 82) return { label: "Internacional indie competitivo", color: "good" };
  if(score >= 68) return { label: "Projeto comercial em aceleração", color: "good" };
  if(score >= 52) return { label: "Projeto em crescimento organizado", color: "mid" };
  return { label: "Base em consolidação", color: "low" };
}

export function buildGrowthSuite({ answers = {}, reportResult = null, analytics = null, commercial = null } = {}){
  const score = Number(reportResult?.overall || 0);
  const listeners = n(answers.monthly_listeners_num);
  const spotify = n(answers.spotify_followers_num);
  const instagram = n(answers.instagram_followers_num);
  const tiktok = n(answers.tiktok_followers_num);
  const youtube = n(answers.youtube_subs_num);
  const team = t(answers.team);
  const planning = t(answers.planning);
  const shows = t(answers.shows);
  const ads = t(answers.ads_budget);
  const goal = t(answers.goal);
  const genre = genreLabel(t(answers.genre));
  const artist = t(answers.artist_name || 'Artista');
  const audience = listeners + spotify + instagram + tiktok + youtube;
  const band = benchmarkBand(score);

  const benchmark = [
    {
      name: 'Produto vs mercado',
      mine: score,
      target: score >= 75 ? 85 : score >= 55 ? 72 : 60,
      hint: 'Mostra o quanto o projeto já se aproxima de uma operação vendável.'
    },
    {
      name: 'Audiência acionável',
      mine: clamp((Math.log10(audience + 1) / Math.log10(250000 + 1)) * 100),
      target: audience > 25000 ? 70 : 55,
      hint: 'Mede o tamanho de base que já pode reagir a lançamentos, agenda e produtos.'
    },
    {
      name: 'Execução comercial',
      mine: clamp((Number(commercial?.readiness || 0) * 0.78) + (planning === 'pro' ? 10 : planning === 'bom' ? 6 : 0) + (team === 'time' || team === 'completa' ? 7 : 0)),
      target: 74,
      hint: 'Avalia capacidade de transformar atenção em agenda, ticket e receita recorrente.'
    }
  ];

  const showBase = commercial?.readiness >= 75 ? 4500 : commercial?.readiness >= 60 ? 2400 : commercial?.readiness >= 45 ? 1200 : 700;
  const eventBase = Math.round(showBase * 1.6);
  const featureBase = commercial?.readiness >= 70 ? 1800 : commercial?.readiness >= 55 ? 950 : 450;
  const ugcBase = commercial?.readiness >= 70 ? 1200 : commercial?.readiness >= 55 ? 700 : 350;

  const pricing = [
    {
      name: 'Show base / pocket',
      price: `R$ ${formatNumber(showBase)}`,
      rationale: 'Faixa de entrada para vender agenda sem perder valor percebido.',
      script: 'Este formato entrega repertório forte, presença profissional e CTA de contratação para próximos eventos.'
    },
    {
      name: 'Evento premium / igreja / corporativo',
      price: `R$ ${formatNumber(eventBase)}`,
      rationale: 'Ticket ampliado para datas mais valiosas, com estrutura e deslocamento.',
      script: 'Aqui a proposta inclui experiência completa, alinhamento de repertório e material de divulgação.'
    },
    {
      name: 'Feat / participação / collab',
      price: `R$ ${formatNumber(featureBase)}`,
      rationale: 'Serve como âncora para participação estratégica e parceria remunerada.',
      script: 'A parceria entra com entrega clara, calendário definido e plano de divulgação cruzada.'
    },
    {
      name: 'Pacote creator / UGC / promo cut',
      price: `R$ ${formatNumber(ugcBase)}`,
      rationale: 'Oferta leve para creators, marcas ou parceiros que precisam de peça curta e rápida.',
      script: 'O pacote é desenhado para circulação rápida, aprovação simples e reaproveitamento em Reels/Shorts.'
    }
  ];

  const sprint = [
    {
      label: 'Sprint 1 · Base que vende',
      tasks: [
        'alinhar bio, capa, pitch e CTA principal em todas as plataformas',
        'fechar 1 oferta principal e 1 oferta de entrada com preço público',
        'selecionar a música/ativo mais forte para puxar os próximos 21 dias'
      ]
    },
    {
      label: 'Sprint 2 · Prova social e conversão',
      tasks: [
        'publicar 7 peças derivadas do mesmo ativo forte em vídeo curto',
        'registrar prints, números, palco, bastidores e depoimentos como prova social',
        'abrir lista quente com 20 contatos para agenda, collab ou creators'
      ]
    },
    {
      label: 'Sprint 3 · Escala controlada',
      tasks: [
        'rodar follow-up em 3 mensagens para leads, casas, igrejas ou parceiros',
        'medir resposta por canal e concentrar energia no melhor canal da semana',
        'documentar aprendizados e salvar no histórico para a próxima build'
      ]
    }
  ];

  const integrations = [
    {
      label: 'GitHub + Vercel prontos',
      status: 'ok',
      detail: 'Projeto já pode ser versionado e publicado sem backend pago.'
    },
    {
      label: 'Pacote de métricas futuras',
      status: 'next',
      detail: 'Preparar campos para Spotify, YouTube, Meta e campanhas quando houver API/chaves.'
    },
    {
      label: 'Analytics de produto',
      status: 'next',
      detail: 'Mapear eventos: início, abandono, geração de relatório, exportação e retorno ao histórico.'
    },
    {
      label: 'Camada comercial',
      status: 'ok',
      detail: 'Oferta, projeção de receita e pricing já estão modelados localmente.'
    },
    {
      label: 'Conta e sincronização',
      status: 'future',
      detail: 'Falta backend para autenticação, nuvem e colaboração multiusuário real.'
    }
  ];

  const expansion = [
    `${artist} já tem base para vender com estética ${genre} mais forte e operação repetível.`,
    `Objetivo dominante: ${reportResult?.insights?.goalLabel || 'crescimento'} com foco em execução semanal, não só planejamento.`,
    team === 'solo' ? 'Prioridade máxima: delegar pelo menos design, social ou comercial.' : 'Aproveite a equipe existente para documentar rotina e reduzir retrabalho.',
    shows === 'nao' ? 'Construa vídeo de performance e prova social antes de aumentar ticket.' : 'Use agenda/show como motor principal de caixa e conteúdo.',
    ads === 'none' ? 'Sem investir dinheiro agora, concentre esforço em criativos derivados e outreach orgânico.' : 'Trate mídia paga como aceleração de criativo vencedor, não como solução isolada.'
  ];

  const enterpriseMode = score >= 82
    ? { label: 'Modo Agência / Selo', color: 'good' }
    : score >= 63
      ? { label: 'Modo Equipe / Manager', color: 'mid' }
      : { label: 'Modo Artista Solo', color: 'low' };

  const enterprisePillars = [
    { name: 'Operação', value: team === 'solo' ? 'solo com apoio pontual' : 'time ou parceiros já acionáveis' },
    { name: 'Comercial', value: commercial?.readiness >= 70 ? 'oferta repetível pronta' : 'estrutura comercial em consolidação' },
    { name: 'Documentação', value: planning === 'pro' || planning === 'bom' ? 'ritmo documentado' : 'precisa formalizar processos' },
    { name: 'Escala', value: audience >= 50000 ? 'já pode testar múltiplas frentes' : 'escalar com foco em 1 canal vencedor' }
  ];

  const enterpriseSummary = `${artist} deve operar em ${enterpriseMode.label.toLowerCase()} nesta build. A melhor configuração agora combina processo simples, handoff claro e uma esteira comercial que permita vender, entregar e repetir sem aumentar custo fixo.`;

  const marketplace = [
    {
      tag: 'DLC',
      name: 'Marketing Digital',
      valueAdd: '+aquisição',
      summary: 'Aumenta alcance e conversão com criativos, calendário e funil de campanha.',
      deliverables: ['plano de criativos por lançamento', 'roteiros para anúncios e collabs', 'painel de métricas por objetivo']
    },
    {
      tag: 'DLC',
      name: 'Monetização Musical',
      valueAdd: '+receita',
      summary: 'Expande ticket com ofertas, comunidade, merch e serviços musicais.',
      deliverables: ['escada de produtos', 'oferta recorrente', 'scripts de conversão e follow-up']
    },
    {
      tag: 'DLC',
      name: 'Shows e Turnês',
      valueAdd: '+agenda',
      summary: 'Transforma prova social em agenda vendável por cidade, igreja, casa ou evento.',
      deliverables: ['pipeline de booking', 'proposta comercial por praça', 'mapa de repertório e formatos']
    },
    {
      tag: 'DLC',
      name: 'Carreira Internacional',
      valueAdd: '+global',
      summary: 'Prepara pitch, comunicação e expansão para mercados e parceiros internacionais.',
      deliverables: ['pitch multilíngue', 'priorização de mercados', 'checklist de creators e mídia']
    },
    {
      tag: 'DLC',
      name: 'Branding Premium',
      valueAdd: '+percepção',
      summary: 'Fortalece identidade visual, posicionamento e percepção de valor do artista.',
      deliverables: ['direção estética', 'guia de voz e mensagem', 'padrão visual para capas e campanhas']
    }
  ];

  const artistTier = score >= 88
    ? { label: 'Elite', color: 'good', summary: `${artist} já apresenta maturidade para competir com projetos comerciais independentes de alto padrão.` }
    : score >= 75
      ? { label: 'Profissional', color: 'good', summary: `${artist} já tem sinais fortes de produto vendável e precisa sustentar consistência operacional.` }
      : score >= 61
        ? { label: 'Crescimento', color: 'mid', summary: `${artist} está em crescimento organizado, com espaço claro para aumentar percepção de valor e repetição comercial.` }
        : score >= 46
          ? { label: 'Estruturando', color: 'mid', summary: `${artist} já saiu da fase inicial, mas ainda precisa consolidar marca, oferta e rotina.` }
          : { label: 'Iniciante', color: 'low', summary: `${artist} ainda está montando a base essencial para operar como produto musical competitivo.` };

  const globalReadiness = [
    {
      label: 'Marca exportável',
      score: clamp(score * 0.92 + (planning === 'pro' ? 6 : 0)),
      hint: 'Mede clareza de identidade, consistência estética e capacidade de ser entendido fora do contexto local.'
    },
    {
      label: 'Operação multilíngue',
      score: clamp(28 + (team !== 'solo' ? 15 : 0) + (commercial?.readiness || 0) * 0.45),
      hint: 'Avalia preparo para adaptar pitch, conteúdo e atendimento em mais de um idioma.'
    },
    {
      label: 'Monetização escalável',
      score: clamp((commercial?.readiness || 0) * 0.88 + (shows !== 'nao' ? 10 : 0)),
      hint: 'Indica se o projeto consegue crescer receita sem depender de uma única fonte ou praça.'
    }
  ];

  return {
    benchmarkBand: band,
    benchmark,
    pricing,
    sprint,
    integrations,
    expansion,
    enterpriseMode,
    enterprisePillars,
    enterpriseSummary,
    marketplace,
    artistTier,
    globalReadiness,
    summary: `${artist} entra na fase de execução comercial com benchmark ${band.label.toLowerCase()}. O projeto já consegue operar como produto vendável, desde que mantenha disciplina de sprint, oferta clara, documentação das próximas melhorias e escolha correta do modo enterprise.`
  };
}
