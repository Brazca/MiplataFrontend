//FUNCIONES INICIO SESION Y REGISTRO
function iniciarSesion() {
    let datosGuardados = localStorage.getItem("usuarios");
        if (datosGuardados === null) {
        alert("No hay ningún usuario registrado");
        return;
        }
    let usuarios= JSON.parse(datosGuardados);
    let intentos = 0;
    while (intentos < 3) {
        let nombreIngresado = prompt("Ingrese su nombre de usuario:");
        let claveIngresada = prompt("Ingrese su clave:");
        let usuarioEncontrado = null;
        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].nombre === nombreIngresado) {
                usuarioEncontrado = usuarios[i];
                break;
            }
        }
        if (usuarioEncontrado === null) {
            alert("Usuario no encontrado");
            intentos++;
            alert("Intento " + intentos + " de 3");
            continue;
        }
        if (
        claveIngresada === usuarioEncontrado.clave
        ) {
            alert("Inicio de sesión exitoso");
            menuPrincipal(usuarioEncontrado, usuarios);
            break;
        } else {
            alert("Usuario o clave incorrectos");
            intentos++;
            alert("Intento " + intentos + " de 3");
        }
    }
    if (intentos === 3) {
    alert("Cuenta bloqueada por 24 horas, comunícate con tu banco");
    }
}

function registrarUsuario() {
    let nombre = prompt("Ingrese su nombre de usuario:");
    if (nombre === null) {
    alert("Registro cancelado");
    return;
    }
    if (nombre === "") {
    alert("El nombre no puede estar vacío");
        return;
    }
    let clave = prompt("Ingrese su clave:");
    if (clave === null) {
    alert("Registro cancelado");
    return;
    }   
    if (clave === "") {
        alert("La clave no puede estar vacía");
        return;
    }
    let saldo = Number(prompt("Ingrese su saldo inicial:"));
    if (isNaN(saldo) || saldo < 0) {
        alert("Por favor, ingrese un saldo válido");
        return;
    }
    //USUARIO GUARDADO EN LOCAL STORAGE
    let usuarios = [];
    let datosGuardados = localStorage.getItem("usuarios");
    if (datosGuardados !== null) {
        usuarios = JSON.parse(datosGuardados);
    }
    for (let i = 0; i < usuarios.length; i++) {

    if (usuarios[i].nombre === nombre) {
        alert("El usuario ya existe");
        return;
    }
}
    let usuario = {
    nombre: nombre,
    clave: clave,
    saldo: saldo,
    movimientos: []
    };
    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert(
    "Usuario registrado correctamente" +
    "\nUsuario: " + usuario.nombre +
    "\nSaldo: $" + usuario.saldo
    );
}

//funcion consultar saldo
function consultarSaldo(usuario) {
    alert("Su saldo actual es: $" + usuario.saldo);
}

//funcion retirar dinero
function retirarDinero(usuario, usuarios) {
    let monto = Number(prompt("Ingrese el monto a retirar:"));
        if (isNaN(monto) || monto <= 0) {
        alert("Ingrese un monto válido");
        return;
        }
    if (monto > usuario.saldo) {
    alert("Saldo insuficiente");
    return;
    } 
        usuario.saldo -= monto;
        let movimiento = {
        tipo: "Retiro",
        monto: monto,
        fecha: new Date()
    };
    usuario.movimientos.push(movimiento);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Retiro exitoso. Su nuevo saldo es: $" + usuario.saldo);
}

//funcion consignar dinero
function consignarDinero(usuario, usuarios) {
    let monto = Number(prompt("Ingrese el monto a consignar:"));
    if (isNaN(monto) || monto <= 0) {
        alert("Ingrese un monto válido");
        return;
    }
    usuario.saldo += monto;
        let movimiento = {
        tipo: "Consignación",
        monto: monto,
        fecha: new Date()
        };
    usuario.movimientos.push(movimiento);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    alert("Consignación exitosa. Su nuevo saldo es: $" + usuario.saldo);
}

//funcion consultar movimientos
function consultarMovimientos(usuario) {
    if (usuario.movimientos.length === 0) {
    alert("No hay movimientos registrados");
    return;
    }
    let historial = "";
    for (let i = 0; i < usuario.movimientos.length; i++) {
        historial +=
        "Tipo: " + usuario.movimientos[i].tipo +
        "\nMonto: $" + usuario.movimientos[i].monto +
        "\nFecha: " + new Date(usuario.movimientos[i].fecha).toLocaleString() +
        "\n\n";
    }
    alert("Historial de movimientos:\n" + historial);
}

//funcion menu principal
function menuPrincipal(usuario, usuarios){
    let opcion;
    do {
        opcion = prompt(
            "===== MI PLATA =====\n\n" +
            "1. Retirar dinero\n" +
            "2. Consultar saldo\n" +
            "3. Consignar dinero\n" +
            "4. Consultar movimientos\n" +
            "5. Salir\n\n" +
            "Seleccione una opción:"
        );      
        if (opcion === "1") {
            retirarDinero(usuario, usuarios);

        } else if (opcion === "2") {
            consultarSaldo(usuario);

        } else if (opcion === "3") {
            consignarDinero(usuario, usuarios)

        } else if (opcion === "4") {
            consultarMovimientos(usuario);

        } else if (opcion === "5") {
            alert("Hasta luego");

        } else {
            alert("Opción no válida");
        }
    } while (opcion !== "5");
}

//MENU INICIO SESIÓN
let opcion = prompt(
    "===== MI PLATA =====\n\n" +
    "1. Iniciar sesión\n" +
    "2. Registrar usuario\n" +
    "3. Salir\n\n" +
    "Seleccione una opción:"
);

//VALIDACIÓN DE OPCIÓN, LLAMADO A FUNCIONES DE INICIO SESIÓN Y REGISTRO
if (opcion === "1") {
    iniciarSesion();
}

if (opcion === "2") {
    registrarUsuario();
}

if (opcion === "3") {
    alert("Hasta luego");
}

