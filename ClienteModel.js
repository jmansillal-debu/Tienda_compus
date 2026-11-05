class ClienteModel {
  constructor(conexion) {
    this.pool = conexion.obtenerPool();
  }

  async inicializarTabla() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS clientes_tienda (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        interes VARCHAR(100) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Migración: la tabla original no tenía contraseña.
    await this.pool.query(`ALTER TABLE clientes_tienda ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`);
  }

  // Devuelve null si el correo ya está registrado con contraseña.
  // Si era un registro antiguo (sin contraseña), lo completa.
  async registrar(nombre, email, interes, passwordHash) {
    const consulta = `
      INSERT INTO clientes_tienda (nombre, email, interes, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            interes = EXCLUDED.interes,
            password_hash = EXCLUDED.password_hash
        WHERE clientes_tienda.password_hash IS NULL
      RETURNING id, nombre, email, interes
    `;
    const resultado = await this.pool.query(consulta, [nombre, email, interes, passwordHash]);
    return resultado.rows[0] || null;
  }

  async buscarPorEmail(email) {
    const r = await this.pool.query(
      'SELECT id, nombre, email, interes, password_hash FROM clientes_tienda WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return r.rows[0] || null;
  }

  async buscarPorId(id) {
    const r = await this.pool.query(
      'SELECT id, nombre, email, interes FROM clientes_tienda WHERE id = $1',
      [id]
    );
    return r.rows[0] || null;
  }
}

module.exports = ClienteModel;
