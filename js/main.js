const productos = [
  { nombre: "Vermut Blanco", precio: 28000 },
  { nombre: "Vermut Rosso", precio: 28000 },
  { nombre: "Vermut Tinto", precio: 28000 },
];

function mostrarCatalogo() {
  console.log("Catálogo de Arroyo Blanco:");
  productos.forEach((producto, index) => {
    console.log(`${index + 1}. ${producto.nombre} - $${producto.precio}`);
  });
}

function calcularTotal(precio, cantidad) {
  return precio * cantidad;
}

function simuladorTienda() {
  alert("Bienvenido/a a Arroyo Blanco - Tienda de Vermut");

  mostrarCatalogo();

  let seleccion = parseInt(prompt("Elegí el número del vermut que querés comprar:\n1. Vermut Blanco\n2. Vermut Rosso\n3. Vermut Tinto"));

  if (isNaN(seleccion) || seleccion < 1 || seleccion > productos.length) {
    alert("Selección inválida. Reiniciá el simulador.");
    return;
  }

  const productoSeleccionado = productos[seleccion - 1];
  const cantidad = parseInt(prompt(`¿Cuántas unidades de "${productoSeleccionado.nombre}" querés comprar?`));

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Cantidad inválida.");
    return;
  }

  const totalCompra = calcularTotal(productoSeleccionado.precio, cantidad);
  const dineroDisponible = parseFloat(prompt(`El total es $${totalCompra}.\n¿Cuánto dinero tenés disponible para la compra?`));

  if (isNaN(dineroDisponible)) {
    alert("Monto inválido.");
    return;
  }

  if (dineroDisponible >= totalCompra) {
    alert(`¡Compra exitosa!\nCompraste ${cantidad} unidad(es) de ${productoSeleccionado.nombre}.\nTotal: $${totalCompra}\nVuelto: $${(dineroDisponible - totalCompra).toFixed(2)}`);
  } else {
    alert(`No tenés suficiente dinero para esta compra.\nTe faltan $${(totalCompra - dineroDisponible).toFixed(2)}.`);
  }

  const seguir = confirm("¿Querés hacer otra compra?");
  if (seguir) {
    simuladorTienda();
  } else {
    alert("Gracias por visitar Arroyo Blanco. ¡Salud!");
  }
}

simuladorTienda();