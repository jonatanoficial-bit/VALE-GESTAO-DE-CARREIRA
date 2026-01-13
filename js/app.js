// js/app.js
import { QUESTIONS } from "./data/questions.js";
import { scoreAnswers, pillarMeta } from "./core/report.js";
import { toast, safeText, formatNumber } from "./utils.js";
import { buildAnalytics } from "./core/analytics.js";

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

const qSection = document.getElementById("qSection");
const qCount = document.getElementById("qCount");
const qText = document.getElementById("qText");
const qHelp = document.getElementById("qHelp");
const answerArea = document.getElementById("answerArea");

const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const reportSubtitle = document.getElementById("reportSubtitle");
const stageLabel = document.getElementById("stageLabel");
const stageHint = document.getElementById("stageHint");
const overallScore = document.getElementById("overallScore");
const nextGoal = document.getElementById("nextGoal");
const pillarChips = document.getElementById("pillarChips");
const pillarBars = document.getElementById("pillarBars");
const priorities30 = document.getElementById("priorities30");
const checklist = document.getElementById("checklist");
const timelineMonth = document.getElementById("timelineMonth");
const timelineYear = document.getElementById("timelineYear");
const recommendations = document.getElementById("recommendations");

// Analytics UI (NEW)
const analyticsCards = document.getElementById("analyticsCards");
const analyticsInsights = document.getElementById("analyticsInsights");
const analyticsGoals = document.getElementById("analyticsGoals");

let state = {
  idx: 0,
  answers: loadAnswers(),
  lastScreen: "landing"
};

init();

function init(){
  bind();
  applyTheme(loadTheme());
  showScreen("landing", false);
  btnBack.style.visibility = "hidden";
}

function bind(){
  btnStart.addEventListener("click", ()=> startWizard(false));
  btnDemoFill.addEventListener("click", ()=> startWizard(true));
  btnPrev.addEventListener("click", prevQ);
  btnNext.addEventListener("click", nextQ);
  btnBack.addEventListener("click", handleBack);
  btnReset.addEventListener("click", resetAll);
  btnEdit.addEventListener("click", ()=> showScreen("wizard"));
  btnPrint.addEventListener("click", ()=> window.print());
  btnTheme.addEventListener("click", toggleTheme);

  window.addEventListener("keydown", (e)=>{
    if(state.lastScreen !== "wizard") return;
    if(e.key === "Enter" && !e.shiftKey){
      const active = document.activeElement;
      if(active && (active.tagName === "TEXTAREA")) return;
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

  if(pushHistory){
    history.pushState({screen:name}, "");
  }
}

window.addEventListener("popstate", (e)=>{
  const scr = (e.state && e.state.screen) ? e.state.screen : "landing";
  Object.values(screens).forEach(s=> s.classList.remove("screen--active"));
  screens[scr].classList.add("screen--active");
  state.lastScreen = scr;
  btnBack.style.visibility = (scr === "landing") ? "hidden" : "visible";
});

function handleBack(){
  if(state.lastScreen === "wizard"){
    showScreen("landing");
  }else if(state.lastScreen === "report"){
    showScreen("wizard");
  }else{
    showScreen("landing");
  }
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
    if(a == null || a === "" || (Array.isArray(a) && a.length===0)){
      return i;
    }
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
  if(!ok){
    toast("Escolha uma opção ou preencha o campo para continuar.");
    return;
  }

  saveAnswers(state.answers);

  if(state.idx >= QUESTIONS.length - 1){
    buildReport();
    showScreen("report");
    return;
  }
  state.idx += 1;
  renderQuestion();
}

function validateCurrent(q){
  const a = state.answers[q.id];
  if(q.type === "text" || q.type === "textarea"){
    return (typeof a === "string" && safeText(a).length > 0);
  }
  if(q.type === "single"){
    return typeof a === "string" && a.length > 0;
  }
  if(q.type === "multi"){
    return Array.isArray(a) && a.length > 0;
  }
  if(q.type === "number"){
    return (typeof a === "number" && Number.isFinite(a) && a >= (q.min ?? 0));
  }
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
  if(q.type === "single"){
    renderSingle(q);
  }else if(q.type === "multi"){
    renderMulti(q);
  }else if(q.type === "textarea"){
    renderTextarea(q);
  }else if(q.type === "number"){
    renderNumber(q);
  }else{
    renderText(q);
  }

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
        <div class="choice__title">${opt.label}</div>
        ${opt.desc ? `<div class="choice__desc">${opt.desc}</div>` : ""}
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
        <div class="choice__title">${opt.label}</div>
      </div>
    `;
    el.addEventListener("click", ()=>{
      let next = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
      if(next.includes(opt.value)){
        next = next.filter(v=>v!==opt.value);
      }else{
        if(opt.value === "nenhuma") next = ["nenhuma"];
        else next = next.filter(v=>v!=="nenhuma").concat(opt.value);
      }
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
  reportSubtitle.textContent = `Relatório gerado para ${name} • ${new Date().toLocaleString("pt-BR")}`;

  stageLabel.textContent = result.stage.label;
  stageHint.textContent = result.stage.hint;
  overallScore.textContent = String(result.overall);
  nextGoal.textContent = result.insights.nextGoal;

  pillarChips.innerHTML = "";
  Object.entries(result.pillarScores).forEach(([p,val])=>{
    const meta = pillarMeta(p);
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<strong>${meta.label}</strong> • ${val}/100`;
    pillarChips.appendChild(chip);
  });

  pillarBars.innerHTML = "";
  Object.entries(result.pillarScores).forEach(([p,val])=>{
    const meta = pillarMeta(p);
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `
      <div class="bar__label">${meta.label}</div>
      <div class="bar__track"><div class="bar__fill" style="width:${val}%"></div></div>
      <div class="bar__val">${val}</div>
    `;
    pillarBars.appendChild(bar);
  });

  // Analytics (NEW)
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
    li.innerHTML = `<div class="check__box" aria-hidden="true"></div><div class="check__text">${t}</div>`;
    checklist.appendChild(li);
  });

  timelineMonth.innerHTML = "";
  result.plans.month.forEach(item=>{
    const el = document.createElement("div");
    el.className = "titem";
    el.innerHTML = `
      <div class="titem__top">
        <div class="titem__label">${item.label}</div>
        <div class="titem__when">${item.when}</div>
      </div>
      <div class="titem__desc">${item.desc}</div>
    `;
    timelineMonth.appendChild(el);
  });

  timelineYear.innerHTML = "";
  result.plans.year.forEach(item=>{
    const el = document.createElement("div");
    el.className = "titem";
    el.innerHTML = `
      <div class="titem__top">
        <div class="titem__label">${item.label}</div>
        <div class="titem__when">${item.when}</div>
      </div>
      <div class="titem__desc">${item.desc}</div>
    `;
    timelineYear.appendChild(el);
  });

  recommendations.innerHTML = "";
  result.plans.recs.forEach(r=>{
    const el = document.createElement("div");
    el.className = "rec";
    el.innerHTML = `<div class="rec__title">${r.title}</div><div class="rec__body">${r.body}</div>`;
    recommendations.appendChild(el);
  });

  toast("Relatório gerado. Você pode imprimir em PDF.");
}

function renderAnalytics(a){
  // Cards
  analyticsCards.innerHTML = "";
  a.cards.forEach(c=>{
    const el = document.createElement("div");
    el.className = "acard";
    el.innerHTML = `
      <div class="acard__top">
        <div class="acard__name">${c.name}</div>
        <div class="acard__tag ${c.tagType}">${c.tag}</div>
      </div>
      <div class="acard__val">${c.value}</div>
      <div class="acard__sub">${c.sub}</div>
      <div class="acard__meter"><div class="acard__fill" style="width:${c.pct}%"></div></div>
    `;
    analyticsCards.appendChild(el);
  });

  // Insights
  analyticsInsights.innerHTML = "";
  a.insights.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    analyticsInsights.appendChild(li);
  });

  // Goals
  analyticsGoals.innerHTML = "";
  a.goals.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    analyticsGoals.appendChild(li);
  });
}

function resetAll(){
  if(!confirm("Limpar todas as respostas deste dispositivo?")) return;
  state.answers = {};
  saveAnswers(state.answers);
  state.idx = 0;
  renderQuestion();
  toast("Respostas removidas.");
}

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
    goal: "crescer_fas",
    career_time: "2-5y",
    released_music: "3-10",
    distributor: "ONErpm",
    metadata_ready: "parcial",
    spotify_profile: "basico",
    youtube_channel: "ativo",
    tiktok_use: "asvezes",
    content_frequency: "3w",
    ads_budget: "low",
    team: "parcial",
    planning: "basico",
    shows: "ocasional",
    revenue_sources: ["shows","streaming"],

    monthly_listeners_num: 5200,
    spotify_followers_num: 430,
    instagram_followers_num: 6800,
    tiktok_followers_num: 900,
    youtube_subs_num: 320,

    notes: "Quero um plano para crescer no Brasil e abrir portas fora, mantendo identidade visual premium."
  };
}

// THEME
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

function handleBack(){
  if(state.lastScreen === "wizard"){
    showScreen("landing");
  }else if(state.lastScreen === "report"){
    showScreen("wizard");
  }else{
    showScreen("landing");
  }
}
