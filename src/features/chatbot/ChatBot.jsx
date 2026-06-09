import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from './hooks/useChatbot';
import { PersonaCard } from './components/PersonaCard';
import { SacramentoCard } from './components/SacramentoCard';
import './ChatBot.css';
import Layout from '../../shared/components/layout/Layout';
/**
 * Componente principal del chatbot de búsqueda.
 * Renderiza el historial de mensajes con lógica condicional:
 *  - tipo_respuesta === 'texto'                       → burbuja de chat
 *  - tipo_respuesta === 'ui_cards_seleccion_persona'  → grid de PersonaCards
 *  - tipo_respuesta === 'ui_cards_sacramento'         → grid de SacramentoCards
 */
export default function ChatBot() {
  const {
    mensajes,
    cargando,
    error,
    enviarMensaje,
    seleccionarPersona,
    seleccionarSacramento,
    limpiarChat,
  } = useChatbot();

  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  const handleEnviar = () => {
    if (!input.trim() || cargando) return;
    enviarMensaje(input.trim());
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  // ──────────────────────────────────────────────
  // Renderizador de mensajes individuales
  // ──────────────────────────────────────────────
  const renderMensaje = (msg) => {
    const esUsuario = msg.role === 'user';

    // ── Burbuja de texto (usuario o asistente) ──
    if (msg.tipo_respuesta === 'texto' || esUsuario) {
      return (
        <div
          key={msg.id}
          className={`chatbot-message chatbot-message--${esUsuario ? 'user' : 'assistant'}`}
        >
          {!esUsuario && (
            <div className="chatbot-message__avatar">
              <BotIcon />
            </div>
          )}
          <div className="chatbot-message__bubble">
            <p>{msg.content}</p>
          </div>
        </div>
      );
    }

    // ── Cards de personas ──
    if (msg.tipo_respuesta === 'ui_cards_seleccion_persona') {
      return (
        <div key={msg.id} className="chatbot-message chatbot-message--assistant">
          <div className="chatbot-message__avatar">
            <BotIcon />
          </div>
          <div className="chatbot-message__cards-wrapper">
            {msg.content && (
              <p className="chatbot-message__cards-label">{msg.content}</p>
            )}
            <div className="chatbot-cards-grid">
              {msg.datos.map((persona) => (
                <PersonaCard
                  key={persona.id_persona}
                  persona={persona}
                  onSeleccionar={seleccionarPersona}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── Cards de sacramentos ──
    if (msg.tipo_respuesta === 'ui_cards_sacramento') {
      return (
        <div key={msg.id} className="chatbot-message chatbot-message--assistant">
          <div className="chatbot-message__avatar">
            <BotIcon />
          </div>
          <div className="chatbot-message__cards-wrapper">
            {msg.content && (
              <p className="chatbot-message__cards-label">{msg.content}</p>
            )}
            <div className="chatbot-cards-grid">
              {msg.datos.map((dato, idx) => (
                <SacramentoCard
                  key={dato.id_sacramento ?? dato.sacramento?.id_sacramento ?? idx}
                  dato={dato}
                  onSeleccionar={seleccionarSacramento}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ──────────────────────────────────────────────
  return (
    
    <Layout title="Chatbot de busqueda">
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header__info">
            <BotIcon className="chatbot-header__icon" />
            <div>
              <h2 className="chatbot-header__title">Asistente de Búsqueda</h2>
              <span className="chatbot-header__subtitle">
                Personas · Sacramentos · Registros
              </span>
            </div>
          </div>
          <button
            className="chatbot-header__btn-limpiar"
            onClick={limpiarChat}
            title="Limpiar conversación"
            type="button"
          >
            <TrashIcon />
          </button>
        </div>

        {/* Área de mensajes */}
        <div className="chatbot-messages">
          {mensajes.map(renderMensaje)}

          {/* Indicador de escritura */}
          {cargando && (
            <div className="chatbot-message chatbot-message--assistant">
              <div className="chatbot-message__avatar">
                <BotIcon />
              </div>
              <div className="chatbot-message__bubble chatbot-message__bubble--typing">
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
                <span className="chatbot-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Sugerencias rápidas (solo si el chat está vacío) */}
        {mensajes.length <= 1 && (
          <div className="chatbot-suggestions">
            {[
              'Buscar persona por nombre',
              'Buscar bautizo por foja',
              'Matrimonios de una persona',
            ].map((sugerencia) => (
              <button
                key={sugerencia}
                className="chatbot-suggestion-chip"
                onClick={() => enviarMensaje(sugerencia)}
                type="button"
              >
                {sugerencia}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            placeholder="Escribe tu búsqueda… (Enter para enviar)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={cargando}
          />
          <button
            className="chatbot-send-btn"
            onClick={handleEnviar}
            disabled={cargando || !input.trim()}
            type="button"
            aria-label="Enviar mensaje"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </Layout>
  );
}

function BotIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}