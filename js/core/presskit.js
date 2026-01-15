// js/core/presskit.js
// Vale Produção — Press Kit Generator (Etapa E)
// Geração automática, offline, segura.

import { safeText, formatNumber } from "../utils.js";

function genreLabel(g){
  const map = {
    gospel:"Gospel",
    sertanejo:"Sertanejo",
    funk:"Funk / Trap",
    pop:"Pop",
    rap:"Rap / Hip Hop",
    rock:"Rock",
    pagode:"Pagode / Samba",
    eletronica:"Eletrônica",
    outros:"Híbrido"
  };
  return map[g] || "Artista";
}

export function buildPressKit({ answers, reportResult, analytics }){
  const name = safeText(answers.artist_name || "Artista");
  const genre = genreLabel(answers.genre);
  const stage = safeText(reportResult?.stage?.label || "");
  const goal = safeText(answers.goal || "");
  const distributor = safeText(answers.distributor || "Independente");

  const ml = analytics?.cards?.find(c=>c.name.includes("Ouvintes"))?.value || "—";
  const streams28 = analytics?.cards?.find(c=>c.name.includes("Streams"))?.value || "—";

  // BIO CURTA
  const bioShort =
`${name} é um(a) artista ${genre} independente, em fase de ${stage.toLowerCase()}, 
com foco em ${goal.replace("_"," ")} e construção de carreira sólida no mercado musical.`.trim();

  // BIO LONGA
  const bioLong =
`${name} é um(a) artista ${genre} que vem construindo sua trajetória de forma independente, 
unindo identidade, consistência e visão estratégica.

Atualmente em fase de ${stage.toLowerCase()}, o projeto busca crescer de forma sustentável,
com foco em audiência real, engajamento e profissionalização da carreira.

Distribuído via ${distributor}, o artista trabalha lançamentos alinhados com estratégias
de conteúdo, performance digital e relacionamento com o público.`.trim();

  // DADOS
  const dataList = [
    `Estilo: ${genre}`,
    `Status da carreira: ${stage}`,
    `Distribuição: ${distributor}`,
    `Modelo: Artista independente`
  ];

  // MÉTRICAS
  const metrics = [
    `Ouvintes mensais (Spotify): ${ml}`,
    `Streams últimos 28 dias: ${streams28}`
  ];

  // PROPOSTA SHOW
  const showProposal =
`${name} está disponível para apresentações ao vivo, eventos e projetos culturais.

Formato flexível (solo, banda ou playback), com repertório adaptável ao evento.
Material de divulgação e releases disponíveis mediante solicitação.`.trim();

  // PROPOSTA COLLAB
  const collabProposal =
`${name} está aberto(a) a colaborações artísticas, feats, projetos especiais
e ações com creators, marcas ou outros artistas.

Propostas podem ser enviadas diretamente para contato.`.trim();

  return {
    meta:{
      name,
      genre,
      stage
    },
    bioShort,
    bioLong,
    dataList,
    metrics,
    showProposal,
    collabProposal
  };
}