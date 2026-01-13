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
  try{ localStorage.setItem(KEY, JSON.stringify(arr)); }catch{}
}

export function loadCampaigns(){ return load(); }

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

  // Plano simples e estável: 4 semanas pré + semana lançamento + 4 semanas pós
  const weeks = [];
  for(let i=1;i<=4;i++){
    weeks.push({
      phase:"Pré-lançamento",
      label:`Semana ${i} (pré)`,
      goals:[
        "3 Reels/Shorts (hook + CTA seguir/salvar)",
        "Stories diários (bastidor + link)",
        "7 contatos com playlists/curadores (1/dia)",
        "1 collab/dueto na semana"
      ]
    });
  }

  weeks.push({
    phase:"Lançamento",
    label:"Semana 0/1 (lançamento)",
    goals:[
      "Post principal + Reels/Shorts com link",
      "Pitch para curadores + PR (blogs/canais)",
      "Live curta ou premiere",
      "Se houver orçamento: tráfego por 7 dias"
    ]
  });

  for(let i=1;i<=4;i++){
    weeks.push({
      phase:"Pós-lançamento",
      label:`Semana ${i} (pós)`,
      goals:[
        "1 conteúdo/dia por 7 dias (variações do hook)",
        "2 conteúdos de prova social (comentários/reaction)",
        "Bastidor/ao vivo 1x na semana",
        "10 novos contatos com curadores/canais"
      ]
    });
  }

  const plan = { weeks };
  return { ok:true, campaign: { ...base, plan } };
}
