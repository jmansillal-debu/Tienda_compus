class ErrorNegocio extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

class PedidoModel {
  constructor(conexion) {
    this.pool = conexion.obtenerPool();
  }

  async inicializarTabla() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES clientes_tienda(id) ON DELETE CASCADE,
        total NUMERIC(12,2) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS pedido_items (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
        nombre VARCHAR(150) NOT NULL,
        precio_unitario NUMERIC(10,2) NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0)
      );
    `);
  }

  // items: [{ id, cantidad }]. Los precios SIEMPRE se toman de la base de datos.
  async crear(usuarioId, items) {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');

      const ids = items.map((i) => i.id);
      const { rows: productos } = await cliente.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
        [ids]
      );
      const mapa = new Map(productos.map((p) => [p.id, p]));

      let total = 0;
      for (const item of items) {
        const p = mapa.get(item.id);
        if (!p) throw new ErrorNegocio('Uno de los productos ya no existe.');
        if (p.stock < item.cantidad) {
          throw new ErrorNegocio(
            p.stock === 0
              ? `"${p.nombre}" está agotado.`
              : `Solo quedan ${p.stock} unidades de "${p.nombre}".`,
            409
          );
        }
        total += Number(p.precio) * item.cantidad;
      }

      const { rows: [pedido] } = await cliente.query(
        'INSERT INTO pedidos (usuario_id, total) VALUES ($1, $2) RETURNING id, total, creado_en',
        [usuarioId, total.toFixed(2)]
      );

      for (const item of items) {
        const p = mapa.get(item.id);
        await cliente.query(
          'INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unitario, cantidad) VALUES ($1, $2, $3, $4, $5)',
          [pedido.id, p.id, p.nombre, p.precio, item.cantidad]
        );
        await cliente.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, p.id]);
      }

      await cliente.query('COMMIT');
      return { id: pedido.id, total: Number(pedido.total), creado_en: pedido.creado_en };
    } catch (error) {
      await cliente.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      cliente.release();
    }
  }

  async listarPorUsuario(usuarioId) {
    const { rows } = await this.pool.query(
      `SELECT p.id, p.total, p.creado_en,
              COALESCE(
                json_agg(json_build_object('nombre', i.nombre, 'cantidad', i.cantidad, 'precio', i.precio_unitario) ORDER BY i.id)
                FILTER (WHERE i.id IS NOT NULL), '[]'
              ) AS items
       FROM pedidos p
       LEFT JOIN pedido_items i ON i.pedido_id = p.id
       WHERE p.usuario_id = $1
       GROUP BY p.id
       ORDER BY p.creado_en DESC
       LIMIT 50`,
      [usuarioId]
    );
    return rows.map((r) => ({
      id: r.id,
      total: Number(r.total),
      creado_en: r.creado_en,
      items: r.items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: Number(i.precio) }))
    }));
  }
}

module.exports = PedidoModel;
module.exports.ErrorNegocio = ErrorNegocio;
