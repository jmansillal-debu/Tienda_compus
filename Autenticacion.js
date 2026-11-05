const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class Autenticacion {
  constructor() {
    this.secreto = process.env.JWT_SECRET;
    if (!this.secreto) {
      this.secreto = crypto.randomBytes(32).toString('hex');
      console.warn('⚠️  JWT_SECRET no está definida. Se generó una temporal (las sesiones se cierran al reiniciar). Defínela en Render.');
    }
  }

  generarToken(usuario) {
    return jwt.sign({ id: usuario.id }, this.secreto, { expiresIn: '7d' });
  }

  proteger = (req, res, next) => {
    const cabecera = req.headers.authorization || '';
    const [tipo, token] = cabecera.split(' ');
    if (tipo !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Debes iniciar sesión.' });
    }
    try {
      const datos = jwt.verify(token, this.secreto);
      req.usuario = { id: datos.id };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }
  };
}

module.exports = Autenticacion;
