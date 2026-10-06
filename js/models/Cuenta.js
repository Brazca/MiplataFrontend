/**
 * Modelos de dominio del sistema bancario.
 * Estas clases contienen únicamente datos y reglas de negocio.
 */
import { uid } from '../utils.js';

/** Representa una operación registrada en una cuenta. */
export class Movimiento {
  constructor(tipo,valor,detalle='') {
    this.id=uid();
    this.fecha=new Date().toISOString();
    this.tipo=tipo;
    this.valor=Number(valor);
    this.detalle=detalle
  }
}
/* =========================================================
   3. MODELO: CUENTAS
   ========================================================= */
/** Clase base para los productos bancarios del sistema. */
export class Cuenta {
  #saldo;
  #movimientos;
  constructor( {
    id=uid(),tipo='Cuenta',numero, saldo=0, cupo=0, movimientos=[]
  }
  ) {
    this.id=id;
    this.tipo=tipo;
    this.numero=numero||('•••• '+String(Math.floor(1000+Math.random()*9000)));
    this.#saldo=Number(saldo);
    this.cupo=Number(cupo);
    this.#movimientos=movimientos.map(m=>Object.assign(new Movimiento(m.tipo,m.valor,m.detalle),m))
  }
  get saldo() {
    return this.#saldo
  }
  get movimientos() {
    return [...this.#movimientos].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha))
  }
  registrar(tipo,valor,detalle='') {
    this.#movimientos.push(new Movimiento(tipo,valor,detalle))
  }
  consignar(monto) {
    if(!Number.isFinite(monto)||monto<=0)throw Error('Ingresa un monto mayor a cero.');
    this.#saldo+=monto;
    this.registrar('Consignación',monto);
    return this.#saldo
  }
  retirar(monto) {
    if(!Number.isFinite(monto)||monto<=0)throw Error('Ingresa un monto mayor a cero.');
    if(monto>this.limiteRetiro())throw Error('El monto supera el límite de retiro disponible.');
    this.#saldo-=monto;
    this.registrar('Retiro',monto);
    return this.#saldo
  }
  limiteRetiro() {
    return this.#saldo
  }
  aplicarDelta(n) {
    this.#saldo+=n
  }
  toJSON() {
    return  {
      id:this.id,tipo:this.tipo,numero:this.numero,saldo:this.#saldo,cupo:this.cupo,movimientos:this.#movimientos
    }
  }
}
/** Cuenta de ahorros con rendimiento mensual y retiro limitado al saldo. */
export class CuentaAhorros extends Cuenta {
  constructor(o= {
  }
  ) {
    super( {
      ...o,tipo:'Ahorros'
    }
    )
  }
  limiteRetiro() {
    return this.saldo
  }
  retirar(monto) {
    if(monto>this.saldo)throw Error('Saldo insuficiente para este retiro.');
    return super.retirar(monto)
  }
  aplicarInteres() {
    const interes=this.saldo*.015;
    this.aplicarDelta(interes);
    this.registrar('Interés',interes,'Rendimiento mensual 1,5%');
    return interes
  }
}
/** Cuenta corriente que permite un límite de retiro equivalente al 120% del saldo. */
export class CuentaCorriente extends Cuenta {
  constructor(o= {
  }
  ) {
    super( {
      ...o,tipo:'Corriente'
    }
    )
  }
  limiteRetiro() {
    return this.saldo*1.2
  }
}
/** Producto de crédito que controla cupo, compras y cuotas. */
export class TarjetaCredito extends Cuenta {
  constructor(o= {
  }
  ) {
    super( {
      ...o,tipo:'Crédito',cupo:o.cupo||3000000
    }
    )
  }
  get disponible() {
    return Math.max(0,this.cupo-this.saldo)
  }
  comprar(valor,cuotas) {
    if(valor<=0||!Number.isFinite(valor))throw Error('Ingresa un valor de compra válido.');
    if(valor>this.disponible)throw Error('La compra supera el cupo disponible.');
    if(!Number.isInteger(cuotas)||cuotas<1)throw Error('Selecciona un número válido de cuotas.');
    const tasa=cuotas<=2?0:cuotas<=6?.019:.023;
    const pago=tasa===0?valor/cuotas:(valor*tasa)/(1-Math.pow(1+tasa,-cuotas));
    this.aplicarDelta(valor);
    this.registrar('Compra',valor,`${cuotas} cuotas · ${money(pago)}/mes`);
    return  {
      pago,tasa
    }
  }
  toJSON() {
    return  {
      ...super.toJSON(),cupo:this.cupo
    }
  }
}
