import React from 'react';

// Mapeo de tipo a etiqueta visual
const TIPO_LABELS = {
  1: { texto: 'Bautizo', clase: 'chatbot-badge--bautizo' },
  2: { texto: 'Matrimonio', clase: 'chatbot-badge--matrimonio' },
  3: { texto: 'Comunión', clase: 'chatbot-badge--comunion' },
};

/**
 * Tarjeta de sacramento. Se muestra cuando tipo_respuesta === 'ui_cards_sacramento'.
 * Maneja tanto resultados de buscar_sacramento como de buscar_sacramento_por_persona.
 *
 * @param {{ dato: object, onSeleccionar: (dato: object) => void }} props
 */
export function SacramentoCard({ dato, onSeleccionar }) {
  // El dato puede ser un Sacramento directo o un PersonaSacramento con .sacramento anidado
  const sacramento = dato.sacramento ?? dato;
  const tipoId = sacramento.tipo_sacramento_id_tipo ?? sacramento.tipoSacramento?.id_tipo_sacra;
  const tipoNombre =
    sacramento.tipoSacramento?.nombre ??
    TIPO_LABELS[tipoId]?.texto ??
    'Sacramento';
  const badgeClase = TIPO_LABELS[tipoId]?.clase ?? '';

  const parroquia = sacramento.parroquia?.nombre ?? '—';

  const fechaFormateada = sacramento.fecha_sacramento
    ? new Date(sacramento.fecha_sacramento).toLocaleDateString('es-BO')
    : '—';

  // Si viene de buscar_sacramento_por_persona, el rol está en el wrapper
  const rol = dato.rolSacramento?.nombre ?? null;

  return (
    <div className="chatbot-card chatbot-card--sacramento">
      {/* Badge de tipo */}
      <span className={`chatbot-badge ${badgeClase}`}>{tipoNombre}</span>

      <div className="chatbot-card__body">
        {/* Foja y número */}
        <div className="chatbot-card__row">
          {sacramento.foja && (
            <p className="chatbot-card__dato">
              <span className="chatbot-card__label">Foja:</span> {sacramento.foja}
            </p>
          )}
          {sacramento.numero && (
            <p className="chatbot-card__dato">
              <span className="chatbot-card__label">Acta N°:</span> {sacramento.numero}
            </p>
          )}
        </div>

        {/* Fecha */}
        <p className="chatbot-card__dato">
          <span className="chatbot-card__label">Fecha:</span> {fechaFormateada}
        </p>

        {/* Parroquia */}
        <p className="chatbot-card__dato">
          <span className="chatbot-card__label">Parroquia:</span> {parroquia}
        </p>

        {/* Rol (solo cuando viene de buscar_sacramento_por_persona) */}
        {rol && (
          <p className="chatbot-card__dato">
            <span className="chatbot-card__label">Rol:</span> {rol}
          </p>
        )}

        {/* Observaciones */}
        {sacramento.observaciones && (
          <p className="chatbot-card__dato chatbot-card__observaciones">
            {sacramento.observaciones}
          </p>
        )}
      </div>

      {/* Acción */}
      <button
        className="chatbot-card__btn"
        onClick={() => onSeleccionar(dato)}
        type="button"
      >
        Ver detalle
      </button>
    </div>
  );
}