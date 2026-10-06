/**
 * Modelo de cliente.
 */
import { CuentaFactory } from './factories.js';

/** Representa al usuario bancario y sus productos asociados. */
export class Cliente {
  #password;
  constructor(o) {
    Object.assign(this, {
      id:o.id||uid(),cedula:o.cedula||'',nombre:o.nombre||'',celular:o.celular||'',usuario:o.usuario||'',bloqueado:!!o.bloqueado,intentos:o.intentos||0,esAdmin:!!o.esAdmin
    }
    );
    this.#password=o.password||'';
    this.cuentas=(o.cuentas||[]).map(CuentaFactory);
  }
  validarClave(clave) {
    return this.#password===clave
  }
  cambiarClave(clave) {
    this.#password=clave
  }
  get password() {
    return this.#password
  }
  get cuentaPrincipal() {
    return this.cuentas.find(c=>c.tipo==='Ahorros')||this.cuentas[0]
  }
  toJSON() {
    return  {
      id:this.id,cedula:this.cedula,nombre:this.nombre,celular:this.celular,usuario:this.usuario,password:this.#password,bloqueado:this.bloqueado,intentos:this.intentos,esAdmin:this.esAdmin,cuentas:this.cuentas.map(c=>c.toJSON())
    }
  }
}
