export const QUESTIONS = [
  // PERFIL
  {
    id: "artist_name",
    section: "Perfil",
    text: "Qual é o nome artístico (cantor ou banda)?",
    help: "Esse nome aparecerá no relatório. Você pode alterar depois.",
    type: "text",
    pillar: "Estratégia"
  },
  {
    id: "genre",
    section: "Perfil",
    text: "Qual é o estilo principal hoje?",
    help: "Se você mistura estilos, escolha o dominante nas suas músicas atuais.",
    type: "single",
    options: [
      { value: "pop", label: "Pop / Pop urbano", score: 60 },
      { value: "sertanejo", label: "Sertanejo", score: 60 },
      { value: "funk", label: "Funk / Brega-funk", score: 60 },
      { value: "gospel", label: "Gospel", score: 60 },
      { value: "rap", label: "Rap / Trap / Hip Hop", score: 60 },
      { value: "forro", label: "Forró / Piseiro / Arrocha", score: 60 },
      { value: "rock", label: "Rock / Alternativo", score: 60 },
      { value: "mpb", label: "MPB / Samba / Pagode", score: 60 },
      { value: "eletronica", label: "Eletrônica / DJ", score: 60 },
      { value: "outro", label: "Outro / Misto", score: 55 }
    ],
    pillar: "Estratégia"
  },
  {
    id: "career_time",
    section: "Perfil",
    text: "Há quanto tempo você está ativo(a) na música?",
    help: "Considere tempo real de atuação (lançamentos, shows, divulgação).",
    type: "single",
    options: [
      { value: "0-6m", label: "0 a 6 meses", score: 20 },
      { value: "6-12m", label: "6 a 12 meses", score: 30 },
      { value: "1-2y", label: "1 a 2 anos", score: 45 },
      { value: "2-5y", label: "2 a 5 anos", score: 60 },
      { value: "5y+", label: "5+ anos", score: 70 }
    ],
    pillar: "Estratégia"
  },

  // CATÁLOGO & DISTRIBUIÇÃO
  {
    id: "released_music",
    section: "Catálogo & Distribuição",
    text: "Você já lançou músicas nas plataformas (Spotify/Deezer/Apple/YouTube Music)?",
    help: "Lançamentos oficiais via distribuidora/aggregator.",
    type: "single",
    options: [
      { value: "nao", label: "Ainda não lancei oficialmente", score: 10 },
      { value: "1-2", label: "Sim, 1 a 2 faixas", score: 35 },
      { value: "3-10", label: "Sim, 3 a 10 faixas", score: 55 },
      { value: "10+", label: "Sim, mais de 10 faixas", score: 70 }
    ],
    pillar: "Distribuição"
  },
  {
    id: "distributor",
    section: "Catálogo & Distribuição",
    text: "Qual distribuidora você usa (ou pretende usar)?",
    help: "Ex.: ONErpm, CD Baby, DistroKid, Tratore, Symphonic, TuneCore, Ditto…",
    type: "text",
    pillar: "Distribuição"
  },
  {
    id: "metadata_ready",
    section: "Catálogo & Distribuição",
    text: "Seu processo de lançamento está organizado (ISRC, capa, créditos, pitch em tempo)?",
    help: "Metadados e planejamento aumentam chances de playlists e evitam erros.",
    type: "single",
    options: [
      { value: "nunca", label: "Não tenho esse processo", score: 15 },
      { value: "parcial", label: "Tenho parcialmente", score: 45 },
      { value: "sim", label: "Sim, faço checklist e envio com antecedência", score: 70 }
    ],
    pillar: "Distribuição"
  },

  // STREAMING & DADOS
  {
    id: "spotify_profile",
    section: "Streaming & Dados",
    text: "Você usa Spotify for Artists (perfil completo e pitch de lançamentos)?",
    help: "Foto, bio, links, Canvas e envio antecipado para playlists editoriais.",
    type: "single",
    options: [
      { value: "nao", label: "Não", score: 10 },
      { value: "basico", label: "Sim, mas básico", score: 40 },
      { value: "avancado", label: "Sim, completo e uso pitch", score: 70 }
    ],
    pillar: "Streaming"
  },
  {
    id: "youtube_channel",
    section: "Streaming & Dados",
    text: "Seu YouTube está ativo (canal organizado, vídeos regulares, Shorts)?",
    help: "YouTube é vitrine, descoberta e monetização. Consistência é chave.",
    type: "single",
    options: [
      { value: "nao", label: "Não tenho / não uso", score: 10 },
      { value: "irregular", label: "Posto raramente", score: 35 },
      { value: "ativo", label: "Ativo com clipes/lyric/bastidores", score: 60 },
      { value: "forte", label: "Muito forte + Shorts + estratégia", score: 75 }
    ],
    pillar: "Streaming"
  },
  {
    id: "monthly_listeners",
    section: "Streaming & Dados",
    text: "Qual sua faixa aproximada de ouvintes mensais no Spotify (se tiver)?",
    help: "Se não souber, estime. Isso ajuda a calibrar o plano.",
    type: "single",
    options: [
      { value: "0", label: "0 (não tenho Spotify)", score: 0 },
      { value: "<1k", label: "Até 1.000", score: 20 },
      { value: "1-10k", label: "1.000 a 10.000", score: 40 },
      { value: "10-50k", label: "10.000 a 50.000", score: 55 },
      { value: "50-200k", label: "50.000 a 200.000", score: 70 },
      { value: "200k+", label: "200.000+", score: 80 }
    ],
    pillar: "Streaming"
  },

  // MARKETING & CONTEÚDO
  {
    id: "content_frequency",
    section: "Marketing & Conteúdo",
    text: "Com que frequência você posta conteúdo nas redes (Reels/TikTok/Shorts)?",
    help: "Consistência costuma importar mais do que volume extremo.",
    type: "single",
    options: [
      { value: "0", label: "Quase nunca", score: 10 },
      { value: "1w", label: "1x por semana", score: 30 },
      { value: "3w", label: "2-3x por semana", score: 55 },
      { value: "daily", label: "4-7x por semana", score: 75 }
    ],
    pillar: "Marketing"
  },
  {
    id: "tiktok_use",
    section: "Marketing & Conteúdo",
    text: "Você usa TikTok estrategicamente (tendências, ganchos, repetição do refrão)?",
    help: "A plataforma pode impulsionar descoberta, mas precisa de método.",
    type: "single",
    options: [
      { value: "nao", label: "Não uso", score: 10 },
      { value: "asvezes", label: "Uso às vezes, sem estratégia", score: 35 },
      { value: "sim", label: "Uso com estratégia e consistência", score: 70 }
    ],
    pillar: "Marketing"
  },
  {
    id: "ads_budget",
    section: "Marketing & Conteúdo",
    text: "Você investe em anúncios (Meta/YouTube/TikTok) para lançamentos?",
    help: "Mesmo valores baixos podem ajudar se a segmentação estiver correta.",
    type: "single",
    options: [
      { value: "0", label: "Não invisto", score: 10 },
      { value: "low", label: "R$ 50–300/mês", score: 45 },
      { value: "mid", label: "R$ 300–1500/mês", score: 60 },
      { value: "high", label: "R$ 1500+/mês", score: 75 }
    ],
    pillar: "Marketing"
  },

  // SHOWS & RECEITA
  {
    id: "shows",
    section: "Shows & Receita",
    text: "Você faz shows/pockets atualmente?",
    help: "Show é uma das maiores fontes de renda e fortalecimento de fãs.",
    type: "single",
    options: [
      { value: "nao", label: "Ainda não", score: 10 },
      { value: "ocasional", label: "Sim, ocasional", score: 45 },
      { value: "mensal", label: "Sim, 1–3 por mês", score: 65 },
      { value: "intenso", label: "Sim, 4+ por mês", score: 75 }
    ],
    pillar: "Monetização"
  },
  {
    id: "revenue_sources",
    section: "Shows & Receita",
    text: "Quais fontes de renda você já tem com música?",
    help: "Selecione tudo que se aplica.",
    type: "multi",
    options: [
      { value: "shows", label: "Cachês de shows", score: 15 },
      { value: "streaming", label: "Royalties de streaming", score: 12 },
      { value: "youtube", label: "YouTube monetizado / Content ID", score: 12 },
      { value: "merch", label: "Merch (camiseta, boné etc.)", score: 10 },
      { value: "aulas", label: "Aulas / serviços musicais", score: 8 },
      { value: "publishing", label: "Direitos autorais (UBC/Abramus etc.)", score: 10 },
      { value: "sync", label: "Licenciamento (trilhas / publicidade)", score: 12 },
      { value: "nenhuma", label: "Nenhuma", score: 0 }
    ],
    pillar: "Monetização"
  },

  // OPERAÇÃO & EQUIPE
  {
    id: "team",
    section: "Operação & Equipe",
    text: "Você tem equipe (produtor, assessor, social media, booking)?",
    help: "Equipe ajuda a escalar e manter consistência.",
    type: "single",
    options: [
      { value: "solo", label: "Faço tudo sozinho(a)", score: 20 },
      { value: "parcial", label: "Tenho 1–2 apoios", score: 45 },
      { value: "time", label: "Tenho equipe definida", score: 70 }
    ],
    pillar: "Operação"
  },
  {
    id: "planning",
    section: "Operação & Equipe",
    text: "Você mantém planejamento (calendário anual + rotina semanal)?",
    help: "Planejamento reduz estresse e aumenta performance.",
    type: "single",
    options: [
      { value: "nao", label: "Não", score: 15 },
      { value: "basico", label: "Básico (às vezes)", score: 40 },
      { value: "sim", label: "Sim, organizado(a) e consistente", score: 70 }
    ],
    pillar: "Operação"
  },

  // OBJETIVOS
  {
    id: "goal",
    section: "Objetivos",
    text: "Qual é seu objetivo principal nos próximos 12 meses?",
    help: "O relatório vai priorizar ações para esse objetivo.",
    type: "single",
    options: [
      { value: "primeiro_lancamento", label: "Fazer meu 1º lançamento profissional", score: 40 },
      { value: "crescer_stream", label: "Crescer streams e ouvintes mensais", score: 55 },
      { value: "crescer_fas", label: "Transformar público em fãs (comunidade)", score: 55 },
      { value: "agenda_shows", label: "Montar agenda de shows", score: 55 },
      { value: "viral", label: "Tentar viralizar com consistência", score: 55 },
      { value: "internacional", label: "Abrir portas fora do Brasil", score: 60 }
    ],
    pillar: "Estratégia"
  },
  {
    id: "notes",
    section: "Objetivos",
    text: "Algo importante sobre sua carreira que você quer que o relatório considere?",
    help: "Ex.: cidade, limitações de tempo, equipe, orçamento, referências.",
    type: "textarea",
    pillar: "Estratégia"
  }
];
