// js/core/admin.js
// Vale Produção — Admin Engine (Etapa F)
// Offline: leitura do histórico e geração de visão/ações.

import { safeText, formatNumber } from "../utils.js";

export function defaultAdminPin(){
  return "2026";
}

export function getAdminPin(){
  try{
    const p = localStorage.getItem("vale_cm_admin_pin");
    return p && p.length >= 4 ? p : defaultAdminPin();
  }catch{
    return defaultAdminPin();
  }
}

export function setAdminPin(pin){
  const p = safeText(pin).trim();
  if(!/^\d{4,10}$/.test(p)) return { ok:false, error:"PIN inválido. Use 4 a 10 dígitos." };
  try{
    localStorage.setItem("vale_cm_admin_pin", p);
  }catch{}
  return { ok:true };
}

export function verifyPin(inputPin){
  const pin = safeText(inputPin).trim();
  return pin === getAdminPin();
}

export function normalizeReports(reports){
  const arr = Array.isArray(reports) ? reports : [];
  return arr.map(r=>{
    const name = safeText(r.artistName || "Artista");
    const created = safeText(r.createdAtLabel || "");
    const score = Number(r?.result?.overall ?? 0);
    const stage = safeText(r?.result?.stage?.label || "—");

    const mlRaw = Number(r?.answers?.monthly_listeners_num ?? 0);
    const sfRaw = Number(r?.answers?.spotify_followers_num ?? 0);
    const igRaw = Number(r?.answers?.instagram_followers_num ?? 0);
    const ytRaw = Number(r?.answers?.youtube_subs_num ?? 0);
    const tkRaw = Number(r?.answers?.tiktok_followers_num ?? 0);

    return {
      id: safeText(r.id || ""),
      name,
      created,
      score,
      stage,
      ml: mlRaw,
      sf: sfRaw,
      ig: igRaw,
      yt: ytRaw,
      tk: tkRaw,
      raw: r
    };
  }).filter(x=>x.id);
}

export function filterAndSort(reportsNorm, query, sortKey){
  const q = safeText(query).trim().toLowerCase();
  let filtered = reportsNorm;

  if(q){
    filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.stage.toLowerCase().includes(q));
  }

  const s = safeText(sortKey || "new");
  const copy = [...filtered];

  if(s === "old"){
    // createdAtLabel é texto; usamos raw.createdAt ISO se existir
    copy.sort((a,b)=> safeText(a.raw?.createdAt || "").localeCompare(safeText(b.raw?.createdAt || "")));
  }else if(s === "scoreHigh"){
    copy.sort((a,b)=> (b.score - a.score));
  }else if(s === "scoreLow"){
    copy.sort((a,b)=> (a.score - b.score));
  }else if(s === "name"){
    copy.sort((a,b)=> a.name.localeCompare(b.name));
  }else{
    // new
    copy.sort((a,b)=> safeText(b.raw?.createdAt || "").localeCompare(safeText(a.raw?.createdAt || "")));
  }

  return copy;
}

export function buildAdminSummary(item){
  const lines = [];
  lines.push(`${item.name}`);
  lines.push(`Status: ${item.stage} • Score: ${item.score}`);
  if(item.created) lines.push(`Gerado: ${item.created}`);
  lines.push("");
  lines.push("Métricas (informadas):");
  lines.push(`• Ouvintes mensais: ${formatNumber(item.ml)}`);
  lines.push(`• Seguidores Spotify: ${formatNumber(item.sf)}`);
  lines.push(`• Instagram: ${formatNumber(item.ig)}`);
  lines.push(`• TikTok: ${formatNumber(item.tk)}`);
  lines.push(`• YouTube: ${formatNumber(item.yt)}`);

  return lines.join("\n");
}

export function buildWhatsAppMessage(item){
  const goal = safeText(item.raw?.answers?.goal || "");
  const goalTxt =
    goal === "crescer_fas" ? "crescer fãs" :
    goal === "crescer_stream" ? "crescer streams" :
    goal === "fechar_shows" ? "fechar shows" :
    goal === "monetizar" ? "monetizar" :
    goal === "viralizar" ? "viralizar" : "crescer";

  const nextGoal = safeText(item.raw?.result?.insights?.nextGoal || "");

  const msg = [
    `Olá, ${item.name}! Aqui é da Vale Produção.`,
    ``,
    `Analisei seu diagnóstico:`,
    `• Status: ${item.stage}`,
    `• Score: ${item.score}/100`,
    ``,
    `Seu foco atual: ${goalTxt}.`,
    nextGoal ? `Próxima meta recomendada: ${nextGoal}` : ``,
    ``,
    `Se você quiser, eu posso te orientar com um plano semanal e campanha de lançamento baseada nos seus dados.`,
    `Me diga: qual é seu próximo lançamento (música/EP/álbum) e a data?`
  ].filter(Boolean).join("\n");

  return msg;
}