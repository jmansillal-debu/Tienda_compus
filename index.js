const Conexion = require('./Conexion');
const Autenticacion = require('./Autenticacion');
const ClienteModel = require('./ClienteModel');
const ClienteControlador = require('./ClienteControlador');
const ProductoModel = require('./ProductoModel');
const ProductoControlador = require('./ProductoControlador');
const PedidoModel = require('./PedidoModel');
const PedidoControlador = require('./PedidoControlador');
const Servidor = require('./Servidor');

async function main() {
  const conexion = new Conexion();
  const autenticacion = new Autenticacion();

  const clienteModel = new ClienteModel(conexion);
  const productoModel = new ProductoModel(conexion);
  const pedidoModel = new PedidoModel(conexion);

  // El orden importa: pedidos depende de clientes y productos
  await clienteModel.inicializarTabla();
  await productoModel.inicializarTabla();
  await pedidoModel.inicializarTabla();

  const servidor = new Servidor({
    clienteControlador: new ClienteControlador(clienteModel, autenticacion),
    productoControlador: new ProductoControlador(productoModel),
    pedidoControlador: new PedidoControlador(pedidoModel),
    autenticacion
  });

  servidor.iniciar();
}

main().catch((error) => {
  console.error('No se pudo iniciar la aplicación:', error);
  process.exit(1);
});
