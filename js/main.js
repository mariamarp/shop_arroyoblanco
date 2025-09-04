let catalogo = [];
let carrito = [];

function guardarLS(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}
function leerLS(clave) {
  return JSON.parse(localStorage.getItem(clave)) || [];
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
          <p class="card-text">$${prod.precio}</p>
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
      <span>$${item.precio * item.cantidad}</span>
    `;
    lista.appendChild(li);
  });

  document.getElementById("totalCarrito").innerText =
    "Total: $" + carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

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
document.getElementById("formProducto").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const imgUrl = document.getElementById("imgUrl").value || "assets/producto (1).jpg";

  const nuevo = { id: Date.now(), nombre, precio, img: imgUrl };
  catalogo.push(nuevo);
  guardarLS("AB_CATALOG", catalogo);

  e.target.reset();
  aplicaBusquedaYOrden();
});
document.getElementById("vaciarCarrito").addEventListener("click", () => {
  carrito = [];
  renderCarrito();
});

document.getElementById("formCheckout").addEventListener("submit", (e) => {
  e.preventDefault();

  if (carrito.length === 0) {
    document.getElementById("mensajeCompra").innerText =
      "⚠️ No puedes finalizar la compra con el carrito vacío.";
    return;
  }

  const nombre = document.getElementById("nombreCliente").value;
  const email = document.getElementById("emailCliente").value;
  const direccion = document.getElementById("direccionCliente").value;

  document.getElementById("mensajeCompra").innerText =
    `✅ ¡Gracias ${nombre}, tu compra ha sido confirmada!\n\n` +
    `Enviaremos un comprobante a ${email} y tus productos a ${direccion}.`;

  carrito = [];
  renderCarrito();

  e.target.reset();
});

function main() {
  catalogo = leerLS("AB_CATALOG");
  if (catalogo.length === 0) {
    catalogo = [
      { id: 1, nombre: "Vermut Rojo", precio: 28000, img: "assets/producto (3).jpg" },
      { id: 2, nombre: "Vermut Blanco", precio: 26000, img: "assets/producto (2).jpg" },
      { id: 3, nombre: "Vermut Rosso", precio: 25000, img: "assets/producto (1).jpg" }
    ];
  }

  carrito = leerLS("AB_CART");

  aplicaBusquedaYOrden();
  renderCarrito();
}
main();