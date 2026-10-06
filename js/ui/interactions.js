/**
 * Microinteracciones visuales y centro de acciones.
 * No contiene lógica bancaria; únicamente mejora la experiencia de uso.
 */
import { actual } from '../state.js';
import { renderSection } from './views.js';

/* =========================================================
   13. MICROINTERACCIONES Y CENTRO DE ACCIONES
   ========================================================= */
/* =========================================================
   ULTIMATE INTERACTION LAYER — microinteractions + command center
   ========================================================= */
(function ultimateInteractionLayer(){
  let palette;
  const openPalette=()=>{
    if(palette||!actual)return;
    palette=document.createElement('div');
    palette.className='command-palette-overlay';
    palette.innerHTML=`<div class="command-palette" role="dialog" aria-modal="true" aria-label="Acciones rápidas">
      <div class="command-head"><div><span>MI PLATA</span><b>Centro de acciones</b></div><button class="command-close" aria-label="Cerrar">×</button></div>
      <input id="command-search" autocomplete="off" placeholder="Buscar sección, operación o tarjeta...">
      <div class="command-items">
        <button data-command-section="dashboard"><span>⌂</span><div><b>Resumen</b><small>Vista general de tus finanzas</small></div><kbd>1</kbd></button>
        <button data-command-section="movements"><span>⇄</span><div><b>Movimientos</b><small>Consulta tus operaciones</small></div><kbd>2</kbd></button>
        <button data-command-section="transfer"><span>↗</span><div><b>Transferir</b><small>Envía dinero a una cuenta</small></div><kbd>3</kbd></button>
        <button data-command-section="credit"><span>▤</span><div><b>Mis tarjetas</b><small>Gestiona Gold, Silver, Black y Green</small></div><kbd>4</kbd></button>
        <button data-command-section="profile"><span>◉</span><div><b>Mi perfil</b><small>Datos y seguridad</small></div><kbd>5</kbd></button>
        ${actual.esAdmin?'<button data-command-section="admin"><span>♛</span><div><b>Administrador</b><small>Centro de control del sistema</small></div><kbd>6</kbd></button>':''}
      </div><small class="command-foot">Consejo: usa Ctrl + K para abrir este centro desde cualquier pantalla.</small>
    </div>`;
    document.body.appendChild(palette);
    const close=()=>{palette?.remove();palette=null};
    palette.querySelector('.command-close').onclick=close;
    palette.onclick=e=>{if(e.target===palette)close()};
    palette.querySelectorAll('[data-command-section]').forEach(b=>b.onclick=()=>{renderSection(b.dataset.commandSection);close()});
    const input=palette.querySelector('#command-search');
    input.oninput=()=>{const q=input.value.toLowerCase().trim();palette.querySelectorAll('.command-items button').forEach(b=>b.hidden=!b.innerText.toLowerCase().includes(q))};
    input.focus();
  };
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette?palette.remove()|| (palette=null):openPalette();return}
    if(palette&&e.key==='Escape'){palette.remove();palette=null;return}
    if(palette&&['1','2','3','4','5','6'].includes(e.key)&&document.activeElement?.id!=='command-search'){
      const b=palette.querySelector(`.command-items button:nth-child(${e.key})`);b?.click();
    }
  });

  const enhanceCards=()=>{
    document.querySelectorAll('.bank-card:not([data-enhanced])').forEach(card=>{
      card.dataset.enhanced='1';
      card.addEventListener('pointermove',e=>{
        if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*7).toFixed(2)}deg) translateY(-5px) scale(1.012)`;
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}});
    });
  };
  const observer=new MutationObserver(enhanceCards);
  observer.observe(document.getElementById('app-content'),{childList:true,subtree:true});
  enhanceCards();

  /* A tiny live clock is added to the header without changing the banking logic. */
  setInterval(()=>{
    const h=document.querySelector('.date-line');
    if(h&&actual){
      const now=new Date();
      const date=new Intl.DateTimeFormat('es-CO',{weekday:'long',day:'numeric',month:'long'}).format(now).toUpperCase();
      h.textContent=`${date} · ${now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}`;
    }
  },1000);
})();
