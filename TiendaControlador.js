class TiendaControlador {
  constructor(tiendaModel) {
    this.tiendaModel = tiendaModel;
  }

  async listarProductos(req, res) {
    try {
      const productos = await this.tiendaModel.obtenerProductos();
      return res.json(productos);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener productos.' });
    }
  }

  async procesarCompra(req, res) {
    const { cliente, email, total } = req.body;

    if (!cliente || !email || !total) {
      return res.status(400).json({ error: 'Datos incompletos para procesar la compra.' });
    }

    try {
      const pedido = await this.tiendaModel.crearPedido(cliente, email, total);
      return res.status(201).json({ mensaje: '¡Compra y registro realizados con éxito!', pedido });
    } catch (error) {
      return res.status(500).json({ error: 'Error al procesar el pedido.' });
    }
  }
}

module.exports = TiendaControlador;
