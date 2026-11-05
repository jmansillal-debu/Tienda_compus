class ClienteControlador {
  constructor(clienteModel) {
    this.clienteModel = clienteModel;
  }

  async registrar(req, res) {
    const { nombre, email, interes } = req.body;

    if (!nombre || !email || !interes) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
      const cliente = await this.clienteModel.registrar(nombre, email, interes);
      return res.status(201).json({ mensaje: 'Registro guardado exitosamente en la tienda', cliente });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
}

module.exports = ClienteControlador;
