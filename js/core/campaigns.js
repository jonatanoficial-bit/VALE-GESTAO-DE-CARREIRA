// js/core/campaigns.js
// Vale Produção — Campaign Engine (Etapa C)
// Profissional: plano de 6 semanas (4 pré + semana lançamento + 1 pós)
// Seguro: não depende de API, não altera UI, não quebra app.js atual.

import { safeText, uid } from "../utils.js";

const KEY = "vale_cm_campaigns_v2";

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function save(arr){
  try{
    localStorage.setItem(KEY, JSON.stringify(arr));
  }catch{}
}

export function loadCampaigns(){
  return load();
}

export function addCampaign(c){
  const arr = load();
  arr.unshift(c);
  save(arr.slice(0, 60));
  return arr;
}

export function deleteCampaign(id){
  const arr = load().filter(x => x?.id !== id);
  save(arr);
  return arr;
}

export function findCampaign(id){
  return load().find(x => x?.id === id) || null;
}

/**
 * buildCampaign (Etapa C - 6 semanas profissional)
 *
 * Mantém compatibilidade com app.js existente.
 * Aceita opcionalmente (sem obrigar):
 * - trafficMain, trafficWeak
 * - topCountries, topCities, topTracks
 *
 * Exemplo (opcional no futuro):
 * buildCampaign({ ..., trafficMain:"social", topCities:["São Paulo"] })
 */
export function buildCampaign({ type, name, releaseDate, budget, focus, trafficMain, trafficWeak, topCountries, topCities, topTracks }){
  const rel = new Date(releaseDate);
  if(!(rel instanceof Date) || isNaN(rel.getTime())){
    return { ok:false, error:"Data de lançamento inválida." };
  }

  const projectName = safeText(name) || "Campanha";
  const b = Math.max(0, Number(budget || 0));

  const base = {
    id: uid(),
    createdAt: new Date().toISOString(),
    type: safeText(type || "single"),
    name: projectName,
    releaseDate: rel.toISOString().slice(0,10),
    budget: b,
    focus: safeText(focus || "streams"),
    context: {
      trafficMain: safeText(trafficMain || ""),
      trafficWeak: safeText(trafficWeak || ""),
      topCountries: normalizeList(topCountries),
      topCities: normalizeList(topCities),
      topTracks: normalizeList(topTracks)
    }
  };

  const plan = generatePlan(base.type, projectName, rel, b, base.focus, base.context);

  return { ok:true, campaign: { ...base, plan } };
}

function normalizeList(v){
  if(Array.isArray(v)) return v.map(x => safeText(x)).filter(Boolean).slice(0, 5);
  const t = safeText(v || "").trim();
  if(!t) return [];
  // aceita string "a, b, c"
  return t.split(",").map(s => safeText(s).trim()).filter(Boolean).slice(0, 5);
}

function dAdd(date, days){
  const x = new Date(date);
  x.setDate(x.getDate() + days);
  return x;
}

function fmt(date){
  return date.toLocaleDateString("pt-BR");
}

function pct(val){
  return Math.max(0, Math.min(100, Math.round(val)));
}

/**
 * Plano profissional (6 semanas):
 * - Semana -4 (pré): estrutura + assets + perfil + narrativa
 * - Semana -3 (pré): conteúdo em lote + roteiro + creators + pitch
 * - Semana -2 (pré): aquecimento + pré-save + lista/curadores + prova social
 * - Semana -1 (pré): contagem regressiva + posts diários + alinhamento final
 * - Semana 0 (lançamento): dia D + 7 dias de pressão controlada
 * - Semana +1 (pós): manutenção + versão alternativa + segunda onda (creators/playlist)
 */
function generatePlan(type, name, rel, budget, focus, ctx){
  const w4s = dAdd(rel, -28);
  const w3s = dAdd(rel, -21);
  const w2s = dAdd(rel, -14);
  const w1s = dAdd(rel, -7);
  const w0s = dAdd(rel, 0);
  const wP1s = dAdd(rel, 7);

  const w4e = dAdd(w4s, 6);
  const w3e = dAdd(w3s, 6);
  const w2e = dAdd(w2s, 6);
  const w1e = dAdd(w1s, 6);
  const w0e = dAdd(w0s, 6);
  const wP1e = dAdd(wP1s, 6);

  const phases = [
    { name:"Pré-lançamento", range:`${fmt(w4s)} — ${fmt(w1e)}` },
    { name:"Lançamento", range:`${fmt(w0s)} — ${fmt(w0e)}` },
    { name:"Pós-lançamento", range:`${fmt(wP1s)} — ${fmt(wP1e)}` }
  ];

  const budgetSplit = budgetSplitSuggestion(type, budget, focus);
  const focusTips = buildFocusTips(focus, ctx);

  const weeks = [
    {
      phase: "Pré-lançamento",
      label: "Semana -4 (fundação)",
      range: `${fmt(w4s)} — ${fmt(w4e)}`,
      goals: weekGoalsMinus4(type, focus, ctx),
      checklist: weekChecklistMinus4(type, focus, ctx)
    },
    {
      phase: "Pré-lançamento",
      label: "Semana -3 (produção de conteúdo)",
      range: `${fmt(w3s)} — ${fmt(w3e)}`,
      goals: weekGoalsMinus3(type, focus, ctx),
      checklist: weekChecklistMinus3(type, focus, ctx)
    },
    {
      phase: "Pré-lançamento",
      label: "Semana -2 (aquecimento)",
      range: `${fmt(w2s)} — ${fmt(w2e)}`,
      goals: weekGoalsMinus2(type, focus, ctx),
      checklist: weekChecklistMinus2(type, focus, ctx)
    },
    {
      phase: "Pré-lançamento",
      label: "Semana -1 (contagem regressiva)",
      range: `${fmt(w1s)} — ${fmt(w1e)}`,
      goals: weekGoalsMinus1(type, focus, ctx),
      checklist: weekChecklistMinus1(type, focus, ctx)
    },
    {
      phase: "Lançamento",
      label: "Semana 0 (lançamento)",
      range: `${fmt(w0s)} — ${fmt(w0e)}`,
      goals: weekGoalsLaunch(type, focus, ctx),
      checklist: weekChecklistLaunch(type, focus, ctx)
    },
    {
      phase: "Pós-lançamento",
      label: "Semana +1 (segunda onda)",
      range: `${fmt(wP1s)} — ${fmt(wP1e)}`,
      goals: weekGoalsPlus1(type, focus, ctx),
      checklist: weekChecklistPlus1(type, focus, ctx)
    }
  ];

  return {
    name,
    phases,
    focusTips,
    budgetSplit,
    weeks
  };
}

function buildFocusTips(focus, ctx){
  const tMain = safeText(ctx?.trafficMain || "");
  const topCity = (ctx?.topCities && ctx.topCities[0]) ? ctx.topCities[0] : "";
  const topCountry = (ctx?.topCountries && ctx.topCountries[0]) ? ctx.topCountries[0] : "";
  const topTrack = (ctx?.topTracks && ctx.topTracks[0]) ? ctx.topTracks[0] : "";

  const base = {
    streams: [
      "Objetivo: repetição e retenção (salvar/playlist) nos primeiros 7 dias.",
      "Ajuste o conteúdo para começar com o gancho nos primeiros 2 segundos.",
      "Crie um funil claro: conteúdo → link → salvar/seguir."
    ],
    seguidores: [
      "Objetivo: conversão (ouvintes → seguidores / views → inscritos).",
      "CTA fixo: ‘segue/salva/ativa o sino’ em 100% dos conteúdos do ciclo.",
      "Perfil completo e profissional aumenta conversão (bio + links + estética)."
    ],
    shows: [
      "Objetivo: transformar alcance em agenda (proposta clara + prova social).",
      "Tenha um ‘kit show’ simples: vídeo curto ao vivo + setlist + contato.",
      "Ação local: creators e páginas da sua cidade geram contratação."
    ],
    marca: [
      "Objetivo: percepção premium (identidade, consistência, história).",
      "Crie narrativa da música: por que existe, para quem é, qual emoção gera.",
      "Repita elementos visuais e tom de voz (padrão internacional)."
    ]
  };

  const extra = [];
  if(tMain){
    const map = {
      social: "Tráfego principal é social: foque em volume e variação (12 formatos do mesmo hook).",
      playlists: "Tráfego principal é playlists: foco pesado em pitch, press kit e ‘saves’ nos 7 dias.",
      algoritmo: "Tráfego principal é algoritmo: retenção e repetição; gancho rápido e CTA salvar.",
      youtube: "Tráfego principal é YouTube: Shorts + 1 vídeo fixo/semana com título direto.",
      shows: "Tráfego principal é shows: prova social + contato + ação regional.",
      colabs: "Tráfego principal é colabs: cross-post e dueto com consistência.",
      ads: "Tráfego principal é anúncios: criativos múltiplos e otimização por 7–14 dias."
    };
    extra.push(map[tMain] || "Use o canal principal como motor, mas crie 1 canal secundário para não depender de um só.");
  }

  if(topTrack) extra.push(`Use "${topTrack}" como motor: 10 variações do trecho mais forte em 10 dias.`);
  if(topCity) extra.push(`Ação local sugerida: ativar creators/páginas em ${topCity}.`);
  if(topCountry) extra.push(`Globalização: adapte legenda/horários para ${topCountry} (sem perder identidade).`);

  const core = base[focus] || base.streams;
  return [...core, ...extra].slice(0, 8);
}

function budgetSplitSuggestion(type, budget, focus){
  if(budget <= 0){
    return [
      { item:"Conteúdo orgânico", pct: 70, note:"Constância + variações do hook", value: 0 },
      { item:"Playlists/Relacionamento", pct: 30, note:"Pitch e networking", value: 0 }
    ];
  }

  // split “profissional”: mantém compatibilidade com UI atual
  const preset = {
    single: [
      { item:"Anúncios (social/YouTube)", pct: 50, note:"7–14 dias (criativos múltiplos)", value:0 },
      { item:"Creators/Colabs", pct: 25, note:"duetos/reactions (alcance rápido)", value:0 },
      { item:"Assets/Design", pct: 25, note:"capas/teasers/variações", value:0 }
    ],
    ep: [
      { item:"Anúncios", pct: 45, note:"14 dias (em ondas)", value:0 },
      { item:"Conteúdo/Captação", pct: 35, note:"bastidores/cortes/ao vivo", value:0 },
      { item:"Creators/PR", pct: 20, note:"blogs/podcasts/curadores", value:0 }
    ],
    album: [
      { item:"Anúncios", pct: 40, note:"30 dias (fases)", value:0 },
      { item:"Conteúdo/Captação", pct: 35, note:"vários formatos", value:0 },
      { item:"PR/Imprensa", pct: 25, note:"mídia e narrativa", value:0 }
    ],
    clipe: [
      { item:"Tráfego YouTube", pct: 50, note:"7–14 dias", value:0 },
      { item:"Cortes/Shorts", pct: 30, note:"volume e retenção", value:0 },
      { item:"Creators/Reaction", pct: 20, note:"prova social", value:0 }
    ]
  };

  const key = (type === "album" || type === "ep" || type === "clipe") ? type : "single";
  let arr = preset[key] || preset.single;

  // ajuste fino por foco (sem mudar estrutura)
  if(focus === "shows"){
    arr = arr.map(x => {
      if(x.item.toLowerCase().includes("creators")) return { ...x, pct: x.pct + 5, note: x.note + " + páginas locais" };
      if(x.item.toLowerCase().includes("anúncios")) return { ...x, pct: Math.max(0, x.pct - 5), note: x.note + " (segmentar por região)" };
      return x;
    });
  }

  // normaliza pct para somar 100
  const sum = arr.reduce((s,x)=> s + (x.pct||0), 0) || 100;
  arr = arr.map(x => ({ ...x, pct: pct((x.pct/sum)*100) }));

  // corrige arredondamento (garante 100)
  let fix = 100 - arr.reduce((s,x)=> s + x.pct, 0);
  if(arr.length && fix !== 0){
    arr[0] = { ...arr[0], pct: arr[0].pct + fix };
  }

  return arr.map(x => ({ ...x, value: Math.round((budget * (x.pct/100))) }));
}

/* ===== SEMANA -4 ===== */
function weekGoalsMinus4(type, focus, ctx){
  const goals = [
    "Definir narrativa (1 frase) + promessa da música (o que ela faz o público sentir).",
    "Padronizar identidade (foto, bio, links) em todas as plataformas.",
    "Montar press kit simples (bio curta + 3 fotos + 1 link + 1 vídeo curto).",
    "Preparar 12 ganchos (2–5s) do refrão/parte forte."
  ];

  if(type === "clipe") goals.push("Definir roteiro do clipe + lista de cortes para Shorts/Reels (15–30 ideias).");
  if(focus === "seguidores") goals.push("Planejar CTAs fixos para conversão (seguir/salvar/inscrever).");
  if(focus === "shows") goals.push("Criar mini kit show (vídeo curto, setlist, contato, proposta).");

  addGeoGoals(goals, ctx);
  return goals;
}

function weekChecklistMinus4(type, focus, ctx){
  const list = [
    "Master/capa/metadata 100% (ISRC, títulos, feat, compositores)",
    "Perfil Spotify for Artists completo (bio, foto, links, destaque)",
    "YouTube: banner + sobre + links + playlists/organização",
    "Link único (bio) pronto + botão principal para a música",
    "Press kit básico salvo (PDF/Drive) + link copiável",
    "Separar 10–15 trechos (vídeo) com gancho e legenda"
  ];

  if(type === "clipe") list.push("Checklist clipe: locação/visual + roteiro + plano de cortes.");
  if(focus === "marca") list.push("Guia rápido de identidade: cores/estilo/linguagem (consistência AAA).");
  addGeoChecklist(list, ctx);
  return list;
}

/* ===== SEMANA -3 ===== */
function weekGoalsMinus3(type, focus, ctx){
  const goals = [
    "Produzir conteúdo em lote: 10 vídeos (variações do mesmo trecho).",
    "Criar 3 formatos: performance, storytelling, trend/participação.",
    "Listar 30 contatos (playlists/creators/páginas) e organizar por prioridade.",
    "Ensaiar CTA e repetir sem vergonha (o público precisa de repetição)."
  ];

  if(type === "clipe") goals.push("Produzir 8 cortes do clipe (vertical) prontos para Shorts/Reels.");
  if(focus === "streams") goals.push("Planejar campanha de saves: ‘salvar’ como meta principal do ciclo.");
  if(focus === "shows") goals.push("Contatar 10 locais/eventos (começar pelo top cidade).");

  addGeoGoals(goals, ctx);
  return goals;
}

function weekChecklistMinus3(type, focus, ctx){
  const list = [
    "10 vídeos gravados e rascunhos prontos (com legenda curta)",
    "3 modelos de legenda (curta/média/CTA forte)",
    "Lista 30 contatos criada (playlists/creators/páginas)",
    "Criar 1 teaser oficial (15s) + 1 teaser ‘cru’ (real)",
    "Programar posts (mín. 4 na semana)"
  ];

  if(focus === "seguidores") list.push("Definir frase CTA padrão (seguir/inscrever) e aplicar em todos os vídeos.");
  if(focus === "shows") list.push("Montar mensagem padrão de contratação + link WhatsApp.");
  addGeoChecklist(list, ctx);
  return list;
}

/* ===== SEMANA -2 ===== */
function weekGoalsMinus2(type, focus, ctx){
  const goals = [
    "Iniciar aquecimento: 4–6 posts na semana (mesmo trecho, formatos diferentes).",
    "Ativar creators: enviar 10 convites (dueto/reaction).",
    "Iniciar pitch (playlists/curadores) com press kit e mensagem curta.",
    "Criar prova social (bastidor, processo, história real)."
  ];

  if(focus === "algoritmo") goals.push("Ajustar vídeos para retenção: gancho em 2s + cortes rápidos.");
  if(focus === "streams") goals.push("Fazer ‘pré-save’ ou ‘pré-link’ (se aplicável) e empurrar nos stories.");
  if(type === "clipe") goals.push("Publicar 2 bastidores do clipe + 1 corte teaser.");

  addGeoGoals(goals, ctx);
  return goals;
}

function weekChecklistMinus2(type, focus, ctx){
  const list = [
    "4–6 posts publicados (variações do mesmo trecho)",
    "10 creators convidados (mensagem curta + áudio + referência)",
    "10 curadores contatados (pitch + link)",
    "Stories diários (mín. 5 dias) com CTA claro",
    "Checklist de lançamento montada (o que vai sair no dia D)"
  ];

  if(focus === "playlists") list.push("Planilha de curadores atualizada + follow-up programado para D+2.");
  addGeoChecklist(list, ctx);
  return list;
}

/* ===== SEMANA -1 ===== */
function weekGoalsMinus1(type, focus, ctx){
  const goals = [
    "Contagem regressiva: posts diários (7/7) ou no mínimo 5/7.",
    "Fazer 2 conteúdos de ‘promessa’ (o que a música significa).",
    "Follow-up de curadores e creators (2ª mensagem curta).",
    "Preparar ‘kit do dia D’: textos, capas, links, pinned post."
  ];

  if(focus === "seguidores") goals.push("Call-to-action em todo post: seguir/salvar/inscrever.");
  if(focus === "marca") goals.push("Fixar linguagem: mesma estética, mesmo tom, repetição intencional.");
  if(type === "clipe") goals.push("Agendar premiere no YouTube + 5 cortes para o dia D.");

  addGeoGoals(goals, ctx);
  return goals;
}

function weekChecklistMinus1(type, focus, ctx){
  const list = [
    "5–7 posts feitos na semana (contagem regressiva)",
    "Links revisados (bio, story, WhatsApp se tiver)",
    "Mensagem curta pronta (para story/feed) + variação 1 e 2",
    "Organizar ‘primeiras 24h’: o que postar e em que horários",
    "Preparar 1 live curta (10–20 min) para semana 0"
  ];

  if(type === "clipe") list.push("YouTube: título/descrição/tags + thumbnail + cards/telas finais.");
  addGeoChecklist(list, ctx);
  return list;
}

/* ===== SEMANA 0 ===== */
function weekGoalsLaunch(type, focus, ctx){
  const goals = [
    "Dia D: post principal + 2 Shorts/Reels + stories com link e CTA.",
    "Pressão controlada 7 dias: 1 conteúdo/dia (variações do mesmo trecho).",
    "Repostar creators e prova social (comentários, reactions).",
    "Follow-up curadores D+2 e D+5 (mensagem objetiva)."
  ];

  if(type === "clipe") goals.push("Dia D: publicar clipe + 5 cortes verticais (Shorts/Reels).");
  if(focus === "shows") goals.push("Oferta clara: agenda aberta + contato rápido (WhatsApp/DM).");
  if(focus === "streams") goals.push("Meta: saves e playlists pessoais (pedir para público adicionar em playlist).");

  addGeoGoals(goals, ctx);
  return goals;
}

function weekChecklistLaunch(type, focus, ctx){
  const list = [
    "Post principal no feed publicado (com link e CTA)",
    "2–3 Shorts/Reels no dia D (gancho nos 2s)",
    "Stories com link (mín. 6 stories no dia D)",
    "Fixar post do lançamento (pinned) onde possível",
    "Follow-up de curadores agendado (D+2 e D+5)"
  ];

  if(type === "clipe") list.push("YouTube: telas finais + comentário fixado com link/CTA.");
  if(focus === "ads") list.push("Anúncios: subir 2 criativos e acompanhar diariamente (pausar o pior, reforçar o melhor).");
  addGeoChecklist(list, ctx);
  return list;
}

/* ===== SEMANA +1 ===== */
function weekGoalsPlus1(type, focus, ctx){
  const goals = [
    "Segunda onda: 7 conteúdos em 7 dias (mesmo hook, ângulos diferentes).",
    "Versão alternativa: acústico/ao vivo/bastidor profundo.",
    "Ativar 10 novos contatos (creators/curadores/páginas) com prova social do lançamento.",
    "Reforçar comunidade: responder comentários/DM e pedir UGC (vídeos usando o áudio)."
  ];

  if(focus === "playlists") goals.push("Buscar 15 novas playlists independentes (com prova social e números).");
  if(focus === "seguidores") goals.push("Meta conversão: pedir seguir/inscrever explicitamente (sem medo).");
  if(focus === "shows") goals.push("Ação local: 5 contatos de eventos/casas com vídeo curto e proposta.");

  addGeoGoals(goals, ctx);
  return goals;
}

function weekChecklistPlus1(type, focus, ctx){
  const list = [
    "7 posts na semana (+1 por dia) com variações do mesmo trecho",
    "1 versão alternativa publicada (acústico/ao vivo/bastidor)",
    "10 novos contatos feitos (creators/curadores/páginas)",
    "Conteúdo de prova social (prints/comentários/reactions)",
    "Revisar o que performou melhor e repetir formato vencedor"
  ];

  addGeoChecklist(list, ctx);
  return list;
}

/* ===== Geo helpers (opcional, não quebra se vazio) ===== */
function addGeoGoals(goals, ctx){
  const city = (ctx?.topCities && ctx.topCities[0]) ? ctx.topCities[0] : "";
  const country = (ctx?.topCountries && ctx.topCountries[0]) ? ctx.topCountries[0] : "";
  if(city) goals.push(`Ação regional: ativar ${city} (creator/página local) com 1 conteúdo direcionado.`);
  if(country) goals.push(`Ação de globalização: testar 2 posts com legenda adaptada para ${country}.`);
}

function addGeoChecklist(list, ctx){
  const track = (ctx?.topTracks && ctx.topTracks[0]) ? ctx.topTracks[0] : "";
  if(track) list.push(`Usar "${track}" como motor: separar 3 trechos principais e revezar nos posts.`);
}