export function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

export function safeText(s){
  if(typeof s !== "string") return "";
  return s.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function toast(message){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = message;
  el.classList.add("toast--show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> el.classList.remove("toast--show"), 2400);
}
