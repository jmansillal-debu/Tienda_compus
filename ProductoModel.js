const PRODUCTOS_INICIALES = [
  // [nombre, categoria, descripcion, precio (S/), stock, emoji, destacado]
  ['ASUS ROG Strix G16', 'Laptops Gamer', 'Intel Core i7, RTX 4060 8GB, 16GB RAM, SSD 1TB, pantalla 16" 165Hz.', 6499, 8, '💻', true],
  ['Lenovo Legion 5 Pro', 'Laptops Gamer', 'Ryzen 7, RTX 4060, 16GB RAM, SSD 512GB, pantalla QHD 165Hz.', 6199, 6, '💻', true],
  ['MSI Katana 15', 'Laptops Gamer', 'Core i7, RTX 4050, 16GB RAM, SSD 512GB, teclado retroiluminado.', 4899, 10, '💻', false],
  ['Acer Nitro V 15', 'Laptops Gamer', 'Ryzen 5, RTX 3050, 8GB RAM, SSD 512GB, pantalla 144Hz.', 3399, 12, '💻', false],

  ['NVIDIA GeForce RTX 4070 Super', 'Tarjetas Gráficas', '12GB GDDR6X, ideal para 1440p con ray tracing y DLSS 3.', 2999, 5, '🎮', true],
  ['NVIDIA GeForce RTX 4060', 'Tarjetas Gráficas', '8GB GDDR6, excelente relación precio/rendimiento en 1080p.', 1499, 14, '🎮', false],
  ['AMD Radeon RX 7800 XT', 'Tarjetas Gráficas', '16GB GDDR6, gran rendimiento en 1440p sin gastar de más.', 2599, 7, '🎮', false],
  ['AMD Radeon RX 6600', 'Tarjetas Gráficas', '8GB GDDR6, opción económica para jugar en Full HD.', 999, 15, '🎮', false],

  ['AMD Ryzen 7 7800X3D', 'Procesadores', '8 núcleos, 16 hilos, 3D V-Cache. El rey del gaming.', 1799, 9, '⚙️', true],
  ['AMD Ryzen 5 5600', 'Procesadores', '6 núcleos, 12 hilos, socket AM4. Calidad-precio imbatible.', 499, 25, '⚙️', false],
  ['Intel Core i7-14700K', 'Procesadores', '20 núcleos (8P+12E), hasta 5.6 GHz, socket LGA1700.', 1699, 8, '⚙️', false],
  ['Intel Core i5-13400F', 'Procesadores', '10 núcleos, hasta 4.6 GHz. Ideal para PC gamer de gama media.', 649, 20, '⚙️', false],

  ['Monitor LG UltraGear 27" 165Hz', 'Monitores', 'IPS QHD 2560x1440, 1ms, compatible con G-Sync y FreeSync.', 1199, 11, '🖥️', true],
  ['Monitor Samsung Odyssey G5 32"', 'Monitores', 'Curvo VA QHD, 165Hz, 1ms. Inmersión total.', 1399, 6, '🖥️', false],
  ['Monitor AOC 24" Full HD 144Hz', 'Monitores', 'Panel IPS, 1ms, bordes finos. Ideal para eSports.', 549, 18, '🖥️', false],
  ['Monitor ASUS ProArt 27" 4K', 'Monitores', 'IPS 4K UHD, 100% sRGB. Para diseño y edición.', 1899, 4, '🖥️', false],

  ['SSD NVMe Samsung 980 Pro 1TB', 'Almacenamiento', 'Lectura hasta 7000 MB/s, PCIe 4.0. Velocidad extrema.', 449, 22, '💾', true],
  ['SSD Kingston NV2 500GB', 'Almacenamiento', 'NVMe PCIe 4.0, lectura hasta 3500 MB/s.', 169, 40, '💾', false],
  ['Disco Duro Seagate Barracuda 2TB', 'Almacenamiento', '3.5" 7200 RPM. Almacenamiento masivo a buen precio.', 229, 30, '💾', false],
  ['Memoria RAM Corsair Vengeance 16GB DDR5', 'Almacenamiento', 'Kit 2x8GB DDR5 5600MHz con disipador.', 289, 26, '💾', false],

  ['Teclado Mecánico Redragon Kumara', 'Accesorios', 'Switches Outemu Blue, retroiluminado RGB, formato TKL.', 159, 35, '⌨️', false],
  ['Mouse Logitech G502 Hero', 'Accesorios', 'Sensor de 25K DPI, 11 botones programables.', 219, 28, '🖱️', true],
  ['Audífonos HyperX Cloud II', 'Accesorios', 'Sonido envolvente 7.1 virtual, micrófono desmontable.', 349, 16, '🎧', false],
  ['Silla Gamer Cougar Armor One', 'Accesorios', 'Ergonómica, reclinable 180°, soporte lumbar y cervical.', 899, 7, '🪑', false]
];

const ORDENES = {
  relevancia: 'destacado DESC, id ASC',
  precio_asc: 'precio ASC, id ASC',
  precio_desc: 'precio DESC, id ASC',
  nombre: 'nombre ASC'
};

class ProductoModel {
  constructor(conexion) {
    this.pool = conexion.obtenerPool();
  }

  async inicializarTabla() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        emoji VARCHAR(10) NOT NULL DEFAULT '🖥️',
        destacado BOOLEAN NOT NULL DEFAULT FALSE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows } = await this.pool.query('SELECT COUNT(*)::int AS total FROM productos');
    if (rows[0].total === 0) {
      await this.sembrar();
    }
  }

  async sembrar() {
    const valores = [];
    const marcas = PRODUCTOS_INICIALES.map((p, i) => {
      valores.push(...p);
      const b = i * 7;
      return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7})`;
    });
    await this.pool.query(
      `INSERT INTO productos (nombre, categoria, descripcion, precio, stock, emoji, destacado) VALUES ${marcas.join(', ')}`,
      valores
    );
    console.log(`Catálogo inicial creado: ${PRODUCTOS_INICIALES.length} productos.`);
  }

  async listar({ categoria, q, orden } = {}) {
    const condiciones = [];
    const params = [];

    if (categoria) {
      params.push(categoria);
      condiciones.push(`categoria = $${params.length}`);
    }
    if (q) {
      const patron = `%${String(q).replace(/[\\%_]/g, '\\$&')}%`;
      params.push(patron);
      condiciones.push(`(nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const orderBy = ORDENES[orden] || ORDENES.relevancia;

    const { rows } = await this.pool.query(
      `SELECT id, nombre, categoria, descripcion, precio, stock, emoji, destacado
       FROM productos ${where} ORDER BY ${orderBy}`,
      params
    );
    return rows.map((p) => ({ ...p, precio: Number(p.precio) }));
  }

  async categorias() {
    const { rows } = await this.pool.query(
      'SELECT categoria, COUNT(*)::int AS total FROM productos GROUP BY categoria ORDER BY categoria'
    );
    return rows;
  }
}

module.exports = ProductoModel;
