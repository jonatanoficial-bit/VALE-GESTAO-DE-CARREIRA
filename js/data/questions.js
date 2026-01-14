// js/data/questions.js
// Vale Produção — Career Manager
// Questionário base (MVP Premium) + Métricas numéricas

export const QUESTIONS = [
  // Identidade
  {
    id: "artist_name",
    section: "Identidade",
    type: "text",
    text: "Qual é o nome artístico (cantor/banda)?",
    help: "Use o nome oficial que você quer consolidar em todas as plataformas."
  },
  {
    id: "genre",
    section: "Identidade",
    type: "single",
    text: "Qual seu estilo principal hoje?",
    help: "Você pode evoluir e misturar gêneros, mas escolha o eixo central.",
    options: [
      { value: "gospel", label: "Gospel / Cristã" },
      { value: "sertanejo", label: "Sertanejo / Agro / Forró" },
      { value: "funk", label: "Funk / Trap / Urbano" },
      { value: "pop", label: "Pop / Dance / Indie Pop" },
      { value: "rap", label: "Rap / Trap / Hip Hop" },
      { value: "rock", label: "Rock / Alternativo" },
      { value: "pagode", label: "Pagode / Samba" },
      { value: "eletronica", label: "Eletrônica / DJ" },
      { value: "outros", label: "Outros / Híbrido" }
    ]
  },
  {
    id: "goal",
    section: "Objetivo",
    type: "single",
    text: "Qual é o objetivo principal nos próximos 90 dias?",
    help: "O relatório vai priorizar ações para esse foco.",
    options: [
      { value: "crescer_fas", label: "Crescer base de fãs", desc: "Seguidores, comunidade, retenção e engajamento." },
      { value: "crescer_stream", label: "Aumentar streams e playlists", desc: "Spotify/Deezer/Apple + curadoria e algoritmo." },
      { value: "fechar_shows", label: "Fechar mais shows", desc: "Agenda, cachê, repertório e presença local." },
      { value: "monetizar", label: "Monetizar melhor", desc: "Diversificar receita: shows, merch, licenciamento, digital." },
      { value: "viralizar", label: "Aumentar chance de viral", desc: "TikTok/Reels/Shorts com estratégia e conversão." }
    ]
  },

  // Maturidade / catálogo
  {
    id: "career_time",
    section: "Carreira",
    type: "single",
    text: "Há quanto tempo você está ativo(a) como artista?",
    options: [
      { value: "0-6m", label: "0 a 6 meses" },
      { value: "6-12m", label: "6 a 12 meses" },
      { value: "1-2y", label: "1 a 2 anos" },
      { value: "2-5y", label: "2 a 5 anos" },
      { value: "5y+", label: "Mais de 5 anos" }
    ]
  },
  {
    id: "released_music",
    section: "Catálogo",
    type: "single",
    text: "Quantas músicas já lançadas oficialmente (distribuídas) você tem?",
    help: "Lançamento oficial = Spotify/Deezer/Apple/YouTube Music via distribuidora.",
    options: [
      { value: "0", label: "0 (ainda não lancei)" },
      { value: "1-2", label: "1 a 2" },
      { value: "3-10", label: "3 a 10" },
      { value: "11-25", label: "11 a 25" },
      { value: "25+", label: "Mais de 25" }
    ]
  },
  {
    id: "distributor",
    section: "Distribuição",
    type: "text",
    text: "Qual distribuidora você usa (se usa)?",
    help: "Ex.: ONErpm, CD Baby, DistroKid, Tratore, Ditto… Se não usa, escreva “não tenho”."
  },
  {
    id: "metadata_ready",
    section: "Distribuição",
    type: "single",
    text: "Seu lançamento está organizado com ISRC/metadata e registros?",
    help: "Metadata correta evita problemas e ajuda a monetização (inclusive Content ID).",
    options: [
      { value: "nao", label: "Não" },
      { value: "parcial", label: "Parcial" },
      { value: "sim", label: "Sim, tudo organizado" }
    ]
  },

  // Plataformas
  {
    id: "spotify_profile",
    section: "Plataformas",
    type: "single",
    text: "Seu perfil no Spotify for Artists está completo?",
    help: "Foto, bio, links, canvas, playlists do artista, destaque do lançamento.",
    options: [
      { value: "nao", label: "Ainda não tenho/ não reivindiquei" },
      { value: "basico", label: "Básico" },
      { value: "bom", label: "Bem completo" },
      { value: "premium", label: "Premium (muito profissional)" }
    ]
  },
  {
    id: "youtube_channel",
    section: "Plataformas",
    type: "single",
    text: "Como está seu YouTube hoje?",
    options: [
      { value: "nao", label: "Não tenho canal ativo" },
      { value: "inicio", label: "Tenho, mas posto pouco" },
      { value: "ativo", label: "Ativo (Shorts/Clipes/Lyric)" },
      { value: "forte", label: "Forte (constância + estratégia)" }
    ]
  },
  {
    id: "tiktok_use",
    section: "Conteúdo",
    type: "single",
    text: "Você usa TikTok/Reels/Shorts de forma estratégica?",
    options: [
      { value: "nao", label: "Não" },
      { value: "asvezes", label: "Às vezes" },
      { value: "semanal", label: "Semanal" },
      { value: "diario", label: "Quase diário" }
    ]
  },
  {
    id: "content_frequency",
    section: "Conteúdo",
    type: "single",
    text: "Com que frequência você posta conteúdo (qualquer rede)?",
    help: "Constância > perfeição. O algoritmo premia presença regular.",
    options: [
      { value: "raramente", label: "Raramente" },
      { value: "1w", label: "1x por semana" },
      { value: "3w", label: "3x por semana" },
      { value: "diario", label: "Diário" }
    ]
  },

  // Marketing / operação
  {
    id: "ads_budget",
    section: "Marketing",
    type: "single",
    text: "Você investe em anúncios (Instagram/YouTube/TikTok)?",
    options: [
      { value: "none", label: "Não invisto" },
      { value: "low", label: "Baixo (até R$ 200/mês)" },
      { value: "mid", label: "Médio (R$ 200–R$ 1.000/mês)" },
      { value: "high", label: "Alto (acima de R$ 1.000/mês)" }
    ]
  },
  {
    id: "team",
    section: "Operação",
    type: "single",
    text: "Você tem equipe (mesmo que pequena)?",
    help: "Ex.: produtor, social media, designer, assessor, empresário, booking.",
    options: [
      { value: "solo", label: "Faço tudo sozinho(a)" },
      { value: "parcial", label: "Tenho 1–2 apoios pontuais" },
      { value: "time", label: "Tenho uma mini-equipe fixa" },
      { value: "completa", label: "Equipe completa/estruturada" }
    ]
  },
  {
    id: "planning",
    section: "Planejamento",
    type: "single",
    text: "Como está seu planejamento de lançamentos e rotina?",
    options: [
      { value: "zero", label: "Não tenho plano" },
      { value: "basico", label: "Básico (ideias soltas)" },
      { value: "bom", label: "Bom (calendário mensal)" },
      { value: "pro", label: "Profissional (90 dias + anual)" }
    ]
  },

  // Shows / receita
  {
    id: "shows",
    section: "Shows",
    type: "single",
    text: "Você faz shows atualmente?",
    options: [
      { value: "nao", label: "Ainda não" },
      { value: "ocasional", label: "Ocasional" },
      { value: "mensal", label: "Mensal" },
      { value: "semanal", label: "Quase toda semana" }
    ]
  },
  {
    id: "revenue_sources",
    section: "Receita",
    type: "multi",
    text: "Quais fontes de receita você já tem?",
    help: "Marque todas que se aplicam.",
    options: [
      { value: "streaming", label: "Streaming (Spotify/Deezer/Apple)" },
      { value: "youtube", label: "YouTube (Ads/monetização)" },
      { value: "shows", label: "Shows / eventos" },
      { value: "merch", label: "Merch (camisetas, bonés, etc.)" },
      { value: "publishing", label: "Direitos autorais / publishing" },
      { value: "licenciamento", label: "Licenciamento (trilha, publicidade)" },
      { value: "aulas", label: "Aulas / serviços musicais" },
      { value: "nenhuma", label: "Nenhuma ainda" }
    ]
  },

  // Métricas (numéricas) — upgrade Parte 2
  {
    id: "monthly_listeners_num",
    section: "Métricas",
    type: "number",
    text: "Quantos ouvintes mensais você tem hoje no Spotify? (se não sabe, coloque 0)",
    help: "Isso ajuda a calcular o estágio e o plano. Você pode ajustar depois.",
    min: 0,
    max: 5000000,
    step: 100
  },
  {
    id: "spotify_followers_num",
    section: "Métricas",
    type: "number",
    text: "Quantos seguidores no Spotify? (se não sabe, coloque 0)",
    min: 0,
    max: 2000000,
    step: 10
  },
  {
    id: "instagram_followers_num",
    section: "Métricas",
    type: "number",
    text: "Quantos seguidores no Instagram? (se não sabe, coloque 0)",
    min: 0,
    max: 50000000,
    step: 10
  },
  {
    id: "tiktok_followers_num",
    section: "Métricas",
    type: "number",
    text: "Quantos seguidores no TikTok? (se não sabe, coloque 0)",
    min: 0,
    max: 50000000,
    step: 10
  },
  {
    id: "youtube_subs_num",
    section: "Métricas",
    type: "number",
    text: "Quantos inscritos no YouTube? (se não sabe, coloque 0)",
    min: 0,
    max: 50000000,
    step: 10
  },

  // Métricas avançadas (manual/offline) — upgrade Etapa A
  {
    id: "streams_28d_total",
    section: "Métricas",
    type: "number",
    text: "Quantos streams você fez nos últimos 28 dias (somando plataformas)?",
    help: "Some Spotify + Deezer + Apple + YouTube Music (se tiver). Se não souber, coloque 0. Depois você pode ajustar.",
    min: 0,
    max: 500000000,
    step: 100
  },
  {
    id: "youtube_views_28d",
    section: "Métricas",
    type: "number",
    text: "Quantas visualizações no YouTube nos últimos 28 dias? (vídeos + Shorts)",
    help: "Pegue no YouTube Studio (Últimos 28 dias). Se não souber, coloque 0.",
    min: 0,
    max: 500000000,
    step: 100
  },
  {
    id: "content_posts_7d",
    section: "Métricas",
    type: "number",
    text: "Quantos conteúdos você postou nos últimos 7 dias? (Reels/TikTok/Shorts/Posts)",
    help: "Contagem simples: ajuda o sistema a ligar 'constância' com crescimento.",
    min: 0,
    max: 500,
    step: 1
  },

  // Observações
  {
    id: "notes",
    section: "Observações",
    type: "textarea",
    text: "Conte rapidamente o seu momento e o que você quer conquistar.",
    help: "Ex.: “Quero crescer no Brasil e preparar uma estratégia internacional, sem perder minha essência.”"
  }
];