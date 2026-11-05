class ClienteRegistro {
  constructor(formId, msgId) {
    this.formulario = document.getElementById(formId);
    this.mensaje = document.getElementById(msgId);
    this.inicializar();
  }

  inicializar() {
    this.formulario.addEventListener('submit', (e) => this.procesarFormulario(e));
  }

  async procesarFormulario(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const interes = document.getElementById('interes').value;

    this.mostrarMensaje('Enviando...', '#38bdf8');

    try {
      const respuesta = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, interes })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        this.mostrarMensaje(datos.mensaje, '#4ade80');
        this.formulario.reset();
      } else {
        this.mostrarMensaje(datos.error, '#f87171');
      }
    } catch (error) {
      this.mostrarMensaje('Error al conectar con el servidor.', '#f87171');
    }
  }

  mostrarMensaje(texto, color) {
    this.mensaje.innerText = texto;
    this.mensaje.style.color = color;
  }
}
