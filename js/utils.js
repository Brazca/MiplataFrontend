/**
 * Utilidades compartidas por el proyecto.
 */
/*
 * Mi Plata — Cajero Web
 * Proyecto académico de Programación Orientada a Objetos con JavaScript.
 *
 * IMPORTANTE:
 * Este archivo conserva la lógica original del proyecto. Esta versión
 * únicamente reorganiza el código, mejora su formato y añade comentarios
 * para facilitar su lectura y sustentación.
 */
/* =========================================================
   1. CONFIGURACIÓN Y FUNCIONES AUXILIARES
   ========================================================= */
const STORE_KEY='mi-plata-god-v2';
const money=n=>new Intl.NumberFormat('es-CO', {
  style:'currency',currency:'COP',maximumFractionDigits:0
}
).format(Number(n)||0);
const uid=()=>Math.random().toString(36).slice(2,9).toUpperCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>( {
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}
[c]));
const dateText=d=>new Intl.DateTimeFormat('es-CO', {
  day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'
}
).format(new Date(d));
/* =========================================================
   2. MODELO: MOVIMIENTO
   ========================================================= */

export { STORE_KEY, money, uid, esc, dateText };
