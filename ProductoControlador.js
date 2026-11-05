class ProductoControlador {
  constructor(productoModel) {
    this.productoModel = productoModel;
  }

  async listar(req, res) {
    try {
      const { categoria, q, orden } = req.query;
      const productos = await this.productoModel.listar({
        categoria: typeof categoria === 'string' ? categoria : undefined,
        q: typeof q === 'string' ? q.trim().slice(0, 100) : undefined,
        orden: typeof orden === 'string' ? orden : undefined
      });
      return res.json({ productos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudo cargar el catálogo.' });
    }
  }

  async categorias(req, res) {
    try {
      const categorias = await this.productoModel.categorias();
      return res.json({ categorias });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudieron cargar las categorías.' });
    }
  }
}

module.exports = ProductoControlador;
