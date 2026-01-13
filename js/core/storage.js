// js/core/storage.js
// Vale Produção — Histórico local (localStorage)
// Armazena relatórios completos para abrir/comparar.

const KEY = "vale_cm_reports_v1";

export function loadReports(){
  try{
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

export function saveReports(arr){
  try{
    localStorage.setItem(KEY, JSON.stringify(arr));
  }catch{}
}

export function addReport(report){
  const arr = loadReports();
  arr.unshift(report); // mais recente primeiro

  // limite para não estourar storage
  const trimmed = arr.slice(0, 30);
  saveReports(trimmed);
  return trimmed;
}

export function clearReports(){
  try{
    localStorage.removeItem(KEY);
  }catch{}
}

export function findReportById(id){
  const arr = loadReports();
  return arr.find(r => r && r.id === id) || null;
}
