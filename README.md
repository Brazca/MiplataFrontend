## Diagrama UML

```mermaid
classDiagram
    class Banco {
        +clientes
        +hidratar()
        +guardar()
        +crear(d)
        +autenticar(usuario, clave)
    }

    class Cliente {
        -password
        +id
        +cedula
        +nombre
        +celular
        +usuario
        +bloqueado
        +intentos
        +esAdmin
        +cuentas
        +validarClave(clave)
        +cambiarClave(clave)
        +cuentaPrincipal
        +toJSON()
    }

    class Cuenta {
        -saldo
        -movimientos
        +id
        +tipo
        +numero
        +cupo
        +registrar(tipo, valor, detalle)
        +consignar(monto)
        +retirar(monto)
        +limiteRetiro()
        +aplicarDelta(n)
        +toJSON()
    }

    class CuentaAhorros {
        +limiteRetiro()
        +retirar(monto)
        +aplicarInteres()
    }

    class CuentaCorriente {
        +limiteRetiro()
    }

    class TarjetaCredito {
        +disponible
        +comprar(valor, cuotas)
        +toJSON()
    }

    class Movimiento {
        +id
        +fecha
        +tipo
        +valor
        +detalle
    }

    class CuentaFactory {
        <<function>>
        +CuentaFactory(o)
    }

    Banco "1" *-- "*" Cliente : administra
    Cliente "1" *-- "*" Cuenta : posee
    Cuenta "1" *-- "*" Movimiento : registra
    Cuenta <|-- CuentaAhorros
    Cuenta <|-- CuentaCorriente
    Cuenta <|-- TarjetaCredito
    CuentaFactory ..> CuentaAhorros : crea
    CuentaFactory ..> CuentaCorriente : crea
    CuentaFactory ..> TarjetaCredito : crea
```

## 📋 Historias de usuario

El proyecto cuenta con 12 historias de usuario que describen las principales funcionalidades de **Mi Plata**.

👉 [Ver historias de usuario](docs/historias-usuario.md)

## 🖥️ Maqueta responsive

La maqueta del proyecto presenta la interfaz de **Mi Plata** para diferentes tamaños de pantalla: escritorio, tablet y smartphone.

👉 [Ver maqueta responsive](docs/maqueta.png)

## 👥 Roles del equipo

### José Berrío
- Desarrollo de la estructura HTML.
- Participación en la programación JavaScript.

### Juan Pablo Quiceno
- Desarrollo de gran parte de la lógica JavaScript.
- Construcción de la maquetación e interfaz del proyecto.

### Braian Ocampo
- Participación en el desarrollo JavaScript.
- Elaboración del diagrama UML.
- Elaboración de las historias de usuario.

### Trabajo colaborativo
- Construcción y diseño de los estilos CSS.
- Pruebas y ajustes visuales del proyecto.
- Integración de los diferentes componentes.
