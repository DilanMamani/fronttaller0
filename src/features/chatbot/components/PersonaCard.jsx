import React from 'react';

/**
 * Tarjeta de persona. Se muestra cuando tipo_respuesta === 'ui_cards_seleccion_persona'.
 *
 * @param {{ persona: object, onSeleccionar: (persona: object) => void }} props
 */
export function PersonaCard({ persona, onSeleccionar }) {
  const nombreCompleto = [
    persona.nombre,
    persona.apellido_paterno,
    persona.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ');

  const iniciales = [persona.nombre?.[0], persona.apellido_paterno?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <div className="chatbot-card chatbot-card--persona">
      {/* Avatar con iniciales */}
      <div className="chatbot-card__avatar">
        <span>{iniciales}</span>
      </div>

      {/* Datos */}
      <div className="chatbot-card__body">
        <p className="chatbot-card__nombre">{nombreCompleto}</p>

        {persona.carnet_identidad && (
          <p className="chatbot-card__dato">
            <span className="chatbot-card__label">CI:</span>{' '}
            {persona.carnet_identidad}
          </p>
        )}

        {persona.fecha_nacimiento && (
          <p className="chatbot-card__dato">
            <span className="chatbot-card__label">Nacimiento:</span>{' '}
            {new Date(persona.fecha_nacimiento).toLocaleDateString('es-BO')}
          </p>
        )}

        {persona.lugar_nacimiento && (
          <p className="chatbot-card__dato">
            <span className="chatbot-card__label">Lugar:</span>{' '}
            {persona.lugar_nacimiento}
          </p>
        )}

        {persona.estado && (
          <p className="chatbot-card__dato">
            <span className="chatbot-card__label">Estado:</span>{' '}
            {persona.estado}
          </p>
        )}
      </div>

      {/* Acción */}
      <button
        className="chatbot-card__btn"
        onClick={() => onSeleccionar(persona)}
        type="button"
      >
        Seleccionar
      </button>
    </div>
  );
}