class ClienteModel {
  constructor(conexion) {
    this.pool = conexion.obtenerPool();
    this.inicializarTabla();
  }

  async inicializarTabla() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS clientes_tienda (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          interes VARCHAR(100) NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error(error);
    }
  }

  async registrar(nombre, email, interes) {
    const consulta = 'INSERT INTO clientes_tienda (nombre, email, interes) VALUES ($1, $2, $3) RETURNING id, nombre, email, interes';
    const resultado = await this.pool.query(consulta, [nombre, email, interes]);
    return resultado.rows[0];
  }
}

module.exports = ClienteModel;
