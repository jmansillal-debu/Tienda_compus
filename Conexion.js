const { Pool } = require('pg');

class Conexion {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
  }

  obtenerPool() {
    return this.pool;
  }
}

module.exports = Conexion;
