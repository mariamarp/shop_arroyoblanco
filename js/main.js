let catalogo = [];
let carrito = [];

function guardarLS(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function leerLS(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
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
        console.error("Error:", error);
        document.getElementById("catalogo").innerHTML = `<p class="text-danger">Error al cargar el catálogo de productos.</p>`;
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

function renderCarrito() {
    const lista = document.getElementById("listaCarrito");
    lista.innerHTML = "";

    carrito.forEach((item) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${item.nombre} x${item.cantidad} 
            <span>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
        `;
        lista.appendChild(li);
    });

    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    document.getElementById("totalCarrito").innerText = `Total: $${total.toLocaleString('es-AR')}`;

    guardarLS("AB_CART", carrito);
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
        text: `✅ ${producto.nombre} añadido al carrito`,
        duration: 2000,
        gravity: "top",
        position: "right",
        style: {
            background: "#082d26",
        }
    }).showToast();

    renderCarrito();
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
        style: {
            background: "#082d26",
        }
    }).showToast();
});

document.getElementById("formCheckout").addEventListener("submit", (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
        Toastify({
            text: "⚠️ No puedes finalizar la compra con el carrito vacío.",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "#dc3545",
            }
        }).showToast();
        return;
    }

    const nombre = document.getElementById("nombreCliente").value;
    const email = document.getElementById("emailCliente").value;
    const direccion = document.getElementById("direccionCliente").value;

    document.getElementById("mensajeCompra").innerHTML = `
        <p class="mb-1">✅ ¡Gracias <strong>${nombre}</strong>, tu compra ha sido confirmada!</p>
        <p>Enviaremos un comprobante a <strong>${email}</strong> y tus productos a <strong>${direccion}</strong>.</p>
    `;

    Toastify({
        text: "¡Compra finalizada con éxito!",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background: "#28a745",
        }
    }).showToast();

    carrito = [];
    renderCarrito();
    e.target.reset();
});

function main() {
    cargarCatalogo();
    carrito = leerLS("AB_CART");
    renderCarrito();
}

main();