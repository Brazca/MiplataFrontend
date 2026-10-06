/**
 * Servicio principal del banco.
 * Gestiona clientes, autenticación y persistencia en localStorage.
 */
import { STORE_KEY } from '../utils.js';
import { Cliente } from '../models/Cliente.js';

   ========================================================= */
/** Gestiona clientes, autenticación y persistencia local de la aplicación. */
export class Banco {
  constructor() {
    this.clientes=[];
    this.hidratar()
  }
  hidratar() {
    try {
      const raw=JSON.parse(localStorage.getItem(STORE_KEY));
      if(raw)this.clientes=raw.map(c=>new Cliente(c))
    } catch(e) {
      this.clientes=[]
    }
    if(!this.clientes.length) {
      this.clientes=[new Cliente( {
        id:'demo',cedula:'100200300',nombre:'Valentina Ríos',celular:'3001234567',usuario:'valentina',password:'demo1234',esAdmin:true,cuentas:[ {
          tipo:'Ahorros',saldo:4850000,movimientos:[ {
            id:'a',fecha:new Date(Date.now()-86400000).toISOString(),tipo:'Consignación',valor:750000,detalle:'Abono recibido'
          }
          , {
            id:'b',fecha:new Date(Date.now()-172800000).toISOString(),tipo:'Retiro',valor:85000,detalle:'Compra en comercio'
          }
          ]
        }
        , {
          tipo:'Corriente',saldo:1350000,movimientos:[]
        }
        , {
          tipo:'Crédito',saldo:420000,cupo:3000000,movimientos:[]
        }
        ]
      }
      )];
      this.guardar()
    }
  }
  guardar() {
    localStorage.setItem(STORE_KEY,JSON.stringify(this.clientes))
  }
  crear(d) {
    if(this.clientes.some(c=>c.usuario.toLowerCase()===d.usuario.toLowerCase()))throw Error('Ese nombre de usuario ya está ocupado.');
    const c=new Cliente( {
      ...d,cuentas:[ {
        tipo:'Ahorros',saldo:0
      }
      , {
        tipo:'Corriente',saldo:0
      }
      , {
        tipo:'Crédito',saldo:0,cupo:3000000
      }
      ]
    }
    );
    this.clientes.push(c);
    this.guardar();
    return c
  }
  autenticar(usuario,clave) {
    const c=this.clientes.find(x=>x.usuario.toLowerCase()===usuario.toLowerCase());
    if(!c)throw Error('Usuario o contraseña incorrectos.');
    if(c.bloqueado)throw Error('Usuario bloqueado después de tres intentos fallidos.');
    if(!c.validarClave(clave)) {
      c.intentos++;
      if(c.intentos>=3) {
        c.bloqueado=true;
        this.guardar();
        throw Error('Se agotaron los intentos. Tu usuario quedó bloqueado.')
      }
      this.guardar();
      throw Error(`Usuario o contraseña incorrectos. Intentos restantes: ${3-c.intentos}.`)
    }
    c.intentos=0;
    this.guardar();
    return c
  }
}
