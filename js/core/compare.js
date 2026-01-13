// js/core/compare.js
function n(v){ const x = Number(v); return Number.isFinite(x) ? x : 0; }

function delta(a,b){
  const d = b - a;
  const text = (d>0?`+${d}`: String(d));
  const cls = d>0 ? "delta delta--up" : d<0 ? "delta delta--down" : "delta delta--neutral";
  return { d, text, cls };
}

function spark(values){
  const w = 240, h = 52, pad = 6;
  const arr = values.map(n);
  const min = Math.min(...arr), max = Math.max(...arr);
  const span = (max-min) || 1;
  const step = (w - pad*2) / (arr.length-1 || 1);

  const pts = arr.map((v,i)=>{
    const x = pad + i*step;
    const y = pad + (h - pad*2) * (1 - ((v-min)/span));
    return [x,y];
  });

  const d = pts.map((p,i)=> (i===0?`M ${p[0]} ${p[1]}`:`L ${p[0]} ${p[1]}`)).join(" ");
  return `
    <svg class="spark__svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d}" fill="none" stroke="rgba(240,212,138,.95)" stroke-width="2.4" />
    </svg>
  `;
}

export function buildCompareUIData(reports, idA, idB){
  const a = reports.find(r=>r.id===idA);
  const b = reports.find(r=>r.id===idB);
  if(!a || !b) return { ok:false, message:"Relatórios não encontrados." };

  const sa = n(a?.result?.overall);
  const sb = n(b?.result?.overall);

  const mla = n(a?.answers?.monthly_listeners_num);
  const mlb = n(b?.answers?.monthly_listeners_num);

  const sfa = n(a?.answers?.spotify_followers_num);
  const sfb = n(b?.answers?.spotify_followers_num);

  const insights = [];
  if(sb > sa) insights.push("O Score melhorou. Mantenha consistência e dobre o que deu certo.");
  if(mlb > mla) insights.push("Ouvintes mensais cresceram. Hora de converter em seguidores (CTA + links).");
  if(sfb <= sfa && mlb > mla) insights.push("Cresceu ouvintes mas não seguidores: precisa otimizar conversão no Spotify.");

  const actions = [];
  actions.push("Faça 1 post/semana com CTA direto: ‘segue + salva’.");
  actions.push("Repetir o top 2 conteúdos que mais performaram (variações do hook).");
  actions.push("Enviar pitch para 10 novos curadores por semana (planilha).");

  return {
    ok:true,
    cards:{
      score:{ a:sa, b:sb, delta: delta(sa,sb) },
      ml:{ a:mla, b:mlb, delta: delta(mla,mlb) },
      sf:{ a:sfa, b:sfb, delta: delta(sfa,sfb) }
    },
    sparks:{
      score: spark([sa, sb]),
      ml: spark([mla, mlb]),
      sf: spark([sfa, sfb])
    },
    insights,
    actions
  };
}
