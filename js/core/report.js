// js/core/report.js
// Vale Produção — Strategic Report Engine v2
// Offline, determinístico e preparado para GitHub/Vercel.

function clamp(n, min=0, max=100){
  return Math.max(min, Math.min(max, Math.round(n)));
}

function num(v, def=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function text(v){
  return v == null ? "" : String(v).trim();
}

function listCount(v){
  if(Array.isArray(v)) return v.filter(Boolean).length;
  return 0;
}

function splitCsv(v){
  const t = text(v);
  if(!t) return [];
  const low = t.toLowerCase();
  if(low === "não sei" || low === "nao sei") return [];
  return t.split(",").map(s=> text(s)).filter(Boolean);
}

function logScore(value, ref){
  if(value <= 0) return 0;
  const x = Math.log10(value + 1);
  const m = Math.log10(ref + 1);
  return clamp((x / m) * 100);
}

export function pillarMeta(key){
  const map = {
    produto: { label:"Produto" },
    marca: { label:"Marca" },
    conteudo: { label:"Conteúdo" },
    marketing: { label:"Marketing" },
    audiencia: { label:"Audiência" },
    monetizacao: { label:"Monetização" },
    operacao: { label:"Operação" }
  };
  return map[key] || { label:key };
}

function stageFromScore(score){
  if(score >= 85) return { label:"Escala", hint:"Projeto pronto para escalar com campanhas, time e metas agressivas." };
  if(score >= 72) return { label:"Aceleração", hint:"Já existe base suficiente para dobrar o que funciona e profissionalizar conversão." };
  if(score >= 55) return { label:"Crescimento", hint:"A estrutura está ficando competitiva. O foco agora é constância, conversão e posicionamento." };
  if(score >= 38) return { label:"Construção", hint:"Existe potencial, mas ainda faltam rotina, identidade e operação previsível." };
  return { label:"Início", hint:"A prioridade é formar base: lançamento, perfis completos, rotina de conteúdo e metas simples." };
}

function labelGoal(v){
  const map = {
    crescer_fas: "Crescer fãs",
    crescer_stream: "Crescer streams",
    fechar_shows: "Fechar shows",
    monetizar: "Monetizar melhor",
    viralizar: "Viralizar"
  };
  return map[v] || "Crescimento";
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
    nao_sei: "Indefinido"
  };
  return map[v] || "Indefinido";
}

function pillarNarrative(key){
  const map = {
    produto: "Catálogo, lançamentos, metadata e clareza do produto musical.",
    marca: "Percepção visual, posicionamento, bio e coerência do projeto.",
    conteudo: "Volume, constância e capacidade de gerar repertório para social/video.",
    marketing: "Capacidade de atrair descoberta, rodar campanhas e testar canais.",
    audiencia: "Tração real de ouvintes, seguidores e prova social.",
    monetizacao: "Capacidade de transformar atenção em receita e oportunidades.",
    operacao: "Planejamento, equipe, organização e execução contínua."
  };
  return map[key] || "";
}

function buildProfile(overall, stage, goalLabel, ml, shows, revenueCount){
  if(overall >= 82){
    return {
      label: "Projeto pronto para mercado",
      description: `Seu projeto já opera acima da média do artista independente. A prioridade é aumentar eficiência comercial, repetição dos formatos vencedores e ampliar distribuição sem perder identidade.`,
      tone: "good"
    };
  }

  if(overall >= 65){
    return {
      label: "Projeto em expansão",
      description: `Existe base consistente para crescer com método. O sistema recomenda foco em ${goalLabel.toLowerCase()}, conversão e profissionalização da operação para entrar em faixa comercial mais forte.`,
      tone: "good"
    };
  }

  if(overall >= 45){
    return {
      label: "Projeto em estruturação séria",
      description: `Há sinais de potencial real, porém o crescimento ainda depende demais do esforço pontual. O próximo salto vem ao transformar rotina, estética e funil em sistema.`,
      tone: "mid"
    };
  }

  const extra = ml > 0 || shows === "ocasional" || revenueCount > 0
    ? "Já existe alguma tração, então o foco é organizar o que está disperso."
    : "Como ainda não há base forte, a missão é construir prova social mínima e presença recorrente.";

  return {
    label: "Projeto em fundação",
    description: `O projeto ainda está na fase de base e precisa de mais previsibilidade antes de competir em nível alto. ${extra}`,
    tone: "low"
  };
}

function addUnique(target, items){
  for(const item of items){
    const t = text(item);
    if(t && !target.includes(t)) target.push(t);
  }
}

function scoreBucket(score){
  if(score >= 75) return "Forte";
  if(score >= 55) return "Em evolução";
  return "Crítico";
}

function readinessCards(pillars, answers, topCountries){
  const brandBoost = text(answers.spotify_profile) === "premium" ? 8 : text(answers.spotify_profile) === "bom" ? 4 : 0;
  const releaseBoost = text(answers.metadata_ready) === "sim" ? 8 : text(answers.metadata_ready) === "parcial" ? 3 : 0;
  const intlBoost = topCountries.length >= 2 ? 8 : topCountries.length === 1 ? 3 : 0;

  const visual = clamp((pillars.marca * 0.62) + (pillars.produto * 0.18) + (pillars.operacao * 0.12) + brandBoost);
  const release = clamp((pillars.produto * 0.34) + (pillars.conteudo * 0.18) + (pillars.marketing * 0.20) + (pillars.operacao * 0.18) + releaseBoost);
  const execution = clamp((pillars.operacao * 0.40) + (pillars.conteudo * 0.24) + (pillars.marketing * 0.18) + (pillars.marca * 0.10));
  const monetization = clamp((pillars.monetizacao * 0.58) + (pillars.audiencia * 0.15) + (pillars.operacao * 0.12) + (pillars.marketing * 0.10));
  const international = clamp((pillars.audiencia * 0.28) + (pillars.marketing * 0.22) + (pillars.conteudo * 0.15) + (pillars.marca * 0.15) + intlBoost);

  return [
    { label:"Identidade visual", score:visual, hint:`${scoreBucket(visual)} · estética, bio, pitch e coerência de marca.` },
    { label:"Prontidão de lançamento", score:release, hint:`${scoreBucket(release)} · música, metadata, campanha e plano de saída.` },
    { label:"Execução operacional", score:execution, hint:`${scoreBucket(execution)} · rotina, time, calendário e capacidade de repetir.` },
    { label:"Monetização", score:monetization, hint:`${scoreBucket(monetization)} · shows, receita ativa e conversão comercial.` },
    { label:"Potencial internacional", score:international, hint:`${scoreBucket(international)} · geografia, posicionamento e escala de conteúdo.` }
  ];
}

function buildDiagnostics({ pillars, answers, overall, stage, goalLabel, topCountries, topCities, topTracks, trafficMain }){
  const strengths = [];
  const risks = [];
  const opportunities = [];
  const quickWins = [];

  const sorted = Object.entries(pillars).sort((a,b)=> b[1]-a[1]);
  const strongest = sorted.slice(0,3);
  const weakest = sorted.slice(-3).reverse();

  strongest.forEach(([key, value])=>{
    addUnique(strengths, [`${pillarMeta(key).label} acima da média (${value}/100). ${pillarNarrative(key)}`]);
  });

  if(text(answers.spotify_profile) === "premium" || text(answers.spotify_profile) === "bom"){
    addUnique(strengths, ["Perfis digitais já demonstram cuidado profissional. Isso encurta o caminho para campanhas e conversão."]);
  }
  if(num(answers.content_posts_7d) >= 7){
    addUnique(strengths, ["Existe disciplina recente de conteúdo. Isso é uma das maiores vantagens competitivas no cenário independente."]);
  }
  if(listCount(answers.revenue_sources) >= 2){
    addUnique(strengths, ["A receita já começa a se diversificar. Isso reduz a dependência de uma única fonte e melhora sustentabilidade."]);
  }

  weakest.forEach(([key, value])=>{
    if(value < 58){
      addUnique(risks, [`${pillarMeta(key).label} está vulnerável (${value}/100). Sem reforço aqui, o crescimento tende a travar.`]);
    }
  });

  if(text(answers.metadata_ready) === "nao"){
    addUnique(risks, ["Metadata e registros ainda não estão sólidos. Isso compromete monetização, organização e confiança de mercado."]);
  }
  if(num(answers.content_posts_7d) <= 3){
    addUnique(risks, ["Volume de conteúdo insuficiente para competir por atenção. O algoritmo dificilmente sustenta descoberta sem repetição."]);
  }
  if(text(answers.team) === "solo"){
    addUnique(risks, ["Operação excessivamente centralizada. Fazer tudo sozinho reduz velocidade, qualidade e consistência."]);
  }
  if(text(answers.traffic_weakest)){
    addUnique(risks, [`O canal mais fraco hoje é ${labelTraffic(answers.traffic_weakest)}. Isso aumenta dependência dos outros canais.`]);
  }

  if(topTracks.length){
    addUnique(opportunities, [`${topTracks[0]} já pode virar motor criativo: cortes, versões, refrões, acoustic, story e CTA em série.`]);
  }
  if(topCities.length){
    addUnique(opportunities, [`${topCities[0]} aparece como alavanca local. Há oportunidade clara para creators, mídia regional e agenda de shows.`]);
  }
  if(topCountries.length >= 2){
    addUnique(opportunities, ["Já existe sinal geográfico além do óbvio. Vale testar legenda adaptada, collabs e horários voltados ao público externo."]);
  }
  if(trafficMain){
    addUnique(opportunities, [`A principal origem de tráfego hoje é ${labelTraffic(trafficMain)}. O sistema recomenda aprofundar esse canal antes de abrir muitas frentes.`]);
  }
  if(goalLabel === "Fechar shows"){
    addUnique(opportunities, ["Há espaço para transformar conteúdo em demanda local, material de palco e proposta comercial simples para contratação."]);
  }
  if(goalLabel === "Monetizar melhor"){
    addUnique(opportunities, ["Seu caso pede empacotar atenção em oferta: show, produto, serviço musical, suporte de comunidade ou licenciamento."]);
  }

  addUnique(quickWins, [
    "Padronizar foto, bio, links e pitch de 2 linhas em Spotify, Instagram e YouTube.",
    "Definir um CTA principal por 30 dias: seguir, salvar, comentar ou pedir agenda.",
    "Criar 10 variações do mesmo trecho mais forte da música e postar em sequência controlada.",
    "Separar uma tarde por semana para produção em lote de conteúdo."
  ]);

  if(text(answers.planning) === "zero" || text(answers.planning) === "basico"){
    addUnique(quickWins, ["Transformar o plano em calendário de 4 semanas com tarefas pequenas e responsáveis claros."]);
  }
  if(text(answers.team) === "solo"){
    addUnique(quickWins, ["Delegar ao menos uma frente crítica: design, social, tráfego ou organização comercial."]);
  }
  if(num(answers.monthly_listeners_num) > 0 && num(answers.spotify_followers_num) < (num(answers.monthly_listeners_num) * 0.05)){
    addUnique(quickWins, ["Melhorar conversão de ouvintes em seguidores com CTA explícito e repetido em todo conteúdo sobre a música."]);
  }

  const summary = `A IA estratégica local identifica um projeto em fase de ${stage.label.toLowerCase()}, com score geral ${overall}/100. O foco recomendado é ${goalLabel.toLowerCase()} combinando reforço nos pilares mais fracos, aumento de constância e uma identidade mais memorável para competir em padrão premium.`;

  return { summary, strengths, risks, opportunities, quickWins };
}

function planTemplates(goal, weakSet, topCity, topTrack, trafficMain){
  const priorities = [];
  const checklist = [];
  const recs = [];

  if(weakSet.has("marca")){
    priorities.push("Refazer identidade essencial: foto, bio, capa, links e promessa clara do projeto.");
    checklist.push("Definir frase de posicionamento em 1 linha.");
    checklist.push("Atualizar Spotify, Instagram e YouTube com a mesma narrativa visual.");
    recs.push({ title:"Identidade forte", body:"Sem clareza visual e verbal, o público esquece rápido. Marca forte acelera percepção de valor." });
  }
  if(weakSet.has("conteudo")){
    priorities.push("Executar rotina de 30 dias com 4 a 7 conteúdos por semana usando o mesmo motor criativo.");
    checklist.push("Separar 12 ideias de conteúdo derivadas da música principal.");
    checklist.push("Gravar lote semanal com performance, história, bastidor e prova social.");
    recs.push({ title:"Conteúdo com sistema", body:"Volume inteligente vence perfeccionismo. Use variações de um mesmo gancho até encontrar o formato campeão." });
  }
  if(weakSet.has("marketing")){
    priorities.push("Montar campanha simples com teste A/B, CTA único e objetivo claro por 7 a 14 dias.");
    checklist.push("Criar 2 criativos principais e 2 ângulos secundários por lançamento.");
    checklist.push("Separar uma planilha de creators, playlists e páginas para outreach semanal.");
    recs.push({ title:"Marketing de precisão", body:"Campanha pequena, bem medida e repetível vale mais do que disparos sem tracking nem meta." });
  }
  if(weakSet.has("audiencia")){
    priorities.push("Subir prova social real: seguir, salvar, comentário, UGC e relacionamento com o público existente.");
    checklist.push("Criar CTA fixo para seguidores e saves em todo conteúdo por 30 dias.");
    checklist.push("Responder comentários e DMs com mais velocidade e intenção de comunidade.");
    recs.push({ title:"Audiência que converte", body:"Atenção sem comunidade vira vaidade. Priorize relacionamento e não apenas alcance bruto." });
  }
  if(weakSet.has("monetizacao")){
    priorities.push("Ativar pelo menos uma nova fonte de receita nas próximas 6 semanas.");
    checklist.push("Modelar proposta simples de show, serviço musical, apoio ou merch leve.");
    checklist.push("Definir preço-base, entregável e mensagem comercial curta.");
    recs.push({ title:"Monetização viável", body:"Receita vem de oferta clara. O público e os contratantes precisam entender rapidamente o que podem comprar." });
  }
  if(weakSet.has("operacao")){
    priorities.push("Transformar a carreira em operação com calendário, responsabilidades e revisão semanal.");
    checklist.push("Criar quadro semanal com prioridades, métricas e próxima ação.");
    checklist.push("Definir uma rotina de revisão todo domingo ou segunda-feira.");
    recs.push({ title:"Operação previsível", body:"Quando a execução vira sistema, o crescimento deixa de depender do humor ou do improviso." });
  }
  if(weakSet.has("produto")){
    priorities.push("Fortalecer produto: lançamento organizado, metadata correta e repertório pronto para trabalhar por semanas.");
    checklist.push("Checar ISRC, capa, título, créditos e distribuidora antes do próximo ciclo.");
    checklist.push("Escolher uma música-motor para virar centro do funil de conteúdo.");
    recs.push({ title:"Produto musical sólido", body:"Sem produto bem definido, até marketing bom perde potência. Trate a música como ativo central do sistema." });
  }

  if(goal === "fechar_shows"){
    priorities.unshift("Criar kit de show direto ao ponto: vídeo curto, setlist, proposta e contato rápido.");
    checklist.push("Mapear 30 contatos entre casas, igrejas, eventos e produtores locais.");
    recs.push({ title:"Agenda local", body:"Shows fecham quando existe clareza comercial, prova de palco e resposta rápida." });
  }
  if(goal === "crescer_stream"){
    priorities.unshift("Fazer a música principal trabalhar por 30 dias com CTA para seguir, salvar e entrar em playlists pessoais.");
    checklist.push("Criar 10 conteúdos com foco em refrão, contexto e repetição do áudio principal.");
  }
  if(goal === "monetizar"){
    priorities.unshift("Empacotar valor comercial em uma oferta simples e comunicável para fãs e contratantes.");
    checklist.push("Definir qual oferta será priorizada: show, serviço, merch, comunidade ou licenciamento.");
  }
  if(goal === "viralizar"){
    priorities.unshift("Testar volume alto de variações do mesmo áudio com hooks diferentes por 14 dias.");
    checklist.push("Produzir 12 aberturas diferentes usando o mesmo refrão/trecho forte.");
  }

  if(topTrack){
    priorities.push(`Usar "${topTrack}" como motor central de conteúdo, campanha e CTA.`);
  }
  if(topCity){
    checklist.push(`Executar ao menos uma ação local em ${topCity} com creator, página ou agenda.`);
  }
  if(trafficMain === "playlists"){
    checklist.push("Fazer outreach semanal para curadores independentes com mensagem curta e press kit enxuto.");
  }
  if(trafficMain === "social"){
    checklist.push("Repetir o formato vencedor por pelo menos 7 variações antes de abandonar a linha criativa.");
  }

  return { priorities, checklist, recs };
}

function buildMonthPlan(goalLabel, mainFocus){
  return [
    { label:"Semana 1", when:"Dias 1–7", desc:`Organizar perfis, definir meta principal (${goalLabel.toLowerCase()}) e montar produção em lote.` },
    { label:"Semana 2", when:"Dias 8–14", desc:`Publicar constância com foco em ${mainFocus.toLowerCase()} e iniciar contatos estratégicos.` },
    { label:"Semana 3", when:"Dias 15–21", desc:"Analisar performance, repetir o melhor formato e fortalecer prova social/comunidade." },
    { label:"Semana 4", when:"Dias 22–30", desc:"Rodar segunda onda da campanha, medir conversão e decidir próximo lançamento ou oferta." }
  ];
}

function buildYearPlan(goalLabel){
  const cycle = [
    `Trimestre 1 · Base visual, conteúdo e validação de proposta comercial para ${goalLabel.toLowerCase()}.`,
    `Trimestre 2 · Reforço de catálogo, collabs e crescimento dos canais que já respondem melhor.`,
    `Trimestre 3 · Consolidação de audiência, oferta mais madura e repetição das ações de melhor ROI.`,
    `Trimestre 4 · Escala premium: campanhas maiores, calendário fechado e posicionamento mais internacional.`
  ];
  return Array.from({ length: 12 }).map((_, index)=>({
    label:`Mês ${index + 1}`,
    when:"Ciclo",
    desc: cycle[Math.floor(index / 3)]
  }));
}

function buildRoadmap90(goalLabel, topTrack, topCity){
  return [
    {
      label:"0–30 dias",
      desc:`Organizar base, identidade e rotina. O objetivo é criar previsibilidade operacional para ${goalLabel.toLowerCase()} sem depender do acaso.`
    },
    {
      label:"31–60 dias",
      desc:`Dobrar o que funcionou, testar campanha e empilhar prova social. ${topTrack ? `A música-motor será ${topTrack}.` : "Escolher uma música-motor será obrigatório."}`
    },
    {
      label:"61–90 dias",
      desc:`Converter o crescimento em ativo comercial: agenda, receita, comunidade ou expansão. ${topCity ? `A cidade-chave é ${topCity}.` : "Definir território prioritário para expansão."}`
    }
  ];
}

export function scoreAnswers(answers){
  const a = answers || {};
  const revenue = Array.isArray(a.revenue_sources) ? a.revenue_sources.filter(v => v && v !== "nenhuma") : [];
  const topCountries = splitCsv(a.top_countries_3);
  const topCities = splitCsv(a.top_cities_3);
  const topTracks = splitCsv(a.top_tracks_3);

  const ml = num(a.monthly_listeners_num);
  const sf = num(a.spotify_followers_num);
  const ig = num(a.instagram_followers_num);
  const tt = num(a.tiktok_followers_num);
  const ys = num(a.youtube_subs_num);
  const s28 = num(a.streams_28d_total);
  const yv28 = num(a.youtube_views_28d);
  const posts7 = num(a.content_posts_7d);

  const goal = text(a.goal || "crescer_stream");
  const goalLabel = labelGoal(goal);
  const trafficMain = text(a.traffic_source_main || "nao_sei");

  const pillars = {
    produto: 18,
    marca: 18,
    conteudo: 18,
    marketing: 18,
    audiencia: 16,
    monetizacao: 16,
    operacao: 18
  };

  const careerMap = {
    "0-6m": [2, 1],
    "6-12m": [4, 3],
    "1-2y": [8, 7],
    "2-5y": [12, 12],
    "5y+": [15, 14]
  };
  const releasedMap = {
    "0": [0, 0],
    "1-2": [6, 2],
    "3-10": [12, 6],
    "11-25": [18, 8],
    "25+": [24, 12]
  };
  const spotifyMap = {
    nao: [0, 0],
    basico: [8, 3],
    bom: [14, 8],
    premium: [20, 12]
  };
  const youtubeMap = {
    nao: [0, 0],
    inicio: [4, 4],
    ativo: [10, 10],
    forte: [16, 14]
  };
  const tiktokMap = {
    nao: [0, 0],
    asvezes: [6, 4],
    semanal: [12, 8],
    diario: [18, 12]
  };
  const freqMap = {
    raramente: 0,
    "1w": 6,
    "3w": 13,
    diario: 20
  };
  const adsMap = {
    none: 0,
    low: 6,
    mid: 12,
    high: 18
  };
  const teamMap = {
    solo: 0,
    parcial: 8,
    time: 14,
    completa: 20
  };
  const planningMap = {
    zero: 0,
    basico: 8,
    bom: 16,
    pro: 22
  };
  const showsMap = {
    nao: 0,
    ocasional: 8,
    mensal: 15,
    semanal: 22
  };

  const career = careerMap[text(a.career_time)] || [0, 0];
  pillars.produto += career[0];
  pillars.operacao += career[1];

  const released = releasedMap[text(a.released_music)] || [0, 0];
  pillars.produto += released[0];
  pillars.operacao += released[1];

  const spotify = spotifyMap[text(a.spotify_profile)] || [0, 0];
  pillars.marca += spotify[0];
  pillars.audiencia += spotify[1];

  const youtube = youtubeMap[text(a.youtube_channel)] || [0, 0];
  pillars.conteudo += youtube[0];
  pillars.audiencia += youtube[1];

  const tiktok = tiktokMap[text(a.tiktok_use)] || [0, 0];
  pillars.conteudo += tiktok[0];
  pillars.audiencia += tiktok[1];

  pillars.conteudo += freqMap[text(a.content_frequency)] || 0;
  pillars.marketing += adsMap[text(a.ads_budget)] || 0;
  pillars.operacao += teamMap[text(a.team)] || 0;
  pillars.operacao += planningMap[text(a.planning)] || 0;
  pillars.monetizacao += showsMap[text(a.shows)] || 0;

  if(text(a.metadata_ready) === "sim"){
    pillars.produto += 16;
    pillars.operacao += 8;
  }else if(text(a.metadata_ready) === "parcial"){
    pillars.produto += 8;
    pillars.operacao += 4;
  }

  const distributor = text(a.distributor).toLowerCase();
  if(distributor && distributor !== "não tenho" && distributor !== "nao tenho"){
    pillars.operacao += 8;
    pillars.produto += 4;
  }

  if(text(a.genre)) pillars.marca += 5;
  if(text(a.notes).length >= 20) pillars.marca += 4;
  if(text(a.traffic_source_main) && text(a.traffic_source_main) !== "nao_sei") pillars.marketing += 6;
  if(text(a.traffic_weakest)) pillars.marketing += 2;

  pillars.monetizacao += clamp(revenue.length * 5, 0, 22);
  if(revenue.includes("shows")) pillars.monetizacao += 4;
  if(revenue.includes("publishing") || revenue.includes("licenciamento")) pillars.produto += 5;

  const audienceComposite = (
    logScore(ml, 250000) * 0.26 +
    logScore(sf, 50000) * 0.16 +
    logScore(ig, 500000) * 0.16 +
    logScore(tt, 500000) * 0.12 +
    logScore(ys, 200000) * 0.12 +
    logScore(s28, 2500000) * 0.10 +
    logScore(yv28, 5000000) * 0.08
  );
  pillars.audiencia += Math.round(audienceComposite * 0.34);

  pillars.conteudo += clamp(posts7 * 2.4, 0, 18);
  pillars.marketing += clamp(logScore(s28, 1500000) * 0.10, 0, 10);
  pillars.produto += clamp(logScore(s28, 1500000) * 0.08, 0, 8);

  if(topCountries.length) pillars.marketing += 3;
  if(topCountries.length >= 2) pillars.audiencia += 4;
  if(topCities.length) pillars.monetizacao += 4;
  if(topTracks.length) pillars.produto += 6;
  if(topTracks.length) pillars.marketing += 3;

  if(goal === "crescer_stream") pillars.produto += 4;
  if(goal === "fechar_shows") pillars.monetizacao += 4;
  if(goal === "monetizar") pillars.operacao += 3;
  if(goal === "viralizar") pillars.conteudo += 4;
  if(goal === "crescer_fas") pillars.marca += 4;

  Object.keys(pillars).forEach(key => {
    pillars[key] = clamp(pillars[key]);
  });

  const weights = {
    produto: 1.05,
    marca: 1.0,
    conteudo: 1.1,
    marketing: 1.05,
    audiencia: 1.2,
    monetizacao: 1.0,
    operacao: 1.05
  };

  let sum = 0;
  let weightSum = 0;
  for(const key of Object.keys(pillars)){
    sum += pillars[key] * weights[key];
    weightSum += weights[key];
  }
  const overall = clamp(sum / weightSum);
  const stage = stageFromScore(overall);
  const profile = buildProfile(overall, stage, goalLabel, ml, text(a.shows), revenue.length);
  const diagnostics = buildDiagnostics({
    pillars,
    answers:a,
    overall,
    stage,
    goalLabel,
    topCountries,
    topCities,
    topTracks,
    trafficMain
  });
  const readiness = readinessCards(pillars, a, topCountries);

  const sortedWeak = Object.entries(pillars).sort((a,b)=> a[1]-b[1]).slice(0,3).map(([key])=> key);
  const weakSet = new Set(sortedWeak);
  const templates = planTemplates(goal, weakSet, topCities[0] || "", topTracks[0] || "", trafficMain);

  const plans = {
    priorities: templates.priorities.slice(0, 6),
    checklist: templates.checklist.slice(0, 12),
    month: buildMonthPlan(goalLabel, pillarMeta(sortedWeak[0] || "conteudo").label),
    year: buildYearPlan(goalLabel),
    roadmap90: buildRoadmap90(goalLabel, topTracks[0] || "", topCities[0] || ""),
    recs: templates.recs.slice(0, 6)
  };

  const insights = {
    nextGoal: plans.priorities[0] || "Definir meta única para os próximos 30 dias.",
    executiveFocus: pillarMeta(sortedWeak[0] || "conteudo").label,
    mainTraffic: labelTraffic(trafficMain),
    goalLabel
  };

  return {
    overall,
    stage,
    pillarScores:pillars,
    profile,
    readiness,
    diagnostics,
    plans,
    insights
  };
}
