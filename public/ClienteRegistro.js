// Maneja la vista de Login y Registro
class ClienteRegistro {
  constructor(alIniciarSesion) {
    this.alIniciarSesion = alIniciarSesion;
    this.vista = document.getElementById('vistaAuth');
    this.formLogin = document.getElementById('formularioLogin');
    this.formRegistro = document.getElementById('formularioRegistro');
    this.mensaje = document.getElementById('mensaje');
    this.tabLogin = document.getElementById('tabLogin');
    this.tabRegistro = document.getElementById('tabRegistro');
    this.inicializar();
  }

  inicializar() {
    this.tabLogin.addEventListener('click', () => this.cambiarPestana('login'));
    this.tabRegistro.addEventListener('click', () => this.cambiarPestana('registro'));
    this.formLogin.addEventListener('submit', (e) => this.procesarLogin(e));
    this.formRegistro.addEventListener('submit', (e) => this.procesarFormulario(e));
  }

  mostrar() {
    this.vista.classList.remove('oculto');
    this.cambiarPestana('login');
  }

  ocultar() {
    this.vista.classList.add('oculto');
  }

  cambiarPestana(cual) {
    const esLogin = cual === 'login';
    this.formLogin.classList.toggle('oculto', !esLogin);
    this.formRegistro.classList.toggle('oculto', esLogin);
    this.tabLogin.classList.toggle('activa', esLogin);
    this.tabRegistro.classList.toggle('activa', !esLogin);
    this.mostrarMensaje('', '');
  }

  async procesarLogin(evento) {
    evento.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await this.enviar('/api/login', { email, password }, this.formLogin);
  }

  async procesarFormulario(evento) {
    evento.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const interes = document.getElementById('interes').value;
    await this.enviar('/api/registrar', { nombre, email, password, interes }, this.formRegistro);
  }

  async enviar(url, datos, formulario) {
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    this.mostrarMensaje('Enviando...', '#38bdf8');

    try {
      const respuesta = await Api.post(url, datos);
      Api.guardarToken(respuesta.token);
      this.mostrarMensaje(respuesta.mensaje, '#4ade80');
      formulario.reset();
      this.ocultar();
      this.alIniciarSesion(respuesta.cliente);
    } catch (error) {
      this.mostrarMensaje(error.message, '#f87171');
    } finally {
      boton.disabled = false;
    }
  }

  mostrarMensaje(texto, color) {
    this.mensaje.innerText = texto;
    this.mensaje.style.color = color;
  }
}
