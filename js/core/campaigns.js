// js/core/campaigns.js
import { safeText, uid } from "../utils.js";

const KEY = "vale_cm_campaigns_v1";

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
  save(arr.slice(0, 40));
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
 * Gera campanha profissional por fases:
 * - Pré-lançamento: -28 a -1 (4 semanas)
 * - Lançamento: 0 a +7 (semana 0/1)
 * - Pós-lançamento: +8 a +42 (5 semanas)
 */
export function buildCampaign({ type, name, releaseDate, budget, focus }){
  const rel = new Date(releaseDate);
  if(!(rel instanceof Date) || isNaN(rel.getTime())){
    return { ok:false, error:"Data de lançamento inválida." };
  }

  const projectName = safeText(name) || "Campanha";
  const b = Math.max(0, Number(budget || 0));

  const base = {
    id: uid(),
    createdAt: new Date().toISOString(),
    type,
    name: projectName,
    releaseDate: rel.toISOString().slice(0,10),
    budget: b,
    focus
  };

  const plan = generatePlan(type, projectName, rel, b, focus);

  return { ok:true, campaign: { ...base, plan } };
}

function dAdd(date, days){
  const x = new Date(date);
  x.setDate(x.getDate() + days);
  return x;
}

function fmt(date){
  return date.toLocaleDateString("pt-BR");
}

function generatePlan(type, name, rel, budget, focus){
  // fases
  const preStart = dAdd(rel, -28);
  const preEnd = dAdd(rel, -1);
  const launchStart = dAdd(rel, 0);
  const launchEnd = dAdd(rel, 7);
  const postStart = dAdd(rel, 8);
  const postEnd = dAdd(rel, 42);

  // metas por foco
  const focusGoals = {
    streams: [
      "Meta: aumentar streams por repetição (salvar + playlist).",
      "CTA fixo: ‘salva e adiciona na playlist’ em todo conteúdo."
    ],
    seguidores: [
      "Meta: converter seguidores (Spotify/Instagram/YouTube).",
      "CTA fixo: ‘segue no Spotify + ativa sino’."
    ],
    shows: [
      "Meta: converter audiência em agenda de shows.",
      "CTA fixo: ‘contrate para evento’ + link/WhatsApp."
    ],
    marca: [
      "Meta: reforçar identidade e autoridade (percepção premium).",
      "Conteúdo: bastidores + história + posicionamento claro."
    ]
  };

  // distribuição de orçamento sugerida
  const budgetSplit = budgetSplitSuggestion(type, budget);

  // checklist profissional (por fase)
  const checklistPre = [
    "Finalizar master/ISRC/capa + metadados 100%",
    "Atualizar perfil Spotify/Deezer/Apple (bio, fotos, links)",
    "Criar link único (bio) + pré-save (se aplicável)",
    "Planejar 12 conteúdos (4 semanas) com roteiros curtos",
    "Lista de 30 playlists/curadores para contato (organizar planilha)",
    "Definir 1 collab/dueto + 1 influencer/creator",
    "Separar trechos (15s / 30s) + hook do refrão",
    "Criar Canvas/Shorts/Reels (assets prontos)"
  ];

  const checklistLaunch = [
    "Publicar no dia: post feed + reels/shorts + story com link",
    "Enviar para curadores (pitch/press kit) + reforço no D+2",
    "Repost de creators (pelo menos 5 reposts no dia)",
    "Live curta (10–20 min) ou premiere (YouTube/clipe)",
    "Campanha de anúncios (se houver orçamento) por 7 dias"
  ];

  const checklistPost = [
    "Série de 10 dias: 1 conteúdo/dia com variações do hook",
    "Conteúdo de prova social (comentários/reaction/duetos)",
    "Versão alternativa: acústico/ao vivo/bastidor",
    "Contato com rádios/podcasts/canais nichados",
    "Atualizar press kit com resultados + pedir oportunidades",
    "Reforçar shows/agenda e propostas"
  ];

  // metas semanais (simplificado e efetivo)
  const weeks = [];

  for(let w=1; w<=4; w++){
    const weekStart = dAdd(preStart, (w-1)*7);
    const weekEnd = dAdd(weekStart, 6);
    weeks.push({
      phase: "Pré-lançamento",
      label: `Semana ${w} (pré)`,
      range: `${fmt(weekStart)} — ${fmt(weekEnd)}`,
      goals: weekGoalsPre(w, focus),
      checklist: checklistPre
    });
  }

  weeks.push({
    phase: "Lançamento",
    label: "Semana 0/1 (lançamento)",
    range: `${fmt(launchStart)} — ${fmt(launchEnd)}`,
    goals: weekGoalsLaunch(type, focus),
    checklist: checklistLaunch
  });

  for(let w=1; w<=5; w++){
    const weekStart = dAdd(postStart, (w-1)*7);
    const weekEnd = dAdd(weekStart, 6);
    weeks.push({
      phase: "Pós-lançamento",
      label: `Semana ${w} (pós)`,
      range: `${fmt(weekStart)} — ${fmt(weekEnd)}`,
      goals: weekGoalsPost(w, focus),
      checklist: checklistPost
    });
  }

  return {
    name,
    phases: [
      { name:"Pré-lançamento", range:`${fmt(preStart)} — ${fmt(preEnd)}` },
      { name:"Lançamento", range:`${fmt(launchStart)} — ${fmt(launchEnd)}` },
      { name:"Pós-lançamento", range:`${fmt(postStart)} — ${fmt(postEnd)}` }
    ],
    focusTips: focusGoals[focus] || focusGoals.streams,
    budgetSplit,
    weeks
  };
}

function budgetSplitSuggestion(type, budget){
  if(budget <= 0){
    return [
      { item:"Conteúdo orgânico", pct: 70, note:"Rotina e constância", value: 0 },
      { item:"Playlists/Curadoria", pct: 30, note:"Pitch + relacionamento", value: 0 }
    ];
  }

  const preset = {
    single: [
      { item:"Anúncios (Reels/TikTok/YouTube)", pct: 55, note:"7–14 dias", value:0 },
      { item:"Creators/Collabs", pct: 25, note:"duetos/reactions", value:0 },
      { item:"Design/Assets", pct: 20, note:"capas, teasers", value:0 }
    ],
    ep: [
      { item:"Anúncios", pct: 45, note:"14 dias", value:0 },
      { item:"Creators/Collabs", pct: 25, note:"pacote de creators", value:0 },
      { item:"Conteúdo/Captação", pct: 30, note:"bastidores + clipes", value:0 }
    ],
    album: [
      { item:"Anúncios", pct: 40, note:"30 dias", value:0 },
      { item:"Conteúdo/Captação", pct: 35, note:"vários formatos", value:0 },
      { item:"PR/Imprensa", pct: 25, note:"blogs/podcasts", value:0 }
    ],
    clipe: [
      { item:"Tráfego para YouTube", pct: 50, note:"7–14 dias", value:0 },
      { item:"Creators/Collabs", pct: 20, note:"reaction/duetos", value:0 },
      { item:"Assets/Teasers", pct: 30, note:"cortes + trailers", value:0 }
    ]
  };

  const arr = preset[type] || preset.single;
  return arr.map(x => ({
    ...x,
    value: Math.round((budget * (x.pct/100)))
  }));
}

function weekGoalsPre(week, focus){
  const base = [
    "3 Reels/Shorts (hook + contexto + CTA)",
    "2 Stories por dia (rotina + bastidor)",
    "1 contato diário com curador/playlists (mín. 7/semana)",
    "1 collab/dueto na semana",
  ];
  if(focus === "shows") base.push("Adicionar CTA de contratação em bio + 1 vídeo falando de eventos.");
  if(focus === "seguidores") base.push("CTA: ‘segue no Spotify’ em 100% dos conteúdos.");
  if(focus === "marca") base.push("1 conteúdo de história/autoridade (por que essa música existe).");
  return base;
}

function weekGoalsLaunch(type, focus){
  const base = [
    "Post principal + Reel/Short (lançamento) com link",
    "Story com CTA (salvar/seguir) + reposts",
    "Enviar pitch (curadores, blogs, rádios)",
    "1 live curta ou premiere (YouTube se clipe)",
    "Rodar anúncios 7 dias (se houver orçamento)"
  ];
  if(type === "clipe") base.push("Cortes diários do clipe (5–10) para Shorts/Reels.");
  if(focus === "shows") base.push("Oferta: agenda aberta + formulário/WhatsApp.");
  return base;
}

function weekGoalsPost(week, focus){
  const base = [
    "1 conteúdo/dia (variações do hook) por 7 dias",
    "2 conteúdos de prova social (comentários/reaction/dueto)",
    "1 conteúdo bastidor/ao vivo",
    "Pitch para novos canais/curadores (mín. 10 semana)"
  ];
  if(week >= 3) base.push("Testar versão alternativa: acústico/ao vivo/capela.");
  if(focus === "seguidores") base.push("CTA: seguir + salvar + playlist (reforçar em todo post).");
  if(focus === "marca") base.push("Conteúdo: posicionamento + valores + visão (1x/semana).");
  return base;
}
