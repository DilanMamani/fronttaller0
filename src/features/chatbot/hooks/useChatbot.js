import { useState, useCallback } from 'react';
import { chatbotApi } from '../../../lib/api'; // Ajusta la ruta de importación según tu estructura

/**
 * Tipos de mensajes en el historial local (para renderizado):
 * { id, role: 'user'|'assistant', tipo_respuesta: 'texto'|'ui_cards_seleccion_persona'|'ui_cards_sacramento', content, datos }
 *
 * Historial para el backend (formato Gemini):
 * { role: 'user'|'model', content: string }
 */
export function useChatbot() {
  // Historial completo para renderizar en pantalla
  const [mensajes, setMensajes] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      tipo_respuesta: 'texto',
      content:
        '¡Hola! Soy el asistente de búsqueda. Puedo ayudarte a encontrar personas por nombre o carnet, y sacramentos por foja, fecha o tipo. ¿Qué deseas buscar?',
    },
  ]);

  // Historial reducido para enviar al backend (solo texto, formato Gemini)
  const [historialBackend, setHistorialBackend] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Envía un mensaje al backend.
   * @param {string} textoUsuario - Texto visible del usuario.
   * @param {boolean} silencioso - Si es true, no agrega el mensaje del usuario al historial visible.
   */
  const enviarMensaje = useCallback(
    async (textoUsuario, silencioso = false) => {
      if (!textoUsuario?.trim() || cargando) return;

      setError(null);
      setCargando(true);

      // ── 1. Agregar mensaje del usuario al historial visible ──
      const mensajeUsuario = {
        id: `user-${Date.now()}`,
        role: 'user',
        tipo_respuesta: 'texto',
        content: textoUsuario,
      };

      if (!silencioso) {
        setMensajes((prev) => [...prev, mensajeUsuario]);
      }

      // ── 2. Actualizar historial del backend ──
      const nuevoHistorial = [
        ...historialBackend,
        { role: 'user', content: textoUsuario },
      ];

      try {
        // AQUÍ USAMOS TU API CENTRALIZADA (Axios se encarga del token y del JSON)
        const data = await chatbotApi.enviarMensaje({
          mensaje: textoUsuario,
          historial: historialBackend, // historial ANTES de este mensaje
        });

        // ── 3. Construir mensaje de respuesta del asistente ──
        const mensajeAsistente = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          tipo_respuesta: data.tipo_respuesta,
          content: data.mensaje ?? '',
          datos: data.datos ?? [],
        };

        setMensajes((prev) => [...prev, mensajeAsistente]);

        // ── 4. Actualizar historial del backend solo si fue respuesta de texto ──
        if (data.tipo_respuesta === 'texto') {
          setHistorialBackend([
            ...nuevoHistorial,
            { role: 'model', content: data.mensaje },
          ]);
        } else {
          // Para cards, guardamos el turno del usuario pero no generamos turno del modelo
          setHistorialBackend(nuevoHistorial);
        }
      } catch (err) {
        console.error('Error en chatbot:', err);
        // Extraemos el mensaje de error que viene de tu handleError en api.js
        const errorMsg = err.message || err.msg || 'Hubo un error de conexión con el servidor.';
        
        setError(errorMsg);

        setMensajes((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            tipo_respuesta: 'texto',
            content: `Hubo un error: ${errorMsg}`,
          },
        ]);
      } finally {
        setCargando(false);
      }
    },
    [cargando, historialBackend]
  );

  /**
   * Seleccionar una persona desde una tarjeta.
   * Envía un mensaje silencioso al backend con el ID.
   */
  const seleccionarPersona = useCallback(
    (persona) => {
      const mensajeSilencioso = `Selecciono a la persona con ID ${persona.id_persona}: ${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`;
      enviarMensaje(mensajeSilencioso, false);
    },
    [enviarMensaje]
  );

  /**
   * Seleccionar un sacramento desde una tarjeta.
   */
  const seleccionarSacramento = useCallback(
    (sacramento) => {
      const mensajeSilencioso = `Selecciono el sacramento con ID ${sacramento.id_sacramento}`;
      enviarMensaje(mensajeSilencioso, false);
    },
    [enviarMensaje]
  );

  const limpiarChat = useCallback(() => {
    setMensajes([
      {
        id: 'welcome',
        role: 'assistant',
        tipo_respuesta: 'texto',
        content: '¡Hola! ¿Qué deseas buscar?',
      },
    ]);
    setHistorialBackend([]);
    setError(null);
  }, []);

  return {
    mensajes,
    cargando,
    error,
    enviarMensaje,
    seleccionarPersona,
    seleccionarSacramento,
    limpiarChat,
  };
}