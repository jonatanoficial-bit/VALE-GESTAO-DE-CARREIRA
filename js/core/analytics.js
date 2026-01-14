// js/core/analytics.js
// Vale Produção — Analytics (heurística inteligente)
// Upgrade Etapa B: Geo/Top músicas/Tráfego (manual/offline)

import { clamp, formatNumber, safeText } from "../utils.js";

function n(v){ return (typeof v === "number" && Number.isFinite(v)) ? v : 0; }

function pctFromLog(value, ref){
  if(value <= 0) return 0;
  const x = Math.log10(value + 1);
  const m = Math.log10(ref + 1);
  return clamp(Math.round((x / m) * 100), 0, 100);
}

function tagFromPct(p){
  if(p >= 75) return { tag:"Forte", tagType:"tag--good" };
  if(p >= 45) return { tag:"OK", tagType:"tag--mid" };
  if(p >= 20) return { tag:"Baixo", tagType:"tag--low" };
  return { tag:"Muito baixo", tagType:"tag--low" };
}

function growthTarget(current){
  if(current <= 0) return 50;
  if(current < 200) return 60;
  if(current < 1000) return 35;
  if(current < 5000) return 25;
  if(current < 20000) return 18;
  if(current < 100000) return 12;
  return 8;
}

function ratio(a,b){
  if(b <= 0) return 0;
  return a / b;
}

function parseTop3(text){
  const t = safeText(text).trim();
  if(!t || t.toLowerCase() === "não sei" || t.toLowerCase() === "nao sei") return [];
  return t.split(",").map(s=> safeText(s).trim()).filter(Boolean).slice(0,3);
}

function labelTraffic(v){
  const map = {
    algoritmo: "Algoritmo",
    playlists: "Playlists",
    social: "Redes sociais",
    youtube: "YouTube",
    shows: "Shows",
    colabs: "Colabs",
    ads: "Anúncios",
    nao_sei: "Não sei"
  };
  return map[v] || "—";
}

export function buildAnalytics(answers){
  const ml = n(answers.monthly_listeners_num);
  const sf = n(answers.spotify_followers_num);
  const ig = n(answers.instagram_followers_num);
  const tk = n(answers.tiktok_followers_num);
  const yt = n(answers.youtube_subs_num);
  const s28 = n(answers.streams_28d_total);
  const yv28 = n(answers.youtube_views_28d);
  const posts7 = n(answers.content_posts_7d);

  const topCountries = parseTop3(answers.top_countries_3);
  const topCities = parseTop3(answers.top_cities_3);
  const topTracks = parseTop3(answers.top_tracks_3);
  const trafficMain = safeText(answers.traffic_source_main || "");
  const trafficWeak = safeText(answers.traffic_weakest || "");

  // Pcts (log)
  const pML = pctFromLog(ml, 2000000);
  const pSF = pctFromLog(sf, 500000);
  const pIG = pctFromLog(ig, 2000000);
  const pTK = pctFromLog(tk, 2000000);
  const pYT = pctFromLog(yt, 1000000);
  const pS28 = pctFromLog(s28, 20000000);
  const pYV28 = pctFromLog(yv28, 50000000);
  const pP7 = clamp(Math.round((posts7 / 14) * 100), 0, 100);

  const c1 = tagFromPct(pML);
  const c2 = tagFromPct(pSF);
  const c3 = tagFromPct(pIG);
  const c4 = tagFromPct(pTK);
  const c5 = tagFromPct(pYT);
  const c6 = tagFromPct(pS28);
  const c7 = tagFromPct(pYV28);
  const c8 = tagFromPct(pP7);

  // Conversões
  const convSpotify = ratio(sf, ml);
  const convPct = convSpotify * 100;

  const streamsPerListener = (ml > 0) ? ratio(s28, ml) : 0;
  const ytViewsPerSub = (yt > 0) ? ratio(yv28, yt) : 0;

  const cards = [
    { name: "Streams • Últimos 28 dias", value: formatNumber(s28), sub: "Volume total (somando plataformas)", pct: pS28, ...c6 },
    { name: "Spotify • Ouvintes mensais", value: formatNumber(ml), sub: "Alcance recente e descoberta", pct: pML, ...c1 },
    { name: "Spotify • Seguidores", value: formatNumber(sf), sub: "Base fiel (retorno em lançamentos)", pct: pSF, ...c2 },
    { name: "Instagram • Seguidores", value: formatNumber(ig), sub: "Relacionamento e prova social", pct: pIG, ...c3 },
    { name: "TikTok • Seguidores", value: formatNumber(tk), sub: "Alcance orgânico e viral", pct: pTK, ...c4 },
    { name: "YouTube • Inscritos", value: formatNumber(yt), sub: "Canal, Shorts e prova social", pct: pYT, ...c5 },
    { name: "YouTube • Views (28 dias)", value: formatNumber(yv28), sub: "Descoberta por vídeo/Shorts", pct: pYV28, ...c7 },
    { name: "Constância • Posts (7 dias)", value: formatNumber(posts7), sub: "Reels/TikTok/Shorts/Posts", pct: pP7, ...c8 }
  ];

  const insights = [];
  const goals = [];

  // Conversão Spotify
  if(ml > 0){
    if(convSpotify >= 0.08) insights.push(`Conversão Spotify forte: ~${convPct.toFixed(1)}% dos ouvintes viram seguidores. Mantenha CTA (seguir/salvar).`);
    else if(convSpotify >= 0.03) insights.push(`Conversão Spotify ok: ~${convPct.toFixed(1)}%. Dá para subir com CTA e perfil completo.`);
    else insights.push(`Conversão Spotify baixa: ~${convPct.toFixed(1)}%. Trabalhe CTA, perfil, repetição do refrão e “contexto” em conteúdo.`);
  }else{
    insights.push("Spotify ainda sem tração (0 ouvintes). Prioridade: perfil completo + 1 lançamento + conteúdo curto consistente.");
  }

  // Retenção (streams/ouvintes)
  if(s28 > 0 && ml > 0){
    if(streamsPerListener >= 7) insights.push(`Boa repetição no streaming: ~${streamsPerListener.toFixed(1)} streams por ouvinte (28d). Indica retenção.`);
    else if(streamsPerListener >= 3) insights.push(`Retenção razoável: ~${streamsPerListener.toFixed(1)} streams por ouvinte (28d). Suba com séries e playlists.`);
    else insights.push(`Retenção baixa: ~${streamsPerListener.toFixed(1)} streams por ouvinte (28d). Ajuste gancho + refrão + formatos de conteúdo.`);
  }

  // YouTube eficiência
  if(yv28 > 0 && yt > 0){
    if(ytViewsPerSub >= 4) insights.push(`YouTube com boa descoberta: ~${ytViewsPerSub.toFixed(1)} views por inscrito (28d). Ótimo para crescer com CTA.`);
    else if(ytViewsPerSub >= 1.5) insights.push(`YouTube ok: ~${ytViewsPerSub.toFixed(1)} views por inscrito (28d). Reforce CTA e Shorts com gancho em 2s.`);
    else insights.push(`YouTube fraco em descoberta: ~${ytViewsPerSub.toFixed(1)} views por inscrito (28d). Falta volume/variação (Shorts + títulos).`);
  }

  // Constância
  if(posts7 >= 10) insights.push("Constância forte na última semana. Agora foque em repetir formatos vencedores e converter para seguidores/streams.");
  else if(posts7 >= 4) insights.push("Constância ok, mas dá para subir. Meta simples: 1 conteúdo por dia por 7 dias (reaproveitando o mesmo trecho).");
  else insights.push("Constância baixa. Sem volume, o algoritmo não entrega. Prioridade: rotina mínima (4–7 posts/semana).");

  // ✅ Geo/Top
  if(topCountries.length){
    insights.push(`Top países (28d): ${topCountries.join(", ")}. Direcione conteúdo com linguagem/legenda e horários desses públicos.`);
  }else{
    insights.push("Você não informou países. Quando tiver, use isso para segmentar conteúdo e anúncios com mais precisão.");
  }

  if(topCities.length){
    insights.push(`Top cidades (28d): ${topCities.join(", ")}. Isso é ouro para shows, rádio local, creators e collabs regionais.`);
  }else{
    insights.push("Você não informou cidades. Quando tiver, isso ajuda a planejar shows e creators locais.");
  }

  if(topTracks.length){
    insights.push(`Top músicas (28d): ${topTracks.join(", ")}. Use a #1 como motor: crie 10 variações de conteúdo do refrão/trecho mais forte.`);
  }else{
    insights.push("Você não informou Top músicas. Quando tiver, a #1 vira o motor principal de conteúdo e funil.");
  }

  // ✅ Tráfego
  if(trafficMain){
    insights.push(`Sua principal fonte de tráfego hoje: ${labelTraffic(trafficMain)}. O plano vai potencializar esse canal sem depender do acaso.`);
  }else{
    insights.push("Fonte principal de tráfego não informada. Isso ajuda a escolher onde focar (social, playlists, algoritmo, YouTube).");
  }

  if(trafficWeak){
    insights.push(`Canal mais fraco hoje: ${labelTraffic(trafficWeak)}. Isso vira prioridade para reduzir dependência de um único canal.`);
  }

  // Goals 30 dias (base)
  goals.push(`Spotify: aumentar ouvintes mensais em ~${growthTarget(ml)}%.`);
  goals.push(`Spotify: aumentar seguidores em ~${growthTarget(sf)}% (CTA “seguir/salvar” em todo conteúdo).`);
  goals.push(`Instagram: aumentar seguidores em ~${growthTarget(ig)}% (3–5 posts/semana + stories diários por 7 dias).`);
  goals.push(`TikTok: aumentar seguidores em ~${growthTarget(tk)}% (1 vídeo/dia por 7 dias com variações do mesmo áudio).`);
  goals.push(`YouTube: aumentar inscritos em ~${growthTarget(yt)}% (Shorts 3x/semana + 1 vídeo/semana).`);
  goals.push(`Streams (28 dias): aumentar em ~${growthTarget(s28)}% (rotina + colabs + playlists independentes).`);
  goals.push(`YouTube views (28 dias): aumentar em ~${growthTarget(yv28)}% (Shorts com gancho + consistência).`);

  const targetPosts7 = clamp(Math.max(7, posts7 + 3), 7, 21);
  goals.push(`Constância: fazer ${targetPosts7} posts nos próximos 7 dias (mínimo 1/dia).`);

  // Goals específicos por tráfego
  if(trafficMain === "social"){
    goals.push("Social: criar 12 variações do MESMO trecho (gancho em 2s) e testar 3 formatos (storytelling, performance, trend).");
  }
  if(trafficMain === "playlists"){
    goals.push("Playlists: fazer 30 abordagens (curadores independentes) + atualizar pitch/presskit + reforçar saves nos primeiros 7 dias.");
  }
  if(trafficMain === "algoritmo"){
    goals.push("Algoritmo: priorizar retenção: conteúdo com refrão nos 2s + CTA salvar/seguir + repetir 3 vezes por semana.");
  }
  if(trafficMain === "youtube"){
    goals.push("YouTube: publicar 9 Shorts (3/semana) + 1 vídeo fixo/semana (lyric ou acústico) com título direto.");
  }
  if(trafficMain === "shows"){
    goals.push("Shows: montar lista de 30 contatos (casas, igrejas, eventos) + kit de show + vídeo curto de palco.");
  }
  if(trafficMain === "colabs"){
    goals.push("Colabs: fechar 2 feats/duetos (mesmo pequenos) e postar 6 conteúdos em conjunto (cross-post).");
  }
  if(trafficMain === "ads"){
    goals.push("Ads: rodar 2 campanhas (descoberta + conversão) com criativos diferentes e UTM/links separados.");
  }

  // Se topTracks existe, meta extra
  if(topTracks.length){
    goals.push(`Conteúdo: usar "${topTracks[0]}" como motor e postar 10 variações do trecho mais forte nos próximos 10 dias.`);
  }

  // Se topCities existe, meta extra local
  if(topCities.length){
    goals.push(`Local: criar 1 ação por cidade (creator, rádio, evento, collab). Comece por: ${topCities[0]}.`);
  }

  // Se topCountries existe, meta extra global
  if(topCountries.length){
    const c0 = topCountries[0].toLowerCase();
    if(c0 !== "brasil" && c0 !== "brazil"){
      goals.push(`Global: preparar versões/legendas e horários para o país #1 (${topCountries[0]}) e postar 6 conteúdos em 14 dias.`);
    }else{
      goals.push("Global: testar 2 conteúdos com legenda em inglês e hashtags internacionais (sem mudar identidade), para abrir porta fora.");
    }
  }

  return { cards, insights, goals };
}