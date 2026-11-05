class TiendaCliente {
  constructor() {
    this.carrito = [];
    this.productos = [];
    this.inicializar();
  }

  async inicializar() {
    await this.cargarProductos();
    document.getElementById('botonComprar').addEventListener('click', () => this.finalizarCompra());
  }

  async cargarProductos() {
    try {
      const respuesta = await fetch('/api/productos');
      this.productos = await respuesta.json();
      this.renderizarCatalogo();
    } catch (error) {
      console.error('Error al cargar productos');
    }
  }

  renderizarCatalogo() {
    const contenedor = document.getElementById('catalogoProductos');
    contenedor.innerHTML = '';

    this.productos.forEach(prod => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta-producto';
      tarjeta.innerHTML = `
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <h3>${prod.nombre}</h3>
        <p>$${Number(prod.precio).toFixed(2)}</p>
        <button onclick="tienda.agregarAlCarrito(${prod.id})">Agregar</button>
      `;
      contenedor.appendChild(tarjeta);
    });
  }

  agregarAlCarrito(id) {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      this.carrito.push(producto);
      this.actualizarCarrito();
    }
  }

  actualizarCarrito() {
    const lista = document.getElementById('listaCarrito');
    const totalSpan = document.getElementById('totalCarrito');
    const contador = document.getElementById('contadorCarrito');
    
    lista.innerHTML = '';
    let total = 0;

    this.carrito.forEach((item, index) => {
      total += Number(item.precio);
      const li = document.createElement('li');
      li.innerHTML = `${item.nombre} <span>$${item.precio}</span>`;
      lista.appendChild(li);
    });

    totalSpan.innerText = total.toFixed(2);
    contador.innerText = `🛒 Carrito: ${this.carrito.length} items`;
  }

  async finalizarCompra() {
    const nombre = document.getElementById('nombreCliente').value;
    const email = document.getElementById('emailCliente').value;
    const mensaje = document.getElementById('mensajeEstado');

    if (this.carrito.length === 0) {
      mensaje.innerText = 'El carrito está vacío.';
      mensaje.style.color = '#f87171';
      return;
    }

    if (!nombre || !email) {
      mensaje.innerText = 'Completa tu nombre y correo.';
      mensaje.style.color = '#f87171';
      return;
    }

    const total = this.carrito.reduce((acc, item) => acc + Number(item.precio), 0);

    try {
      const respuesta = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: nombre, email, total })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        mensaje.innerText = datos.mensaje;
        mensaje.style.color = '#4ade80';
        this.carrito = [];
        this.actualizarCarrito();
        document.getElementById('nombreCliente').value = '';
        document.getElementById('emailCliente').value = '';
      } else {
        mensaje.innerText = datos.error;
        mensaje.style.color = '#f87171';
      }
    } catch (error) {
      mensaje.innerText = 'Error de conexión.';
      mensaje.style.color = '#f87171';
    }
  }
}
