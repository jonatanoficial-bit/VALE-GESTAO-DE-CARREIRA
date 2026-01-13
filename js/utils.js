// js/utils.js
export function safeText(v){
  if(v == null) return "";
  return String(v).trim();
}

export function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

export function formatNumber(num){
  try{
    return Number(num).toLocaleString("pt-BR");
  }catch{
    return String(num);
  }
}

export function toast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("toast--on");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{
    el.classList.remove("toast--on");
  }, 2400);
}
