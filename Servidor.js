const express = require('express');
const path = require('path');

class Servidor {
  constructor(clienteControlador) {
    this.app = express();
    this.puerto = process.env.PORT || 3000;
    this.clienteControlador = clienteControlador;

    this.configurarMiddlewares();
    this.configurarRutas();
  }

  configurarMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  configurarRutas() {
    this.app.post('/api/registrar', (req, res) => this.clienteControlador.registrar(req, res));
  }

  iniciar() {
    this.app.listen(this.puerto, () => {
      console.log(`Servidor en puerto ${this.puerto}`);
    });
  }
}

module.exports = Servidor;
