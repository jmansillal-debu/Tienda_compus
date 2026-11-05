class TiendaModel {
  constructor(conexion) {
    this.pool = conexion.obtenerPool();
    this.inicializarTablas();
  }

  async inicializarTablas() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS productos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          categoria VARCHAR(50) NOT NULL,
          precio NUMERIC(10, 2) NOT NULL,
          imagen VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pedidos (
          id SERIAL PRIMARY KEY,
          cliente VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          total NUMERIC(10, 2) NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const resultado = await this.pool.query('SELECT COUNT(*) FROM productos');
      if (parseInt(resultado.rows[0].count) === 0) {
        await this.pool.query(`
          INSERT INTO productos (nombre, categoria, precio, imagen) VALUES
          ('Laptop Gamer ASUS ROG', 'Laptops', 1250.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'),
          ('Tarjeta Gráfica RTX 4070', 'Hardware', 699.99, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'),
          ('Procesador Intel Core i7', 'Hardware', 350.00, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500'),
          ('Teclado Mecánico RGB', 'Accesorios', 85.50, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500');
        `);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async obtenerProductos() {
    const resultado = await this.pool.query('SELECT * FROM productos');
    return resultado.rows;
  }

  async crearPedido(cliente, email, total) {
    const consulta = 'INSERT INTO pedidos (cliente, email, total) VALUES ($1, $2, $3) RETURNING id, cliente, total';
    const resultado = await this.pool.query(consulta, [cliente, email, total]);
    return resultado.rows[0];
  }
}

module.exports = TiendaModel;
