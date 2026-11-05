const { Pool } = require('pg');

class Conexion {
  constructor() {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL no está definida. Configúrala en Render.');
    }
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
    this.pool.on('error', (err) => console.error('Error en el pool de PostgreSQL:', err));
  }

  obtenerPool() {
    return this.pool;
  }
}

module.exports = Conexion;
