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

export function uid(){
  return "r_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

export function downloadJSON(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
