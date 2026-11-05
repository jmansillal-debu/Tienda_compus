const Conexion = require('./Conexion');
const TiendaModel = require('./TiendaModel');
const TiendaControlador = require('./TiendaControlador');
const Servidor = require('./Servidor');

const conexion = new Conexion();
const tiendaModel = new TiendaModel(conexion);
const tiendaControlador = new TiendaControlador(tiendaModel);
const servidor = new Servidor(tiendaControlador);

servidor.iniciar();
