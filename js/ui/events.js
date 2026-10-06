/**
 * Eventos globales del documento: navegación, autenticación y cierre de sesión.
 */
import { banco, actual, $, setActual } from '../state.js';
import { showLanding, showAuth, renderSection, renderDeposit, openReceipt, notify, openApp } from './views.js';

document.addEventListener('click',e=>{const movement=e.target.closest('[data-movement-id]')?.dataset.movementId;if(movement){openReceipt(movement);return}const view=e.target.closest('[data-view]')?.dataset.view;if(view){showAuth(view);return}if(e.target.closest('[data-home]')){showLanding();return}if(e.target.closest('[data-dashboard]')){renderSection('dashboard');return}const sec=e.target.closest('[data-section]')?.dataset.section;if(sec){if(sec==='deposit'){renderDeposit(false);return}if(sec==='withdraw'){renderDeposit(true);return}renderSection(sec)}});
$('#logout').onclick=()=>{setActual(null);showLanding();notify('Sesión cerrada correctamente.')};$('#help-demo').onclick=()=>notify('Soporte de demostración · Mi Plata');
document.addEventListener('submit',e=>{if(e.target.id==='login-form'){e.preventDefault();const f=new FormData(e.target),user=f.get('usuario'),cl=banco.clientes.find(c=>c.usuario.toLowerCase()===user.toLowerCase());try{const c=banco.autenticar(user,f.get('password'));openApp(c)}catch(err){notify(err.message,'error');const attempts=cl?Math.max(0,3-cl.intentos):3;const el=$('#attempts');if(el)el.textContent=`Intentos disponibles: ${attempts} de 3${cl?.bloqueado?' · usuario bloqueado':''}`}}if(e.target.id==='register-form'){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(d.password!==d.confirm){notify('Las contraseñas no coinciden.','error');return}try{delete d.confirm;const c=banco.crear(d);notify('Cuenta creada. ¡Te damos la bienvenida!');openApp(c)}catch(err){notify(err.message,'error')}}});
showLanding();
