// js/core/analytics.js
function n(v){ const x = Number(v); return Number.isFinite(x) ? x : 0; }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

export function buildAnalytics(answers){
  const ml = n(answers.monthly_listeners_num);
  const sf = n(answers.spotify_followers_num);
  const ig = n(answers.instagram_followers_num);
  const tt = n(answers.tiktok_followers_num);
  const ys = n(answers.youtube_subs_num);

  // Indicadores simples e interpretáveis
  const ratioFollow = (ml > 0) ? (sf / ml) : 0;
  const convLabel =
    ratioFollow >= 0.12 ? "Alta" :
    ratioFollow >= 0.06 ? "Boa" :
    ratioFollow >= 0.025 ? "Média" : "Baixa";

  const convPct = clamp(Math.round(ratioFollow * 100), 0, 30);

  const cards = [
    card("Ouvintes mensais", ml, pctFromRange(ml, [0, 500, 3000, 10000, 50000]), "ml"),
    card("Seguidores Spotify", sf, pctFromRange(sf, [0, 200, 800, 2000, 10000]), "sf"),
    card("Conversão (Spotify)", `${convPct}%`, clamp(convPct*3, 0, 100), "conv", convLabel)
  ];

  const insights = [];
  if(ml > 0 && ratioFollow < 0.03) insights.push("Sua conversão para seguidores está baixa. Use CTA de ‘seguir’ e ‘salvar’ em todo conteúdo.");
  if(ig > sf * 10 && sf < 1000) insights.push("Você tem base forte no Instagram. Direcione tráfego para o Spotify com link único e séries de Reels.");
  if(tt > 0 && tt > ig) insights.push("TikTok está forte. Reaproveite os melhores vídeos no Reels/Shorts mantendo o hook.");
  if(ys < 200 && answers.youtube_channel === "ativo") insights.push("YouTube ativo com poucos inscritos: foque em Shorts e cortes (3 por semana).");
  if(insights.length === 0) insights.push("Boas métricas iniciais. Aumente consistência e acompanhe conversão (ml → seguidores).");

  const goals = [];
  goals.push("Publicar 12 conteúdos em 30 dias (3/semana) com CTA de seguir/salvar.");
  goals.push("Contato com 30 playlists/curadores (1 por dia útil).");
  goals.push("Criar 2 variações do mesmo hook (A/B) e repetir o que performar.");
  goals.push("Se tiver orçamento: campanha curta de 7 dias com 2 criativos.");

  return { cards, insights, goals };
}

function pctFromRange(v, steps){
  // steps: [min, s1, s2, s3, s4]
  if(v <= steps[1]) return 15;
  if(v <= steps[2]) return 35;
  if(v <= steps[3]) return 60;
  if(v <= steps[4]) return 85;
  return 100;
}

function card(name, value, pct, type, tagOverride){
  const tag = tagOverride || (pct >= 70 ? "Bom" : pct >= 40 ? "Ok" : "Atenção");
  const tagType = pct >= 70 ? "good" : pct >= 40 ? "warn" : "bad";
  const sub = (type==="conv") ? "seguidores / ouvintes" : "medição informada";
  return { name, value: String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "."), pct, tag, tagType, sub };
}
