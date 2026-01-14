// js/core/content-plan.js
// Vale Produção — Content Plan Engine (Etapa D)
// Gera 30 ideias com CTA e mini-roteiro, baseado em objetivo, tráfego e top música.
// Offline, determinístico, sem API.

import { safeText } from "../utils.js";

function pick(arr, i){
  if(!arr.length) return "";
  return arr[i % arr.length];
}

function normList(text){
  const t = safeText(text).trim();
  if(!t) return [];
  const low = t.toLowerCase();
  if(low === "não sei" || low === "nao sei") return [];
  return t.split(",").map(s=> safeText(s).trim()).filter(Boolean).slice(0, 5);
}

function labelGoal(v){
  const map = {
    crescer_fas: "Crescer fãs",
    crescer_stream: "Crescer streams",
    fechar_shows: "Fechar shows",
    monetizar: "Monetizar",
    viralizar: "Viralizar"
  };
  return map[v] || "Crescer";
}

function labelTraffic(v){
  const map = {
    algoritmo: "Algoritmo",
    playlists: "Playlists",
    social: "Social",
    youtube: "YouTube",
    shows: "Shows",
    colabs: "Colabs",
    ads: "Anúncios",
    nao_sei: "Indefinido"
  };
  return map[v] || "Indefinido";
}

function buildCTA(goal){
  const ctas = {
    crescer_stream: [
      "CTA: salva a música e coloca em uma playlist sua.",
      "CTA: segue no Spotify e salva agora pra ouvir depois.",
      "CTA: ouve 2x e me diz qual parte mais pegou."
    ],
    crescer_fas: [
      "CTA: me segue e comenta ‘EU TÔ AQUI’ pra eu te reconhecer.",
      "CTA: manda esse vídeo pra alguém que precisa ouvir isso.",
      "CTA: segue e entra na comunidade (link na bio)."
    ],
    fechar_shows: [
      "CTA: quer me ver na sua cidade? comenta a cidade aqui.",
      "CTA: produtores/igrejas/eventos: chama no direct/WhatsApp.",
      "CTA: marca um local/evento da sua região."
    ],
    monetizar: [
      "CTA: entra no link da bio (apoio/playlist/YouTube).",
      "CTA: compartilha e me ajuda a manter o projeto vivo.",
      "CTA: segue pra acompanhar os próximos lançamentos."
    ],
    viralizar: [
      "CTA: usa esse áudio e marca meu perfil.",
      "CTA: faz dueto/reaction e me marca.",
      "CTA: comenta a parte que mais te atingiu."
    ]
  };
  return ctas[goal] || ctas.crescer_stream;
}

function stageHint(stageLabel){
  const s = safeText(stageLabel).toLowerCase();
  if(!s) return "base";
  if(s.includes("início") || s.includes("inicio")) return "base";
  if(s.includes("constru")) return "build";
  if(s.includes("cresci")) return "grow";
  if(s.includes("escala")) return "scale";
  return "base";
}

function formatHook(track, genre){
  const g = safeText(genre || "").toLowerCase();
  const hookStyles = [
    `Começa com o refrão (2s) de "${track}" e corta no melhor verso.`,
    `Começa com uma frase forte e entra no refrão de "${track}".`,
    `Mostra 1 segundo do “drop” e volta: "olha isso..." → refrão.`,
    `Começa em silêncio + legenda: “isso aqui me salvou…” → refrão.`
  ];

  if(g.includes("gospel")){
    hookStyles.unshift(`Legenda: “Se você precisa de fé hoje…” → refrão de "${track}".`);
  }
  if(g.includes("funk") || g.includes("trap")){
    hookStyles.unshift(`Começa no beat + gesto marcante → entra no refrão de "${track}".`);
  }
  if(g.includes("sertanejo") || g.includes("forró")){
    hookStyles.unshift(`Começa com violão/pegada ao vivo → refrão de "${track}".`);
  }

  return hookStyles;
}

function trafficAngle(traffic){
  const tips = {
    social: [
      "Formato curto (7–15s), gancho em 2s, legenda grande e cortes rápidos.",
      "Repetir o mesmo trecho com ângulos diferentes (12 variações)."
    ],
    playlists: [
      "Foco em prova social + ‘saves’ nos primeiros 7 dias.",
      "Conteúdo pedindo para adicionar em playlist pessoal."
    ],
    algoritmo: [
      "Foco em retenção: começa no refrão + loop no final.",
      "Postar em horários consistentes e repetir formato vencedor."
    ],
    youtube: [
      "Shorts com título direto + fixar comentário com link.",
      "1 vídeo fixo (lyric/acústico) por semana pra consolidar."
    ],
    shows: [
      "Conteúdo com palco/ensaio + CTA para cidade/produtores.",
      "Prova social: trechos ao vivo e reação do público."
    ],
    colabs: [
      "Dueto/reaction com creators e artistas do mesmo nicho.",
      "Cross-post (ambos publicam e marcam)."
    ],
    ads: [
      "Criativos curtos (6–12s), muitos testes, otimiza pelo melhor.",
      "Separar criativo de descoberta vs conversão."
    ],
    nao_sei: [
      "Comece pelo social (volume), e use CTA salvar/seguir pra medir conversão.",
      "Anote o que trouxe mais resultado em 7 dias e dobre a aposta."
    ]
  };
  return tips[traffic] || tips.nao_sei;
}

export function buildContentPlan({ answers, reportResult }){
  const goal = safeText(answers.goal || "crescer_stream");
  const traffic = safeText(answers.traffic_source_main || "nao_sei");
  const weak = safeText(answers.traffic_weakest || "");
  const genre = safeText(answers.genre || "");

  const topTracks = normList(answers.top_tracks_3 || "");
  const topCities = normList(answers.top_cities_3 || "");
  const topCountries = normList(answers.top_countries_3 || "");

  const track = topTracks[0] || "sua música";
  const city = topCities[0] || "sua cidade";
  const country = topCountries[0] || "seu público";

  const stageLabel = safeText(reportResult?.stage?.label || "");
  const stageMode = stageHint(stageLabel);

  const ctas = buildCTA(goal);
  const hooks = formatHook(track, genre);
  const trafficTips = trafficAngle(traffic);

  const weakNote = weak ? `Canal fraco: ${labelTraffic(weak)}.` : "";

  // blocos de formatos
  const formats = [
    { tag: "Performance", base: "Você cantando/tocando com emoção, enquadramento limpo e legenda grande." },
    { tag: "Storytelling", base: "História real: por que essa música existe e o que ela cura no público." },
    { tag: "Trend", base: "Aproveitar trend sem perder identidade: usar o áudio/tema com seu refrão." },
    { tag: "Bastidores", base: "Processo: estúdio, ensaio, composição, erro engraçado, antes/depois." },
    { tag: "Prova social", base: "Reactions, comentários, prints, pessoas usando o áudio, mini depoimentos." },
    { tag: "Comunidade", base: "Perguntas, enquetes, pedido de cidade, pedidos de oração/tema, desafios." }
  ];

  // Ajuste por estágio (base/build/grow/scale)
  const stageDirective = {
    base: "Prioridade: consistência + identidade clara + CTA direto.",
    build: "Prioridade: repetição inteligente + funil para seguir/salvar.",
    grow: "Prioridade: colabs/creators + playlists + otimizar conversão.",
    scale: "Prioridade: escalar formatos vencedores + segunda onda + PR."
  }[stageMode];

  const ideas = [];
  for(let i=0; i<30; i++){
    const day = i + 1;
    const f = formats[i % formats.length];
    const cta = pick(ctas, i);
    const hook = pick(hooks, i);
    const tTip = pick(trafficTips, i);

    const title =
      (i % 6 === 0) ? `Hook imediato (${track})` :
      (i % 6 === 1) ? `História por trás (${track})` :
      (i % 6 === 2) ? `Trend adaptada (${track})` :
      (i % 6 === 3) ? `Bastidor real (processo)` :
      (i % 6 === 4) ? `Prova social (reação/print)` :
      `Comunidade (cidade/público)`;

    const angle =
      (f.tag === "Comunidade" && topCities.length) ? `Pedir ${city} nos comentários e marcar páginas locais.` :
      (f.tag === "Comunidade") ? "Fazer pergunta direta e responder comentários em vídeo." :
      (f.tag === "Prova social" && topCountries.length) ? `Usar comentário do público de ${country} (mesmo que pequeno).` :
      f.base;

    const script =
      `🧠 Direção: ${stageDirective}\n` +
      `🎯 Objetivo: ${labelGoal(goal)} • Tráfego: ${labelTraffic(traffic)}. ${weakNote}\n` +
      `⚡ Hook: ${hook}\n` +
      `🎬 Formato: ${f.tag}\n` +
      `📌 Ângulo: ${angle}\n` +
      `🚀 Otimização: ${tTip}`;

    ideas.push({
      day,
      title,
      tags: [f.tag, labelTraffic(traffic), labelGoal(goal)],
      script,
      cta
    });
  }

  return {
    meta: {
      goal: labelGoal(goal),
      traffic: labelTraffic(traffic),
      stage: stageLabel || "—",
      track: track
    },
    ideas
  };
}