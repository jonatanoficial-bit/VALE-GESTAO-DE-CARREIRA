import { safeText, formatNumber } from "../utils.js";

function n(v){ return (typeof v === 'number' && Number.isFinite(v)) ? v : 0; }
function t(v){ return safeText(v || '').trim(); }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function hasRevenue(arr, key){ return Array.isArray(arr) && arr.includes(key); }

function genreLabel(v){
  const map = {
    gospel: 'gospel', sertanejo: 'sertanejo', funk: 'urbano', pop: 'pop', rap: 'rap', rock: 'rock', pagode: 'pagode', eletronica: 'eletrônica', outros: 'híbrido'
  };
  return map[v] || 'musical';
}

function stageBucket(score){
  if(score >= 80) return 'elite';
  if(score >= 65) return 'growth';
  if(score >= 50) return 'foundation';
  return 'build';
}

export function buildCommercialPlan({ answers = {}, reportResult = null, analytics = null } = {}){
  const revenueSources = Array.isArray(answers.revenue_sources) ? answers.revenue_sources.filter(Boolean) : [];
  const score = Number(reportResult?.overall || 0);
  const goal = t(answers.goal || 'crescer_stream');
  const goalLabel = reportResult?.insights?.goalLabel || 'crescimento';
  const stage = reportResult?.stage?.label || 'Projeto em desenvolvimento';
  const artist = t(answers.artist_name || 'Artista');
  const genre = genreLabel(t(answers.genre));
  const ml = n(answers.monthly_listeners_num);
  const sf = n(answers.spotify_followers_num);
  const ig = n(answers.instagram_followers_num);
  const tt = n(answers.tiktok_followers_num);
  const yt = n(answers.youtube_subs_num);
  const shows = t(answers.shows);
  const team = t(answers.team);
  const planning = t(answers.planning);
  const ads = t(answers.ads_budget);
  const bucket = stageBucket(score);

  let readiness = 20;
  readiness += clamp(Math.round(score * 0.45), 0, 45);
  readiness += hasRevenue(revenueSources, 'shows') ? 10 : 0;
  readiness += hasRevenue(revenueSources, 'streaming') ? 6 : 0;
  readiness += hasRevenue(revenueSources, 'aulas') ? 5 : 0;
  readiness += hasRevenue(revenueSources, 'merch') ? 5 : 0;
  readiness += (shows === 'mensal' || shows === 'semanal') ? 8 : 0;
  readiness += (planning === 'bom' || planning === 'pro') ? 6 : 0;
  readiness += (team === 'time' || team === 'completa') ? 5 : 0;
  readiness += (ads === 'mid' || ads === 'high') ? 4 : 0;
  readiness = clamp(readiness, 0, 100);

  let lane = 'Validação comercial';
  if(readiness >= 75) lane = 'Escala comercial';
  else if(readiness >= 55) lane = 'Produto comercial beta';
  else if(readiness >= 40) lane = 'Pré-comercial estruturado';

  const baseShow = score >= 75 ? 3500 : score >= 60 ? 1800 : score >= 45 ? 900 : 500;
  const baseService = score >= 75 ? 2500 : score >= 60 ? 1400 : score >= 45 ? 700 : 350;
  const communityMonthly = score >= 70 ? 29 : score >= 55 ? 19 : 12;

  const offers = [
    {
      tier: 'Entrada',
      name: goal === 'fechar_shows' ? 'Pocket Showcase' : 'Diagnóstico + Call Estratégica',
      price: `R$ ${formatNumber(baseShow)}`,
      summary: goal === 'fechar_shows'
        ? 'Show enxuto, repertório forte e proposta comercial objetiva para abrir mercado local.'
        : 'Oferta inicial de baixo atrito para transformar interesse em conversa séria e prova de valor.',
      bullets: [
        'entregável claro em 1 página',
        'CTA único e fácil de comprar',
        'uso em bio, direct e WhatsApp'
      ]
    },
    {
      tier: 'Core',
      name: goal === 'monetizar' ? 'Pacote Receita 90D' : 'Show / Campanha Principal',
      price: `R$ ${formatNumber(baseService)}`,
      summary: 'Oferta central que concentra posicionamento, promessa e margem. Deve receber a melhor comunicação.',
      bullets: [
        'proposta visual profissional',
        'prova social e métricas-chave',
        'roteiro de follow-up em 3 mensagens'
      ]
    },
    {
      tier: 'Recorrência',
      name: 'Comunidade / Clube / Assinatura',
      price: `R$ ${communityMonthly}/mês`,
      summary: 'Camada opcional para fãs mais quentes: bastidores, prévias, descontos, grupo fechado ou conteúdo premium.',
      bullets: [
        'aumenta LTV do público',
        'funciona mesmo com base pequena',
        'ajuda a financiar próximos lançamentos'
      ]
    }
  ];

  const estimatedMonthly = {
    conservative: Math.round(baseShow * (shows === 'nao' ? 1 : 2) + communityMonthly * Math.max(15, Math.round(sf * 0.01))),
    target: Math.round(baseShow * (shows === 'ocasional' ? 2 : 3) + baseService * 1 + communityMonthly * Math.max(30, Math.round((ig + sf) * 0.012))),
    stretch: Math.round(baseShow * (shows === 'mensal' || shows === 'semanal' ? 5 : 3) + baseService * 2 + communityMonthly * Math.max(60, Math.round((ig + sf + yt) * 0.018)))
  };

  const launchChecklist = [
    'definir a oferta principal em 1 frase',
    'fechar CTA único para bio, direct e link da campanha',
    'publicar prova social: números, depoimento, palco ou bastidor real',
    'montar 10 contatos quentes para outreach comercial',
    'preparar press kit curto com foto, bio e proposta',
    'revisar preço-base, objeções e resposta padrão de negociação'
  ];
  if(shows === 'nao') launchChecklist.push('gravar vídeo curto de performance ao vivo para vender agenda');
  if(!hasRevenue(revenueSources, 'merch')) launchChecklist.push('testar oferta leve de merch ou item digital antes de investir pesado');
  if(planning === 'zero' || planning === 'basico') launchChecklist.push('criar calendário de 4 semanas com conteúdo + comercial + follow-up');

  const betaFeatures = [
    'camada de monetização com ofertas sugeridas',
    'projeção de receita por cenário',
    'checklist de lançamento comercial',
    'roadmap de upgrades e DLC do produto'
  ];

  const dlc = [
    { name: 'DLC Booking Pro', value: 'pipeline de casas, proposta comercial e agenda por cidade' },
    { name: 'DLC Fan Club', value: 'assinatura, perks, comunidade e calendário premium' },
    { name: 'DLC Internacional', value: 'versões de pitch, calendário regional e comunicação multilíngue' }
  ];

  let summary = `${artist} está em ${lane.toLowerCase()}, com prontidão comercial ${readiness}/100 e estágio ${stage.toLowerCase()}. `;
  summary += `O melhor caminho agora é vender uma oferta ${bucket === 'build' ? 'simples e objetiva' : 'clara, repetível e escalável'}, conectada ao objetivo de ${goalLabel.toLowerCase()}. `;
  summary += `A identidade ${genre} precisa aparecer tanto no conteúdo quanto na proposta comercial.`;

  return {
    readiness,
    lane,
    summary,
    offers,
    estimatedMonthly,
    launchChecklist,
    betaFeatures,
    dlc,
    diagnostics: {
      strongestChannel: analytics?.cards?.[0]?.name || 'Base atual',
      revenueCount: revenueSources.length,
      audienceBase: ml + sf + ig + tt + yt,
      monetizationHint: hasRevenue(revenueSources, 'shows')
        ? 'Você já possui prova de monetização. O próximo passo é padronizar proposta e aumentar ticket.'
        : 'Ainda falta transformar atenção em oferta clara. Comece com um produto de entrada e prova social forte.'
    }
  };
}
