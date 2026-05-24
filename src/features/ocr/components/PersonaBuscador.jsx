import { useState, useEffect, useRef } from 'react';
import { ocrApi } from '../../../lib/api';
import NuevaPersonaModal from './NuevaPersonaModal';
 
/**
 * Buscador de personas con autocompletado + botón "Crear nueva persona".
 *
 * Props:
 *  - label            : string           — etiqueta del campo
 *  - placeholder      : string
 *  - initialQuery     : string           — texto pre-rellenado (ej. nombre del contrayente)
 *  - datosOcr         : object           — datos del OCR para pre-rellenar el modal de creación
 *  - onSelect         : (persona) => void
 *  - onClear          : () => void
 *  - personaSeleccionada: object | null
 *  - advertencia      : string | null    — mensaje de advertencia debajo del buscador
 *  - error            : string | null    — mensaje de error resaltado
 */
export default function PersonaBuscador({
  label,
  placeholder = 'Buscar persona...',
  initialQuery = '',
  datosOcr = {},
  onSelect,
  onClear,
  personaSeleccionada = null,
  advertencia = null,
  error = null,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);
 
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
 
  // Búsqueda debounced
  useEffect(() => {
    if (personaSeleccionada) return; // no buscar si ya hay selección
    clearTimeout(timerRef.current);
    if (query.trim().length < 3) {
      setResultados([]);
      setDropdownOpen(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const resp = await ocrApi.buscarPersonas({ search: query });
        const personas = resp?.personas || [];
        setResultados(personas);
        setDropdownOpen(personas.length > 0);
      } catch {
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps
 
  const handleSelect = (persona) => {
    setDropdownOpen(false);
    setQuery(`${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`);
    onSelect(persona);
  };
 
  const handleClear = () => {
    setQuery('');
    setResultados([]);
    setDropdownOpen(false);
    onClear?.();
  };
 
  const handlePersonaCreada = (persona) => {
    setModalOpen(false);
    setQuery(`${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`);
    onSelect(persona);
  };
 
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      )}
 
      {/* Tarjeta de persona seleccionada */}
      {personaSeleccionada ? (
        <div
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
            error
              ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
              : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">person</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {personaSeleccionada.nombre} {personaSeleccionada.apellido_paterno}{' '}
                {personaSeleccionada.apellido_materno}
                {personaSeleccionada.estado === 'no verificado' && (
                  <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">
                    no verificado
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CI: {personaSeleccionada.carnet_identidad}
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
            Cambiar
          </button>
        </div>
      ) : (
        /* Buscador */
        <div ref={wrapRef} className="relative">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 ${
              error
                ? 'border-red-500 ring-2 ring-red-300'
                : 'border-gray-300 dark:border-gray-600 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
            } transition-all`}
          >
            <span className="material-symbols-outlined text-[18px] text-gray-400">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder={placeholder}
              className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            {loading && (
              <span className="material-symbols-outlined text-[16px] text-gray-400 animate-spin">
                progress_activity
              </span>
            )}
          </div>
 
          {/* Dropdown */}
          {dropdownOpen && resultados.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
              {resultados.map((p) => (
                <button
                  key={p.id_persona}
                  onMouseDown={() => handleSelect(p)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    CI: {p.carnet_identidad}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
 
      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
 
      {/* Advertencia */}
      {advertencia && !personaSeleccionada && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <span className="material-symbols-outlined text-amber-600 text-[16px] mt-0.5 shrink-0">warning</span>
          <p className="text-xs text-amber-700 dark:text-amber-400">{advertencia}</p>
        </div>
      )}
 
      {/* Botón crear nueva persona */}
      {!personaSeleccionada && (
        <button
          onClick={() => setModalOpen(true)}
          className="self-start flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-0.5"
        >
          <span className="material-symbols-outlined text-[15px]">person_add</span>
          Crear nueva persona
        </button>
      )}
 
      {/* Modal de creación */}
      <NuevaPersonaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPersonaCreada={handlePersonaCreada}
        datosOcr={datosOcr}
      />
    </div>
  );
}