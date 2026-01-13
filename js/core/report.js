import { clamp, safeText } from "../utils.js";

const PILLARS = ["Estratégia","Distribuição","Streaming","Marketing","Monetização","Operação"];

export function scoreAnswers(answers, questions){
  const pillarTotals = Object.fromEntries(PILLARS.map(p=>[p,{sum:0,count:0}]));

  for(const q of questions){
    const a = answers[q.id];
    if(a == null || a === "") continue;

    let pts = 0;

    if(q.type === "single"){
      const opt = q.options.find(o=>o.value===a);
      pts = opt ? opt.score : 0;
      pillarTotals[q.pillar].sum += pts;
      pillarTotals[q.pillar].count += 1;
    }else if(q.type === "multi"){
      if(Array.isArray(a)){
        let local = 0;
        for(const v of a){
          const opt = q.options.find(o=>o.value===v);
          local += opt ? opt.score : 0;
        }
        // Normalize multi so it doesn't dominate
        pts = clamp(Math.round(local), 0, 80);
        pillarTotals[q.pillar].sum += pts;
        pillarTotals[q.pillar].count += 1;
      }
    }else{
      // text / textarea (no direct score)
      // but count towards strategy completeness lightly if present
      if(q.pillar && q.pillar in pillarTotals){
        pillarTotals[q.pillar].sum += 35;
        pillarTotals[q.pillar].count += 1;
      }
    }
  }

  const pillarScores = {};
  for(const [p,v] of Object.entries(pillarTotals)){
    pillarScores[p] = v.count ? clamp(Math.round(v.sum / v.count), 0, 100) : 0;
  }

  const weights = {
    "Estratégia": 0.18,
    "Distribuição": 0.16,
    "Streaming": 0.18,
    "Marketing": 0.20,
    "Monetização": 0.16,
    "Operação": 0.12
  };

  let overall = 0;
  for(const p of PILLARS){
    overall += (pillarScores[p] || 0) * (weights[p] || 0);
  }
  overall = clamp(Math.round(overall), 0, 100);

  const stage = deriveStage(overall, pillarScores, answers);
  const insights = deriveInsights(pillarScores, answers);
  const plans = derivePlans(pillarScores, answers, stage);

  return { overall, pillarScores, stage, insights, plans };
}

function deriveStage(overall, pillars, answers){
  // Simple, reliable staging — adjustable later
  if(overall < 30) return {
    key:"iniciante",
    label:"Iniciante",
    hint:"Organizar base: identidade, 1º lançamento, presença mínima nas plataformas."
  };
  if(overall < 50) return {
    key:"diy",
    label:"DIY em crescimento",
    hint:"Construir consistência: lançamentos, perfis completos, conteúdo semanal e dados."
  };
  if(overall < 70) return {
    key:"scale",
    label:"Profissionalizando",
    hint:"Escalar: playlists, campanhas, colabs, shows regulares e diversificação de receita."
  };
  return {
    key:"pro",
    label:"Pronto(a) para expansão",
    hint:"Otimizar e expandir (Brasil + mundo): equipe, imprensa, turnês e estratégia avançada."
  };
}

function deriveInsights(pillars, answers){
  const sorted = Object.entries(pillars).sort((a,b)=>b[1]-a[1]);
  const strengths = sorted.slice(0,2).map(([p])=>p);
  const weaknesses = sorted.slice(-2).map(([p])=>p);

  const goal = answers.goal || "crescer_stream";
  const goalMap = {
    primeiro_lancamento: "Finalizar e lançar sua primeira música com processo profissional.",
    crescer_stream: "Aumentar ouvintes mensais e conversão em seguidores/saves.",
    crescer_fas: "Construir comunidade e repetição (fãs reais, não só números).",
    agenda_shows: "Montar agenda de shows e presença local consistente.",
    viral: "Criar rotina de conteúdo com ganchos e tendências sem depender de sorte.",
    internacional: "Preparar catálogo e marketing para alcance internacional."
  };

  const nextGoal = goalMap[goal] || goalMap.crescer_stream;

  return { strengths, weaknesses, nextGoal };
}

function derivePlans(pillars, answers, stage){
  const month = [];
  const year = [];
  const priorities = [];
  const checklist = [];
  const recs = [];

  const name = safeText(answers.artist_name || "Artista");
  const hasRelease = answers.released_music && answers.released_music !== "nao";
  const contentFreq = answers.content_frequency || "0";
  const hasShows = answers.shows && answers.shows !== "nao";

  // PRIORITIES (30 days)
  if(!hasRelease){
    priorities.push("Escolher distribuidora e preparar o 1º lançamento (ISRC, capa, créditos, data).");
    checklist.push("Definir data de lançamento com 21–28 dias de antecedência.");
    checklist.push("Criar capa em alta resolução e checklist de créditos (compositores, intérprete, produtores).");
    checklist.push("Criar links de pre-save e roteiro de divulgação (teasers, bastidores, live).");
  }else{
    priorities.push("Organizar calendário de próximos lançamentos (singles em sequência + projeto maior).");
    checklist.push("Fazer pitch do próximo lançamento no Spotify for Artists com antecedência.");
    checklist.push("Atualizar bio/fotos/links em Spotify, YouTube e redes (coerência de marca).");
  }

  if(pillars.Marketing < 50 || contentFreq === "0" || contentFreq === "1w"){
    priorities.push("Implementar rotina mínima de conteúdo (2–3 posts/semana) com ganchos e repetição de refrão.");
    checklist.push("Criar 12 ideias de vídeos (Reels/TikTok/Shorts) para o mês e gravar em lote.");
    checklist.push("Responder comentários e DMs diariamente por 10–15 minutos (engajamento).");
  }else{
    priorities.push("Refinar conteúdo: séries semanais, colabs e CTA para pre-save/streams.");
    checklist.push("Criar 2 formatos fixos (ex.: bastidores + performance) e manter por 4 semanas.");
  }

  if(pillars.Streaming < 45){
    priorities.push("Fortalecer perfis e coleta de dados (Spotify for Artists / YouTube Studio).");
    checklist.push("Reivindicar/atualizar perfis e monitorar cidades/playlist sources semanalmente.");
  }

  if(!hasShows){
    priorities.push("Iniciar estratégia de palco: pockets, igrejas, bares, eventos locais, participações.");
    checklist.push("Montar repertório de 30–45 minutos e um kit (release + fotos + vídeo).");
  }else{
    priorities.push("Transformar show em motor de crescimento: capturar contatos e vender merch/ingressos.");
    checklist.push("Criar QR Code de link central (Linktree/site) para coletar seguidores após shows.");
  }

  // MONTH PLAN (4 weeks)
  month.push({
    when: "Semana 1",
    label: "Base & Organização",
    desc: (!hasRelease)
      ? "Escolha distribuidora, finalize áudio (mix/master), defina identidade visual do single e data de lançamento."
      : "Defina a próxima data de lançamento, revise metadados e atualize perfis (Spotify/YouTube/Redes)."
  });
  month.push({
    when: "Semana 2",
    label: "Conteúdo em Lote",
    desc: "Grave 8–12 vídeos curtos (teaser do refrão, bastidores, performance) e programe publicações."
  });
  month.push({
    when: "Semana 3",
    label: "Aquecimento & Pitch",
    desc: "Ative pre-save, faça pitch no Spotify for Artists e contate curadores/playslists independentes."
  });
  month.push({
    when: "Semana 4",
    label: "Entrega & Expansão",
    desc: "Execute a semana de lançamento (live + clipe/lyric + CTA). Após, analise dados e ajuste o próximo ciclo."
  });

  // YEAR PLAN (12 months)
  year.push({ when:"Mês 1–2", label:"Arranque", desc:"Organizar pipeline: 2–3 singles planejados, rotina de conteúdo e perfis completos." });
  year.push({ when:"Mês 3–4", label:"Crescimento", desc:"Lançar single + campanha leve. Buscar 1 colab e 1 ação de imprensa local/playlist." });
  year.push({ when:"Mês 5–6", label:"Consolidação", desc:"Lançar 2º single, testar anúncios, ampliar YouTube (Shorts + vídeo). Iniciar mais shows/pockets." });
  year.push({ when:"Mês 7–8", label:"Projeto maior", desc:"Preparar EP/mini-álbum com 4–6 faixas. Construir narrativa (era) e visual coeso." });
  year.push({ when:"Mês 9–10", label:"Expansão", desc:"Rodar conteúdos e colabs, buscar oportunidades em rádio/web, eventos e festivais regionais." });
  year.push({ when:"Mês 11–12", label:"Escala", desc:"Revisar métricas do ano, otimizar catálogo, planejar próximo ano com metas e orçamento." });

  // RECOMMENDATIONS
  recs.push({
    title: "Distribuição e lançamentos",
    body: (!hasRelease)
      ? `Priorize um lançamento profissional. ${name} deve enviar a música com antecedência, revisar metadados e organizar pre-save + conteúdo.`
      : "Você já lançou. Agora o foco é cadência: singles em sequência, pitch em playlists e consistência de comunicação."
  });

  recs.push({
    title: "Spotify, YouTube e dados",
    body: "Complete perfis, use Spotify for Artists e YouTube Studio. Monitore: cidades, fontes de descoberta, playlists e retenção."
  });

  recs.push({
    title: "Marketing e viral (sem depender de sorte)",
    body: "Construa uma série semanal de vídeos com gancho forte no começo. Reaproveite o refrão e crie chamadas claras (salvar, seguir, comentar)."
  });

  recs.push({
    title: "Shows e comunidade",
    body: hasShows
      ? "Use o show como conversão: capte seguidores com QR Code, ofereça merch e convide para comunidade (WhatsApp/Telegram)."
      : "Comece com pockets e participações. Show aumenta renda e fortalece fãs. Monte um kit e envie para produtores locais."
  });

  recs.push({
    title: "Operação premium",
    body: "Trabalhe em ciclos de 4 semanas: planejar → produzir conteúdo → lançar → analisar. Isso reduz estresse e acelera crescimento."
  });

  return { priorities, checklist, month, year, recs };
}

export function pillarMeta(pillar){
  const map = {
    "Estratégia": { label:"Estratégia", hint:"Direção, posicionamento e metas." },
    "Distribuição": { label:"Distribuição", hint:"Processo, metadados e cadência." },
    "Streaming": { label:"Streaming", hint:"Perfis, playlists e dados." },
    "Marketing": { label:"Marketing", hint:"Conteúdo, alcance e conversão." },
    "Monetização": { label:"Monetização", hint:"Shows e múltiplas receitas." },
    "Operação": { label:"Operação", hint:"Rotina, equipe e consistência." }
  };
  return map[pillar] || { label:pillar, hint:"" };
}
