const Conexion = require('./Conexion');
const ClienteModel = require('./ClienteModel');
const ClienteControlador = require('./ClienteControlador');
const Servidor = require('./Servidor');

const conexion = new Conexion();
const clienteModel = new ClienteModel(conexion);
const clienteControlador = new ClienteControlador(clienteModel);
const servidor = new Servidor(clienteControlador);

servidor.iniciar();
