// js/app.js
import { QUESTIONS } from "./data/questions.js";
import { BUILD_INFO } from "./data/build-info.js";
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
import { buildPressKit } from "./core/presskit.js";
import { buildCommercialPlan } from "./core/commercial.js";

import {
  verifyPin,
  setAdminPin,
  normalizeReports,
  filterAndSort,
  buildAdminSummary,
  buildWhatsAppMessage
} from "./core/admin.js";

/* ----------------------------------------------------------
  ELEMENTOS / SCREENS
---------------------------------------------------------- */
const screens = {
  landing: document.getElementById("screenLanding"),
  wizard: document.getElementById("screenWizard"),
  report: document.getElementById("screenReport"),
  admin: document.getElementById("screenAdmin")
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
const btnExportBundle = document.getElementById("btnExportBundle");
const btnCopyTeamSummary = document.getElementById("btnCopyTeamSummary");
const btnDownloadTeamSummary = document.getElementById("btnDownloadTeamSummary");
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

const buildLabelLanding = document.getElementById("buildLabelLanding");
const projectCompletionLanding = document.getElementById("projectCompletionLanding");
const projectStageLanding = document.getElementById("projectStageLanding");
const deployTargetsLanding = document.getElementById("deployTargetsLanding");
const buildLabelReport = document.getElementById("buildLabelReport");
const projectCompletionReport = document.getElementById("projectCompletionReport");
const projectStageReport = document.getElementById("projectStageReport");
const executiveSummary = document.getElementById("executiveSummary");
const profileLabel = document.getElementById("profileLabel");
const profileSummary = document.getElementById("profileSummary");
const readinessGrid = document.getElementById("readinessGrid");
const strengthList = document.getElementById("strengthList");
const riskList = document.getElementById("riskList");
const opportunityList = document.getElementById("opportunityList");
const quickWinList = document.getElementById("quickWinList");
const roadmap90 = document.getElementById("roadmap90");
const commercialScore = document.getElementById("commercialScore");
const commercialLane = document.getElementById("commercialLane");
const commercialSummary = document.getElementById("commercialSummary");
const offerStack = document.getElementById("offerStack");
const revenueForecast = document.getElementById("revenueForecast");
const launchChecklist = document.getElementById("launchChecklist");
const betaFeatures = document.getElementById("betaFeatures");
const dlcRoadmap = document.getElementById("dlcRoadmap");
const projectBuildFoot = document.getElementById("projectBuildFoot");
const reportLocaleSelect = document.getElementById("reportLocaleSelect");
const teamHandoffCard = document.getElementById("teamHandoffCard");

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

// Etapa D — Plano de Conteúdo
const cpMetaGoal = document.getElementById("cpMetaGoal");
const cpMetaTraffic = document.getElementById("cpMetaTraffic");
const cpMetaStage = document.getElementById("cpMetaStage");
const cpMetaTrack = document.getElementById("cpMetaTrack");
const contentPlanGrid = document.getElementById("contentPlanGrid");
const btnCopyContentPlan = document.getElementById("btnCopyContentPlan");

// Etapa E — Press Kit
const pkName = document.getElementById("pkName");
const pkGenre = document.getElementById("pkGenre");
const pkStage = document.getElementById("pkStage");
const pkBioShort = document.getElementById("pkBioShort");
const pkBioLong = document.getElementById("pkBioLong");
const pkData = document.getElementById("pkData");
const pkMetrics = document.getElementById("pkMetrics");
const pkShow = document.getElementById("pkShow");
const pkCollab = document.getElementById("pkCollab");
const btnCopyPressKit = document.getElementById("btnCopyPressKit");
const btnPrintPressKit = document.getElementById("btnPrintPressKit");

let lastPressKit = null;

// Etapa F — Admin
const btnOpenAdmin = document.getElementById("btnOpenAdmin");
const btnAdminPin = document.getElementById("btnAdminPin");
const btnAdminExportAll = document.getElementById("btnAdminExportAll");
const btnAdminClearAll = document.getElementById("btnAdminClearAll");
const adminSearch = document.getElementById("adminSearch");
const adminSort = document.getElementById("adminSort");
const adminList = document.getElementById("adminList");
const adminDetail = document.getElementById("adminDetail");

const pinModal = document.getElementById("pinModal");
const pinInput = document.getElementById("pinInput");
const btnPinEnter = document.getElementById("btnPinEnter");
const btnPinCancel = document.getElementById("btnPinCancel");

const pinChangeModal = document.getElementById("pinChangeModal");
const pinNewInput = document.getElementById("pinNewInput");
const btnPinSave = document.getElementById("btnPinSave");
const btnPinClose = document.getElementById("btnPinClose");

/* ----------------------------------------------------------
  STATE
---------------------------------------------------------- */
let state = {
  idx: 0,
  answers: loadAnswers(),
  lastScreen: "landing",
  lastBuiltReport: null,
  lastContentPlan: null,
  reportLocale: loadReportLocale()
};

let adminState = {
  selectedId: "",
  normalized: [],
  filtered: []
};

init();

/* ----------------------------------------------------------
  INIT
---------------------------------------------------------- */
function init(){
  bind();
  applyBuildInfo();
  applyTheme(loadTheme());
  showScreen("landing", false);
  if(btnBack) btnBack.style.visibility = "hidden";
  renderHistory();
  renderCompareSelects();
  if(reportLocaleSelect) reportLocaleSelect.value = state.reportLocale || "pt-BR";
  renderCampaigns();
  clearContentPlan();
  clearPressKit();
  adminInit();
  registerServiceWorker();
}

function bind(){
  btnStart?.addEventListener("click", ()=> startWizard(false));
  btnDemoFill?.addEventListener("click", ()=> startWizard(true));
  btnPrev?.addEventListener("click", prevQ);
  btnNext?.addEventListener("click", nextQ);
  btnBack?.addEventListener("click", handleBack);

  btnReset?.addEventListener("click", resetAll);
  btnEdit?.addEventListener("click", ()=> showScreen("wizard"));
  btnPrint?.addEventListener("click", ()=> window.print());
  btnTheme?.addEventListener("click", toggleTheme);

  btnExportJSON?.addEventListener("click", ()=>{
    if(!state.lastBuiltReport){ toast("Gere um relatório antes."); return; }
    const name = safeText(state.lastBuiltReport.artistName || "relatorio");
    downloadJSON(`vale-relatorio-${slug(name)}-${BUILD_INFO.buildSlug}.json`, state.lastBuiltReport);
    toast("JSON exportado.");
  });

  btnExportBundle?.addEventListener("click", ()=>{
    if(!state.lastBuiltReport){ toast("Gere um relatório antes."); return; }
    const name = safeText(state.lastBuiltReport.artistName || "relatorio");
    const payload = {
      exportedAt: new Date().toISOString(),
      build: { ...BUILD_INFO },
      report: state.lastBuiltReport
    };
    downloadJSON(`vale-backup-completo-${slug(name)}-${BUILD_INFO.buildSlug}.json`, payload);
    toast("Backup completo exportado.");
  });

  btnCopyTeamSummary?.addEventListener("click", copyTeamSummary);
  btnDownloadTeamSummary?.addEventListener("click", downloadTeamSummary);
  reportLocaleSelect?.addEventListener("change", ()=>{
    state.reportLocale = reportLocaleSelect.value || "pt-BR";
    saveReportLocale(state.reportLocale);
    refreshTeamHandoff();
    toast("Idioma do handoff atualizado.");
  });

  btnClearHistory?.addEventListener("click", ()=>{
    if(!confirm("Deseja remover todo o histórico deste dispositivo?")) return;
    clearReports();
    renderHistory();
    renderCompareSelects();
    clearCompareView();
    adminRefresh();
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

  // Conteúdo
  btnCopyContentPlan?.addEventListener("click", copyContentPlan);

  // Press kit
  btnPrintPressKit?.addEventListener("click", ()=> window.print());
  btnCopyPressKit?.addEventListener("click", copyPressKit);

  // Admin
  btnOpenAdmin?.addEventListener("click", ()=> openPinModal());
  btnAdminPin?.addEventListener("click", ()=> openPinChangeModal());
  btnAdminExportAll?.addEventListener("click", adminExportAll);
  btnAdminClearAll?.addEventListener("click", adminClearAll);

  adminSearch?.addEventListener("input", ()=> adminApplyFilterSort());
  adminSort?.addEventListener("change", ()=> adminApplyFilterSort());

  btnPinEnter?.addEventListener("click", ()=> tryEnterAdmin());
  btnPinCancel?.addEventListener("click", ()=> closePinModal());
  pinInput?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") tryEnterAdmin(); });

  btnPinSave?.addEventListener("click", ()=> saveNewPin());
  btnPinClose?.addEventListener("click", ()=> closePinChangeModal());

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

/* ----------------------------------------------------------
  NAVIGATION
---------------------------------------------------------- */
function showScreen(name, pushHistory=true){
  Object.values(screens).forEach(s=> s?.classList?.remove("screen--active"));
  screens[name]?.classList?.add("screen--active");
  state.lastScreen = name;
  if(btnBack) btnBack.style.visibility = (name === "landing") ? "hidden" : "visible";
  if(pushHistory) history.pushState({screen:name}, "");
}

window.addEventListener("popstate", (e)=>{
  const scr = (e.state && e.state.screen) ? e.state.screen : "landing";
  Object.values(screens).forEach(s=> s?.classList?.remove("screen--active"));
  screens[scr]?.classList?.add("screen--active");
  state.lastScreen = scr;
  if(btnBack) btnBack.style.visibility = (scr === "landing") ? "hidden" : "visible";
});

function handleBack(){
  if(state.lastScreen === "wizard") showScreen("landing");
  else if(state.lastScreen === "report") showScreen("wizard");
  else if(state.lastScreen === "admin") showScreen("landing");
  else showScreen("landing");
}

/* ----------------------------------------------------------
  WIZARD
---------------------------------------------------------- */
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

function prevQ(){
  state.idx = Math.max(0, state.idx - 1);
  renderQuestion();
}

function nextQ(){
  const q = QUESTIONS[state.idx];
  const ok = validateCurrent(q);
  if(!ok){ toast("Escolha uma opção ou preencha o campo para continuar."); return; }

  saveAnswers(state.answers);

  if(state.idx >= QUESTIONS.length - 1){
    try{
      buildReport();
      showScreen("report");
      renderCampaigns();
    }catch(err){
      console.error("Falha ao gerar relatório final", err);
      toast("O relatório falhou no final. Corrigido nesta build: tente novamente.");
    }
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

  if(qSection) qSection.textContent = q.section;
  if(qCount) qCount.textContent = `${state.idx + 1} / ${QUESTIONS.length}`;
  if(qText) qText.textContent = q.text;
  if(qHelp) qHelp.textContent = q.help || "";

  const pct = Math.round(((state.idx) / (QUESTIONS.length-1)) * 100);
  if(progressFill) progressFill.style.width = `${pct}%`;
  if(progressLabel) progressLabel.textContent = `${pct}%`;

  if(btnPrev){
    btnPrev.disabled = state.idx === 0;
    btnPrev.style.opacity = btnPrev.disabled ? ".55" : "1";
  }

  if(answerArea) answerArea.innerHTML = "";
  if(q.type === "single") renderSingle(q);
  else if(q.type === "multi") renderMulti(q);
  else if(q.type === "textarea") renderTextarea(q);
  else if(q.type === "number") renderNumber(q);
  else renderText(q);

  if(btnNext) btnNext.textContent = (state.idx === QUESTIONS.length - 1) ? "Gerar relatório" : "Próximo";
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
    answerArea?.appendChild(el);
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
    answerArea?.appendChild(el);
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
  answerArea?.appendChild(wrap);
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
  answerArea?.appendChild(wrap);
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

  answerArea?.appendChild(wrap);
  setTimeout(()=> input.focus(), 0);
}


/* ----------------------------------------------------------
  REPORT BUILD
---------------------------------------------------------- */
function buildReport(){
  const sourceAnswers = { ...state.answers };
  const result = scoreAnswers(sourceAnswers, QUESTIONS);
  const analytics = buildAnalytics(sourceAnswers);
  const contentPlan = buildContentPlan({ answers: sourceAnswers, reportResult: result });
  const pressKit = buildPressKit({ answers: sourceAnswers, reportResult: result, analytics });
  const commercial = buildCommercialPlan({ answers: sourceAnswers, reportResult: result, analytics });

  const name = safeText(sourceAnswers.artist_name || "Artista");
  const stamp = new Date().toLocaleString("pt-BR");

  const fullReport = {
    id: uid(),
    createdAt: new Date().toISOString(),
    createdAtLabel: stamp,
    artistName: name,
    answers: { ...sourceAnswers },
    result,
    analytics,
    contentPlan,
    pressKit,
    commercial,
    build: { ...BUILD_INFO }
  };

  state.lastBuiltReport = fullReport;
  applyReportView(fullReport);
  addReport(fullReport);
  renderHistory();
  renderCompareSelects(true);
  renderCampaigns();
  adminRefresh();
  toast("Relatório gerado e salvo no histórico.");
}

function applyReportView(fullReport){
  const sourceAnswers = fullReport?.answers ? { ...fullReport.answers } : { ...state.answers };
  const result = fullReport?.result?.diagnostics ? fullReport.result : scoreAnswers(sourceAnswers, QUESTIONS);
  const analytics = fullReport?.analytics || buildAnalytics(sourceAnswers);
  const contentPlan = fullReport?.contentPlan?.ideas?.length
    ? fullReport.contentPlan
    : buildContentPlan({ answers: sourceAnswers, reportResult: result });
  const pressKit = fullReport?.pressKit?.copyText
    ? fullReport.pressKit
    : buildPressKit({ answers: sourceAnswers, reportResult: result, analytics });
  const commercial = fullReport?.commercial?.offers?.length
    ? fullReport.commercial
    : buildCommercialPlan({ answers: sourceAnswers, reportResult: result, analytics });
  const buildMeta = fullReport?.build || BUILD_INFO;

  const name = safeText(fullReport?.artistName || state.answers.artist_name || "Artista");
  const stamp = safeText(fullReport?.createdAtLabel || new Date().toLocaleString("pt-BR"));
  const subtitle = `Relatório gerado para ${name} • ${stamp}`;

  state.lastBuiltReport = {
    ...fullReport,
    artistName: name,
    createdAtLabel: stamp,
    answers: { ...sourceAnswers },
    result,
    analytics,
    contentPlan,
    pressKit,
    commercial,
    build: { ...buildMeta }
  };

  if(reportSubtitle) reportSubtitle.textContent = subtitle;
  if(reportSubtitle2) reportSubtitle2.textContent = subtitle;

  if(stageLabel) stageLabel.textContent = result.stage.label;
  if(stageLabel2) stageLabel2.textContent = result.stage.label;
  if(stageHint) stageHint.textContent = result.stage.hint;

  if(overallScore) overallScore.textContent = String(result.overall);
  if(overallScore2) overallScore2.textContent = String(result.overall);
  if(nextGoal) nextGoal.textContent = result.insights?.nextGoal || "—";

  if(pillarChips){
    pillarChips.innerHTML = "";
    Object.entries(result.pillarScores || {}).forEach(([p,val])=>{
      const meta = pillarMeta(p);
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `<strong>${escapeHtml(meta.label)}</strong> • ${val}/100`;
      pillarChips.appendChild(chip);
    });
  }

  if(pillarBars){
    pillarBars.innerHTML = "";
    Object.entries(result.pillarScores || {}).forEach(([p,val])=>{
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
  }

  renderAnalytics(analytics);
  renderStrategicReport(result, state.lastBuiltReport);
  renderCommercialPlan(commercial);

  if(priorities30){
    priorities30.innerHTML = "";
    (result.plans?.priorities || []).forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      priorities30.appendChild(li);
    });
  }

  if(checklist){
    checklist.innerHTML = "";
    (result.plans?.checklist || []).forEach(t=>{
      const li = document.createElement("li");
      li.className = "check";
      li.innerHTML = `<div class="check__box" aria-hidden="true"></div><div class="check__text">${escapeHtml(t)}</div>`;
      checklist.appendChild(li);
    });
  }

  if(timelineMonth){
    timelineMonth.innerHTML = "";
    (result.plans?.month || []).forEach(item=>{
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
  }

  if(timelineYear){
    timelineYear.innerHTML = "";
    (result.plans?.year || []).forEach(item=>{
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
  }

  if(recommendations){
    recommendations.innerHTML = "";
    (result.plans?.recs || []).forEach(r=>{
      const el = document.createElement("div");
      el.className = "rec";
      el.innerHTML = `<div class="rec__title">${escapeHtml(r.title)}</div><div class="rec__body">${escapeHtml(r.body)}</div>`;
      recommendations.appendChild(el);
    });
  }

  state.lastContentPlan = contentPlan;
  renderContentPlan(contentPlan);

  lastPressKit = pressKit;
  renderPressKit(pressKit);
  refreshTeamHandoff();
}



function applyBuildInfo(){
  const completion = `${BUILD_INFO.completionPct}%`;
  const stageText = `${BUILD_INFO.currentMilestone}`;
  const deployText = BUILD_INFO.deployTargets.join(" + ");

  if(buildLabelLanding) buildLabelLanding.textContent = BUILD_INFO.buildLabel;
  if(projectCompletionLanding) projectCompletionLanding.textContent = completion;
  if(projectStageLanding) projectStageLanding.textContent = stageText;
  if(deployTargetsLanding) deployTargetsLanding.textContent = deployText;

  if(buildLabelReport) buildLabelReport.textContent = BUILD_INFO.buildLabel;
  if(projectCompletionReport) projectCompletionReport.textContent = completion;
  if(projectStageReport) projectStageReport.textContent = stageText;
  if(projectBuildFoot) projectBuildFoot.textContent = `${BUILD_INFO.buildLabel} • Projeto ${completion} concluído • ${stageText}`;
}

function renderSimpleList(container, items, emptyText="—"){
  if(!container) return;
  const arr = Array.isArray(items) ? items : [];
  container.innerHTML = "";
  if(!arr.length){
    const li = document.createElement("li");
    li.textContent = emptyText;
    container.appendChild(li);
    return;
  }
  arr.forEach(item=>{
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function scoreTone(score){
  if(score >= 75) return "good";
  if(score >= 55) return "mid";
  return "low";
}

function renderStrategicReport(result, fullReport){
  if(executiveSummary) executiveSummary.textContent = safeText(result?.diagnostics?.summary || "Resumo executivo indisponível.");

  if(profileLabel){
    const tone = scoreTone(Number(result?.overall || 0));
    profileLabel.className = `profileBadge profileBadge--${tone}`;
    profileLabel.textContent = safeText(result?.profile?.label || "—");
  }
  if(profileSummary) profileSummary.textContent = safeText(result?.profile?.description || "—");

  if(readinessGrid){
    readinessGrid.innerHTML = "";
    (result?.readiness || []).forEach(card=>{
      const tone = scoreTone(Number(card.score || 0));
      const el = document.createElement("div");
      el.className = `readinessCard readinessCard--${tone}`;
      el.innerHTML = `
        <div class="readinessCard__top">
          <div class="readinessCard__label">${escapeHtml(safeText(card.label))}</div>
          <div class="readinessCard__score">${Number(card.score || 0)}</div>
        </div>
        <div class="readinessCard__hint">${escapeHtml(safeText(card.hint))}</div>
      `;
      readinessGrid.appendChild(el);
    });
  }

  renderSimpleList(strengthList, result?.diagnostics?.strengths, "Gere um relatório para visualizar as forças.");
  renderSimpleList(riskList, result?.diagnostics?.risks, "Gere um relatório para visualizar os riscos.");
  renderSimpleList(opportunityList, result?.diagnostics?.opportunities, "Gere um relatório para visualizar as oportunidades.");
  renderSimpleList(quickWinList, result?.diagnostics?.quickWins, "Gere um relatório para visualizar os quick wins.");

  if(roadmap90){
    roadmap90.innerHTML = "";
    (result?.plans?.roadmap90 || []).forEach(item=>{
      const el = document.createElement("div");
      el.className = "roadmapCard";
      el.innerHTML = `
        <div class="roadmapCard__label">${escapeHtml(safeText(item.label))}</div>
        <div class="roadmapCard__desc">${escapeHtml(safeText(item.desc))}</div>
      `;
      roadmap90.appendChild(el);
    });
  }

  const buildMeta = fullReport?.build || BUILD_INFO;
  if(projectBuildFoot){
    projectBuildFoot.textContent = `${safeText(buildMeta.buildLabel || BUILD_INFO.buildLabel)} • Projeto ${safeText(String(buildMeta.completionPct || BUILD_INFO.completionPct))}% concluído • ${safeText(buildMeta.currentMilestone || BUILD_INFO.currentMilestone)}`;
  }
}


function renderCommercialPlan(plan){
  if(commercialScore) commercialScore.textContent = String(Number(plan?.readiness || 0));
  if(commercialLane){
    const tone = scoreTone(Number(plan?.readiness || 0));
    commercialLane.className = `profileBadge profileBadge--${tone}`;
    commercialLane.textContent = safeText(plan?.lane || "—");
  }
  if(commercialSummary) commercialSummary.textContent = safeText(plan?.summary || "Plano comercial indisponível.");

  if(revenueForecast){
    revenueForecast.innerHTML = "";
    const cards = [
      ["Conservador", plan?.estimatedMonthly?.conservative],
      ["Meta", plan?.estimatedMonthly?.target],
      ["Escala", plan?.estimatedMonthly?.stretch]
    ];
    cards.forEach(([label, value])=>{
      const el = document.createElement("div");
      el.className = "forecastCard";
      el.innerHTML = `<div class="forecastCard__label">${escapeHtml(label)}</div><div class="forecastCard__value">R$ ${escapeHtml(formatNumber(Number(value || 0)))}</div>`;
      revenueForecast.appendChild(el);
    });
  }

  if(offerStack){
    offerStack.innerHTML = "";
    (plan?.offers || []).forEach(item=>{
      const el = document.createElement("div");
      el.className = "offerCard";
      el.innerHTML = `
        <div class="offerCard__top">
          <div>
            <div class="offerCard__tier">${escapeHtml(safeText(item.tier))}</div>
            <div class="offerCard__name">${escapeHtml(safeText(item.name))}</div>
          </div>
          <div class="offerCard__price">${escapeHtml(safeText(item.price))}</div>
        </div>
        <div class="offerCard__summary">${escapeHtml(safeText(item.summary))}</div>
        <ul class="offerCard__list">${(item.bullets || []).map(b=>`<li>${escapeHtml(safeText(b))}</li>`).join("")}</ul>
      `;
      offerStack.appendChild(el);
    });
  }

  if(launchChecklist){
    launchChecklist.innerHTML = "";
    (plan?.launchChecklist || []).forEach(t=>{
      const li = document.createElement("li");
      li.className = "check";
      li.innerHTML = `<div class="check__box" aria-hidden="true"></div><div class="check__text">${escapeHtml(safeText(t))}</div>`;
      launchChecklist.appendChild(li);
    });
  }

  if(betaFeatures){
    betaFeatures.innerHTML = "";
    (plan?.betaFeatures || []).forEach(f=>{
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `<strong>Beta</strong> • ${escapeHtml(safeText(f))}`;
      betaFeatures.appendChild(chip);
    });
  }

  if(dlcRoadmap){
    dlcRoadmap.innerHTML = "";
    (plan?.dlc || []).forEach(item=>{
      const el = document.createElement("div");
      el.className = "offerCard offerCard--mini";
      el.innerHTML = `<div class="offerCard__name">${escapeHtml(safeText(item.name))}</div><div class="offerCard__summary">${escapeHtml(safeText(item.value))}</div>`;
      dlcRoadmap.appendChild(el);
    });
  }
}

function registerServiceWorker(){
  if(location.protocol === "file:") return;
  if(!("serviceWorker" in navigator)) return;
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  });
}

function renderAnalytics(a){
  if(analyticsCards){
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
  }

  if(analyticsInsights){
    analyticsInsights.innerHTML = "";
    a.insights.forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      analyticsInsights.appendChild(li);
    });
  }

  if(analyticsGoals){
    analyticsGoals.innerHTML = "";
    a.goals.forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      analyticsGoals.appendChild(li);
    });
  }
}

/* ----------------------------------------------------------
  CONTEÚDO (ETAPA D)
---------------------------------------------------------- */
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

  if(cpMetaGoal) cpMetaGoal.textContent = `Objetivo: ${safeText(plan.meta.goal || "—")}`;
  if(cpMetaTraffic) cpMetaTraffic.textContent = `Tráfego: ${safeText(plan.meta.traffic || "—")}`;
  if(cpMetaStage) cpMetaStage.textContent = `Status: ${safeText(plan.meta.stage || "—")}`;
  if(cpMetaTrack) cpMetaTrack.textContent = `Motor: ${safeText(plan.meta.track || "—")}`;

  if(!contentPlanGrid) return;
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

/* ----------------------------------------------------------
  PRESS KIT (ETAPA E)
---------------------------------------------------------- */
function clearPressKit(){
  if(pkName) pkName.textContent = "—";
  if(pkGenre) pkGenre.textContent = "—";
  if(pkStage) pkStage.textContent = "—";
  if(pkBioShort) pkBioShort.textContent = "";
  if(pkBioLong) pkBioLong.textContent = "";
  if(pkData) pkData.innerHTML = "";
  if(pkMetrics) pkMetrics.innerHTML = "";
  if(pkShow) pkShow.textContent = "";
  if(pkCollab) pkCollab.textContent = "";
  lastPressKit = null;
}

function renderPressKit(pk){
  if(!pk){ clearPressKit(); return; }

  if(pkName) pkName.textContent = pk.meta.name;
  if(pkGenre) pkGenre.textContent = pk.meta.genre;
  if(pkStage) pkStage.textContent = pk.meta.stage;

  if(pkBioShort) pkBioShort.textContent = pk.bioShort;
  if(pkBioLong) pkBioLong.textContent = pk.bioLong;

  if(pkData){
    pkData.innerHTML = "";
    pk.dataList.forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      pkData.appendChild(li);
    });
  }

  if(pkMetrics){
    pkMetrics.innerHTML = "";
    pk.metrics.forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      pkMetrics.appendChild(li);
    });
  }

  if(pkShow) pkShow.textContent = pk.showProposal;
  if(pkCollab) pkCollab.textContent = pk.collabProposal;
}

async function copyPressKit(){
  if(!lastPressKit?.copyText){
    toast("Gere um relatório para copiar o press kit.");
    return;
  }
  try{
    await navigator.clipboard.writeText(lastPressKit.copyText);
    toast("Press kit copiado.");
  }catch{
    try{
      const ta = document.createElement("textarea");
      ta.value = lastPressKit.copyText;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("Press kit copiado.");
    }catch{
      toast("Não foi possível copiar. Seu navegador bloqueou a área de transferência.");
    }
  }
}

/* ----------------------------------------------------------
  HISTÓRICO
---------------------------------------------------------- */
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
  toast("Relatório aberto do histórico.");
}


function buildReportFromStored(fullReport){
  state.answers = fullReport.answers || {};
  saveAnswers(state.answers);
  applyReportView(fullReport || {});
  renderHistory();
  adminRefresh();
}

/* ----------------------------------------------------------
  COMPARE
---------------------------------------------------------- */
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
    compareA.value = reports[1].id;
    compareB.value = reports[0].id;
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

  if(cmpScore) cmpScore.textContent = `${String(data.cards.score.a)} → ${String(data.cards.score.b)}`;
  if(cmpMl) cmpMl.textContent = `${formatNumber(data.cards.ml.a)} → ${formatNumber(data.cards.ml.b)}`;
  if(cmpSf) cmpSf.textContent = `${formatNumber(data.cards.sf.a)} → ${formatNumber(data.cards.sf.b)}`;

  if(cmpScoreDelta){
    cmpScoreDelta.textContent = data.cards.score.delta.text;
    cmpScoreDelta.className = data.cards.score.delta.cls;
  }

  if(cmpMlDelta){
    cmpMlDelta.textContent = data.cards.ml.delta.text;
    cmpMlDelta.className = data.cards.ml.delta.cls;
  }

  if(cmpSfDelta){
    cmpSfDelta.textContent = data.cards.sf.delta.text;
    cmpSfDelta.className = data.cards.sf.delta.cls;
  }

  if(sparkScore) sparkScore.innerHTML = data.sparks.score;
  if(sparkMl) sparkMl.innerHTML = data.sparks.ml;
  if(sparkSf) sparkSf.innerHTML = data.sparks.sf;

  if(compareInsights){
    compareInsights.innerHTML = "";
    data.insights.forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      compareInsights.appendChild(li);
    });
  }

  if(compareActions){
    compareActions.innerHTML = "";
    data.actions.forEach(t=>{
      const li = document.createElement("li");
      li.textContent = t;
      compareActions.appendChild(li);
    });
  }

  toast("Comparação atualizada.");
}

/* ----------------------------------------------------------
  RESET
---------------------------------------------------------- */
function resetAll(){
  if(!confirm("Limpar todas as respostas deste dispositivo?")) return;
  state.answers = {};
  saveAnswers(state.answers);
  state.idx = 0;
  renderQuestion();
  toast("Respostas removidas.");
}

/* ----------------------------------------------------------
  CAMPANHAS
---------------------------------------------------------- */
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

/* ----------------------------------------------------------
  ADMIN (ETAPA F)
---------------------------------------------------------- */
function adminInit(){
  adminRefresh();
}

function adminRefresh(){
  const reports = loadReports();
  adminState.normalized = normalizeReports(reports);
  adminApplyFilterSort();
}

function adminApplyFilterSort(){
  const query = adminSearch?.value || "";
  const sortKey = adminSort?.value || "new";
  adminState.filtered = filterAndSort(adminState.normalized, query, sortKey);
  renderAdminList();
  renderAdminDetail();
}

function renderAdminList(){
  if(!adminList) return;

  if(!adminState.filtered.length){
    adminList.innerHTML = `<div class="historyEmpty">Nenhum relatório encontrado.</div>`;
    return;
  }

  adminList.innerHTML = "";
  adminState.filtered.forEach(item=>{
    const el = document.createElement("button");
    el.type = "button";
    el.className = "adminItem";
    el.innerHTML = `
      <div class="adminItemTop">
        <div>
          <div class="adminItemName">${escapeHtml(item.name)}</div>
          <div class="adminItemMeta">${escapeHtml(item.created)} • ${escapeHtml(item.stage)}</div>
        </div>
        <div class="adminItemRight">
          <div class="adminScore">${String(item.score)}</div>
          <div class="adminTag">Score</div>
        </div>
      </div>
    `;
    el.addEventListener("click", ()=>{
      adminState.selectedId = item.id;
      renderAdminDetail();
    });
    adminList.appendChild(el);
  });
}

function renderAdminDetail(){
  if(!adminDetail) return;

  const id = adminState.selectedId;
  const item = adminState.normalized.find(x=>x.id===id);

  if(!item){
    adminDetail.innerHTML = `<div class="historyEmpty">Selecione um relatório na lista.</div>`;
    return;
  }

  const summary = buildAdminSummary(item);
  const msg = buildWhatsAppMessage(item);

  adminDetail.innerHTML = `
    <div class="adminCard">
      <div class="adminCardTitle">Resumo</div>
      <div class="adminCardBody">${escapeHtml(summary)}</div>
    </div>

    <div class="adminCard">
      <div class="adminCardTitle">Mensagem pronta (WhatsApp)</div>
      <div class="adminCardBody">${escapeHtml(msg)}</div>
    </div>

    <div class="adminBtns">
      <button id="btnAdminOpenReport" class="btn btn--primary">Abrir relatório</button>
      <button id="btnAdminCopyMsg" class="btn btn--ghost">Copiar mensagem</button>
      <button id="btnAdminExportOne" class="btn btn--ghost">Exportar JSON</button>
    </div>
  `;

  document.getElementById("btnAdminOpenReport")?.addEventListener("click", ()=>{
    openReportFromHistory(item.id);
    showScreen("report");
  });

  document.getElementById("btnAdminExportOne")?.addEventListener("click", ()=>{
    downloadJSON(`vale-admin-${slug(item.name)}-${item.id}.json`, item.raw);
    toast("JSON exportado.");
  });

  document.getElementById("btnAdminCopyMsg")?.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(msg);
      toast("Mensagem copiada.");
    }catch{
      toast("Não foi possível copiar. Navegador bloqueou a área de transferência.");
    }
  });
}

function adminExportAll(){
  const payload = {
    exportedAt: new Date().toISOString(),
    reports: loadReports(),
    campaigns: loadCampaigns(),
    admin: { pin: "hidden" }
  };
  downloadJSON(`vale-admin-export-${new Date().toISOString().slice(0,10)}.json`, payload);
  toast("Exportação completa gerada.");
}

function adminClearAll(){
  if(!confirm("Isso vai apagar relatórios e campanhas deste dispositivo. Continuar?")) return;
  clearReports();
  const all = loadCampaigns();
  all.forEach(c => deleteCampaign(c.id));
  renderHistory();
  renderCompareSelects();
  if(reportLocaleSelect) reportLocaleSelect.value = state.reportLocale || "pt-BR";
  renderCampaigns();
  adminRefresh();
  toast("Tudo removido deste dispositivo.");
}

/* ----------------------------------------------------------
  PIN MODAL
---------------------------------------------------------- */
function openPinModal(){
  if(!pinModal) return;
  pinModal.classList.add("pinModal--on");
  pinModal.setAttribute("aria-hidden","false");
  if(pinInput){
    pinInput.value = "";
    setTimeout(()=> pinInput.focus(), 50);
  }
}

function closePinModal(){
  if(!pinModal) return;
  pinModal.classList.remove("pinModal--on");
  pinModal.setAttribute("aria-hidden","true");
}

function tryEnterAdmin(){
  const pin = safeText(pinInput?.value || "");
  if(!pin){ toast("Digite o PIN."); return; }
  if(!verifyPin(pin)){ toast("PIN incorreto."); return; }
  closePinModal();
  adminRefresh();
  showScreen("admin");
  toast("Admin aberto.");
}

function openPinChangeModal(){
  if(!pinChangeModal) return;
  pinChangeModal.classList.add("pinModal--on");
  pinChangeModal.setAttribute("aria-hidden","false");
  if(pinNewInput){
    pinNewInput.value = "";
    setTimeout(()=> pinNewInput.focus(), 50);
  }
}

function closePinChangeModal(){
  if(!pinChangeModal) return;
  pinChangeModal.classList.remove("pinModal--on");
  pinChangeModal.setAttribute("aria-hidden","true");
}

function saveNewPin(){
  const pin = safeText(pinNewInput?.value || "");
  const res = setAdminPin(pin);
  if(!res.ok){
    toast(res.error || "PIN inválido.");
    return;
  }
  closePinChangeModal();
  toast("PIN atualizado.");
}

function refreshTeamHandoff(){
  if(!teamHandoffCard) return;
  const data = buildTeamHandoffData();
  if(!data){
    teamHandoffCard.textContent = "Gere um relatório para montar o handoff da equipe.";
    return;
  }
  teamHandoffCard.innerHTML = `
    <div class="teamHandoffCard__top">
      <div>
        <div class="teamHandoffCard__title">${escapeHtml(data.title)}</div>
        <div class="teamHandoffCard__meta">${escapeHtml(data.meta)}</div>
      </div>
      <div class="teamHandoffBadge">${escapeHtml(data.localeLabel)}</div>
    </div>
    <div class="teamHandoffCard__body">
      <p>${escapeHtml(data.summary)}</p>
      <div class="teamHandoffGrid">
        <div><strong>${escapeHtml(data.labels.strengths)}</strong><ul>${data.strengths.map(v=>`<li>${escapeHtml(v)}</li>`).join("")}</ul></div>
        <div><strong>${escapeHtml(data.labels.risks)}</strong><ul>${data.risks.map(v=>`<li>${escapeHtml(v)}</li>`).join("")}</ul></div>
        <div><strong>${escapeHtml(data.labels.quickWins)}</strong><ul>${data.quickWins.map(v=>`<li>${escapeHtml(v)}</li>`).join("")}</ul></div>
        <div><strong>${escapeHtml(data.labels.nextSprint)}</strong><ul>${data.nextSprint.map(v=>`<li>${escapeHtml(v)}</li>`).join("")}</ul></div>
      </div>
    </div>
  `;
}

function buildTeamHandoffData(){
  const report = state.lastBuiltReport;
  if(!report?.result) return null;
  const locale = state.reportLocale || "pt-BR";
  const dict = handoffDictionary(locale);
  const result = report.result || {};
  const commercial = report.commercial || {};
  const title = `${dict.project}: ${safeText(report.artistName || "Artista")}`;
  const meta = `${dict.build} ${safeText((report.build || BUILD_INFO).buildLabel)} • ${dict.progress} ${safeText(String((report.build || BUILD_INFO).completionPct || BUILD_INFO.completionPct))}% • ${dict.stage} ${safeText(result.stage?.label || "—")}`;
  return {
    title,
    meta,
    localeLabel: dict.localeLabel,
    labels: dict.labels,
    summary: safeText(result.diagnostics?.summary || dict.empty),
    strengths: normalizeTeamList(result.diagnostics?.strengths, dict.emptyItem),
    risks: normalizeTeamList(result.diagnostics?.risks, dict.emptyItem),
    quickWins: normalizeTeamList(result.diagnostics?.quickWins, dict.emptyItem),
    nextSprint: normalizeTeamList(result.plans?.priorities, dict.emptyItem).slice(0,4),
    markdown: buildTeamHandoffMarkdown(report, dict)
  };
}

function buildTeamHandoffMarkdown(report, dict){
  const result = report.result || {};
  const commercial = report.commercial || {};
  const lines = [];
  lines.push(`# ${dict.project}: ${safeText(report.artistName || "Artista")}`);
  lines.push("");
  lines.push(`- ${dict.build}: ${safeText((report.build || BUILD_INFO).buildLabel)}`);
  lines.push(`- ${dict.progress}: ${safeText(String((report.build || BUILD_INFO).completionPct || BUILD_INFO.completionPct))}%`);
  lines.push(`- ${dict.stage}: ${safeText(result.stage?.label || "—")}`);
  lines.push(`- ${dict.score}: ${safeText(String(result.overall || 0))}/100`);
  lines.push(`- ${dict.marketLane}: ${safeText(commercial.lane || "—")}`);
  lines.push("");
  lines.push(`## ${dict.labels.summary}`);
  lines.push(safeText(result.diagnostics?.summary || dict.empty));
  lines.push("");
  lines.push(`## ${dict.labels.strengths}`);
  normalizeTeamList(result.diagnostics?.strengths, dict.emptyItem).forEach(v=> lines.push(`- ${v}`));
  lines.push("");
  lines.push(`## ${dict.labels.risks}`);
  normalizeTeamList(result.diagnostics?.risks, dict.emptyItem).forEach(v=> lines.push(`- ${v}`));
  lines.push("");
  lines.push(`## ${dict.labels.quickWins}`);
  normalizeTeamList(result.diagnostics?.quickWins, dict.emptyItem).forEach(v=> lines.push(`- ${v}`));
  lines.push("");
  lines.push(`## ${dict.labels.nextSprint}`);
  normalizeTeamList(result.plans?.priorities, dict.emptyItem).slice(0,4).forEach(v=> lines.push(`- ${v}`));
  return lines.join("\n");
}

function normalizeTeamList(items, emptyItem){
  return Array.isArray(items) && items.length ? items.map(v=> safeText(v)).filter(Boolean) : [emptyItem];
}

function handoffDictionary(locale){
  const map = {
    "pt-BR": {
      localeLabel: "PT-BR", project: "Handoff de equipe", build: "Build", progress: "Projeto", stage: "Status", score: "Score", marketLane: "Faixa comercial", empty: "Resumo indisponível.", emptyItem: "Sem dados suficientes.",
      labels: { summary: "Resumo executivo", strengths: "Forças", risks: "Riscos", quickWins: "Quick wins", nextSprint: "Próxima sprint" }
    },
    "en-US": {
      localeLabel: "EN-US", project: "Team handoff", build: "Build", progress: "Project", stage: "Stage", score: "Score", marketLane: "Commercial lane", empty: "Executive summary unavailable.", emptyItem: "Not enough data.",
      labels: { summary: "Executive summary", strengths: "Strengths", risks: "Risks", quickWins: "Quick wins", nextSprint: "Next sprint" }
    },
    "es-ES": {
      localeLabel: "ES-ES", project: "Handoff del equipo", build: "Build", progress: "Proyecto", stage: "Etapa", score: "Puntuación", marketLane: "Nivel comercial", empty: "Resumen ejecutivo no disponible.", emptyItem: "Sin datos suficientes.",
      labels: { summary: "Resumen ejecutivo", strengths: "Fortalezas", risks: "Riesgos", quickWins: "Quick wins", nextSprint: "Próximo sprint" }
    }
  };
  return map[locale] || map["pt-BR"];
}

async function copyTeamSummary(){
  const data = buildTeamHandoffData();
  if(!data){ toast("Gere um relatório antes."); return; }
  try{
    await navigator.clipboard.writeText(data.markdown);
    toast("Resumo da equipe copiado.");
  }catch{
    toast("Não foi possível copiar o resumo.");
  }
}

function downloadTeamSummary(){
  const data = buildTeamHandoffData();
  if(!data){ toast("Gere um relatório antes."); return; }
  const blob = new Blob([data.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vale-handoff-${slug(state.lastBuiltReport?.artistName || "artista")}-${state.reportLocale || "pt-BR"}-${BUILD_INFO.buildSlug}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Handoff baixado.");
}

function loadReportLocale(){
  const v = localStorage.getItem("vale_cm_report_locale");
  return ["pt-BR","en-US","es-ES"].includes(v) ? v : "pt-BR";
}

function saveReportLocale(locale){
  localStorage.setItem("vale_cm_report_locale", locale);
}

/* ----------------------------------------------------------
  STORAGE: ANSWERS
---------------------------------------------------------- */
function loadAnswers(){
  try{
    const raw = localStorage.getItem("vale_cm_answers");
    return raw ? JSON.parse(raw) : {};
  }catch{
    return {};
  }
}

function saveAnswers(obj){
  try{
    localStorage.setItem("vale_cm_answers", JSON.stringify(obj));
  }catch{}
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

/* ----------------------------------------------------------
  THEME
---------------------------------------------------------- */
function loadTheme(){
  const t = localStorage.getItem("vale_cm_theme");
  return (t === "light" || t === "dark") ? t : "dark";
}

function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("vale_cm_theme", t);
  const icon = btnTheme?.querySelector(".icon");
  if(icon) icon.textContent = (t === "dark") ? "☾" : "☀";
}

function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
  toast("Tema atualizado.");
}

/* ----------------------------------------------------------
  HELPERS
---------------------------------------------------------- */
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