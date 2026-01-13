// js/core/report.js
// Vale Produção — Career Manager
// Scoring + estágio + planos (mensal/anual) + recomendações

import { clamp } from "../utils.js";

export function pillarMeta(key){
  const map = {
    identidade: { label: "Identidade & Marca" },
    catalogo: { label: "Catálogo & Qualidade" },
    plataformas: { label: "Plataformas & Presença" },
    marketing: { label: "Marketing & Conteúdo" },
    tracao: { label: "Tração & Métricas" },
    negocio: { label: "Negócio & Shows" }
  };
  return map[key] || { label: key };
}

function n(v){ return typeof v === "number" && Number.isFinite(v) ? v : 0; }

function scoreFromChoice(value, table, fallback=0){
  return (value in table) ? table[value] : fallback;
}

function normalizeLog(value, maxRef){
  // Curva log suave: bom para métricas (0..maxRef)
  if(value <= 0) return 0;
  const x = Math.log10(value + 1);
  const m = Math.log10(maxRef + 1);
  return clamp(Math.round((x / m) * 100), 0, 100);
}

function stageFromSignals(sig){
  // sig: { tractionScore, planningScore, catalogScore, platformsScore, businessScore }
  const t = sig.tractionScore;
  const p = sig.planningScore;
  const c = sig.catalogScore;
  const pl = sig.platformsScore;
  const b = sig.businessScore;

  // Estágios simples e confiáveis
  if(t < 18 && c < 20 && pl < 20){
    return {
      key: "iniciante",
      label: "Iniciante",
      hint: "Foco: consolidar identidade, lançar com padrão profissional e criar rotina mínima de conteúdo."
    };
  }
  if(t < 35 && (p < 45 || pl < 45)){
    return {
      key: "diy",
      label: "DIY em construção",
      hint: "Foco: constância + otimização de perfis + estratégia de lançamento para começar a escalar."
    };
  }
  if(t >= 35 && t < 60 && (pl >= 45 || p >= 45)){
    return {
      key: "crescimento",
      label: "Em crescimento",
      hint: "Foco: repetir o que está funcionando, aumentar conversão (fãs) e organizar operação para escalar."
    };
  }
  if(t >= 60 && (b >= 50 || p >= 60)){
    return {
      key: "pro",
      label: "Profissional",
      hint: "Foco: expansão, monetização avançada e consistência de alto nível (Brasil + internacional)."
    };
  }
  return {
    key: "ascensao",
    label: "Em ascensão",
    hint: "Foco: consolidar audiência e transformar tração em base fiel, shows e receita recorrente."
  };
}

function buildNextGoal(stageKey, pillarScores){
  // escolhe o menor pilar como norte
  const sorted = Object.entries(pillarScores).sort((a,b)=> a[1]-b[1]);
  const [weakest] = sorted[0] || ["marketing", 0];
  const meta = pillarMeta(weakest).label;

  const map = {
    iniciante: `Ativar base: ${meta}`,
    diy: `Otimizar para crescer: ${meta}`,
    crescimento: `Escalar com consistência: ${meta}`,
    ascensao: `Converter audiência em fãs: ${meta}`,
    pro: `Expandir e aumentar receita: ${meta}`
  };
  return map[stageKey] || `Fortalecer: ${meta}`;
}

function monthPlan(goal, weakestKey){
  const base = [
    { label:"Semana 1", when:"Dias 1–7", desc:"Organizar perfil (bio/foto/links), definir meta do mês e calendário de conteúdo." },
    { label:"Semana 2", when:"Dias 8–14", desc:"Criar conteúdos curtos (Reels/Shorts/TikTok) com gancho forte + rotina de postagens." },
    { label:"Semana 3", when:"Dias 15–21", desc:"Ações de crescimento: colab/feat, envio para curadores, ativar comunidade (stories, grupo, lives)." },
    { label:"Semana 4", when:"Dias 22–30", desc:"Analisar métricas, ajustar o que performou melhor e preparar o próximo passo (lançamento ou campanha)." }
  ];

  const goalTweaks = {
    crescer_fas: [
      "Criar 1 conteúdo por dia por 7 dias (sequência) e chamar para seguir/salvar.",
      "Abrir canal de comunidade (WhatsApp/Telegram) e convidar os seguidores mais engajados.",
      "1 live curta por semana para humanizar e manter presença."
    ],
    crescer_stream: [
      "Preparar pitch (Spotify for Artists) e enviar lançamento com antecedência.",
      "Campanha de pre-save + conteúdo mostrando trecho mais forte da música.",
      "Ações com playlists independentes e colabs com artistas do nicho."
    ],
    fechar_shows: [
      "Montar kit do artista (bio curta, fotos, links, vídeos ao vivo).",
      "Listar 20 casas/eventos e enviar proposta com repertório e condições.",
      "Fechar 1 show pequeno e registrar conteúdo profissional dele."
    ],
    monetizar: [
      "Definir 2 fontes extras (merch, aulas, licenciamento, publishing).",
      "Criar oferta simples (ex.: camiseta + meet online) e divulgar para a base.",
      "Organizar pagamentos, registros e relatórios (controle financeiro básico)."
    ],
    viralizar: [
      "Criar 10 variações de vídeo com o mesmo áudio (gancho forte nos 2s iniciais).",
      "Rodar 1 trend por dia por 7 dias e estimular UGC (desafio simples).",
      "Fazer 1 collab com criador de conteúdo (microinfluenciador)."
    ]
  };

  const weakTweaks = {
    identidade: "Refinar estética: capa, fotos, bio e narrativa (história por trás das músicas).",
    catalogo: "Revisar qualidade: mix/master, consistência de lançamentos, e planejamento de singles/EP.",
    plataformas: "Otimizar perfis: Spotify/YouTube com playlists, canvas, thumbnails e links.",
    marketing: "Criar rotina de conteúdo (3–5x/semana) e testar formatos com CTA (salvar/seguir).",
    tracao: "Ativar crescimento: campanhas pequenas, colabs e conteúdo direcionado para conversão.",
    negocio: "Estruturar shows e monetização: kit, agenda, cachê e fontes extras."
  };

  // Injeta ajustes no plano base
  base[0].desc += " " + (weakTweaks[weakestKey] || "");
  base[1].desc += " " + (goalTweaks[goal]?.[0] || "");
  base[2].desc += " " + (goalTweaks[goal]?.[1] || "");
  base[3].desc += " " + (goalTweaks[goal]?.[2] || "");
  return base;
}

function yearPlan(stageKey, goal){
  const base = [
    { label:"Mês 1", when:"Agora", desc:"Ajustar marca e perfis. Definir calendário de conteúdo e meta por plataforma." },
    { label:"Mês 2", when:"30–60d", desc:"Rotina de conteúdo + colabs. Preparar (ou planejar) próximo lançamento." },
    { label:"Mês 3", when:"60–90d", desc:"Lançamento (single) ou campanha forte. Analisar retenção e saves." },
    { label:"Mês 4", when:"90–120d", desc:"Fortalecer comunidade. Criar conteúdos recorrentes e melhorar performance." },
    { label:"Mês 5", when:"120–150d", desc:"Segundo lançamento / versão ao vivo / acústico. Expandir playlists e mídia." },
    { label:"Mês 6", when:"150–180d", desc:"Consolidar show/agenda (ou mini-turnê local). Melhorar ticket médio." },
    { label:"Mês 7", when:"180–210d", desc:"Projeto maior (EP/compilado). Reforçar narrativa e identidade visual." },
    { label:"Mês 8", when:"210–240d", desc:"Campanhas segmentadas. Testar formatos vencedores e escalar." },
    { label:"Mês 9", when:"240–270d", desc:"Ativação com fãs: merch/experiência. Converter audiência em receita." },
    { label:"Mês 10", when:"270–300d", desc:"Conteúdos de bastidores e provas sociais (clipes, shows, depoimentos)." },
    { label:"Mês 11", when:"300–330d", desc:"Parcerias maiores. Buscar oportunidades fora da cidade/estado." },
    { label:"Mês 12", when:"330–365d", desc:"Fechamento do ano: métricas, melhores músicas, plano do próximo ano." }
  ];

  // Ajuste conforme estágio/objetivo
  const add = (i, extra)=> { base[i].desc += " " + extra; };

  if(stageKey === "iniciante"){
    add(0, "Prioridade: lançar 1 música bem feita e padronizar perfis.");
    add(2, "Foco em um single com qualidade + conteúdo forte do refrão.");
  }
  if(stageKey === "diy"){
    add(1, "Criar rotina de 3–5 posts/semana e 1 série (ex.: bastidores).");
    add(4, "Aumentar presença em playlists e fortalecer YouTube.");
  }
  if(stageKey === "crescimento" || stageKey === "ascensao"){
    add(5, "Fechar agenda e registrar conteúdos profissionais dos shows.");
    add(7, "Escalar anúncios do formato que já performa.");
  }
  if(stageKey === "pro"){
    add(6, "Pensar em projeto grande (álbum/turnê) e estratégia internacional.");
    add(8, "Monetização avançada: licenciamento, publishing e parcerias de marca.");
  }

  const goalExtras = {
    crescer_fas: "Meta: aumentar seguidores e engajamento com CTA e comunidade.",
    crescer_stream: "Meta: aumentar saves, plays e entradas em playlists (pitch antecipado).",
    fechar_shows: "Meta: aumentar shows/mês, melhorar cachê e ampliar cidades.",
    monetizar: "Meta: diversificar receita (merch, aulas, licenciamento, publishing).",
    viralizar: "Meta: criar sequência de conteúdo com variações e estímulo a UGC."
  };
  add(2, goalExtras[goal] || "");
  return base;
}

function recs(stageKey, weakestKey, answers){
  const recList = [];

  const name = (answers.artist_name || "Artista").toString().trim() || "Artista";
  recList.push({
    title: `Resumo estratégico para ${name}`,
    body: "Seu crescimento depende de consistência + foco. O relatório prioriza ações que aumentam descoberta (algoritmo) e conversão em fãs (comunidade)."
  });

  const byWeak = {
    identidade: {
      title: "Identidade & Marca (prioridade)",
      body: "Padronize nome, foto, bio e estética. Defina uma narrativa: quem você é, o que representa e por que sua música existe. A consistência visual aumenta confiança e conversão."
    },
    catalogo: {
      title: "Catálogo & Qualidade (prioridade)",
      body: "Trabalhe mix/master e constância. Um plano de singles (1 a cada 30–60 dias) + projeto maior (EP/álbum) cria “história” e aumenta retenção."
    },
    plataformas: {
      title: "Plataformas (prioridade)",
      body: "Otimização é dinheiro: Spotify for Artists completo (bio, fotos, canvas, pitch) e YouTube com thumbnails, Shorts e conteúdo recorrente."
    },
    marketing: {
      title: "Marketing & Conteúdo (prioridade)",
      body: "Crie um sistema: 3–5 posts por semana, 1 série fixa, CTA claro (salvar/seguir). Teste formatos e repita o que performa."
    },
    tracao: {
      title: "Tração & Métricas (prioridade)",
      body: "Aumente descoberta: colabs, microinfluenciadores, playlists independentes e anúncios pequenos (teste com baixo orçamento). Otimize para saves e retenção."
    },
    negocio: {
      title: "Negócio & Shows (prioridade)",
      body: "Shows e oferta movem a carreira: monte kit (bio, fotos, links, vídeos ao vivo), liste locais e proponha datas. Estruture cachê e fontes extras."
    }
  };

  recList.push(byWeak[weakestKey] || {
    title: "Prioridade principal",
    body: "Fortaleça o pilar mais fraco primeiro — ele limita o restante."
  });

  // Recomendações complementares baseadas em sinais
  const hasShows = (answers.shows && answers.shows !== "nao");
  const hasTikTok = (answers.tiktok_use && answers.tiktok_use !== "nao");
  const ads = answers.ads_budget || "none";
  const distro = (answers.distributor || "").toString().toLowerCase();

  if(!hasTikTok){
    recList.push({
      title: "TikTok/Reels/Shorts (alavanca rápida)",
      body: "Você está deixando alcance na mesa. Crie 10 vídeos curtos por semana com o trecho mais forte da música, variando contexto (bastidor, performance, história, trend)."
    });
  }
  if(!hasShows){
    recList.push({
      title: "Acelerar com shows (mesmo pequenos)",
      body: "Shows aumentam fãs reais e prova social. Comece com eventos locais e registre conteúdo bom. Isso melhora redes e fecha mais datas."
    });
  }
  if(ads === "none"){
    recList.push({
      title: "Anúncios (pequeno, mas inteligente)",
      body: "Teste R$ 50–R$ 150 por 7 dias com vídeo vertical nativo. Direcione para público semelhante (interesses/artistas) e otimize para perfil/stream."
    });
  }
  if(distro.includes("não") || distro.includes("nao") || distro.trim() === ""){
    recList.push({
      title: "Distribuição profissional",
      body: "Use uma distribuidora para lançar globalmente e organizar metadata. Isso melhora monetização e facilita estratégia de playlists."
    });
  }

  return recList;
}

function buildChecklist(goal, weakestKey){
  const base = [
    "Padronizar nome, foto e bio em todas as plataformas",
    "Criar calendário de conteúdo (mínimo 3x/semana)",
    "Definir 1 meta de crescimento (ex.: +20% seguidores) para 30 dias",
    "Organizar links (link na bio) e call-to-action (salvar/seguir)",
    "Revisar métricas 1x por semana e ajustar o plano"
  ];

  const extraByWeak = {
    identidade: ["Criar 1 guia visual (cores, tipografia, referências) para seus posts e capas"],
    catalogo: ["Definir data do próximo lançamento e checklist de produção (mix/master/capa)"],
    plataformas: ["Reivindicar Spotify for Artists e completar perfil + playlists do artista"],
    marketing: ["Criar 10 roteiros de vídeos curtos com variações do mesmo áudio"],
    tracao: ["Testar 1 collab com artista/criador e medir resultado"],
    negocio: ["Montar kit do artista e enviar proposta para 20 locais/eventos"]
  };

  const extraByGoal = {
    crescer_fas: ["Criar grupo/comunidade e convidar os seguidores mais engajados"],
    crescer_stream: ["Configurar pre-save e enviar pitch editorial com antecedência"],
    fechar_shows: ["Fechar 1 show pequeno e gravar conteúdo profissional"],
    monetizar: ["Escolher 2 fontes extras (merch/aulas/licenciamento) e criar oferta simples"],
    viralizar: ["Publicar 1 variação por dia com o mesmo áudio por 7 dias"]
  };

  return base
    .concat(extraByWeak[weakestKey] || [])
    .concat(extraByGoal[goal] || []);
}

function priorities(goal, weakestKey){
  const map = {
    crescer_fas: [
      "Criar rotina de conteúdo com CTA (seguir/salvar)",
      "Ativar comunidade (WhatsApp/Telegram) e fazer 1 live por semana",
      "Fortalecer identidade visual e narrativa do artista"
    ],
    crescer_stream: [
      "Preparar estratégia de lançamento e pitch antecipado",
      "Criar conteúdo do refrão/gancho + pre-save",
      "Ações com playlists independentes e colabs"
    ],
    fechar_shows: [
      "Montar kit do artista (1 página) e repertório",
      "Contato com 20 locais/eventos + follow-up",
      "Registrar show para virar conteúdo e prova social"
    ],
    monetizar: [
      "Escolher 2 fontes extras de receita",
      "Organizar operação (financeiro, registros e relatórios)",
      "Criar oferta simples para base (merch/experiência)"
    ],
    viralizar: [
      "Definir trecho forte (15s) e criar 10 variações de vídeo",
      "Incentivar UGC (desafio simples) e colab com microinfluenciador",
      "Converter: chamar para seguir e ouvir a música completa"
    ]
  };
  const weakBonus = {
    identidade: "Refinar estética e mensagem do projeto",
    catalogo: "Planejar próximos lançamentos e elevar qualidade",
    plataformas: "Otimizar perfis e presença nas plataformas",
    marketing: "Fortalecer rotina de conteúdo e testes",
    tracao: "Aumentar descoberta e conversão",
    negocio: "Estruturar shows e monetização"
  };

  const list = map[goal] ? [...map[goal]] : ["Definir foco de 30 dias e executar com consistência"];
  list.unshift(weakBonus[weakestKey] || "Fortalecer pilar mais fraco");
  return list.slice(0, 4);
}

export function scoreAnswers(answers, questions){
  // Scores por pergunta (0..100)
  const s = {};

  // Identidade
  s.artist_name = (answers.artist_name && String(answers.artist_name).trim().length >= 2) ? 70 : 0;
  s.genre = scoreFromChoice(answers.genre, { gospel:70, sertanejo:70, funk:70, pop:70, rap:70, rock:70, pagode:70, eletronica:70, outros:60 }, 0);
  s.goal = scoreFromChoice(answers.goal, { crescer_fas:70, crescer_stream:70, fechar_shows:70, monetizar:70, viralizar:70 }, 0);

  // Catálogo / distribuição
  s.released_music = scoreFromChoice(answers.released_music, { "0":5, "1-2":25, "3-10":55, "11-25":75, "25+":90 }, 0);
  s.metadata_ready = scoreFromChoice(answers.metadata_ready, { nao:10, parcial:55, sim:90 }, 0);
  s.distributor = (answers.distributor && String(answers.distributor).trim().length >= 2 && !String(answers.distributor).toLowerCase().includes("não") && !String(answers.distributor).toLowerCase().includes("nao")) ? 65 : 20;

  // Plataformas
  s.spotify_profile = scoreFromChoice(answers.spotify_profile, { nao:10, basico:55, bom:80, premium:95 }, 0);
  s.youtube_channel = scoreFromChoice(answers.youtube_channel, { nao:10, inicio:40, ativo:75, forte:92 }, 0);

  // Marketing / Conteúdo
  s.tiktok_use = scoreFromChoice(answers.tiktok_use, { nao:10, asvezes:45, semanal:70, diario:88 }, 0);
  s.content_frequency = scoreFromChoice(answers.content_frequency, { raramente:10, "1w":40, "3w":72, diario:90 }, 0);
  s.ads_budget = scoreFromChoice(answers.ads_budget, { none:20, low:50, mid:75, high:90 }, 0);

  // Operação
  s.team = scoreFromChoice(answers.team, { solo:25, parcial:55, time:78, completa:92 }, 0);
  s.planning = scoreFromChoice(answers.planning, { zero:15, basico:45, bom:75, pro:92 }, 0);

  // Shows / Negócio
  s.shows = scoreFromChoice(answers.shows, { nao:20, ocasional:50, mensal:75, semanal:90 }, 0);

  const rev = Array.isArray(answers.revenue_sources) ? answers.revenue_sources : [];
  const revScore = rev.includes("nenhuma") ? 10 : clamp(rev.length * 14, 10, 90);
  s.revenue_sources = revScore;

  // Métricas (Tração) — normalização log
  const ml = normalizeLog(n(answers.monthly_listeners_num), 2000000);      // 0..2M
  const sf = normalizeLog(n(answers.spotify_followers_num), 500000);       // 0..500k
  const ig = normalizeLog(n(answers.instagram_followers_num), 2000000);    // 0..2M
  const tk = normalizeLog(n(answers.tiktok_followers_num), 2000000);       // 0..2M
  const yt = normalizeLog(n(answers.youtube_subs_num), 1000000);           // 0..1M

  s.monthly_listeners_num = ml;
  s.spotify_followers_num = sf;
  s.instagram_followers_num = ig;
  s.tiktok_followers_num = tk;
  s.youtube_subs_num = yt;

  // Pillars (pesos)
  const pillars = {
    identidade: [
      { k:"artist_name", w:0.45 },
      { k:"genre", w:0.25 },
      { k:"goal", w:0.30 }
    ],
    catalogo: [
      { k:"released_music", w:0.55 },
      { k:"metadata_ready", w:0.25 },
      { k:"distributor", w:0.20 }
    ],
    plataformas: [
      { k:"spotify_profile", w:0.55 },
      { k:"youtube_channel", w:0.45 }
    ],
    marketing: [
      { k:"tiktok_use", w:0.40 },
      { k:"content_frequency", w:0.35 },
      { k:"ads_budget", w:0.25 }
    ],
    tracao: [
      { k:"monthly_listeners_num", w:0.35 },
      { k:"spotify_followers_num", w:0.20 },
      { k:"instagram_followers_num", w:0.15 },
      { k:"tiktok_followers_num", w:0.15 },
      { k:"youtube_subs_num", w:0.15 }
    ],
    negocio: [
      { k:"shows", w:0.50 },
      { k:"revenue_sources", w:0.25 },
      { k:"planning", w:0.25 }
    ]
  };

  const pillarScores = {};
  for(const [p, items] of Object.entries(pillars)){
    const total = items.reduce((acc,it)=> acc + (s[it.k] || 0) * it.w, 0);
    pillarScores[p] = clamp(Math.round(total), 0, 100);
  }

  // Score geral (ponderado)
  const overall =
    Math.round(
      pillarScores.identidade * 0.12 +
      pillarScores.catalogo * 0.18 +
      pillarScores.plataformas * 0.18 +
      pillarScores.marketing * 0.18 +
      pillarScores.tracao * 0.18 +
      pillarScores.negocio * 0.16
    );

  // Estágio
  const stage = stageFromSignals({
    tractionScore: pillarScores.tracao,
    planningScore: s.planning,
    catalogScore: pillarScores.catalogo,
    platformsScore: pillarScores.plataformas,
    businessScore: pillarScores.negocio
  });

  // Insights
  const sorted = Object.entries(pillarScores).sort((a,b)=> a[1]-b[1]);
  const weakestKey = (sorted[0] && sorted[0][0]) ? sorted[0][0] : "marketing";

  const nextGoal = buildNextGoal(stage.key, pillarScores);

  const plans = {
    priorities: priorities(answers.goal, weakestKey),
    checklist: buildChecklist(answers.goal, weakestKey),
    month: monthPlan(answers.goal, weakestKey),
    year: yearPlan(stage.key, answers.goal),
    recs: recs(stage.key, weakestKey, answers)
  };

  return {
    overall,
    stage,
    pillarScores,
    insights: { nextGoal, weakestKey },
    plans
  };
}
