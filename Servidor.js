const express = require('express');
const path = require('path');

class Servidor {
  constructor({ clienteControlador, productoControlador, pedidoControlador, autenticacion }) {
    this.app = express();
    this.puerto = process.env.PORT || 3000;
    this.clienteControlador = clienteControlador;
    this.productoControlador = productoControlador;
    this.pedidoControlador = pedidoControlador;
    this.autenticacion = autenticacion;

    this.configurarMiddlewares();
    this.configurarRutas();
    this.configurarErrores();
  }

  configurarMiddlewares() {
    this.app.disable('x-powered-by');
    this.app.use(express.json({ limit: '100kb' }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  configurarRutas() {
    const proteger = this.autenticacion.proteger;

    this.app.get('/salud', (req, res) => res.send('ok'));

    // Autenticación
    this.app.post('/api/registrar', (req, res) => this.clienteControlador.registrar(req, res));
    this.app.post('/api/login', (req, res) => this.clienteControlador.login(req, res));
    this.app.get('/api/perfil', proteger, (req, res) => this.clienteControlador.perfil(req, res));

    // Catálogo
    this.app.get('/api/categorias', (req, res) => this.productoControlador.categorias(req, res));
    this.app.get('/api/productos', (req, res) => this.productoControlador.listar(req, res));

    // Pedidos
    this.app.post('/api/pedidos', proteger, (req, res) => this.pedidoControlador.crear(req, res));
    this.app.get('/api/pedidos', proteger, (req, res) => this.pedidoControlador.listar(req, res));
  }

  configurarErrores() {
    this.app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
    // eslint-disable-next-line no-unused-vars
    this.app.use((err, req, res, next) => {
      if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido.' });
      }
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    });
  }

  iniciar() {
    this.app.listen(this.puerto, '0.0.0.0', () => {
      console.log(`Servidor en puerto ${this.puerto}`);
    });
  }
}

module.exports = Servidor;
