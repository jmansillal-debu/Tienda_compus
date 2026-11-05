// Catálogo, carrito y pedidos
class Tienda {
  constructor(alCerrarSesion) {
    this.alCerrarSesion = alCerrarSesion;
    this.usuario = null;
    this.carrito = [];
    this.filtros = { categoria: '', q: '', orden: 'relevancia' };
    this.temporizadorBusqueda = null;
    this.temporizadorToast = null;
    this.formato = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

    this.$ = (id) => document.getElementById(id);
    this.enlazarEventos();
  }

  /* ---------- Utilidades ---------- */
  h(etiqueta, props = {}, ...hijos) {
    const el = document.createElement(etiqueta);
    for (const [clave, valor] of Object.entries(props)) {
      if (clave === 'class') el.className = valor;
      else if (clave.startsWith('on')) el.addEventListener(clave.slice(2), valor);
      else el.setAttribute(clave, valor);
    }
    for (const hijo of hijos.flat()) {
      if (hijo === null || hijo === undefined || hijo === false) continue;
      el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
    }
    return el;
  }

  precio(n) {
    return this.formato.format(n);
  }

  toast(texto, tipo = '') {
    const t = this.$('toast');
    t.textContent = texto;
    t.className = `toast visible ${tipo}`;
    clearTimeout(this.temporizadorToast);
    this.temporizadorToast = setTimeout(() => t.classList.remove('visible'), 3200);
  }

  /* ---------- Sesión ---------- */
  async iniciar(usuario) {
    this.usuario = usuario;
    this.filtros = { categoria: '', q: '', orden: 'relevancia' };
    this.$('buscador').value = '';
    this.$('ordenar').value = 'relevancia';
    this.$('saludo').textContent = `Hola, ${usuario.nombre.split(' ')[0]} 👋`;
    this.$('textoInteres').textContent = usuario.interes
      ? `Te interesa: ${usuario.interes}. ¡Mira lo que tenemos para ti!`
      : 'Los mejores componentes y laptops gamer al mejor precio.';
    this.$('vistaTienda').classList.remove('oculto');

    this.cargarCarrito();
    this.renderCarrito();
    await Promise.all([this.cargarCategorias(), this.cargarProductos()]);
  }

  cerrarSesion() {
    Api.guardarToken(null);
    this.usuario = null;
    this.carrito = [];
    this.cerrarPaneles();
    this.$('vistaTienda').classList.add('oculto');
    this.alCerrarSesion();
  }

  /* ---------- Eventos ---------- */
  enlazarEventos() {
    this.$('buscador').addEventListener('input', (e) => {
      clearTimeout(this.temporizadorBusqueda);
      this.temporizadorBusqueda = setTimeout(() => {
        this.filtros.q = e.target.value.trim();
        this.cargarProductos();
      }, 300);
    });

    this.$('ordenar').addEventListener('change', (e) => {
      this.filtros.orden = e.target.value;
      this.cargarProductos();
    });

    this.$('btnCarrito').addEventListener('click', () => this.abrirPanel('panelCarrito'));
    this.$('btnPedidos').addEventListener('click', () => this.abrirPedidos());
    this.$('btnSalir').addEventListener('click', () => this.cerrarSesion());
    this.$('btnComprar').addEventListener('click', () => this.comprar());
    this.$('btnVaciar').addEventListener('click', () => {
      this.carrito = [];
      this.guardarCarrito();
      this.renderCarrito();
    });

    this.$('fondo').addEventListener('click', () => this.cerrarPaneles());
    document.querySelectorAll('[data-cerrar]').forEach((b) =>
      b.addEventListener('click', () => this.cerrarPaneles())
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.cerrarPaneles();
    });
  }

  abrirPanel(id) {
    this.cerrarPaneles();
    this.$(id).classList.add('abierto');
    this.$('fondo').classList.add('visible');
  }

  cerrarPaneles() {
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('abierto'));
    this.$('fondo').classList.remove('visible');
  }

  /* ---------- Catálogo ---------- */
  async cargarCategorias() {
    try {
      const { categorias } = await Api.get('/api/categorias');
      const total = categorias.reduce((s, c) => s + c.total, 0);
      const contenedor = this.$('chipsCategorias');
      contenedor.replaceChildren(
        this.crearChip('Todos', '', total),
        ...categorias.map((c) => this.crearChip(c.categoria, c.categoria, c.total))
      );
    } catch (error) {
      this.toast(error.message, 'error');
    }
  }

  crearChip(texto, valor, total) {
    return this.h('button', {
      type: 'button',
      class: `chip ${this.filtros.categoria === valor ? 'activa' : ''}`,
      onclick: () => {
        this.filtros.categoria = valor;
        document.querySelectorAll('.chip').forEach((c) => c.classList.remove('activa'));
        document.querySelectorAll('.chip').forEach((c) => {
          if (c.dataset.valor === valor) c.classList.add('activa');
        });
        this.cargarProductos();
      },
      'data-valor': valor
    }, `${texto} (${total})`);
  }

  async cargarProductos() {
    const params = new URLSearchParams();
    if (this.filtros.categoria) params.set('categoria', this.filtros.categoria);
    if (this.filtros.q) params.set('q', this.filtros.q);
    params.set('orden', this.filtros.orden);

    try {
      const { productos } = await Api.get(`/api/productos?${params}`);
      this.productos = productos;
      this.renderProductos(productos);
    } catch (error) {
      this.toast(error.message, 'error');
    }
  }

  renderProductos(productos) {
    this.$('estadoVacio').classList.toggle('oculto', productos.length > 0);
    this.$('gridProductos').replaceChildren(...productos.map((p) => this.tarjetaProducto(p)));
  }

  tarjetaProducto(p) {
    const agotado = p.stock === 0;
    const claseStock = agotado ? 'agotado' : p.stock <= 5 ? 'poco' : '';
    const textoStock = agotado ? 'Agotado' : p.stock <= 5 ? `¡Solo quedan ${p.stock}!` : `${p.stock} disponibles`;

    const boton = this.h('button', {
      type: 'button',
      class: 'btn-primario',
      onclick: () => this.agregar(p)
    }, agotado ? 'Agotado' : '🛒 Agregar al carrito');
    if (agotado) boton.disabled = true;

    return this.h('article', { class: 'producto' },
      this.h('div', { class: 'producto-imagen' },
        p.destacado ? this.h('span', { class: 'etiqueta' }, '⭐ Destacado') : null,
        p.emoji
      ),
      this.h('div', { class: 'producto-cuerpo' },
        this.h('span', { class: 'producto-categoria' }, p.categoria),
        this.h('h3', { class: 'producto-nombre' }, p.nombre),
        this.h('p', { class: 'producto-desc' }, p.descripcion),
        this.h('div', { class: 'producto-precio' }, this.precio(p.precio)),
        this.h('div', { class: `stock ${claseStock}` }, textoStock),
        boton
      )
    );
  }

  /* ---------- Carrito ---------- */
  get claveCarrito() {
    return `carrito_${this.usuario.id}`;
  }

  cargarCarrito() {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.claveCarrito));
      this.carrito = Array.isArray(guardado) ? guardado : [];
    } catch (e) {
      this.carrito = [];
    }
  }

  guardarCarrito() {
    try { localStorage.setItem(this.claveCarrito, JSON.stringify(this.carrito)); } catch (e) { /* ignorar */ }
  }

  agregar(p) {
    const existente = this.carrito.find((i) => i.id === p.id);
    if (existente) {
      if (existente.cantidad >= p.stock) {
        return this.toast('Ya tienes todo el stock disponible en tu carrito.', 'error');
      }
      existente.cantidad += 1;
      existente.stock = p.stock;
      existente.precio = p.precio;
    } else {
      this.carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio, emoji: p.emoji, stock: p.stock, cantidad: 1 });
    }
    this.guardarCarrito();
    this.renderCarrito();
    this.toast(`"${p.nombre}" agregado al carrito`, 'ok');
  }

  cambiarCantidad(id, delta) {
    const item = this.carrito.find((i) => i.id === id);
    if (!item) return;
    const nueva = item.cantidad + delta;
    if (nueva < 1) return this.quitar(id);
    if (nueva > item.stock) return this.toast('No hay más unidades disponibles.', 'error');
    item.cantidad = nueva;
    this.guardarCarrito();
    this.renderCarrito();
  }

  quitar(id) {
    this.carrito = this.carrito.filter((i) => i.id !== id);
    this.guardarCarrito();
    this.renderCarrito();
  }

  renderCarrito() {
    const cantidadTotal = this.carrito.reduce((s, i) => s + i.cantidad, 0);
    const total = this.carrito.reduce((s, i) => s + i.cantidad * i.precio, 0);

    this.$('contadorCarrito').textContent = cantidadTotal;
    this.$('totalCarrito').textContent = this.precio(total);
    this.$('btnComprar').disabled = this.carrito.length === 0;
    this.$('btnVaciar').classList.toggle('oculto', this.carrito.length === 0);

    const contenedor = this.$('itemsCarrito');
    if (this.carrito.length === 0) {
      contenedor.replaceChildren(this.h('p', { class: 'panel-vacio' }, 'Tu carrito está vacío 🛒'));
      return;
    }

    contenedor.replaceChildren(...this.carrito.map((i) =>
      this.h('div', { class: 'item-carrito' },
        this.h('div', { class: 'item-emoji' }, i.emoji),
        this.h('div', { class: 'item-info' },
          this.h('p', { class: 'item-nombre' }, i.nombre),
          this.h('div', { class: 'item-precio' }, `${this.precio(i.precio)} c/u`),
          this.h('div', { class: 'cantidad' },
            this.h('button', { type: 'button', onclick: () => this.cambiarCantidad(i.id, -1) }, '−'),
            this.h('span', {}, i.cantidad),
            this.h('button', { type: 'button', onclick: () => this.cambiarCantidad(i.id, 1) }, '+')
          )
        ),
        this.h('button', { type: 'button', class: 'quitar', 'aria-label': 'Quitar', onclick: () => this.quitar(i.id) }, '🗑️')
      )
    ));
  }

  async comprar() {
    if (this.carrito.length === 0) return;
    const boton = this.$('btnComprar');
    boton.disabled = true;
    boton.textContent = 'Procesando...';

    try {
      const items = this.carrito.map((i) => ({ id: i.id, cantidad: i.cantidad }));
      const { pedido } = await Api.post('/api/pedidos', { items });
      this.carrito = [];
      this.guardarCarrito();
      this.renderCarrito();
      this.cerrarPaneles();
      this.toast(`¡Pedido #${pedido.id} confirmado! Total: ${this.precio(pedido.total)}`, 'ok');
    } catch (error) {
      this.toast(error.message, 'error');
    } finally {
      boton.textContent = 'Finalizar compra';
      boton.disabled = this.carrito.length === 0;
      this.cargarProductos(); // refresca el stock
    }
  }

  /* ---------- Pedidos ---------- */
  async abrirPedidos() {
    this.abrirPanel('panelPedidos');
    const lista = this.$('listaPedidos');
    lista.replaceChildren(this.h('p', { class: 'panel-vacio' }, 'Cargando...'));

    try {
      const { pedidos } = await Api.get('/api/pedidos');
      if (pedidos.length === 0) {
        lista.replaceChildren(this.h('p', { class: 'panel-vacio' }, 'Aún no has realizado pedidos 📦'));
        return;
      }
      lista.replaceChildren(...pedidos.map((p) =>
        this.h('div', { class: 'pedido' },
          this.h('div', { class: 'pedido-cabecera' },
            this.h('span', {}, `Pedido #${p.id}`),
            this.h('span', {}, this.precio(p.total))
          ),
          this.h('div', { class: 'pedido-fecha' }, new Date(p.creado_en).toLocaleString('es-PE')),
          this.h('ul', {}, p.items.map((i) =>
            this.h('li', {}, `${i.cantidad} × ${i.nombre} — ${this.precio(i.precio * i.cantidad)}`)
          ))
        )
      ));
    } catch (error) {
      lista.replaceChildren(this.h('p', { class: 'panel-vacio' }, error.message));
    }
  }
}
