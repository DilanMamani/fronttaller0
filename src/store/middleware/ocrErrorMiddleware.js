import Swal from 'sweetalert2';

const OCR_REJECTED_ACTIONS = [
  'ocr/uploadPreview/rejected',
  'ocr/asignarParroquia/rejected',
  'ocr/crearParroquia/rejected',
  'ocr/confirmar/rejected',
  'ocr/rechazar/rejected',
  'ocr/fetchHistorico/rejected',
];

/**
 * Convierte el objeto errors del backend en texto legible
 * { numero: { msg: '...' }, nombre: { msg: '...' } }  →  "El número es obligatorio\nEl nombre es obligatorio"
 */
export const extraerMensaje = (payload) => {
  if (!payload) return 'Ocurrió un error inesperado';
  if (typeof payload === 'string') return payload;
  if (payload.errors && typeof payload.errors === 'object') {
    const mensajes = Object.values(payload.errors)
      .map((e) => e.msg)
      .filter(Boolean);
    if (mensajes.length) return mensajes.join('\n');
  }
  return payload.msg || payload.message || 'Ocurrió un error inesperado';
};

export const ocrErrorMiddleware = (_store) => (next) => (action) => {
  if (OCR_REJECTED_ACTIONS.includes(action.type)) {
    const mensaje = extraerMensaje(action.payload);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonText: 'Entendido',
      confirmButtonColor: 'var(--color-primary, #6366f1)',
    });
  }

  return next(action);
};