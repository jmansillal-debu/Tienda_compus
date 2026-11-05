const bcrypt = require('bcryptjs');

class ClienteControlador {
  constructor(clienteModel, autenticacion) {
    this.clienteModel = clienteModel;
    this.autenticacion = autenticacion;
  }

  async registrar(req, res) {
    const { nombre, email, interes, password } = req.body || {};

    if (!nombre || !email || !interes || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.length > 100) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      return res.status(400).json({ error: 'El correo electrónico no es válido.' });
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
      return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 72 caracteres.' });
    }
    if (typeof interes !== 'string' || interes.length > 100) {
      return res.status(400).json({ error: 'El producto de interés no es válido.' });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const cliente = await this.clienteModel.registrar(
        nombre.trim(), email.trim().toLowerCase(), interes, hash
      );
      if (!cliente) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }
      const token = this.autenticacion.generarToken(cliente);
      return res.status(201).json({ mensaje: 'Registro guardado exitosamente en la tienda', cliente, token });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
    }

    try {
      const usuario = await this.clienteModel.buscarPorEmail(email.trim());
      const valido = usuario && usuario.password_hash &&
        await bcrypt.compare(password, usuario.password_hash);

      if (!valido) {
        return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      }

      const cliente = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, interes: usuario.interes };
      const token = this.autenticacion.generarToken(cliente);
      return res.json({ mensaje: 'Bienvenido de nuevo', cliente, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  async perfil(req, res) {
    try {
      const usuario = await this.clienteModel.buscarPorId(req.usuario.id);
      if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado.' });
      return res.json({ usuario });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
}

module.exports = ClienteControlador;
