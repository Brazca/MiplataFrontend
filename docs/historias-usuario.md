# Historias de usuario — Mi Plata

Las siguientes historias de usuario describen las funcionalidades principales implementadas en **Mi Plata — Cajero Web**. Están redactadas a partir de las funciones disponibles actualmente en el proyecto.

## US-01 — Registro de usuario
**Como** usuario, **quiero** registrarme en Mi Plata ingresando mis datos personales y una contraseña **para** crear mi cuenta bancaria.

**Prioridad:** Must

### Criterios de aceptación
- El formulario solicita identificación, nombre, celular, usuario y contraseña.
- Se solicita confirmación de la contraseña.
- El usuario debe ser único dentro del sistema.
- Al registrarse correctamente se crean sus productos bancarios.

## US-02 — Inicio de sesión
**Como** usuario registrado, **quiero** iniciar sesión con mi usuario y contraseña **para** acceder de forma segura a mis productos bancarios.

**Prioridad:** Must

### Criterios de aceptación
- El usuario ingresa usuario y contraseña.
- Las credenciales son validadas antes de permitir el acceso.
- Después de tres intentos fallidos la cuenta queda bloqueada.
- Si las credenciales son correctas, se muestra el panel principal.

## US-03 — Consulta de cuentas y saldos
**Como** usuario, **quiero** consultar el resumen de mis cuentas y saldos **para** conocer mi situación financiera actual.

**Prioridad:** Must

### Criterios de aceptación
- Se muestran las cuentas y productos del usuario.
- Se identifica el tipo y número de cada producto.
- Se muestra el saldo disponible.
- La tarjeta de crédito muestra su información disponible.

## US-04 — Consignaciones y retiros
**Como** usuario, **quiero** realizar consignaciones y retiros de mis cuentas **para** administrar mi dinero.

**Prioridad:** Must

### Criterios de aceptación
- Se puede seleccionar la cuenta sobre la cual se realizará la operación.
- El valor debe ser mayor que cero.
- Una consignación aumenta el saldo de la cuenta.
- Un retiro disminuye el saldo y respeta el límite permitido.
- La operación genera un movimiento en el historial.

## US-05 — Transferencias
**Como** usuario, **quiero** transferir dinero a otros clientes o entre mis productos **para** mover mi dinero de manera sencilla.

**Prioridad:** Must

### Criterios de aceptación
- Se selecciona una cuenta de origen.
- Se selecciona el destino de la transferencia.
- El valor debe ser válido y estar disponible en la cuenta de origen.
- Se descuenta el valor de la cuenta de origen.
- Se registra el movimiento correspondiente en las cuentas involucradas.

## US-06 — Historial de movimientos
**Como** usuario, **quiero** consultar mi historial de movimientos **para** conocer las operaciones realizadas en mis cuentas.

**Prioridad:** Must

### Criterios de aceptación
- Los movimientos se muestran ordenados por fecha.
- Cada movimiento muestra fecha, tipo, valor y detalle.
- El usuario puede seleccionar un movimiento para consultar su comprobante.

## US-07 — Comprobantes de operaciones
**Como** usuario, **quiero** consultar y generar un comprobante de mis operaciones **para** tener evidencia de mis transacciones.

**Prioridad:** Should

### Criterios de aceptación
- El comprobante muestra la fecha y hora de la operación.
- Se identifica el producto y el cliente.
- Se muestra el valor, detalle y referencia de la operación.
- El comprobante puede imprimirse.
- El comprobante puede guardarse como imagen PNG.

## US-08 — Compras con tarjeta de crédito
**Como** usuario, **quiero** simular y registrar compras con mi tarjeta de crédito seleccionando el número de cuotas **para** conocer el valor aproximado de cada pago.

**Prioridad:** Must

### Criterios de aceptación
- Se ingresa el valor de la compra.
- Se selecciona el número de cuotas.
- El sistema calcula el valor aproximado de la cuota.
- Se valida que exista cupo disponible.
- La compra se registra como movimiento de la tarjeta.

## US-09 — Perfil y seguridad
**Como** usuario, **quiero** consultar y actualizar mis datos personales y contraseña **para** mantener mi información actualizada y segura.

**Prioridad:** Must

### Criterios de aceptación
- El usuario puede consultar sus datos personales.
- Puede actualizar identificación, nombre, celular y usuario según las validaciones del sistema.
- El cambio de usuario debe respetar la unicidad.
- Para cambiar la contraseña se valida la contraseña actual.
- La nueva contraseña debe confirmarse.

## US-10 — Cierre de sesión
**Como** usuario, **quiero** cerrar sesión **para** proteger mi información cuando termine de utilizar la aplicación.

**Prioridad:** Must

### Criterios de aceptación
- Existe una opción para cerrar sesión.
- La sesión actual termina correctamente.
- El usuario vuelve a la pantalla inicial.

## US-11 — Administración de clientes
**Como** administrador, **quiero** consultar y gestionar los clientes del sistema **para** administrar la plataforma.

**Prioridad:** Must

### Criterios de aceptación
- El administrador puede consultar los clientes registrados.
- Puede buscar y revisar información de los usuarios.
- Puede crear y editar clientes.
- Puede bloquear y desbloquear usuarios.
- Puede consultar sus productos y saldos.

## US-12 — Administración del sistema
**Como** administrador, **quiero** consultar estadísticas, aplicar intereses, exportar movimientos y restaurar los datos de demostración **para** administrar y supervisar el sistema.

**Prioridad:** Should

### Criterios de aceptación
- Se muestran estadísticas generales de los clientes y productos.
- El administrador puede aplicar el interés configurado para las cuentas de ahorro.
- Se pueden exportar datos y movimientos en formato CSV.
- Se puede restaurar la información de demostración.

---

## Relación con la implementación

| Historia | Implementación principal |
|---|---|
| US-01 | `Banco.crear()` |
| US-02 | `Banco.autenticar()` |
| US-03 | `renderDashboard()` |
| US-04 | `consignar()` / `retirar()` |
| US-05 | `renderTransfer()` |
| US-06 | `renderMovements()` |
| US-07 | `openReceipt()` / `downloadReceipt()` |
| US-08 | `TarjetaCredito.comprar()` |
| US-09 | `renderProfile()` |
| US-10 | `logout` |
| US-11 | `renderAdmin()` / `adminAction()` |
| US-12 | `exportAdminCSV()` / `aplicarInteres()` |
