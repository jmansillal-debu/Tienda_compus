class PedidoControlador {
  constructor(pedidoModel) {
    this.pedidoModel = pedidoModel;
  }

  async crear(req, res) {
    const crudos = req.body && req.body.items;
    if (!Array.isArray(crudos) || crudos.length === 0 || crudos.length > 50) {
      return res.status(400).json({ error: 'Tu carrito está vacío.' });
    }

    // Normaliza y agrupa productos repetidos
    const agrupados = new Map();
    for (const it of crudos) {
      const id = Number(it && it.id);
      const cantidad = Number(it && it.cantidad);
      if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
        return res.status(400).json({ error: 'El carrito contiene datos inválidos.' });
      }
      agrupados.set(id, (agrupados.get(id) || 0) + cantidad);
    }
    const items = [...agrupados].map(([id, cantidad]) => ({ id, cantidad }));

    try {
      const pedido = await this.pedidoModel.crear(req.usuario.id, items);
      return res.status(201).json({ mensaje: '¡Pedido realizado con éxito!', pedido });
    } catch (error) {
      if (error.status) return res.status(error.status).json({ error: error.message });
      console.error(error);
      return res.status(500).json({ error: 'No se pudo procesar el pedido.' });
    }
  }

  async listar(req, res) {
    try {
      const pedidos = await this.pedidoModel.listarPorUsuario(req.usuario.id);
      return res.json({ pedidos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudieron cargar tus pedidos.' });
    }
  }
}

module.exports = PedidoControlador;
