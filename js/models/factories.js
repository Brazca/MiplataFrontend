/**
 * Factory responsable de crear el tipo de cuenta adecuado.
 */
import { CuentaAhorros, CuentaCorriente, TarjetaCredito } from './Cuenta.js';

/* =========================================================
   5. FACTORY DE CUENTAS
   ========================================================= */
/** Crea la clase de cuenta adecuada según el tipo recibido. */
export function CuentaFactory(o) {
  return o.tipo==='Corriente'?new CuentaCorriente(o):o.tipo==='Crédito'?new TarjetaCredito(o):new CuentaAhorros(o)
}
/* =========================================================
