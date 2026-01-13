// js/core/report.js
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
  return map[key] || { label: key };
}

function stageFromScore(s){
  if(s >= 80) return { label:"Escala", hint:"Você está pronto para acelerar: consistência + distribuição + campanhas." };
  if(s >= 55) return { label:"Crescimento", hint:"Boa base. Foque em consistência e melhoria de conversão (seguidores/salvos)." };
  if(s >= 35) return { label:"Construção", hint:"Estruture perfil, identidade e rotina. Evite passos sem estratégia." };
  return { label:"Início", hint:"Comece pelo básico: catálogo, perfil, conteúdo e metas simples semanais." };
}

function num(v, def=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function scoreAnswers(answers, QUESTIONS){
  // Pilares (0-100)
  const pillars = {
    produto: 40,
    marca: 35,
    conteudo: 35,
    marketing: 30,
    audiencia: 30,
    monetizacao: 25,
    operacao: 30
  };

  // Regras simples e estáveis (sem depender de plataforma)
  const freq = answers.content_frequency;
  if(freq === "daily") pillars.conteudo += 25;
  else if(freq === "5w") pillars.conteudo += 18;
  else if(freq === "3w") pillars.conteudo += 12;
  else if(freq === "1w") pillars.conteudo += 6;

  const spotify = answers.spotify_profile;
  if(spotify === "pro") pillars.marca += 18;
  else if(spotify === "basico") pillars.marca += 10;

  const yt = answers.youtube_channel;
  if(yt === "ativo") pillars.audiencia += 10;

  const tiktok = answers.tiktok_use;
  if(tiktok === "diario") pillars.audiencia += 14;
  else if(tiktok === "asvezes") pillars.audiencia += 8;

  const dist = String(answers.distributor || "").toLowerCase();
  if(dist.includes("onerpm") || dist.includes("one rpm")) pillars.operacao += 10;
  if(dist.length > 0) pillars.operacao += 6;

  const meta = answers.metadata_ready;
  if(meta === "ok") pillars.produto += 18;
  else if(meta === "parcial") pillars.produto += 10;

  const ads = answers.ads_budget;
  if(ads === "mid") pillars.marketing += 12;
  else if(ads === "high") pillars.marketing += 18;
  else if(ads === "low") pillars.marketing += 6;

  const team = answers.team;
  if(team === "completo") pillars.operacao += 12;
  else if(team === "parcial") pillars.operacao += 6;

  const planning = answers.planning;
  if(planning === "pro") pillars.operacao += 12;
  else if(planning === "basico") pillars.operacao += 6;

  // Métricas informadas (números)
  const ml = num(answers.monthly_listeners_num, 0);
  const sf = num(answers.spotify_followers_num, 0);
  const ig = num(answers.instagram_followers_num, 0);
  const tt = num(answers.tiktok_followers_num, 0);
  const ys = num(answers.youtube_subs_num, 0);

  const audienceScore =
    (ml >= 50000 ? 20 : ml >= 10000 ? 14 : ml >= 3000 ? 10 : ml >= 500 ? 6 : 2) +
    (sf >= 10000 ? 14 : sf >= 2000 ? 10 : sf >= 500 ? 6 : 2) +
    (ig >= 50000 ? 14 : ig >= 10000 ? 10 : ig >= 3000 ? 6 : 2) +
    (tt >= 50000 ? 10 : tt >= 10000 ? 6 : tt >= 1000 ? 3 : 1) +
    (ys >= 50000 ? 10 : ys >= 10000 ? 6 : ys >= 1000 ? 3 : 1);

  pillars.audiencia += Math.min(25, Math.round(audienceScore/2));

  // Clamp 0-100
  Object.keys(pillars).forEach(k=>{
    pillars[k] = Math.max(0, Math.min(100, Math.round(pillars[k])));
  });

  // Score geral (média ponderada simples)
  const weights = {
    produto: 1.1,
    marca: 1.0,
    conteudo: 1.1,
    marketing: 1.0,
    audiencia: 1.2,
    monetizacao: 0.9,
    operacao: 1.0
  };
  let sum = 0, wsum = 0;
  for(const k of Object.keys(pillars)){
    sum += pillars[k] * weights[k];
    wsum += weights[k];
  }
  const overall = Math.round(sum / wsum);

  const stage = stageFromScore(overall);

  const plans = buildPlans(overall, pillars, answers);
  const insights = {
    nextGoal: plans.priorities[0] || "Definir meta e rotina semanal."
  };

  return {
    overall,
    stage,
    pillarScores: pillars,
    plans,
    insights
  };
}

function buildPlans(overall, pillars, answers){
  const priorities = [];
  const recs = [];
  const checklist = [];

  // prioridades por pontos fracos
  const entries = Object.entries(pillars).sort((a,b)=> a[1]-b[1]);
  const weakest = entries.slice(0, 2).map(x=>x[0]);

  if(weakest.includes("conteudo")){
    priorities.push("Criar rotina: 3 Reels/Shorts por semana por 30 dias.");
    checklist.push("Definir 12 ideias de conteúdo (hooks, bastidores, performance).");
    checklist.push("Gravar 4 conteúdos em lote (1 tarde/semana).");
    recs.push({ title:"Conteúdo", body:"O algoritmo premia consistência. Trabalhe com lote + variações do mesmo hook."});
  }
  if(weakest.includes("marketing")){
    priorities.push("Montar campanha simples: 7 dias de impulsionamento + CTA (salvar/seguir).");
    checklist.push("Criar 2 criativos por música (hook + legenda curta).");
    checklist.push("Configurar objetivo: tráfego/visualização e testar 2 públicos.");
    recs.push({ title:"Marketing", body:"Sem teste você não aprende. Pequeno orçamento com teste A/B vale mais que ‘achismo’."});
  }
  if(weakest.includes("marca")){
    priorities.push("Revisar identidade: bio, fotos, capa, links e pitch de 2 linhas.");
    checklist.push("Atualizar bio e foto do Spotify/Instagram/YouTube.");
    checklist.push("Criar press kit simples (1 página).");
    recs.push({ title:"Marca", body:"Pessoas seguem o que entendem rápido. Deixe claro gênero, proposta e prova social."});
  }

  // monetização / shows
  if(String(answers.shows || "") === "ocasional"){
    priorities.push("Criar proposta de show + tabela base e contato rápido (WhatsApp/bio).");
    checklist.push("Montar setlist padrão (30–45 min) e versão igreja/evento.");
    recs.push({ title:"Shows", body:"Quem contrata precisa de clareza: valor, formato, tempo, cidade e contato rápido."});
  }

  if(priorities.length === 0){
    priorities.push("Manter consistência e melhorar conversão (seguidores/salvos) por 30 dias.");
  }

  // cronograma 4 semanas e 12 meses (genérico e útil)
  const month = [
    { label:"Semana 1", when:"Dias 1–7", desc:"Organizar perfis, definir metas, gravar conteúdos em lote." },
    { label:"Semana 2", when:"Dias 8–14", desc:"Publicar 3 conteúdos, testar CTA, iniciar contatos com playlists." },
    { label:"Semana 3", when:"Dias 15–21", desc:"Collab/dueto + reforço de conteúdo + ajustes conforme performance." },
    { label:"Semana 4", when:"Dias 22–30", desc:"Mini campanha (7 dias) + avaliação do que mais performou." }
  ];

  const year = Array.from({length:12}).map((_,i)=>({
    label:`Mês ${i+1}`,
    when:"Ciclo",
    desc:(i%3===0)
      ? "Lançamento/ação principal + campanha curta."
      : "Conteúdo consistente + crescimento + networking."
  }));

  return { priorities, checklist, month, year, recs };
}
