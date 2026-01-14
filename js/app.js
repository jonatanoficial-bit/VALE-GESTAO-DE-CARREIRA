// js/app.js
import { QUESTIONS } from "./data/questions.js";
import { scoreAnswers, pillarMeta } from "./core/report.js";
import { toast, safeText, formatNumber, downloadJSON, uid } from "./utils.js";
import { buildAnalytics } from "./core/analytics.js";
import { loadReports, addReport, clearReports, findReportById } from "./core/storage.js";
import { buildCompareUIData } from "./core/compare.js";
import {
  loadCampaigns,
  buildCampaign,
  addCampaign,
  deleteCampaign,
  findCampaign
} from "./core/campaigns.js";
import { buildContentPlan } from "./core/content-plan.js";

const screens = {
  landing: document.getElementById("screenLanding"),
  wizard: document.getElementById("screenWizard"),
  report: document.getElementById("screenReport")
};

const btnStart = document.getElementById("btnStart");
const btnDemoFill = document.getElementById("btnDemoFill");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const btnReset = document.getElementById("btnReset");
const btnEdit = document.getElementById("btnEdit");
const btnPrint = document.getElementById("btnPrint");
const btnTheme = document.getElementById("btnTheme");
const btnExportJSON = document.getElementById("btnExportJSON");
const btnClearHistory = document.getElementById("btnClearHistory");

const qSection = document.getElementById("qSection");
const qCount = document.getElementById("qCount");
const qText = document.getElementById("qText");
const qHelp = document.getElementById("qHelp");
const answerArea = document.getElementById("answerArea");

const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const reportSubtitle = document.getElementById("reportSubtitle");
const reportSubtitle2 = document.getElementById("reportSubtitle2");
const stageLabel = document.getElementById("stageLabel");
const stageLabel2 = document.getElementById("stageLabel2");
const stageHint = document.getElementById("stageHint");
const overallScore = document.getElementById("overallScore");
const overallScore2 = document.getElementById("overallScore2");
const nextGoal = document.getElementById("nextGoal");

const pillarChips = document.getElementById("pillarChips");
const pillarBars = document.getElementById("pillarBars");
const priorities30 = document.getElementById("priorities30");
const checklist = document.getElementById("checklist");
const timelineMonth = document.getElementById("timelineMonth");
const timelineYear = document.getElementById("timelineYear");
const recommendations = document.getElementById("recommendations");

const analyticsCards = document.getElementById("analyticsCards");
const analyticsInsights = document.getElementById("analyticsInsights");
const analyticsGoals = document.getElementById("analyticsGoals");

const historyListLanding = document.getElementById("historyListLanding");
const historyListReport = document.getElementById("historyListReport");

const compareA = document.getElementById("compareA");
const compareB = document.getElementById("compareB");
const btnCompare = document.getElementById("btnCompare");
const cmpScore = document.getElementById("cmpScore");
const cmpMl = document.getElementById("cmpMl");
const cmpSf = document.getElementById("cmpSf");
const cmpScoreDelta = document.getElementById("cmpScoreDelta");
const cmpMlDelta = document.getElementById("cmpMlDelta");
const cmpSfDelta = document.getElementById("cmpSfDelta");
const sparkScore = document.getElementById("sparkScore");
const sparkMl = document.getElementById("sparkMl");
const sparkSf = document.getElementById("sparkSf");
const compareInsights = document.getElementById("compareInsights");
const compareActions = document.getElementById("compareActions");

// Campanhas
const campType = document.getElementById("campType");
const campName = document.getElementById("campName");
const campDate = document.getElementById("campDate");
const campBudget = document.getElementById("campBudget");
const campFocus = document.getElementById("campFocus");
const btnCreateCampaign = document.getElementById("btnCreateCampaign");
const btnClearCampaigns = document.getElementById("btnClearCampaigns");
const campaignList = document.getElementById("campaignList");
const campaignDetail = document.getElementById("campaignDetail");

// ✅ Etapa D — Plano de Conteúdo
const cpMetaGoal = document.getElementById("cpMetaGoal");
const cpMetaTraffic = document.getElementById("cpMetaTraffic");
const cpMetaStage = document.getElementById("cpMetaStage");
const cpMetaTrack = document.getElementById("cpMetaTrack");
const contentPlanGrid = document.getElementById("contentPlanGrid");
const btnCopyContentPlan = document.getElementById("btnCopyContentPlan");

let state = {
  idx: 0,
  answers: loadAnswers(),
  lastScreen: "landing",
  lastBuiltReport: null,
  lastContentPlan: null
};

init();

function init(){
  bind();
  applyTheme(loadTheme());
  showScreen("landing", false);
  btnBack.style.visibility = "hidden";
  renderHistory();
  renderCompareSelects();
  renderCampaigns();
  clearContentPlan();
}

function bind(){
  btnStart.addEventListener("click", ()=> startWizard(false));
  btnDemoFill.addEventListener("click", ()=> startWizard(true));
  btnPrev.addEventListener("click", prevQ);
  btnNext.addEventListener("click", nextQ);
  btnBack.addEventListener("click", handleBack);
  btnReset?.addEventListener("click", resetAll);
  btnEdit?.addEventListener("click", ()=> showScreen("wizard"));
  btnPrint?.addEventListener("click", ()=> window.print());
  btnTheme.addEventListener("click", toggleTheme);

  btnExportJSON?.addEventListener("click", ()=>{
    if(!state.lastBuiltReport){ toast("Gere um relatório antes."); return; }
    const name = safeText(state.lastBuiltReport.artistName || "relatorio");
    downloadJSON(`vale-relatorio-${slug(name)}.json`, state.lastBuiltReport);
    toast("JSON exportado.");
  });

  btnClearHistory?.addEventListener("click", ()=>{
    if(!confirm("Deseja remover todo o histórico deste dispositivo?")) return;
    clearReports();
    renderHistory();
    renderCompareSelects();
    clearCompareView();
    toast("Histórico removido.");
  });

  btnCompare?.addEventListener("click", runCompare);

  // Campanhas
  btnCreateCampaign?.addEventListener("click", createCampaign);
  btnClearCampaigns?.addEventListener("click", ()=>{
    if(!confirm("Remover todas as campanhas deste dispositivo?")) return;
    const all = loadCampaigns();
    all.forEach(c => deleteCampaign(c.id));
    renderCampaigns();
    hideCampaignDetail();
    toast("Campanhas removidas.");
  });

  // ✅ Plano de conteúdo
  btnCopyContentPlan?.addEventListener("click", copyContentPlan);

  window.addEventListener("keydown", (e)=>{
    if(state.lastScreen !== "wizard") return;
    if(e.key === "Enter" && !e.shiftKey){
      const active = document.activeElement;
      if(active && active.tagName === "TEXTAREA") return;
      e.preventDefault();
      nextQ();
    }
  });
}

function showScreen(name, pushHistory=true){
  Object.values(screens).forEach(s=> s.classList.remove("screen--active"));
  screens[name].classList.add("screen--active");
  state.lastScreen = name;
  btnBack.style.visibility = (name === "landing") ? "hidden" : "visible";
  if(pushHistory) history.pushState({screen:name}, "");
}

window.addEventListener("popstate", (e)=>{
  const scr = (e.state && e.state.screen) ? e.state.screen : "landing";
  Object.values(screens).forEach(s=> s.classList.remove("screen--active"));
  screens[scr].classList.add("screen--active");
  state.lastScreen = scr;
  btnBack.style.visibility = (scr === "landing") ? "hidden" : "visible";
});

function handleBack(){
  if(state.lastScreen === "wizard") showScreen("landing");
  else if(state.lastScreen === "report") showScreen("wizard");
  else showScreen("landing");
}

function startWizard(withDemo){
  if(withDemo){
    state.answers = demoAnswers();
    saveAnswers(state.answers);
    toast("Exemplo preenchido. Você pode editar qualquer resposta.");
  }
  state.idx = firstUnansweredIndex();
  renderQuestion();
  showScreen("wizard");
}

function firstUnansweredIndex(){
  for(let i=0;i<QUESTIONS.length;i++){
    const q = QUESTIONS[i];
    const a = state.answers[q.id];
    if(a == null || a === "" || (Array.isArray(a) && a.length===0)) return i;
  }
  return 0;
}

function prevQ(){ state.idx = Math.max(0, state.idx - 1); renderQuestion(); }

function nextQ(){
  const q = QUESTIONS[state.idx];
  const ok = validateCurrent(q);
  if(!ok){ toast("Escolha uma opção ou preencha o campo para continuar."); return; }

  saveAnswers(state.answers);

  if(state.idx >= QUESTIONS.length - 1){
    buildReport();
    showScreen("report");
    renderCampaigns();
    return;
  }
  state.idx += 1;
  renderQuestion();
}

function validateCurrent(q){
  const a = state.answers[q.id];
  if(q.type === "text" || q.type === "textarea") return (typeof a === "string" && safeText(a).length > 0);
  if(q.type === "single") return typeof a === "string" && a.length > 0;
  if(q.type === "multi") return Array.isArray(a) && a.length > 0;
  if(q.type === "number") return (typeof a === "number" && Number.isFinite(a) && a >= (q.min ?? 0));
  return true;
}

function renderQuestion(){
  const q = QUESTIONS[state.idx];

  qSection.textContent = q.section;
  qCount.textContent = `${state.idx + 1} / ${QUESTIONS.length}`;
  qText.textContent = q.text;
  qHelp.textContent = q.help || "";

  const pct = Math.round(((state.idx) / (QUESTIONS.length-1)) * 100);
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${pct}%`;

  btnPrev.disabled = state.idx === 0;
  btnPrev.style.opacity = btnPrev.disabled ? ".55" : "1";

  answerArea.innerHTML = "";
  if(q.type === "single") renderSingle(q);
  else if(q.type === "multi") renderMulti(q);
  else if(q.type === "textarea") renderTextarea(q);
  else if(q.type === "number") renderNumber(q);
  else renderText(q);

  btnNext.textContent = (state.idx === QUESTIONS.length - 1) ? "Gerar relatório" : "Próximo";
}

function renderSingle(q){
  const current = state.answers[q.id] || "";
  q.options.forEach(opt=>{
    const el = document.createElement("div");
    el.className = "choice" + (current === opt.value ? " choice--selected" : "");
    el.innerHTML = `
      <div class="choice__dot" aria-hidden="true"></div>
      <div class="choice__meta">
        <div class="choice__title">${escapeHtml(opt.label)}</div>
        ${opt.desc ? `<div class="choice__desc">${escapeHtml(opt.desc)}</div>` : ""}
      </div>
    `;
    el.addEventListener("click", ()=>{
      state.answers[q.id] = opt.value;
      renderQuestion();
    });
    answerArea.appendChild(el);
  });
}

function renderMulti(q){
  const current = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
  q.options.forEach(opt=>{
    const selected = current.includes(opt.value);
    const el = document.createElement("div");
    el.className = "choice" + (selected ? " choice--selected" : "");
    el.innerHTML = `
      <div class="choice__dot" aria-hidden="true"></div>
      <div class="choice__meta">
        <div class="choice__title">${escapeHtml(opt.label)}</div>
      </div>
    `;
    el.addEventListener("click", ()=>{
      let next = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
      if(next.includes(opt.value)) next = next.filter(v=>v!==opt.value);
      else next = next.concat(opt.value);
      state.answers[q.id] = next;
      renderQuestion();
    });
    answerArea.appendChild(el);
  });
}

function renderText(q){
  const wrap = document.createElement("div");
  wrap.className = "field";
  wrap.innerHTML = `
    <label>Digite aqui</label>
    <input type="text" placeholder="Ex.: ${q.id === "distributor" ? "ONErpm" : "Jonatan Vale"}" />
  `;
  const input = wrap.querySelector("input");
  input.value = state.answers[q.id] || "";
  input.addEventListener("input", ()=> state.answers[q.id] = input.value);
  answerArea.appendChild(wrap);
  setTimeout(()=> input.focus(), 0);
}

function renderTextarea(q){
  const wrap = document.createElement("div");
  wrap.className = "field";
  wrap.innerHTML = `
    <label>Observações</label>
    <textarea placeholder="Escreva o que for relevante…"></textarea>
  `;
  const ta = wrap.querySelector("textarea");
  ta.value = state.answers[q.id] || "";
  ta.addEventListener("input", ()=> state.answers[q.id] = ta.value);
  answerArea.appendChild(wrap);
  setTimeout(()=> ta.focus(), 0);
}

function renderNumber(q){
  const wrap = document.createElement("div");
  wrap.className = "field";
  const min = (typeof q.min === "number") ? q.min : 0;
  const max = (typeof q.max === "number") ? q.max : 999999999;
  const step = (typeof q.step === "number") ? q.step : 1;

  const current = (typeof state.answers[q.id] === "number") ? state.answers[q.id] : min;

  wrap.innerHTML = `
    <label>Digite um número</label>
    <div class="numrow">
      <input class="numrow__input" type="number" inputmode="numeric" min="${min}" max="${max}" step="${step}" />
      <div class="numrow__hint">min ${formatNumber(min)} • máx ${formatNumber(max)}</div>
    </div>
  `;
  const input = wrap.querySelector("input");
  input.value = String(current);

  input.addEventListener("input", ()=>{
    const v = Number(input.value);
    state.answers[q.id] = Number.isFinite(v) ? v : min;
  });

  answerArea.appendChild(wrap);
  setTimeout(()=> input.focus(), 0);
}

function buildReport(){
  const result = scoreAnswers(state.answers, QUESTIONS);
  const name = safeText(state.answers.artist_name || "Artista");
  const stamp = new Date().toLocaleString("pt-BR");
  const subtitle = `Relatório gerado para ${name} • ${stamp}`;

  reportSubtitle.textContent = subtitle;
  reportSubtitle2.textContent = subtitle;

  stageLabel.textContent = result.stage.label;
  stageLabel2.textContent = result.stage.label;
  stageHint.textContent = result.stage.hint;

  overallScore.textContent = String(result.overall);
  overallScore2.textContent = String(result.overall);
  nextGoal.textContent = result.insights.nextGoal;

  pillarChips.innerHTML = "";
  Object.entries(result.pillarScores).forEach(([p,val])=>{
    const meta = pillarMeta(p);
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<strong>${escapeHtml(meta.label)}</strong> • ${val}/100`;
    pillarChips.appendChild(chip);
  });

  pillarBars.innerHTML = "";
  Object.entries(result.pillarScores).forEach(([p,val])=>{
    const meta = pillarMeta(p);
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `
      <div class="bar__label">${escapeHtml(meta.label)}</div>
      <div class="bar__track"><div class="bar__fill" style="width:${val}%"></div></div>
      <div class="bar__val">${val}</div>
    `;
    pillarBars.appendChild(bar);
  });

  const analytics = buildAnalytics(state.answers);
  renderAnalytics(analytics);

  priorities30.innerHTML = "";
  result.plans.priorities.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    priorities30.appendChild(li);
  });

  checklist.innerHTML = "";
  result.plans.checklist.forEach(t=>{
    const li = document.createElement("li");
    li.className = "check";
    li.innerHTML = `<div class="check__box" aria-hidden="true"></div><div class="check__text">${escapeHtml(t)}</div>`;
    checklist.appendChild(li);
  });

  timelineMonth.innerHTML = "";
  result.plans.month.forEach(item=>{
    const el = document.createElement("div");
    el.className = "titem";
    el.innerHTML = `
      <div class="titem__top">
        <div class="titem__label">${escapeHtml(item.label)}</div>
        <div class="titem__when">${escapeHtml(item.when)}</div>
      </div>
      <div class="titem__desc">${escapeHtml(item.desc)}</div>
    `;
    timelineMonth.appendChild(el);
  });

  timelineYear.innerHTML = "";
  result.plans.year.forEach(item=>{
    const el = document.createElement("div");
    el.className = "titem";
    el.innerHTML = `
      <div class="titem__top">
        <div class="titem__label">${escapeHtml(item.label)}</div>
        <div class="titem__when">${escapeHtml(item.when)}</div>
      </div>
      <div class="titem__desc">${escapeHtml(item.desc)}</div>
    `;
    timelineYear.appendChild(el);
  });

  recommendations.innerHTML = "";
  result.plans.recs.forEach(r=>{
    const el = document.createElement("div");
    el.className = "rec";
    el.innerHTML = `<div class="rec__title">${escapeHtml(r.title)}</div><div class="rec__body">${escapeHtml(r.body)}</div>`;
    recommendations.appendChild(el);
  });

  // ✅ Etapa D: gerar e renderizar plano de conteúdo
  const contentPlan = buildContentPlan({ answers: state.answers, reportResult: result });
  state.lastContentPlan = contentPlan;
  renderContentPlan(contentPlan);

  const fullReport = {
    id: uid(),
    createdAt: new Date().toISOString(),
    createdAtLabel: stamp,
    artistName: name,
    answers: state.answers,
    result,
    analytics,
    contentPlan
  };

  state.lastBuiltReport = fullReport;
  addReport(fullReport);
  renderHistory();
  renderCompareSelects(true);
  renderCampaigns();
  toast("Relatório gerado e salvo no histórico.");
}

function renderAnalytics(a){
  analyticsCards.innerHTML = "";
  a.cards.forEach(c=>{
    const el = document.createElement("div");
    el.className = "acard";
    el.innerHTML = `
      <div class="acard__top">
        <div class="acard__name">${escapeHtml(c.name)}</div>
        <div class="acard__tag ${escapeHtml(c.tagType)}">${escapeHtml(c.tag)}</div>
      </div>
      <div class="acard__val">${escapeHtml(c.value)}</div>
      <div class="acard__sub">${escapeHtml(c.sub)}</div>
      <div class="acard__meter"><div class="acard__fill" style="width:${c.pct}%"></div></div>
    `;
    analyticsCards.appendChild(el);
  });

  analyticsInsights.innerHTML = "";
  a.insights.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    analyticsInsights.appendChild(li);
  });

  analyticsGoals.innerHTML = "";
  a.goals.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    analyticsGoals.appendChild(li);
  });
}

// ✅ Conteúdo
function clearContentPlan(){
  if(cpMetaGoal) cpMetaGoal.textContent = "Objetivo: —";
  if(cpMetaTraffic) cpMetaTraffic.textContent = "Tráfego: —";
  if(cpMetaStage) cpMetaStage.textContent = "Status: —";
  if(cpMetaTrack) cpMetaTrack.textContent = "Motor: —";
  if(contentPlanGrid) contentPlanGrid.innerHTML = `<div class="historyEmpty">Gere um relatório para criar o plano de conteúdo.</div>`;
  state.lastContentPlan = null;
}

function renderContentPlan(plan){
  if(!plan || !plan.ideas || !plan.ideas.length){
    clearContentPlan();
    return;
  }

  cpMetaGoal.textContent = `Objetivo: ${safeText(plan.meta.goal || "—")}`;
  cpMetaTraffic.textContent = `Tráfego: ${safeText(plan.meta.traffic || "—")}`;
  cpMetaStage.textContent = `Status: ${safeText(plan.meta.stage || "—")}`;
  cpMetaTrack.textContent = `Motor: ${safeText(plan.meta.track || "—")}`;

  contentPlanGrid.innerHTML = "";
  plan.ideas.forEach(idea=>{
    const el = document.createElement("div");
    el.className = "ideaCard";
    el.innerHTML = `
      <div class="ideaTop">
        <div class="ideaTitle">${escapeHtml(safeText(idea.title))}</div>
        <div class="ideaDay">Dia ${String(idea.day)}</div>
      </div>

      <div class="ideaTags">
        ${(idea.tags || []).slice(0,3).map(t=> `<div class="ideaTag">${escapeHtml(safeText(t))}</div>`).join("")}
      </div>

      <div class="ideaBody">
        ${escapeHtml(safeText(idea.script)).replaceAll("\n","<br>")}
      </div>

      <div class="ideaCTA">
        <strong>${escapeHtml(safeText(idea.cta))}</strong>
      </div>
    `;
    contentPlanGrid.appendChild(el);
  });
}

async function copyContentPlan(){
  if(!state.lastContentPlan || !state.lastContentPlan.ideas?.length){
    toast("Gere um relatório para copiar o plano.");
    return;
  }

  const p = state.lastContentPlan;
  const lines = [];
  lines.push("VALE PRODUÇÃO — PLANO DE CONTEÚDO (30 DIAS)");
  lines.push(`Objetivo: ${safeText(p.meta.goal)} • Tráfego: ${safeText(p.meta.traffic)} • Status: ${safeText(p.meta.stage)} • Motor: ${safeText(p.meta.track)}`);
  lines.push("");
  p.ideas.forEach(i=>{
    lines.push(`Dia ${i.day} — ${safeText(i.title)}`);
    lines.push(`Tags: ${(i.tags||[]).join(" • ")}`);
    lines.push(safeText(i.script));
    lines.push(safeText(i.cta));
    lines.push("—");
  });

  const text = lines.join("\n");
  try{
    await navigator.clipboard.writeText(text);
    toast("Plano copiado.");
  }catch{
    // fallback
    try{
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("Plano copiado.");
    }catch{
      toast("Não foi possível copiar. Seu navegador bloqueou a área de transferência.");
    }
  }
}

function renderHistory(){
  const reports = loadReports();
  renderHistoryList(historyListLanding, reports, true);
  renderHistoryList(historyListReport, reports, false);
}

function renderHistoryList(container, reports, isLanding){
  if(!container) return;

  if(!reports || reports.length === 0){
    container.innerHTML = `<div class="historyEmpty">Ainda não há relatórios salvos.</div>`;
    return;
  }

  container.innerHTML = "";
  reports.slice(0, isLanding ? 6 : 30).forEach(r=>{
    const el = document.createElement("button");
    el.className = "historyItem";
    el.type = "button";
    el.innerHTML = `
      <div class="historyItem__left">
        <div class="historyItem__title">${escapeHtml(safeText(r.artistName || "Artista"))}</div>
        <div class="historyItem__sub">${escapeHtml(safeText(r.createdAtLabel || ""))}</div>
      </div>
      <div class="historyItem__right">
        <div class="historyItem__score">${String(r?.result?.overall ?? 0)}</div>
        <div class="historyItem__tag">${escapeHtml(safeText(r?.result?.stage?.label || "—"))}</div>
      </div>
    `;
    el.addEventListener("click", ()=> openReportFromHistory(r.id));
    container.appendChild(el);
  });
}

function openReportFromHistory(id){
  const r = findReportById(id);
  if(!r){ toast("Relatório não encontrado."); return; }
  state.lastBuiltReport = r;
  state.answers = r.answers || {};
  saveAnswers(state.answers);
  buildReportFromStored(r);
  showScreen("report");
  renderCompareSelects(true);
  renderCampaigns();

  // conteúdo do histórico (se existir) ou gera de novo
  if(r.contentPlan?.ideas?.length){
    state.lastContentPlan = r.contentPlan;
    renderContentPlan(r.contentPlan);
  }else{
    const cp = buildContentPlan({ answers: state.answers, reportResult: r.result });
    state.lastContentPlan = cp;
    renderContentPlan(cp);
  }

  toast("Relatório aberto do histórico.");
}

function buildReportFromStored(fullReport){
  state.answers = fullReport.answers || {};
  saveAnswers(state.answers);
  state.lastBuiltReport = fullReport;

  const result = fullReport.result;
  const analytics = fullReport.analytics;

  const name = safeText(fullReport.artistName || "Artista");
  const stamp = safeText(fullReport.createdAtLabel || "");
  const subtitle = `Relatório gerado para ${name} • ${stamp}`;

  reportSubtitle.textContent = subtitle;
  reportSubtitle2.textContent = subtitle;

  stageLabel.textContent = result.stage.label;
  stageLabel2.textContent = result.stage.label;
  stageHint.textContent = result.stage.hint;

  overallScore.textContent = String(result.overall);
  overallScore2.textContent = String(result.overall);
  nextGoal.textContent = result.insights.nextGoal;

  pillarChips.innerHTML = "";
  Object.entries(result.pillarScores).forEach(([p,val])=>{
    const meta = pillarMeta(p);
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<strong>${escapeHtml(meta.label)}</strong> • ${val}/100`;
    pillarChips.appendChild(chip);
  });

  pillarBars.innerHTML = "";
  Object.entries(result.pillarScores).forEach(([p,val])=>{
    const meta = pillarMeta(p);
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `
      <div class="bar__label">${escapeHtml(meta.label)}</div>
      <div class="bar__track"><div class="bar__fill" style="width:${val}%"></div></div>
      <div class="bar__val">${val}</div>
    `;
    pillarBars.appendChild(bar);
  });

  renderAnalytics(analytics);

  priorities30.innerHTML = "";
  result.plans.priorities.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    priorities30.appendChild(li);
  });

  checklist.innerHTML = "";
  result.plans.checklist.forEach(t=>{
    const li = document.createElement("li");
    li.className = "check";
    li.innerHTML = `<div class="check__box" aria-hidden="true"></div><div class="check__text">${escapeHtml(t)}</div>`;
    checklist.appendChild(li);
  });

  timelineMonth.innerHTML = "";
  result.plans.month.forEach(item=>{
    const el = document.createElement("div");
    el.className = "titem";
    el.innerHTML = `
      <div class="titem__top">
        <div class="titem__label">${escapeHtml(item.label)}</div>
        <div class="titem__when">${escapeHtml(item.when)}</div>
      </div>
      <div class="titem__desc">${escapeHtml(item.desc)}</div>
    `;
    timelineMonth.appendChild(el);
  });

  timelineYear.innerHTML = "";
  result.plans.year.forEach(item=>{
    const el = document.createElement("div");
    el.className = "titem";
    el.innerHTML = `
      <div class="titem__top">
        <div class="titem__label">${escapeHtml(item.label)}</div>
        <div class="titem__when">${escapeHtml(item.when)}</div>
      </div>
      <div class="titem__desc">${escapeHtml(item.desc)}</div>
    `;
    timelineYear.appendChild(el);
  });

  recommendations.innerHTML = "";
  result.plans.recs.forEach(r=>{
    const el = document.createElement("div");
    el.className = "rec";
    el.innerHTML = `<div class="rec__title">${escapeHtml(r.title)}</div><div class="rec__body">${escapeHtml(r.body)}</div>`;
    recommendations.appendChild(el);
  });

  // Etapa D (histórico)
  if(fullReport.contentPlan?.ideas?.length){
    state.lastContentPlan = fullReport.contentPlan;
    renderContentPlan(fullReport.contentPlan);
  }else{
    const cp = buildContentPlan({ answers: state.answers, reportResult: result });
    state.lastContentPlan = cp;
    renderContentPlan(cp);
  }

  renderHistory();
}

// Compare
function renderCompareSelects(autoPick=false){
  if(!compareA || !compareB) return;
  const reports = loadReports();

  const makeOpt = (id, label)=>{
    const o = document.createElement("option");
    o.value = id;
    o.textContent = label;
    return o;
  };

  compareA.innerHTML = "";
  compareB.innerHTML = "";
  compareA.appendChild(makeOpt("", "Selecione…"));
  compareB.appendChild(makeOpt("", "Selecione…"));

  reports.forEach(r=>{
    const label = `${safeText(r.artistName||"Artista")} • ${safeText(r.createdAtLabel||"")} • Score ${String(r?.result?.overall ?? 0)}`;
    compareA.appendChild(makeOpt(r.id, label));
    compareB.appendChild(makeOpt(r.id, label));
  });

  if(autoPick && reports.length >= 2){
    compareA.value = reports[reports.length-2].id;
    compareB.value = reports[reports.length-1].id;
    runCompare();
  }else{
    clearCompareView();
  }
}

function clearCompareView(){
  if(cmpScore) cmpScore.textContent = "—";
  if(cmpMl) cmpMl.textContent = "—";
  if(cmpSf) cmpSf.textContent = "—";
  if(cmpScoreDelta){ cmpScoreDelta.textContent = "—"; cmpScoreDelta.className = "delta delta--neutral"; }
  if(cmpMlDelta){ cmpMlDelta.textContent = "—"; cmpMlDelta.className = "delta delta--neutral"; }
  if(cmpSfDelta){ cmpSfDelta.textContent = "—"; cmpSfDelta.className = "delta delta--neutral"; }
  if(sparkScore) sparkScore.innerHTML = "";
  if(sparkMl) sparkMl.innerHTML = "";
  if(sparkSf) sparkSf.innerHTML = "";
  if(compareInsights) compareInsights.innerHTML = "";
  if(compareActions) compareActions.innerHTML = "";
}

function runCompare(){
  const idA = compareA?.value || "";
  const idB = compareB?.value || "";
  const reports = loadReports();

  if(!idA || !idB){ toast("Selecione Relatório A e B."); return; }
  if(idA === idB){ toast("Escolha relatórios diferentes."); return; }

  const data = buildCompareUIData(reports, idA, idB);
  if(!data.ok){ toast(data.message || "Não foi possível comparar."); return; }

  cmpScore.textContent = `${String(data.cards.score.a)} → ${String(data.cards.score.b)}`;
  cmpMl.textContent = `${formatNumber(data.cards.ml.a)} → ${formatNumber(data.cards.ml.b)}`;
  cmpSf.textContent = `${formatNumber(data.cards.sf.a)} → ${formatNumber(data.cards.sf.b)}`;

  cmpScoreDelta.textContent = data.cards.score.delta.text;
  cmpScoreDelta.className = data.cards.score.delta.cls;

  cmpMlDelta.textContent = data.cards.ml.delta.text;
  cmpMlDelta.className = data.cards.ml.delta.cls;

  cmpSfDelta.textContent = data.cards.sf.delta.text;
  cmpSfDelta.className = data.cards.sf.delta.cls;

  sparkScore.innerHTML = data.sparks.score;
  sparkMl.innerHTML = data.sparks.ml;
  sparkSf.innerHTML = data.sparks.sf;

  compareInsights.innerHTML = "";
  data.insights.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    compareInsights.appendChild(li);
  });

  compareActions.innerHTML = "";
  data.actions.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    compareActions.appendChild(li);
  });

  toast("Comparação atualizada.");
}

function resetAll(){
  if(!confirm("Limpar todas as respostas deste dispositivo?")) return;
  state.answers = {};
  saveAnswers(state.answers);
  state.idx = 0;
  renderQuestion();
  toast("Respostas removidas.");
}

// Campanhas
function createCampaign(){
  const type = campType?.value || "single";
  const name = safeText(campName?.value || "");
  const releaseDate = campDate?.value || "";
  const budget = Number(campBudget?.value || 0);
  const focus = safeText(campFocus?.value || "streams");

  if(!name){ toast("Digite o nome do projeto."); return; }
  if(!releaseDate){ toast("Selecione a data de lançamento."); return; }

  const built = buildCampaign({ type, name, releaseDate, budget, focus });
  if(!built.ok){ toast(built.error || "Não foi possível criar a campanha."); return; }

  addCampaign(built.campaign);
  renderCampaigns();
  openCampaignDetail(built.campaign.id);
  toast("Campanha criada e salva.");
}

function renderCampaigns(){
  if(!campaignList) return;
  const arr = loadCampaigns();

  if(!arr || arr.length === 0){
    campaignList.innerHTML = `<div class="historyEmpty">Nenhuma campanha criada ainda.</div>`;
    return;
  }

  campaignList.innerHTML = "";
  arr.slice(0, 30).forEach(c=>{
    const el = document.createElement("div");
    el.className = "campItem";

    const budget = Number(c.budget || 0);
    const date = safeText(c.releaseDate || "");
    const tag = (c.type || "single").toUpperCase();

    el.innerHTML = `
      <div class="campItem__top">
        <div>
          <div class="campItem__name">${escapeHtml(safeText(c.name || "Campanha"))}</div>
          <div class="campItem__meta">Lançamento: ${escapeHtml(date)} • Orçamento: R$ ${escapeHtml(String(budget))}</div>
        </div>
        <div class="campItem__right">
          <div class="campItem__tag">${escapeHtml(tag)}</div>
        </div>
      </div>

      <div class="campItem__actions">
        <button class="campMini" data-open="${escapeHtml(c.id)}">Abrir</button>
        <button class="campMini campMini--danger" data-del="${escapeHtml(c.id)}">Excluir</button>
      </div>
    `;

    el.querySelector("[data-open]")?.addEventListener("click", ()=> openCampaignDetail(c.id));
    el.querySelector("[data-del]")?.addEventListener("click", ()=>{
      if(!confirm("Excluir esta campanha?")) return;
      deleteCampaign(c.id);
      renderCampaigns();
      hideCampaignDetail();
      toast("Campanha excluída.");
    });

    campaignList.appendChild(el);
  });
}

function openCampaignDetail(id){
  const c = findCampaign(id);
  if(!c){ toast("Campanha não encontrada."); return; }
  if(!campaignDetail) return;

  const budget = Number(c.budget || 0);
  const type = (c.type || "single").toUpperCase();
  const focus = safeText(c.focus || "streams");
  const date = safeText(c.releaseDate || "");
  const weeks = Array.isArray(c?.plan?.weeks) ? c.plan.weeks : [];

  campaignDetail.classList.add("campaignDetail--on");
  campaignDetail.innerHTML = `
    <div class="campaignDetail__top">
      <div>
        <div class="campaignDetail__title">${escapeHtml(safeText(c.name || "Campanha"))}</div>
        <div class="campaignDetail__sub">Tipo: ${escapeHtml(type)} • Foco: ${escapeHtml(focus)} • Lançamento: ${escapeHtml(date)} • Orçamento: R$ ${escapeHtml(String(budget))}</div>
      </div>
      <div>
        <button id="btnCloseCampaignDetail" class="campMini">Fechar</button>
      </div>
    </div>

    <div class="weekList">
      ${weeks.map(w=>`
        <div class="weekCard">
          <div class="weekCard__top">
            <div class="weekCard__label">${escapeHtml(safeText(w.label||"Semana"))}</div>
            <div class="weekCard__phase">${escapeHtml(safeText(w.phase||""))}</div>
          </div>
          <ul>
            ${(Array.isArray(w.goals)? w.goals: []).map(g=>`<li>${escapeHtml(safeText(g))}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </div>
  `;

  document.getElementById("btnCloseCampaignDetail")?.addEventListener("click", hideCampaignDetail);
}

function hideCampaignDetail(){
  if(!campaignDetail) return;
  campaignDetail.classList.remove("campaignDetail--on");
  campaignDetail.innerHTML = "";
}

// Storage: answers
function loadAnswers(){
  try{
    const raw = localStorage.getItem("vale_cm_answers");
    return raw ? JSON.parse(raw) : {};
  }catch{ return {}; }
}

function saveAnswers(obj){
  try{ localStorage.setItem("vale_cm_answers", JSON.stringify(obj)); }catch{}
}

function demoAnswers(){
  return {
    artist_name: "Jonatan Vale (demo)",
    genre: "gospel",
    goal: "viralizar",
    career_time: "2-5y",
    released_music: "3-10",
    distributor: "ONErpm",
    metadata_ready: "parcial",
    spotify_profile: "bom",
    youtube_channel: "ativo",
    tiktok_use: "semanal",
    content_frequency: "3w",
    ads_budget: "low",
    team: "parcial",
    planning: "bom",
    shows: "ocasional",
    revenue_sources: ["shows","streaming"],

    monthly_listeners_num: 5200,
    spotify_followers_num: 430,
    instagram_followers_num: 6800,
    tiktok_followers_num: 900,
    youtube_subs_num: 320,

    streams_28d_total: 23000,
    youtube_views_28d: 9000,
    content_posts_7d: 6,

    top_countries_3: "Brasil, Portugal, Estados Unidos",
    top_cities_3: "São Paulo, Rio de Janeiro, Salvador",
    top_tracks_3: "Caminhos da Fé, Promessas, Gratidão",
    traffic_source_main: "social",
    traffic_weakest: "playlists",

    notes: "Quero crescer no Brasil e abrir portas fora, mantendo identidade premium."
  };
}

// Theme
function loadTheme(){
  const t = localStorage.getItem("vale_cm_theme");
  return (t === "light" || t === "dark") ? t : "dark";
}
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("vale_cm_theme", t);
  btnTheme.querySelector(".icon").textContent = (t === "dark") ? "☾" : "☀";
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
  toast("Tema atualizado.");
}

function slug(s){
  return safeText(s)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "relatorio";
}

function escapeHtml(s){
  return safeText(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}