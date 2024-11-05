class Vehiculo {
    constructor(id,modelo,anoFabricacion,velMax){
        this.id = id;
        this.modelo = modelo;
        this.anoFabricacion =anoFabricacion;
        this.velMax = velMax;
    }

    toString() {
        return `Nombre: ${this.modelo}, Apellido: ${this.anoFabricacion}, Edad: ${this.velMax}`;
    }

}

class Auto extends Vehiculo {
    constructor(id, modelo, anoFabricacion, velMax, cantidadPuertas, asientos) {
        super(id, modelo, anoFabricacion, velMax);
        this.cantidadPuertas = cantidadPuertas;
        this.asientos = asientos;
    }
    toString() {
        return `${super.toString()}, Canridad Puertas: ${this.cantidadPuertas}, Asientos: ${this.asientos}`;
    }
}
class Camion extends Vehiculo {
    constructor(id, modelo, anoFabricacion, velMax, carga, autonomia) {
        super(id, modelo, anoFabricacion, velMax);
        this.carga = carga;
        this.autonomia = autonomia;
    }

    toString() {
        return `${super.toString()}, Carga: ${this.carga}, Autonomia: ${this.autonomia}`;
    }
}
function parsearJson(jsonString) {
    const autoMoviles = JSON.parse(jsonString);

    const objetos = autoMoviles.map(autoMoviles => {
        if (autoMoviles.cantidadPuertas !== undefined && autoMoviles.asientos !== undefined) {
            return new Auto(autoMoviles.id, autoMoviles.modelo, autoMoviles.anoFabricacion, autoMoviles.velMax, autoMoviles.cantidadPuertas, autoMoviles.asientos);
        } else if (autoMoviles.carga !== undefined && autoMoviles.autonomia !== undefined) {
            return new Camion(autoMoviles.id, autoMoviles.modelo, autoMoviles.anoFabricacion, autoMoviles.velMax, autoMoviles.carga, autoMoviles.autonomia);
        } else {
            return null;
        }
    });

    return objetos.filter(obj => obj !== null);
}

let listaVehiculos = [];
function cargarVehiculos() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://examenesutn.vercel.app/api/VehiculoAutoCamion"); 
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                listaVehiculos = parsearJson(xhr.responseText); // Asigna la lista parseada a la variable global
                dibujarDatos("todos"); // Dibuja todos los datos tras cargar
            } else {
                alert("Error al cargar datos. Código de estado: " + xhr.status);
            }
        }
    };
    xhr.send();
}

function mostrarABM() {
    document.getElementById("formularioLista").style.display = "none";
    document.getElementById("formABM").style.display = "block";
    document.getElementById("Modificar").style.display = "none";
    document.getElementById("Eliminar").style.display = "none";
    document.getElementById("Aceptar").style.display = "inline";
    
    actualizarLabels("camion");
}

function actualizarLabels(tipo) {
    const labelAtributo5 = document.getElementById("labelAtributo5");
    const inputAtributo5 = document.getElementById("atributo5");

    const labelAtributo6 = document.getElementById("labelAtributo6");
    const inputAtributo6 = document.getElementById("atributo6");

    if (tipo === "auto") {
        labelAtributo5.textContent = "Cantidad de puertas:";
        inputAtributo5.placeholder = "Ingrese cantidad de puertas";

        labelAtributo6.textContent = "Asientos:";
        inputAtributo6.placeholder = "Ingrese cantidad de asientos";
    } else if (tipo === "camion") {
        labelAtributo5.textContent = "Carga:";
        inputAtributo5.placeholder = "Ingrese la carga";

        labelAtributo6.textContent = "Autonomia:";
        inputAtributo6.placeholder = "Ingrese la autonomia";
    }
}


async function aceptarABM() {
    if (!validar()) return; 

    const modelo = document.getElementById("modeloABM").value.trim();
    const anoFabricacion = document.getElementById("anoFabricacionABM").value.trim();
    const velMax = document.getElementById("velMaxABM").value.trim();
    const tipo = document.getElementById("tipo").value;

    let nuevoObjeto;

    if (tipo === "auto") {
        const cantidadPuertas = parseInt(document.getElementById("atributo5").value.trim());
        const asientos = parseInt(document.getElementById("atributo6").value.trim());
        nuevoObjeto = { modelo, anoFabricacion, velMax, cantidadPuertas, asientos };  
    } else if (tipo === "camion") {
        const carga = parseFloat(document.getElementById("atributo5").value.trim());
        const autonomia = parseFloat(document.getElementById("atributo6").value.trim());
        nuevoObjeto = { modelo, anoFabricacion, velMax, carga, autonomia };  
    }

    document.getElementById('spinnerContainer').style.display = 'flex';

    try {
        const response = await fetch("https://examenesutn.vercel.app/api/VehiculoAutoCamion", {
            method: "POST",  
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoObjeto)
        });

        if (!response.ok) {
            throw new Error("No se pudo realizar la operación");
        }

        const data = await response.json(); 

        nuevoObjeto.id = data.id;

        let nuevoVehiculo;  

        if (tipo === "auto") {
            nuevoVehiculo = new Auto(data.id, modelo, anoFabricacion, velMax, nuevoObjeto.cantidadPuertas, nuevoObjeto.asientos);
        } else {
            nuevoVehiculo = new Camion(data.id, modelo, anoFabricacion, velMax, nuevoObjeto.carga, nuevoObjeto.autonomia);
        }

        listaVehiculos.push(nuevoVehiculo);
        dibujarDatos("todos");

        document.getElementById('formABM').style.display = 'none';  
        document.getElementById('formularioLista').style.display = 'block'; 
    } catch (error) {
        console.warn(error.message);
        alert("No se pudo realizar la operación.");
    } finally {
        document.getElementById('spinnerContainer').style.display = 'none';
    }

    cancelarABM();
}

function validar() {
    // Obtener los valores de los campos comunes
    const modelo = document.getElementById("modeloABM").value.trim();
    const anoFabricacion = document.getElementById("anoFabricacionABM").value.trim();
    const velMax = document.getElementById("velMaxABM").value.trim();

    // Verificar que los campos comunes no estén vacíos
    if (!modelo || !anoFabricacion || !velMax) {
        alert("Todos los campos comunes deben estar completos.");
        return false;
    }

    const anoFabricacionNum = parseInt(anoFabricacion, 10);
    const velMaxNum = parseFloat(velMax);

    if (isNaN(anoFabricacionNum) || anoFabricacionNum <= 1985) {
        alert("El año de fabricación debe ser mayor a 1985.");
        return false;
    }

    if (isNaN(velMaxNum) || velMaxNum <= 0) {
        alert("La velocidad máxima debe ser mayor a 0.");
        return false;
    }

    const tipoSeleccionado = document.getElementById("tipo").value;
    if (!tipoSeleccionado) {
        alert("Por favor, seleccione un tipo (Auto o Camion).");
        return false;
    }

    const atributo5 = document.getElementById("atributo5").value.trim();
    const atributo6 = document.getElementById("atributo6").value.trim();

    if (!atributo5 || !atributo6) {
        alert("Todos los campos específicos del tipo seleccionado deben estar completos.");
        return false;
    }

    if (tipoSeleccionado === "auto") {
        const cantidadPuertas = parseInt(atributo5, 10);
        const asientos = parseInt(atributo6, 10);

        if (isNaN(cantidadPuertas) || cantidadPuertas <= 2) {
            alert("La cantidad de puertas debe ser mayor a 2.");
            return false;
        }

        if (isNaN(asientos) || asientos <= 2) {
            alert("La cantidad de asientos debe ser mayor a 2.");
            return false;
        }
    }

    if (tipoSeleccionado === "camion") {
        const carga = parseFloat(atributo5);
        const autonomia = parseFloat(atributo6);

        if (isNaN(carga) || carga <= 0) {
            alert("La carga debe ser mayor a 0.");
            return false;
        }

        if (isNaN(autonomia) || autonomia <= 0) {
            alert("La autonomía debe ser mayor a 0.");
            return false;
        }
    }
    return true;
}

function cancelarABM() {
    document.getElementById("formABM").style.display = "none";
    document.getElementById("formularioLista").style.display = "block";

    document.getElementById("id").value = ""; 
    document.getElementById("modeloABM").value = "";
    document.getElementById("anoFabricacionABM").value = "";
    document.getElementById("velMaxABM").value = "";
    document.getElementById("atributo5").value = "";
    document.getElementById("atributo6").value = ""; 
}

function filtrar(tipo) {
    let objetosValidos;

    if (tipo === "autos") {
        objetosValidos = listaVehiculos.filter(vehiculo => vehiculo instanceof Auto);
    } else if (tipo === "camiones") {
        objetosValidos = listaVehiculos.filter(vehiculo => vehiculo instanceof Camion);
    } else {
        objetosValidos = listaVehiculos;
    }
    return objetosValidos;
}

function dibujarDatos(tipo) {
    const array = filtrar(tipo);

    let tabla = document.getElementById("tablaDatos");
    tabla.innerHTML = ''; 

    array.forEach(element => {
        console.log("Elemento a dibujar:", element); 
        var fila = document.createElement("tr");

        let celdaID = document.createElement("td");
        celdaID.textContent = element.id;
        fila.appendChild(celdaID);

        let celdaModelo = document.createElement("td");
        celdaModelo.textContent = element.modelo;
        fila.appendChild(celdaModelo);

        let celdaAnoFabricacion = document.createElement("td");
        celdaAnoFabricacion.textContent = element.anoFabricacion;
        fila.appendChild(celdaAnoFabricacion);

        let celdaVelMax = document.createElement("td");
        celdaVelMax.textContent = element.velMax;
        fila.appendChild(celdaVelMax);

        let celdaCantidadPuertas = document.createElement("td");
        if (element instanceof Auto) {
            celdaCantidadPuertas.textContent = element.cantidadPuertas;
        } else {
            celdaCantidadPuertas.textContent = "N/A";
        }
        fila.appendChild(celdaCantidadPuertas);

        let celdaAsientos = document.createElement("td");
        if (element instanceof Auto) {
            celdaAsientos.textContent = element.asientos;
        } else {
            celdaAsientos.textContent = "N/A";
        }
        fila.appendChild(celdaAsientos);

        let celdaCarga = document.createElement("td");
        if (element instanceof Camion) {
            celdaCarga.textContent = element.carga;
        } else {
            celdaCarga.textContent = "N/A";
        }
        fila.appendChild(celdaCarga);

let celdaAutonomia = document.createElement("td");
if (element instanceof Camion) {
    celdaAutonomia.textContent = element.autonomia;
} else {
    celdaAutonomia.textContent = "N/A";
}
fila.appendChild(celdaAutonomia);

        let celdaModificar = document.createElement("td");
        let btnModificar = document.createElement("button");
        btnModificar.textContent = "Modificar";
        btnModificar.onclick = (e) => {
            e.stopPropagation();
            modificarABM(element); 
        };
        celdaModificar.appendChild(btnModificar);
        fila.appendChild(celdaModificar);

        
        let celdaEliminar = document.createElement("td");
        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = (e) => {
            e.stopPropagation(); 
            eliminarABM(element.id);
        };
        celdaEliminar.appendChild(btnEliminar);
        fila.appendChild(celdaEliminar);

        tabla.appendChild(fila); 
    });
}

document.addEventListener("DOMContentLoaded", function() {
    cargarVehiculos();
});

async function eliminarABM() {
    const id = document.getElementById("id").value; 
    document.getElementById('spinnerContainer').style.display = 'flex'; 

    try {
        const response = await fetch(`https://examenesutn.vercel.app/api/VehiculoAutoCamion/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const objetoIndex = listaVehiculos.findIndex(obj => obj.id == id);
            if (objetoIndex !== -1) {
                listaVehiculos.splice(objetoIndex, 1); 
                dibujarDatos("todos"); 
                cancelarABM(); 
            }
        } else {
            const errorMessage = await response.text(); 
            alert(`No se pudo realizar la operación: ${errorMessage}`);
            cancelarABM(); 
        }
    } catch (error) {
        console.error('Error:', error);
        alert("No se pudo realizar la operación.");
        cancelarABM(); 
    } finally {
        document.getElementById('spinnerContainer').style.display = 'none'; 
    }
}