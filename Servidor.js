const express = require('express');
const path = require('path');

class Servidor {
  constructor(tiendaControlador) {
    this.app = express();
    this.puerto = process.env.PORT || 3000;
    this.tiendaControlador = tiendaControlador;

    this.configurarMiddlewares();
    this.configurarRutas();
  }

  configurarMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  configurarRutas() {
    this.app.get('/api/productos', (req, res) => this.tiendaControlador.listarProductos(req, res));
    this.app.post('/api/comprar', (req, res) => this.tiendaControlador.procesarCompra(req, res));
  }

  iniciar() {
    this.app.listen(this.puerto, () => {
      console.log(`Servidor en puerto ${this.puerto}`);
    });
  }
}

module.exports = Servidor;
