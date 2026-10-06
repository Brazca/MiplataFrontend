/**
 * Vistas y funciones de interacción de la interfaz.
 * Aquí se construye el HTML dinámico del cajero.
 */
import { money, esc, dateText } from '../utils.js';
import { banco, actual, selectedId, authMode, $, $$, landing, auth, app, authContent, appContent, setActual, setSelectedId, setAuthMode, setToastTimer, toastTimer } from '../state.js';

function notify(msg,type='') {
  const t=$('#toast');
  t.textContent=msg;
  t.className='toast show '+type;
  clearTimeout(toastTimer);
  setToastTimer(setTimeout(()=>t.className='toast',3400))
}
function showLanding() {
  landing.classList.remove('hidden');
  auth.classList.add('hidden');
  app.classList.add('hidden');
  window.scrollTo(0,0)
}
function showAuth(mode) {
  setAuthMode(mode);
  landing.classList.add('hidden');
  app.classList.add('hidden');
  auth.classList.remove('hidden');
  renderAuth()
}
function renderAuth() {
  const reg=authMode==='register';
  authContent.innerHTML=reg?`<div class="auth-form-wrap"><div class="eyebrow"><i></i> EMPIEZA CON MI PLATA</div><h1>Crea tu cuenta</h1><p>Abre las puertas a una banca hecha para acompañarte.</p><form id="register-form"><div class="form-row"><label class="field"><span>Identificación</span><input name="cedula" required placeholder="Número de documento"></label><label class="field"><span>Celular</span><input name="celular" required inputmode="tel" placeholder="300 000 0000"></label></div><label class="field"><span>Nombre completo</span><input name="nombre" required placeholder="Como aparece en tu documento"></label><label class="field"><span>Nombre de usuario</span><input name="usuario" required minlength="3" placeholder="Elige un usuario"></label><div class="form-row"><label class="field"><span>Contraseña</span><input name="password" type="password" required minlength="4" placeholder="Mínimo 4 caracteres"></label><label class="field"><span>Confirmar contraseña</span><input name="confirm" type="password" required placeholder="Repite tu contraseña"></label></div><button class="btn btn-dark auth-submit">Crear mi cuenta <span>↗</span></button></form><div class="form-note">¿Ya tienes usuario? <button class="text-action" data-view="login">Inicia sesión</button></div></div>`:`<div class="auth-form-wrap"><div class="eyebrow"><i></i> QUÉ BUENO VERTE</div><h1>Inicia sesión</h1><p>Ingresa tus datos para continuar con tu banca.</p><form id="login-form"><label class="field"><span>Nombre de usuario</span><input name="usuario" required autocomplete="username" placeholder="Tu usuario"></label><label class="field"><span>Contraseña</span><input name="password" type="password" required autocomplete="current-password" placeholder="Tu contraseña"></label><div id="attempts" class="form-note" style="text-align:left;margin:0 0 12px">Intentos disponibles: 3 de 3</div><button class="btn btn-dark auth-submit">Entrar a mi cuenta <span>↗</span></button></form><div class="form-note">¿Todavía no tienes cuenta? <button class="text-action" data-view="register">Regístrate</button></div><div class="demo-box"><b>Acceso de demostración</b><br>Usuario: <b>valentina</b> · Contraseña: <b>demo1234</b></div></div>`
}
function openApp(c) {
  setActual(c);
  setSelectedId(c.cuentaPrincipal?.id);
  auth.classList.add('hidden');
  landing.classList.add('hidden');
  app.classList.remove('hidden');
  updateHeader();
  renderSection('dashboard')
}
function updateHeader() {
  const first=actual.nombre.trim().split(/\s+/)[0];
  $('#greeting').textContent=`Hola, ${first} 👋`;
  $('#header-name').textContent=actual.nombre;
  $('#user-avatar').textContent=actual.nombre.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  $('#today').textContent=new Intl.DateTimeFormat('es-CO', {
    weekday:'long',day:'numeric',month:'long'
  }
  ).format(new Date()).toUpperCase();
  const admin=$('.admin-only');
  if(admin)admin.style.display=actual.esAdmin?'flex':'none'
}
function account() {
  return actual.cuentas.find(c=>c.id===selectedId)||actual.cuentaPrincipal
}
/* ========================================================
  9. DASHBOARD Y OPERACIONES
   ======================================================== */
/** Cambia la sección visible del panel principal. */
function renderSection(section) {
  if(section==='admin'&&!actual?.esAdmin) {
    notify('Acceso restringido al administrador.','error');
    section='dashboard'
  }
  $$('.side-link').forEach(b=>b.classList.toggle('active',b.dataset.section===section));
  if(section==='dashboard')renderDashboard();
  if(section==='movements')renderMovements();
  if(section==='transfer')renderTransfer();
  if(section==='credit')renderCredit();
  if(section==='profile')renderProfile();
  if(section==='admin')renderAdmin();
}
function accountSelect() {
  return `<select class="account-select" id="account-select">${actual.cuentas.map(c=>`<option value="${c.id}" ${c.id===selectedId?'selected':''}>${c.tipo==='Crédito'?'Tarjeta':'Cuenta'} ${c.tipo} · ${c.numero}</option>`).join('')}</select>`
}
function transactionMarkup(items,limit=4) {
  if(!items.length)return '<tr><td colspan="3" style="text-align:center;color:#98a198;padding:20px">Aún no tienes movimientos. Tus operaciones aparecerán aquí.</td></tr>';
  return items.slice(0,limit).map(m=> {
    let out=['Retiro','Compra','Transferencia enviada'].includes(m.tipo);
    return `<tr class="movement-row" data-movement-id="${esc(m.id)}" title="Ver comprobante"><td><div class="move-name"><span class="move-symbol ${out?'out':''}">${out?'↗':'↙'}</span><span>${esc(m.tipo)}<small class="move-sub">${esc(m.detalle||'Operación')}</small></span></div></td><td><span class="move-date">${dateText(m.fecha)}</span></td><td class="move-value ${out?'negative':'positive'}">${out?'−':'+'}${money(m.valor)}</td></tr>`
  }
  ).join('')
}
function findMovement(id) {
  for(const c of actual?.cuentas||[])  {
    const m=c.movimientos.find(x=>x.id===id);
    if(m)return  {
      movement:m,account:c
    }
  }
  return null
}
/** Muestra el comprobante de un movimiento seleccionado. */
function openReceipt(id) {
  const found=findMovement(id);
  if(!found)return;
  const  {
    movement:m,account:c
  }
  =found;
  const outgoing=['Retiro','Compra','Transferencia enviada'].includes(m.tipo);
  const reference=`MP-${String(m.id).slice(0,6)}-${new Date(m.fecha).getFullYear()}`;
  const modal=document.createElement('div');
  modal.className='receipt-overlay';
  modal.id='receipt-modal';
  modal.innerHTML=`<div class="receipt-modal" role="dialog" aria-modal="true" aria-label="Comprobante de operación"><button class="receipt-close" aria-label="Cerrar">×</button><div class="receipt-brand"><span class="brand-mark">m</span><div><b>mi plata<span class="brand-dot">.</span></b><small>COMPROBANTE DIGITAL</small></div></div><div class="receipt-status"><span>✓</span><div><b>Operación procesada</b><small>Transacción registrada correctamente</small></div></div><div class="receipt-amount ${outgoing?'outgoing':''}">${outgoing?'−':'+'}${money(m.valor)}</div><div class="receipt-type">${esc(m.tipo)}</div><div class="receipt-divider"></div><div class="receipt-details"><div><span>Fecha y hora</span><b>${new Intl.DateTimeFormat('es-CO',{dateStyle:'long',timeStyle:'short'}).format(new Date(m.fecha))}</b></div><div><span>Producto</span><b>${esc(c.tipo)} · ${esc(c.numero)}</b></div><div><span>Cliente</span><b>${esc(actual.nombre)}</b></div><div><span>Detalle</span><b>${esc(m.detalle||'Operación bancaria')}</b></div><div><span>Referencia</span><b>${reference}</b></div></div><div class="receipt-security"><span>⌁</span><div><b>Comprobante académico</b><small>Mi Plata · Simulación de banca digital</small></div></div><div class="receipt-actions"><button class="secondary-action" id="print-receipt">Imprimir</button><button class="primary-action" id="download-receipt">Guardar captura PNG ↗</button></div></div>`;
  document.body.appendChild(modal);
  const close=()=>modal.remove();
  modal.querySelector('.receipt-close').onclick=close;
  modal.onclick=e=> {
    if(e.target===modal)close()
  }
  ;
  /* ========================================================
  12. EVENTOS GLOBALES
   ======================================================== */
document.addEventListener('keydown',function escReceipt(e) {
    if(e.key==='Escape') {
      close();
      document.removeEventListener('keydown',escReceipt)
    }
  }
  );
  modal.querySelector('#print-receipt').onclick=()=>window.print();
  modal.querySelector('#download-receipt').onclick=()=>downloadReceipt(m, c, reference, outgoing)
}
function downloadReceipt(m,c,reference,outgoing) {
  const canvas=document.createElement('canvas');
  canvas.width=1200;
  canvas.height=1500;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#f4f6f2';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#081510';
  ctx.fillRect(70,70,1060,1360);
  ctx.fillStyle='#d9f66d';
  ctx.fillRect(70,70,1060,12);
  ctx.fillStyle='#ffffff';
  ctx.font='800 44px Manrope, Arial';
  ctx.fillText('mi plata.',120,170);
  ctx.fillStyle='#aeb9b1';
  ctx.font='600 20px Arial';
  ctx.fillText('COMPROBANTE DIGITAL',120,210);
  ctx.fillStyle='#d9f66d';
  ctx.beginPath();
  ctx.arc(600,340,58,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle='#081510';
  ctx.font='700 44px Arial';
  ctx.fillText('✓',585,355);
  ctx.fillStyle='#ffffff';
  ctx.textAlign='center';
  ctx.font='700 30px Arial';
  ctx.fillText('OPERACIÓN PROCESADA',600,450);
  ctx.font='800 70px Arial';
  ctx.fillText(`${outgoing?'−':'+'}${money(m)}`,600,555);
  ctx.fillStyle='#aeb9b1';
  ctx.font='500 22px Arial';
  ctx.fillText(m.tipo.toUpperCase(),600,600);
  ctx.textAlign='left';
  const rows=[['FECHA Y HORA',new Intl.DateTimeFormat('es-CO', {
    dateStyle:'long',timeStyle:'short'
  }
  ).format(new Date(m.fecha))],['PRODUCTO',`${c.tipo} · ${c.numero}`],['CLIENTE',actual.nombre],['DETALLE',m.detalle||'Operación bancaria'],['REFERENCIA',reference]];
  let y=700;
  rows.forEach(([a,b])=> {
    ctx.fillStyle='#7f8d84';
    ctx.font='600 18px Arial';
    ctx.fillText(a,140,y);
    ctx.fillStyle='#ffffff';
    ctx.font='600 25px Arial';
    ctx.fillText(String(b).slice(0,58),140,y+38);
    ctx.strokeStyle='#294139';
    ctx.beginPath();
    ctx.moveTo(140,y+60);
    ctx.lineTo(1060,y+60);
    ctx.stroke();
    y+=125
  }
  );
  ctx.fillStyle='#aeb9b1';
  ctx.font='500 18px Arial';
  ctx.fillText('Mi Plata · Simulación académica de banca digital',140,1370);
  const a=document.createElement('a');
  a.download=`comprobante-mi-plata-${m.id}.png`;
  a.href=canvas.toDataURL('image/png');
  a.click();
  notify('Captura del comprobante guardada como PNG.')
}
function cardMarkup(variant, title, subtitle, number, expiry, status, footer) {
  const labels= {
    gold:'GOLD',silver:'SILVER',black:'BLACK',green:'GREEN'
  }
  ;
  const tag=labels[variant]||'PREMIUM';
  return `<article class="bank-card bank-card-${variant}" data-card-theme="${variant}" tabindex="0" aria-label="Tarjeta Mi Plata ${tag}">
    <div class="bank-card-glow"></div><div class="bank-card-grid"></div>
    <div class="bank-card-head"><div class="bank-brand"><span class="bank-logo">m</span><div><b>MI PLATA</b><small>${subtitle}</small></div></div><strong>${tag}</strong></div>
    <div class="bank-card-chip"><span></span><span></span><span></span><span></span><span></span><span></span></div><div class="bank-card-contact">)))</div>
    <div class="bank-card-number">${number}</div>
    <div class="bank-card-meta"><div><small>TITULAR</small><b>${title}</b></div><div><small>VÁLIDA</small><b>${expiry}</b></div><div class="bank-mc"><i></i><i></i><span>mastercard</span></div></div>
    <div class="bank-card-footer"><span>${status}</span><span>${footer}</span></div><div class="bank-card-shine"></div>
  </article>`;
}
/** Construye la vista principal del cliente. */
function renderDashboard() {
  const c=account(), credit=actual.cuentas.find(x=>x.tipo==='Crédito');
  const variants=[
  ['gold','Gold','5421 7500 1234 5678','12/29','ACTIVA','Crédito'],
  ['silver','Silver','3412 7500 1234 9012','11/28','ACTIVA','Débito'],
  ['black','Black','3739 3400 1234 3456','10/27','PREMIUM','Crédito'],
  ['green','Green','3752 0100 1234 7890','09/27','ACTIVA','Débito']
  ];
  const total=actual.cuentas.filter(x=>x.tipo!=='Crédito').reduce((a,x)=>a+x.saldo,0);
  const moves=c.movimientos;
  const allMoves=[];
  banco.clientes.forEach(cl=>cl.cuentas.forEach(ac=>ac.movimientos.forEach(m=>allMoves.push( {
    m,cl,ac
  }
  ))));
  allMoves.sort((a,b)=>new Date(b.m.fecha)-new Date(a.m.fecha));
  const todayMoves=allMoves.slice(0,5);
  const outgoing=/Retiro|Transferencia enviada|Compra/.test.bind(/Retiro|Transferencia enviada|Compra/);
  const pct=credit?.cupo?Math.round((credit.saldo/credit.cupo)*100):0;
  appContent.innerHTML=`<div class="god-dashboard">
    <section class="god-welcome">
      <div><span class="god-eyebrow">MI PLATA · BANCA DIGITAL PREMIUM</span><h2>¡Hola, ${esc(actual.nombre.split(/\s+/)[0])}! <span>👋</span></h2><p>Todo lo que necesitas, en un solo lugar.</p></div>
      <div class="god-date"><span>◷</span><div><b>${new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'long'}).format(new Date())}</b><small>${new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit'}).format(new Date())}</small></div></div>
    </section>
    <section class="god-top-grid">
      <article class="god-main-card">
        <div class="god-card-side">${cardMarkup('gold',esc(actual.nombre).toUpperCase(),'Gold Metal','5421 7500 1234 5678','12/29','ACTIVA','Crédito')}</div>
        <div class="god-account-info"><div class="god-account-head"><div><span>Cuenta de Ahorros</span><small>● Activa</small></div><button class="eye-btn" id="toggle-balance" aria-label="Mostrar u ocultar saldo">◉</button></div><div class="god-balance" id="main-balance">${money(c.tipo==='Crédito'?c.disponible:c.saldo)}</div><label>Saldo disponible</label><div class="god-account-number"><span>Número de cuenta</span><b>${esc(c.numero)}</b></div><div class="god-account-actions"><button data-section="movements">Ver detalles</button><button data-section="profile">⚿ Bloquear</button><button data-section="profile">⚙ Configurar</button></div></div>
      </article>
      <aside class="god-quick-panel"><div class="god-panel-title"><b>Acciones rápidas</b><span>›</span></div><div class="god-quick-grid"><button data-section="transfer"><i>↗</i><b>Transferir dinero</b><small>Enviar dinero</small><em>→</em></button><button data-section="deposit"><i>▣</i><b>Consignar dinero</b><small>Depositar en cuenta</small><em>→</em></button><button data-section="withdraw"><i>▤</i><b>Retirar dinero</b><small>Retirar en cajero</small><em>→</em></button><button data-section="credit"><i>ϟ</i><b>Comprar con tarjeta</b><small>Simular compra</small><em>→</em></button><button data-section="movements"><i>▤</i><b>Movimientos</b><small>Ver historial</small><em>→</em></button><button data-section="profile"><i>⚙</i><b>Más opciones</b><small>Configurar cuenta</small><em>→</em></button></div></aside>
    </section>
    <section class="god-section"><div class="god-section-head"><div><span>RESUMEN FINANCIERO</span><b>Últimos 7 días</b></div></div><div class="god-finance-grid"><article class="god-stat emerald"><span>▣</span><small>Total en cuentas</small><strong>${money(total)}</strong><em>↑ 12,5%</em></article><article class="god-stat purple"><span>▤</span><small>Total tarjetas</small><strong>4</strong><em>Activas</em></article><article class="god-stat gold"><span>↕</span><small>Movimientos hoy</small><strong>${moves.length}</strong><em>↑ 25%</em></article><article class="god-stat blue"><span>▣</span><small>Límite de crédito</small><strong>${money(credit?.cupo||0)}</strong><em>Disponible ${money(credit?.disponible||0)}</em></article></div><div class="god-analytics"><div class="god-chart"><div class="chart-head"><b>Patrimonio</b><span>18 Sep — ${new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'short'}).format(new Date())}</span></div><div class="chart-bars">${[34,42,38,55,49,65,60,78,71,92].map((h,i)=>`<i style="height:${h}%" title="Periodo ${i+1}"></i>`).join('')}</div><div class="chart-foot"><span>$0</span><b>${money(total)}</b><span>$3.0M</span></div></div><div class="god-distribution"><div class="donut"><span>${Math.round(total/1000).toLocaleString('es-CO')}K</span></div><div><b>Distribución de fondos</b><p><i></i>Ahorros <strong>60%</strong></p><p><i></i>Corriente <strong>25%</strong></p><p><i></i>Tarjeta <strong>10%</strong></p><p><i></i>Inversión <strong>5%</strong></p></div></div></div></section>
    <section class="god-section god-cards-section"><div class="god-section-head"><div><span>MIS TARJETAS</span><b>4 productos premium</b></div><button data-section="credit">Ver todas ›</button></div><div class="god-card-grid">${variants.map(v=>cardMarkup(v[0],esc(actual.nombre).toUpperCase(),v[1],v[2],v[3],v[4],v[5])).join('')}</div></section>
    <section class="god-lower-grid"><div class="god-section"><div class="god-section-head"><div><span>ÚLTIMOS MOVIMIENTOS</span><b>Actividad reciente</b></div><button data-section="movements">Ver todos ›</button></div><div class="god-movements">${todayMoves.map(x=>{const out=/Retiro|Transferencia enviada|Compra/.test(x.m.tipo);return `<button class="god-move" data-movement-id="${x.m.id}"><span class="move-icon ${out?'out':'in'}">${out?'↙':'↗'}</span><div><b>${esc(x.m.tipo)}</b><small>${esc(x.m.detalle||x.ac.tipo)} · ${dateText(x.m.fecha)}</small></div><strong class="${out?'negative':'positive'}">${out?'−':'+'}${money(x.m.valor)}</strong></button>`}).join('')||'<div class="god-empty">No hay movimientos registrados.</div>'}</div></div><aside class="god-side-stack"><div class="god-card-promo"><span>MI PLATA · PRIVILEGE</span><h3>Tu tarjeta,<br>más que una forma<br>de pago.</h3><p>Compras en línea · Pagos sin contacto · Seguridad avanzada</p><button data-section="credit">Ver beneficios →</button></div><div class="god-system-panel"><div class="god-section-head"><div><span>ADMINISTRACIÓN DEL SISTEMA</span><b>Centro de control</b></div></div><button data-section="admin">♛ Gestión de clientes <em>Ver todos ›</em></button><button data-section="admin">▦ Reportes y estadísticas <em>Ver reportes ›</em></button><button data-section="admin">◉ Aplicar intereses (1,5%) <em>Administrar ›</em></button><button data-section="admin">⇩ Exportar movimientos <em>CSV ›</em></button></div></aside></section>
    <section class="god-security"><span>◈</span><div><b>Sistema seguro y protegido</b><small>Conexión protegida · Datos guardados localmente · Simulación académica</small></div><strong>Mi Plata</strong></section>
  </div>`;
  $('#toggle-balance').onclick=()=> {
    const el=$('#main-balance');
    const hidden=el.dataset.hidden==='1';
    el.dataset.hidden=hidden?'0':'1';
    el.textContent=hidden?money(c.tipo==='Crédito'?c.disponible:c.saldo):'••••••••';
  }
  ;
  $$('.bank-card').forEach(card=>card.addEventListener('click',()=> {
    notify(`Tarjeta ${card.dataset.cardTheme.toUpperCase()} seleccionada.`);
    $$('.bank-card').forEach(x=>x.classList.remove('is-selected'));
    card.classList.add('is-selected')
  }
  ));
}
function renderMovements() {
  const c=account();
  appContent.innerHTML=`<div class="section-head" style="margin-top:0"><div><h2>Movimientos</h2><p style="font-size:10px;color:#8d988e;margin:5px 0">Historial de ${esc(c.tipo.toLowerCase())} · ${c.numero}</p></div>${accountSelect()}</div><div class="panel-card"><table class="movement-table"><thead><tr><th>OPERACIÓN</th><th>FECHA Y HORA</th><th style="text-align:right">VALOR</th></tr></thead><tbody>${transactionMarkup(c.movimientos,100)}</tbody></table></div>`;
  $('#account-select').onchange=e=> {
    setSelectedId(e.target.value);
    renderMovements()
  }
}
function renderDeposit(withdraw=false) {
  const c=account();
  appContent.innerHTML=`<div class="section-head" style="margin-top:0"><h2>${withdraw?'Retirar dinero':'Consignar dinero'}</h2></div><div class="form-card"><h2>${withdraw?'Saca dinero de tu cuenta':'Agrega dinero a tu cuenta'}</h2><p>Producto seleccionado: ${esc(c.tipo)} · ${c.numero}${withdraw?` · Límite actual: ${money(c.limiteRetiro())}`:''}</p><form id="transaction-form"><label class="field"><span>Cuenta de origen</span>${accountSelect()}</label><label class="field"><span>Monto (COP)</span><input name="amount" type="number" min="1" step="1" required placeholder="Ej. 50000"></label>${withdraw&&c.tipo==='Ahorros'?'<div class="demo-box">Al retirar se aplica el rendimiento mensual del 1,5% al saldo de la cuenta, según el enunciado del taller.</div>':''}<div class="form-actions"><button class="primary-action">${withdraw?'Confirmar retiro':'Confirmar consignación'}</button><button type="button" class="secondary-action" data-section="dashboard">Cancelar</button></div></form></div>`;
  $('#account-select').onchange=e=> {
    setSelectedId(e.target.value);
    renderDeposit(withdraw)
  }
  ;
  $('#transaction-form').onsubmit=e=> {
    e.preventDefault();
    try {
      const monto=Number(new FormData(e.currentTarget).get('amount'));
      if(withdraw) {
        if(c.tipo==='Ahorros')c.aplicarInteres();
        c.retirar(monto)
      } else c.consignar(monto);
      banco.guardar();
      notify(withdraw?'Retiro procesado correctamente.':'Consignación realizada correctamente.');
      renderDashboard()
    } catch(err) {
      banco.guardar();
      notify(err.message,'error')
    }
  }
}
function renderTransfer() {
  appContent.innerHTML=`<div class="section-head" style="margin-top:0"><h2>Transferir dinero</h2></div><div class="form-card"><h2>Mueve tu dinero con tranquilidad</h2><p>Transfiere entre tus productos o a otro cliente registrado.</p><form id="transfer-form"><label class="field"><span>Cuenta de origen</span><select name="from">${actual.cuentas.filter(c=>c.tipo!=='Crédito').map(c=>`<option value="${c.id}">${c.tipo} · ${c.numero} · ${money(c.saldo)}</option>`).join('')}</select></label><label class="field"><span>Destinatario</span><select name="to"><option value="">Selecciona un cliente</option>${banco.clientes.filter(cl=>cl.cuentas.some(c=>c.tipo!=='Crédito')).map(cl=>`<option value="${cl.id}">${esc(cl.nombre)}${cl.id===actual.id?' (Mis productos)':''}</option>`).join('')}</select></label><div class="field"><span>Producto de destino</span><select name="toAccount" id="to-account" required><option value="">Elige primero el destinatario</option></select></div><label class="field"><span>Monto (COP)</span><input name="amount" type="number" min="1" step="1" required placeholder="Ej. 50000"></label><div class="form-actions"><button class="primary-action">Revisar y transferir ↗</button></div></form></div>`;
  const dest=$('[name=to]'),sub=$('#to-account');
  dest.onchange=()=> {
    const cl=banco.clientes.find(x=>x.id===dest.value);
    sub.innerHTML=cl?'<option value="">Selecciona cuenta</option>'+cl.cuentas.filter(c=>c.tipo!=='Crédito').map(c=>`<option value="${c.id}" ${cl.id===actual.id&&c.id===$('[name=from]').value?'disabled':''}>${c.tipo} · ${c.numero}${cl.id===actual.id&&c.id===$('[name=from]').value?' (misma cuenta)':''}</option>`).join(''):'<option value="">Elige primero el destinatario</option>'
  }
  ;
  $('#transfer-form').onsubmit=e=> {
    e.preventDefault();
    try {
      const f=new FormData(e.currentTarget),from=actual.cuentas.find(c=>c.id===f.get('from')),toOwner=banco.clientes.find(cl=>cl.cuentas.some(c=>c.id===f.get('toAccount'))),to=toOwner?.cuentas.find(c=>c.id===f.get('toAccount')),m=Number(f.get('amount'));
      if(!to)throw Error('Selecciona una cuenta destino válida.');
      if(from===to)throw Error('No se permite transferir al mismo producto.');
      if(!Number.isFinite(m)||m<=0)throw Error('El monto debe ser mayor a cero.');
      from.retirar(m);
      from.registrar('Transferencia enviada',m,`A ${toOwner.nombre} · ${to.tipo}`);
      to.aplicarDelta(m);
      to.registrar('Transferencia recibida',m,`De ${actual.nombre} · ${from.tipo}`);
      banco.guardar();
      notify('Transferencia enviada correctamente.');
      renderDashboard()
    } catch(err) {
      notify(err.message,'error')
    }
  }
}
function renderCredit() {
  const c=actual.cuentas.find(x=>x.tipo==='Crédito');
  appContent.innerHTML=`<div class="credit-page-pro"><div class="section-head" style="margin-top:0"><div><span class="eyebrow">COLECCIÓN PRIVILEGE · ${esc(actual.nombre.toUpperCase())}</span><h2>Mis tarjetas</h2></div><button data-section="dashboard">← Volver al resumen</button></div>
  <section class="credit-showcase"><div class="showcase-card">${cardMarkup('gold',esc(actual.nombre).toUpperCase(),'Gold Metal','5421 7500 1234 5678','12/29','PRINCIPAL','Crédito')}</div><div class="credit-info premium-credit-info"><span class="eyebrow">LÍNEA DE CRÉDITO</span><h3>Tu cupo disponible</h3><strong class="credit-big-number">${money(c.disponible)}</strong><div class="credit-progress"><i style="width:${Math.min(100,c.saldo/c.cupo*100)}%"></i></div><div class="credit-progress-meta"><span>Utilizado ${money(c.saldo)}</span><b>${Math.round((c.saldo/c.cupo)*100)}%</b><span>Cupo ${money(c.cupo)}</span></div><div class="credit-benefits"><span>✓ Compras en línea</span><span>✓ Pagos sin contacto</span><span>✓ Control de cuotas</span></div></div></section>
  <section class="card-collection credit-collection">${cardMarkup('silver',esc(actual.nombre).toUpperCase(),'Silver Metal','3412 7500 1234 9012','11/28','ACTIVA','Débito')}${cardMarkup('black',esc(actual.nombre).toUpperCase(),'Black Elite','3739 3400 1234 3456','10/27','PREMIUM','Crédito')}${cardMarkup('green',esc(actual.nombre).toUpperCase(),'Green Digital','3752 0100 1234 7890','09/27','ACTIVA','Débito')}</section>
  <div class="form-card premium-form"><h2>Simular una compra</h2><p>Calcula el pago mensual antes de registrar una compra.</p><form id="buy-form"><div class="form-row"><label class="field"><span>Valor de compra (COP)</span><input type="number" name="amount" min="1" step="1" required placeholder="Ej. 350000"></label><label class="field"><span>Número de cuotas</span><select name="installments"><option value="1">1 cuota · 0%</option><option value="2">2 cuotas · 0%</option><option value="3">3 cuotas · 1,9% mensual</option><option value="6">6 cuotas · 1,9% mensual</option><option value="7">7 cuotas · 2,3% mensual</option><option value="12">12 cuotas · 2,3% mensual</option><option value="24">24 cuotas · 2,3% mensual</option></select></label></div><div id="installment-preview" class="demo-box">El pago mensual estimado aparecerá aquí.</div><div class="form-actions"><button class="primary-action">Registrar compra</button></div></form></div><div class="section-head"><h2>Compras recientes</h2></div><div class="panel-card premium-panel"><table class="movement-table"><thead><tr><th>OPERACIÓN</th><th>FECHA</th><th style="text-align:right">VALOR</th></tr></thead><tbody>${transactionMarkup(c.movimientos,10)}</tbody></table></div></div>`;
  const buyForm=$('#buy-form');
  const preview=$('#installment-preview');
  const updatePreview=()=> {
    const amount=Number(buyForm.amount.value),q=Number(buyForm.installments.value);
    if(!amount) {
      preview.textContent='El pago mensual estimado aparecerá aquí.';
      return
    }
    const tasa=q<=2?0:q<=6?.019:.023;
    const pago=tasa===0?amount/q:(amount*tasa)/(1-Math.pow(1+tasa,-q));
    preview.innerHTML=`<b>${money(pago)} / mes</b> · ${q} cuota${q>1?'s':''} · tasa ${tasa*100}% mensual`
  }
  ;
  buyForm.amount.oninput=updatePreview;
  buyForm.installments.onchange=updatePreview;
  buyForm.onsubmit=e=> {
    e.preventDefault();
    try {
      const d=new FormData(e.currentTarget),r=c.comprar(Number(d.get('amount')),Number(d.get('installments')));
      banco.guardar();
      notify(`Compra registrada. Pago mensual estimado: ${money(r.pago)}.`);
      renderCredit()
    } catch(err) {
      notify(err.message,'error')
    }
  }
  ;
  $$('.bank-card').forEach(card=>card.addEventListener('click',()=> {
    notify(`Tarjeta ${card.dataset.cardTheme.toUpperCase()} seleccionada.`);
    $$('.bank-card').forEach(x=>x.classList.remove('is-selected'));
    card.classList.add('is-selected')
  }
  ));
}
/* =========================================================
  10. ADMINISTRACIÓN
   ========================================================= */
/** Construye el panel administrativo y sus acciones. */
function renderAdmin() {
  if(!actual?.esAdmin) {
    notify('Acceso restringido al administrador.','error');
    return
  }
  const allMoves=[];
  let totalSaldo=0,totalCupo=0,blocked=0;
  banco.clientes.forEach(cl=> {
    if(cl.bloqueado)blocked++;
    cl.cuentas.forEach(c=> {
      totalSaldo+=c.tipo==='Crédito'?0:c.saldo;
      totalCupo+=c.tipo==='Crédito'?c.cupo:0;
      c.movimientos.forEach(m=>allMoves.push( {
        m,cl,c
      }
      ))
    }
    )
  }
  );
  allMoves.sort((a,b)=>new Date(b.m.fecha)-new Date(a.m.fecha));
  const deposits=allMoves.filter(x=>/Consignación|Transferencia recibida|Interés/.test(x.m.tipo)).reduce((a,x)=>a+x.m.valor,0);
  const withdrawals=allMoves.filter(x=>/Retiro|Transferencia enviada|Compra/.test(x.m.tipo)).reduce((a,x)=>a+x.m.valor,0);
  appContent.innerHTML=`<div class="admin-page"><div class="section-head admin-title"><div><span class="eyebrow">CENTRO DE CONTROL</span><h2>Administrador de Mi Plata</h2><p>Supervisa clientes, cuentas y movimientos desde un solo lugar.</p></div><span class="admin-badge">● ADMINISTRADOR</span></div>
  <div class="admin-kpis"><article><span>CLIENTES</span><strong>${banco.clientes.length}</strong><small>${blocked} bloqueado${blocked===1?'':'s'}</small></article><article><span>SALDOS ADMINISTRADOS</span><strong>${money(totalSaldo)}</strong><small>Dinero disponible</small></article><article><span>MOVIMIENTOS</span><strong>${allMoves.length}</strong><small>${money(deposits)} entradas</small></article><article><span>CUPO DE CRÉDITO</span><strong>${money(totalCupo)}</strong><small>${money(withdrawals)} en salidas</small></article></div>
  <div class="admin-grid"><section class="admin-panel"><div class="admin-panel-head"><div><h3>Gestión de clientes</h3><small>Crear, bloquear, desbloquear y consultar cuentas.</small></div><button class="primary-action" id="admin-add">+ Nuevo cliente</button></div><div class="admin-search"><input id="admin-search" placeholder="Buscar por nombre, usuario o identificación..."></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>CLIENTE</th><th>ESTADO</th><th>SALDO</th><th>CUENTAS</th><th>ACCIONES</th></tr></thead><tbody id="admin-users-body">${adminUserRows(banco.clientes)}</tbody></table></div></section>
  <section class="admin-panel"><div class="admin-panel-head"><div><h3>Actividad reciente</h3><small>Últimas operaciones registradas.</small></div><button class="secondary-action" id="admin-refresh">Actualizar</button></div><div class="admin-activity">${allMoves.slice(0,9).map(x=>`<div class="admin-activity-row"><span class="move-symbol ${/Retiro|enviada|Compra/.test(x.m.tipo)?'out':''}">${/Retiro|enviada|Compra/.test(x.m.tipo)?'↙':'↗'}</span><div><b>${esc(x.m.tipo)}</b><small>${esc(x.cl.nombre)} · ${esc(x.m.detalle||x.c.tipo)}</small></div><strong class="${/Retiro|enviada|Compra/.test(x.m.tipo)?'negative':'positive'}">${/Retiro|enviada|Compra/.test(x.m.tipo)?'−':'+'}${money(x.m.valor)}</strong></div>`).join('')||'<div class="empty-state">Aún no hay movimientos.</div>'}</div></section></div>
  <section class="admin-panel admin-security"><div class="admin-panel-head"><div><h3>Herramientas del sistema</h3><small>Acciones administrativas de demostración.</small></div></div><div class="admin-tools"><button id="admin-interest">Aplicar interés 1,5% a ahorros</button><button id="admin-export">Exportar resumen CSV</button><button id="admin-demo-reset">Restaurar datos de demostración</button></div></section></div>`;
  $('#admin-add').onclick=()=>openUserForm(true);
  $('#admin-refresh').onclick=renderAdmin;
  $('#admin-search').oninput=e=> {
    const q=e.target.value.toLowerCase();
    $('#admin-users-body').innerHTML=adminUserRows(banco.clientes.filter(c=>(c.nombre+' '+c.usuario+' '+c.cedula).toLowerCase().includes(q)))
  }
  ;
  $$('[data-admin-action]').forEach(b=>b.onclick=()=>adminAction(b.dataset.adminAction,b.dataset.id));
  $('#admin-interest').onclick=()=> {
    let total=0;
    banco.clientes.forEach(c=>c.cuentas.filter(x=>x.tipo==='Ahorros').forEach(a=>total+=a.aplicarInteres()));
    banco.guardar();
    notify(`Interés aplicado: ${money(total)}.`);
    renderAdmin()
  }
  ;
  $('#admin-export').onclick=exportAdminCSV;
  $('#admin-demo-reset').onclick=()=> {
    if(confirm('Esto reemplazará los datos actuales por la cuenta de demostración. ¿Continuar?')) {
      localStorage.removeItem(STORE_KEY);
      location.reload()
    }
  }
  ;
}
function adminUserRows(list) {
  return list.map(cl=> {
    const saldo=cl.cuentas.filter(c=>c.tipo!=='Crédito').reduce((a,c)=>a+c.saldo,0);
    return `<tr><td><div class="admin-client"><span>${esc(cl.nombre.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</span><div><b>${esc(cl.nombre)}</b><small>@${esc(cl.usuario)} · ${esc(cl.cedula||'Sin identificación')}</small></div></div></td><td><span class="status ${cl.bloqueado?'blocked':'active'}">${cl.bloqueado?'Bloqueado':'Activo'}</span></td><td><b>${money(saldo)}</b></td><td>${cl.cuentas.length} productos</td><td><button class="table-action" data-admin-action="toggle" data-id="${cl.id}">${cl.bloqueado?'Desbloquear':'Bloquear'}</button><button class="table-action" data-admin-action="edit" data-id="${cl.id}">Editar</button></td></tr>`
  }
  ).join('')||'<tr><td colspan="5" class="empty-state">No se encontraron clientes.</td></tr>'
}
function adminAction(action,id) {
  const c=banco.clientes.find(x=>x.id===id);
  if(!c)return;
  if(action==='toggle') {
    if(c.id===actual.id) {
      notify('No puedes bloquear tu propia sesión.','warn');
      return
    }
    c.bloqueado=!c.bloqueado;
    c.intentos=0;
    banco.guardar();
    notify(c.bloqueado?'Cliente bloqueado.':'Cliente desbloqueado.');
    renderAdmin()
  }
  if(action==='edit')editUser(id)
}
function exportAdminCSV() {
  const rows=[['Cliente','Usuario','Identificacion','Estado','Cuenta','Saldo','Movimiento','Valor','Fecha']];
  banco.clientes.forEach(c=>c.cuentas.forEach(ac=>ac.movimientos.forEach(m=>rows.push([c.nombre,c.usuario,c.cedula,c.bloqueado?'Bloqueado':'Activo',ac.tipo,ac.saldo,m.tipo,m.valor,m.fecha]))));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mi-plata-reporte-admin.csv';a.click();URL.revokeObjectURL(url);notify('Reporte administrativo exportado.') }
/* =========================================================
  11. PERFIL Y SEGURIDAD
   ========================================================= */
function renderProfile(){appContent.innerHTML=`<div class="section-head" style="margin-top:0"><h2>Mi perfil</h2></div><div class="content-grid"><div class="form-card"><h2>Datos personales</h2><p>Actualiza la información de tu perfil.</p><form id="profile-form"><label class="field"><span>Identificación</span><input name="cedula" value="${esc(actual.cedula)}" required></label><label class="field"><span>Nombre completo</span><input name="nombre" value="${esc(actual.nombre)}" required></label><label class="field"><span>Celular</span><input name="celular" value="${esc(actual.celular)}" required></label><label class="field"><span>Nombre de usuario</span><input name="usuario" value="${esc(actual.usuario)}" required minlength="3"></label><button class="primary-action">Guardar cambios</button></form><div class="section-head"><h2>Seguridad</h2></div><form id="password-form"><label class="field"><span>Usuario</span><input name="usuario" required value="${esc(actual.usuario)}"></label><label class="field"><span>Contraseña actual</span><input name="old" type="password" required></label><label class="field"><span>Nueva contraseña</span><input name="next" type="password" required minlength="4"></label><label class="field"><span>Confirmar nueva contraseña</span><input name="confirm" type="password" required minlength="4"></label><button class="secondary-action">Cambiar contraseña</button></form></div>${actual.esAdmin?`<div class="panel-card"><div class="section-head" style="margin:0 0 8px"><h2>Administración de usuarios</h2><button id="add-user">+ Agregar usuario</button></div><div class="admin-list">${banco.clientes.map(cl=>`<div class="admin-row"><span>${esc(cl.nombre)}<small>@${esc(cl.usuario)} · ${cl.bloqueado?'Bloqueado':'Activo'}</small></span><span><button data-edit-user="${cl.id}">Editar</button><button data-delete-user="${cl.id}">Eliminar</button></span></div>`).join('')}</div></div>`:''}</div>`;
  $('#profile-form').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));if(banco.clientes.some(c=>c.id!==actual.id&&c.usuario.toLowerCase()===d.usuario.toLowerCase())){notify('Ese usuario ya existe.','error');return}Object.assign(actual,d);banco.guardar();updateHeader();notify('Perfil actualizado correctamente.');renderProfile()};$('#password-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(f.get('usuario')!==actual.usuario||!actual.validarClave(f.get('old'))){notify('Usuario o contraseña actual incorrectos.','error');return}if(f.get('next')!==f.get('confirm')){notify('La confirmación no coincide.','error');return}actual.cambiarClave(f.get('next'));banco.guardar();notify('Contraseña actualizada correctamente.');e.currentTarget.reset()};$('#add-user')?.addEventListener('click',()=>openUserForm());$$('[data-delete-user]').forEach(b=>b.onclick=()=>{if(b.dataset.deleteUser===actual.id){notify('No puedes eliminar el usuario que está conectado.','warn');return}if(confirm('¿Eliminar este usuario y sus productos?')){banco.clientes=banco.clientes.filter(c=>c.id!==b.dataset.deleteUser);banco.guardar();notify('Usuario eliminado.');renderProfile()}});$$('[data-edit-user]').forEach(b=>b.onclick=()=>editUser(b.dataset.editUser))}
function openUserForm(){const n=prompt('Nombre completo del nuevo cliente:');if(!n)return;const user=prompt('Nombre de usuario:');if(!user)return;const pass=prompt('Contraseña inicial (mínimo 4 caracteres):');if(!pass)return;try{banco.crear({nombre:n,usuario:user,password:pass,cedula:'',celular:''});notify('Nuevo cliente creado.');renderProfile()}catch(e){notify(e.message,'error')}}
function editUser(id){const c=banco.clientes.find(x=>x.id===id);if(!c)return;const n=prompt('Editar nombre:',c.nombre);if(n===null)return;const cel=prompt('Editar celular:',c.celular);if(cel===null)return;const ced=prompt('Editar identificación:',c.cedula);if(ced===null)return;c.nombre=n;c.celular=cel;c.cedula=ced;banco.guardar();notify('Datos de usuario actualizados.');renderProfile()}
