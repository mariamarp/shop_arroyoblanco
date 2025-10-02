
let catalogo = [];
let carrito = [];
let usuarioLogueado = null; 


const USUARIO_SIMULADO = 'cliente';
const CLAVE_SIMULADA = '1234';
const TOTAL_MINIMO_DESCUENTO = 3; 
const PORCENTAJE_DESCUENTO = 0.20;


function guardarLS(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function leerLS(clave) {
    return JSON.parse(localStorage.getItem(clave)) || null; 
}


async function cargarCatalogo() {
    try {
        const response = await fetch('productos.json');
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        catalogo = await response.json();
        guardarLS("AB_CATALOG", catalogo);
        aplicaBusquedaYOrden();
    } catch (error) {
        document.getElementById("catalogo").innerHTML = `<p class="text-danger">Error al cargar el catálogo de productos. Asegúrate de usar Live Server.</p>`;
    }
}

function renderCatalogo(lista) {
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    lista.forEach((prod) => {
        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
            <div class="card h-100">
                <img src="${prod.img}" class="card-img-top" alt="${prod.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${prod.nombre}</h5>
                    <p class="card-text">$${prod.precio.toLocaleString('es-AR')}</p>
                    <button class="btn btn-agregar mt-auto" data-id="${prod.id}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function aplicaBusquedaYOrden() {
    const texto = document.getElementById("busqueda").value.toLowerCase();
    const orden = document.getElementById("orden").value;

    let lista = catalogo.filter((p) => p.nombre.toLowerCase().includes(texto));

    if (orden === "precio-asc") lista.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") lista.sort((a, b) => b.precio - a.precio);
    if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));

    renderCatalogo(lista);
}


function calcularTotalCarrito() {
    let subtotal = 0;
    let totalProductos = 0;
    
    carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;
        totalProductos += item.cantidad;
    });

    let descuento = 0;
    
    if (totalProductos >= TOTAL_MINIMO_DESCUENTO) {
        descuento = subtotal * PORCENTAJE_DESCUENTO;
    }
    
    const totalFinal = subtotal - descuento;
    
    return {
        subtotal: subtotal,
        descuento: descuento,
        totalFinal: totalFinal,
        aplicaDescuento: totalProductos >= TOTAL_MINIMO_DESCUENTO,
        productos: totalProductos
    };
}


function renderCarrito() {
    const lista = document.getElementById("listaCarrito");
    lista.innerHTML = "";

    const totales = calcularTotalCarrito(); 
    
    carrito.forEach((item) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center mb-2 p-3 border rounded";
        

        li.innerHTML = `
            <div>
                <h6 class="mb-1">${item.nombre}</h6>
                <div class="input-group input-group-sm" style="width: 130px;">
                    <button class="btn btn-outline-secondary btn-restar" data-id="${item.id}" type="button">-</button>
                    <span class="form-control text-center">${item.cantidad}</span>
                    <button class="btn btn-outline-secondary btn-sumar" data-id="${item.id}" type="button">+</button>
                </div>
            </div>
            
            <div class="text-end">
                <span class="d-block fw-bold">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                <button class="btn btn-sm btn-danger mt-1 btn-eliminar" data-id="${item.id}">
                    Eliminar
                </button>
            </div>
        `;
        lista.appendChild(li);
    });

    document.getElementById("totalCarrito").innerText = `Total: $${totales.totalFinal.toLocaleString('es-AR')}`; 

    guardarLS("AB_CART", carrito);
    actualizarVistaCheckout();
    generarResumenCompra(totales); 
    
    agregarListenersCarrito();
}

function agregarAlCarrito(id) {
    const producto = catalogo.find((p) => p.id === id);
    const existente = carrito.find((item) => item.id === id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    Toastify({
        text: `✅ ${producto.nombre} añadido`,
        duration: 2000,
        gravity: "top",
        position: "right",
        style: { background: "#082d26" }
    }).showToast();

    renderCarrito();
}


function actualizarCantidad(id, operacion) {
    const itemIndex = carrito.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return; 

    const item = carrito[itemIndex];

    if (operacion === 'sumar') {
        item.cantidad++;
        Toastify({ text: `+1 de ${item.nombre}`, duration: 1000, style: { background: "#082d26" } }).showToast();
    } else if (operacion === 'restar') {
        item.cantidad--;
        Toastify({ text: `-1 de ${item.nombre}`, duration: 1000, style: { background: "#082d26" } }).showToast();
        
        if (item.cantidad <= 0) {
            carrito.splice(itemIndex, 1);
            Toastify({ text: `${item.nombre} eliminado`, duration: 2000, style: { background: "#dc3545" } }).showToast();
        }
    }
    
    renderCarrito();
}

function eliminarProducto(id) {
    const itemIndex = carrito.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        const nombre = carrito[itemIndex].nombre;
        carrito.splice(itemIndex, 1);
        Toastify({ text: `${nombre} eliminado por completo.`, duration: 3000, style: { background: "#dc3545" } }).showToast();
    }
    renderCarrito();
}

function agregarListenersCarrito() {

    document.querySelectorAll(".btn-sumar").forEach(button => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            actualizarCantidad(id, 'sumar');
        });
    });


    document.querySelectorAll(".btn-restar").forEach(button => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            actualizarCantidad(id, 'restar');
        });
    });

    document.querySelectorAll(".btn-eliminar").forEach(button => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            eliminarProducto(id);
        });
    });
}



function generarResumenCompra(totales) { 
    const resumenDiv = document.getElementById("resumenCompra");
    
    if (carrito.length === 0) {
        resumenDiv.innerHTML = '<p class="text-muted mb-0">El carrito está vacío.</p>';
        return;
    }

    let detalleHTML = '<ul class="list-unstyled small">';
    carrito.forEach(item => {
        detalleHTML += `
            <li class="d-flex justify-content-between">
                <span>${item.nombre} x${item.cantidad}</span>
                <span>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
            </li>
        `;
    });
    detalleHTML += '</ul>';

    let descuentoHTML = '';
    if (totales.aplicaDescuento) {
        descuentoHTML = `
            <div class="d-flex justify-content-between text-success fw-bold">
                <span>Descuento 20% (${totales.productos} prod.):</span>
                <span>- $${totales.descuento.toLocaleString('es-AR')}</span>
            </div>
        `;
    } else if (totales.productos > 0) {
         const faltan = TOTAL_MINIMO_DESCUENTO - totales.productos;
         descuentoHTML = `<p class="small text-muted mb-0">Agrega ${faltan} producto(s) más para obtener 20% OFF.</p>`;
    }

    resumenDiv.innerHTML = `
        ${detalleHTML}
        <div class="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>$${totales.subtotal.toLocaleString('es-AR')}</span>
        </div>
        ${descuentoHTML}
        <hr class="my-1">
        <div class="d-flex justify-content-between fw-bold fs-5">
            <span>TOTAL A PAGAR:</span>
            <span>$${totales.totalFinal.toLocaleString('es-AR')}</span>
        </div>
    `;
}

function actualizarVistaCheckout() {
    const loginDiv = document.getElementById('loginSimulado');
    const checkoutForm = document.getElementById('formCheckout');
    
    if (usuarioLogueado) {
        loginDiv.style.display = 'none';
        checkoutForm.style.display = 'flex'; 
        
        document.getElementById('nombreCliente').value = usuarioLogueado.charAt(0).toUpperCase() + usuarioLogueado.slice(1) + " Pérez";
        document.getElementById('emailCliente').value = `${usuarioLogueado}@arroyoblanco.com`;
        document.getElementById("mensajeCompra").innerHTML = '';
        
    } else {
        loginDiv.style.display = 'block';
        checkoutForm.style.display = 'none';
        
        document.getElementById('userSimulado').value = USUARIO_SIMULADO; 
        document.getElementById('passSimulado').value = '';
    }
}


document.getElementById("catalogo").addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-agregar")) {
        const id = parseInt(e.target.dataset.id);
        agregarAlCarrito(id);
    }
});

document.getElementById("busqueda").addEventListener("input", aplicaBusquedaYOrden);
document.getElementById("orden").addEventListener("change", aplicaBusquedaYOrden);

document.getElementById("vaciarCarrito").addEventListener("click", () => {
    carrito = [];
    renderCarrito();
    Toastify({
        text: "El carrito ha sido vaciado.",
        duration: 2000,
        gravity: "top",
        position: "center",
        style: { background: "#082d26" }
    }).showToast();
});

document.getElementById("btnSimularLogin").addEventListener("click", () => {
    const user = document.getElementById('userSimulado').value;
    const pass = document.getElementById('passSimulado').value;

    if (user === USUARIO_SIMULADO && pass === CLAVE_SIMULADA) {
        usuarioLogueado = user;
        guardarLS("AB_LOGGED_USER", user);
        actualizarVistaCheckout();

        Toastify({
            text: `✅ ¡Bienvenido, ${user}! Continúa con tu compra.`,
            duration: 3000,
            gravity: "top",
            position: "center",
            style: { background: "#28a745" }
        }).showToast();

    } else {
        Toastify({
            text: "⚠️ Credenciales incorrectas. (Usuario: cliente, Clave: 1234)",
            duration: 5000,
            gravity: "top",
            position: "center",
            style: { background: "#dc3545" }
        }).showToast();
    }
});

document.getElementById("formCheckout").addEventListener("submit", (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
        Toastify({
            text: "⚠️ No puedes finalizar la compra con el carrito vacío.",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: { background: "#dc3545" }
        }).showToast();
        return;
    }

    const nombre = document.getElementById("nombreCliente").value;
    const email = document.getElementById("emailCliente").value;
    const direccion = document.getElementById("direccionCliente").value;
    const medioPagoTexto = document.getElementById("medioPago").options[document.getElementById("medioPago").selectedIndex].text;

    document.getElementById("mensajeCompra").innerHTML = `
        <p class="mb-1">✅ ¡Gracias <strong>${nombre}</strong>, tu compra ha sido confirmada!</p>
        <p class="small">Se ha procesado el pago mediante <strong>${medioPagoTexto}</strong>.</p>
        <p>Enviaremos un comprobante a <strong>${email}</strong> y tus productos a <strong>${direccion}</strong>.</p>
    `;

    Toastify({
        text: "¡Compra finalizada con éxito!",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: { background: "#28a745" }
    }).showToast();

    carrito = [];
    usuarioLogueado = null; 
    localStorage.removeItem("AB_LOGGED_USER");
    
    renderCarrito();
    e.target.reset();
});


function main() {
    cargarCatalogo(); 
    carrito = leerLS("AB_CART");
    usuarioLogueado = leerLS("AB_LOGGED_USER"); 
    
    renderCarrito();
    actualizarVistaCheckout();
}

main();