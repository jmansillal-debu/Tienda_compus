class Api {
  static obtenerToken() {
    return localStorage.getItem('token');
  }

  static guardarToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  static async pedir(url, opciones = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.obtenerToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let respuesta;
    try {
      respuesta = await fetch(url, { ...opciones, headers });
    } catch (e) {
      throw new Error('Error al conectar con el servidor.');
    }

    let datos = {};
    try { datos = await respuesta.json(); } catch (e) { /* sin cuerpo */ }

    if (!respuesta.ok) {
      const error = new Error(datos.error || 'Ocurrió un error inesperado.');
      error.status = respuesta.status;
      if (respuesta.status === 401 && token) {
        window.dispatchEvent(new CustomEvent('sesion-expirada'));
      }
      throw error;
    }
    return datos;
  }

  static get(url) {
    return this.pedir(url);
  }

  static post(url, cuerpo) {
    return this.pedir(url, { method: 'POST', body: JSON.stringify(cuerpo) });
  }
}
