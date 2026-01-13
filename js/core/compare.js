// js/core/compare.js
import { safeText, formatNumber } from "../utils.js";

function n(v){ return (typeof v === "number" && Number.isFinite(v)) ? v : 0; }

function deltaTag(d){
  if(d > 0) return { text: `▲ +${formatNumber(d)}`, cls: "delta delta--up" };
  if(d < 0) return { text: `▼ ${formatNumber(d)}`, cls: "delta delta--down" };
  return { text: "— 0", cls: "delta delta--neutral" };
}

function sparklineSVG(values, w=220, h=52, pad=6){
  const v = values.map(n);
  const max = Math.max(...v, 1);
  const min = Math.min(...v, 0);

  const span = (max - min) || 1;
  const innerW = w - pad*2;
  const innerH = h - pad*2;

  const pts = v.map((val, i)=>{
    const x = pad + (innerW * (i/(Math.max(v.length-1,1))));
    const y = pad + (innerH * (1 - ((val - min)/span)));
    return [x,y];
  });

  const d = pts.map((p,i)=> (i===0?`M ${p[0].toFixed(1)} ${p[1].toFixed(1)}`:`L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)).join(" ");

  const last = pts[pts.length-1] || [pad, pad+innerH];

  return `
  <svg viewBox="0 0 ${w} ${h}" class="spark__svg" aria-hidden="true">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="rgba(217,180,92,.55)"></stop>
        <stop offset="1" stop-color="rgba(240,212,138,.95)"></stop>
      </linearGradient>
    </defs>
    <path d="${d}" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" />
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4.5" fill="rgba(240,212,138,.95)"></circle>
  </svg>`;
}

export function buildCompareUIData(reports, idA, idB){
  const a = reports.find(r => r?.id === idA) || null;
  const b = reports.find(r => r?.id === idB) || null;

  if(!a || !b){
    return { ok:false, message:"Selecione dois relatórios válidos." };
  }

  const scoreA = n(a?.result?.overall);
  const scoreB = n(b?.result?.overall);

  const mlA = n(a?.answers?.monthly_listeners_num);
  const mlB = n(b?.answers?.monthly_listeners_num);

  const sfA = n(a?.answers?.spotify_followers_num);
  const sfB = n(b?.answers?.spotify_followers_num);

  const dScore = scoreB - scoreA;
  const dMl = mlB - mlA;
  const dSf = sfB - sfA;

  const scoreDelta = deltaTag(dScore);
  const mlDelta = deltaTag(dMl);
  const sfDelta = deltaTag(dSf);

  const insights = [];
  const actions = [];

  const nameA = safeText(a.artistName || "Artista");
  const nameB = safeText(b.artistName || "Artista");
  const label = `${nameA} (${safeText(a.createdAtLabel)}) → ${nameB} (${safeText(b.createdAtLabel)})`;

  if(dScore > 0){
    insights.push(`Evolução positiva: o score subiu em ${formatNumber(dScore)} pontos.`);
  }else if(dScore < 0){
    insights.push(`Atenção: o score caiu ${formatNumber(Math.abs(dScore))} pontos. Revise consistência e foco.`);
  }else{
    insights.push("Score estável: bom para consolidar e subir com ações pontuais.");
  }

  if(dMl > 0) insights.push(`Ouvintes mensais cresceram +${formatNumber(dMl)}.`);
  if(dMl < 0) insights.push(`Ouvintes mensais caíram ${formatNumber(Math.abs(dMl))}. Pode ser queda de conteúdo/lançamento.`);
  if(dSf > 0) insights.push(`Seguidores Spotify cresceram +${formatNumber(dSf)}.`);
  if(dSf < 0) insights.push(`Seguidores Spotify caíram ${formatNumber(Math.abs(dSf))}. Reforce CTA e perfil.`);

  // Ações sugeridas
  if(dMl <= 0){
    actions.push("Criar série de 7 dias com refrão + contexto (storytelling) e CTA para Spotify.");
    actions.push("Fazer 1 collab (dueto/reaction) com artista do mesmo nicho.");
  }else{
    actions.push("Duplicar o formato de conteúdo que mais trouxe ouvintes (repetir variações por 14 dias).");
  }

  if(dSf <= 0){
    actions.push("Adicionar CTA ‘seguir + salvar’ em todo post do lançamento (principalmente Reels/TikTok).");
    actions.push("Otimizar perfil Spotify: bio, imagens, canvas, playlist ‘This is’ e link fixo.");
  }else{
    actions.push("Criar rotina pós-lançamento: 10 conteúdos em 10 dias reforçando ‘seguir/salvar’.");
  }

  // Series para sparklines (histórico)
  const sorted = [...reports].sort((x,y)=> (x.createdAt||"").localeCompare(y.createdAt||""));
  const seriesScore = sorted.map(r => n(r?.result?.overall));
  const seriesMl = sorted.map(r => n(r?.answers?.monthly_listeners_num));
  const seriesSf = sorted.map(r => n(r?.answers?.spotify_followers_num));

  return {
    ok:true,
    label,
    cards: {
      score: { a: scoreA, b: scoreB, delta: scoreDelta },
      ml: { a: mlA, b: mlB, delta: mlDelta },
      sf: { a: sfA, b: sfB, delta: sfDelta }
    },
    insights,
    actions,
    sparks: {
      score: sparklineSVG(seriesScore),
      ml: sparklineSVG(seriesMl),
      sf: sparklineSVG(seriesSf)
    }
  };
}
