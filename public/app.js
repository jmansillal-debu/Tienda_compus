document.addEventListener('DOMContentLoaded', async () => {
  let auth;
  const tienda = new Tienda(() => auth.mostrar());
  auth = new ClienteRegistro((usuario) => tienda.iniciar(usuario));

  // Si el token expira mientras se usa la tienda, volver al login
  window.addEventListener('sesion-expirada', () => {
    if (tienda.usuario) {
      tienda.cerrarSesion();
      auth.mostrarMensaje('Tu sesión expiró. Inicia sesión nuevamente.', '#f87171');
    }
  });

  // Sesión guardada: entrar directo a la tienda
  if (Api.obtenerToken()) {
    try {
      const { usuario } = await Api.get('/api/perfil');
      tienda.iniciar(usuario);
      return;
    } catch (e) {
      Api.guardarToken(null);
    }
  }
  auth.mostrar();
});
