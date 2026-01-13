// js/core/analytics.js
// Vale Produção — Analytics (heurística inteligente)
// Sem API externa: diagnósticos e metas com base nas métricas informadas.

import { clamp, formatNumber } from "../utils.js";

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
  // metas realistas, quanto menor a base maior % (mas sem exagero)
  if(current <= 0) return 50;          // objetivo mínimo para sair do zero
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

export function buildAnalytics(answers){
  const ml = n(answers.monthly_listeners_num);
  const sf = n(answers.spotify_followers_num);
  const ig = n(answers.instagram_followers_num);
  const tk = n(answers.tiktok_followers_num);
  const yt = n(answers.youtube_subs_num);

  // Pcts (log) — referências "saudáveis" para mobile-first
  const pML = pctFromLog(ml, 2000000);
  const pSF = pctFromLog(sf, 500000);
  const pIG = pctFromLog(ig, 2000000);
  const pTK = pctFromLog(tk, 2000000);
  const pYT = pctFromLog(yt, 1000000);

  const c1 = tagFromPct(pML);
  const c2 = tagFromPct(pSF);
  const c3 = tagFromPct(pIG);
  const c4 = tagFromPct(pTK);
  const c5 = tagFromPct(pYT);

  // Conversões (heurísticas)
  const convSpotify = ratio(sf, ml); // seguidores / ouvintes mensais
  // referência: 2% a 8% geralmente é “ok/boa” (depende do nicho e momento)
  const convScore = clamp(Math.round((convSpotify / 0.06) * 100), 0, 140); // 6% como referência

  const socialVsStreaming = (ig + tk + yt) > 0 ? ratio(ml, (ig + tk + yt)) : 0;

  const cards = [
    {
      name: "Spotify • Ouvintes mensais",
      value: formatNumber(ml),
      sub: "Potencial de descoberta e alcance recente",
      pct: pML,
      ...c1
    },
    {
      name: "Spotify • Seguidores",
      value: formatNumber(sf),
      sub: "Base fiel (saves + retorno em lançamentos)",
      pct: pSF,
      ...c2
    },
    {
      name: "Instagram • Seguidores",
      value: formatNumber(ig),
      sub: "Audiência social e relacionamento",
      pct: pIG,
      ...c3
    },
    {
      name: "TikTok • Seguidores",
      value: formatNumber(tk),
      sub: "Alcance orgânico e viralidade",
      pct: pTK,
      ...c4
    },
    {
      name: "YouTube • Inscritos",
      value: formatNumber(yt),
      sub: "Conteúdo longo + Shorts + prova social",
      pct: pYT,
      ...c5
    }
  ];

  const insights = [];
  const goals = [];

  // Insight: conversão Spotify (seguidores/ouvintes)
  if(ml > 0){
    const convPct = (convSpotify * 100);
    if(convSpotify >= 0.08){
      insights.push(`Conversão Spotify forte: ~${convPct.toFixed(1)}% dos ouvintes viram seguidores. Mantenha CTAs (seguir/salvar).`);
    }else if(convSpotify >= 0.03){
      insights.push(`Conversão Spotify ok: ~${convPct.toFixed(1)}%. Dá para aumentar com CTA e conteúdo do lançamento.`);
    }else{
      insights.push(`Conversão Spotify baixa: ~${convPct.toFixed(1)}%. Falta “converter” ouvintes em seguidores (CTA, perfil forte, repetição do refrão e stories).`);
    }
  }else{
    insights.push("Spotify ainda sem tração (0 ouvintes). Prioridade: lançar/otimizar perfil e gerar descoberta com conteúdo e colabs.");
  }

  // Insight: “muita rede social vs pouco streaming”
  const socialTotal = ig + tk + yt;
  if(socialTotal >= 5000 && ml > 0){
    // Se o streaming é muito baixo comparado à base social
    if(socialVsStreaming < 0.12){
      insights.push("Você tem audiência social, mas poucos ouvintes mensais: crie funil para streaming (links, CTA, desafios com a música e pre-save).");
    }else{
      insights.push("Sua audiência social está convertendo em streaming de forma razoável. Continue reforçando links e séries de conteúdo.");
    }
  }

  // Insight: equilíbrio entre redes
  if(ig > 0 && tk === 0){
    insights.push("Instagram está ativo, mas TikTok está zerado: você está perdendo alcance orgânico. Replicar Reels como TikTok é um atalho.");
  }
  if(tk > 0 && ig === 0){
    insights.push("TikTok ativo, Instagram zerado: consolide presença no IG para relacionamento e prova social (repost do TikTok + stories).");
  }

  // Insight: YouTube subutilizado
  if(yt < 200 && (ml > 2000 || ig > 3000 || tk > 3000)){
    insights.push("Seu YouTube está abaixo do seu potencial. Shorts + lyric video + 1 conteúdo fixo por semana elevam prova social.");
  }

  // Goals 30 dias
  const gML = growthTarget(ml);
  const gSF = growthTarget(sf);
  const gIG = growthTarget(ig);
  const gTK = growthTarget(tk);
  const gYT = growthTarget(yt);

  goals.push(`Spotify: aumentar ouvintes mensais em ~${gML}% (com conteúdo curto + colab + playlists independentes).`);
  goals.push(`Spotify: aumentar seguidores em ~${gSF}% (CTA “seguir/salvar” em todo conteúdo do lançamento).`);
  goals.push(`Instagram: aumentar seguidores em ~${gIG}% (3–5 posts/semana + stories diários por 7 dias).`);
  goals.push(`TikTok: aumentar seguidores em ~${gTK}% (1 vídeo/dia por 7 dias com variações do mesmo áudio).`);
  goals.push(`YouTube: aumentar inscritos em ~${gYT}% (Shorts 3x/semana + 1 vídeo/semana).`);

  // Metas extras: conversão
  if(ml > 0){
    const desiredConv = clamp(Math.max(convSpotify, 0.04) + 0.01, 0.04, 0.1);
    goals.push(`Conversão Spotify: buscar ~${(desiredConv*100).toFixed(1)}% (perfil completo + CTA + destaque do lançamento).`);
  }

  // Se tudo zero
  if(ml === 0 && sf === 0 && ig === 0 && tk === 0 && yt === 0){
    insights.length = 0;
    insights.push("Você está no ponto zero de métricas. Ótimo: dá para estruturar tudo certo desde o início.");
    goals.length = 0;
    goals.push("Criar perfis oficiais (Spotify for Artists / YouTube / Instagram / TikTok) com identidade padronizada.");
    goals.push("Planejar 1 lançamento (single) e preparar 15 conteúdos curtos do refrão.");
    goals.push("Executar rotina mínima: 3 posts/semana + 1 live curta/semana por 30 dias.");
  }

  return { cards, insights, goals };
}
