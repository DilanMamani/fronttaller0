import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPersonasParaSacramento } from '../../sacramentos/slices/sacramentosTrunk';
import NuevaPersonaModal from './NuevaPersonaModal';

/**
 * Roles aceptados por el backend
 * ─────────────────────────────────────────────────────────────────────────────
 * tipo=sacramento → rol: bautizo | comunion | matrimonio
 * tipo=rol        → rol: padrino | ministro | testigo | (cualquier rol del sistema)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Props:
 *  - label               : string
 *  - placeholder         : string
 *  - initialQuery        : string     — texto pre-cargado del OCR
 *  - datosOcr            : object     — datos para pre-rellenar el modal de nueva persona
 *  - onSelect            : (persona) => void
 *  - onClear             : () => void
 *  - personaSeleccionada : object | null
 *  - advertencia         : string     — aviso opcional
 *  - error               : string     — error de validación externo
 *  - rol                 : string     — rol para la búsqueda (ver tabla arriba)
 *  - tipo                : string     — 'sacramento' | 'rol'
 *  - permitirCrear       : bool       — si se permite crear nueva persona (default: true)
 */
export default function PersonaBuscador({
  label = 'Buscar persona',
  placeholder = 'Escribir nombre o CI (mín. 3 caracteres)...',
  initialQuery = '',
  datosOcr = {},
  onSelect,
  onClear,
  personaSeleccionada = null,
  advertencia = '',
  error = '',
  rol = 'bautizo',
  tipo = 'sacramento',
  permitirCrear = true,
}) {
  const dispatch = useDispatch();

  const [query, setQuery] = useState(initialQuery || '');
  const [resultados, setResultados] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (personaSeleccionada) return;
    clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResultados([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const action = await dispatch(
          fetchPersonasParaSacramento({ search: query.trim(), rol, tipo })
        );
        if (fetchPersonasParaSacramento.fulfilled.match(action)) {
          const personas = action.payload?.personas ?? action.payload ?? [];
          setResultados(personas);
          setOpen(true);
        } else {
          // Mostrar mensaje de error del servidor si lo hay
          const msg = action.payload?.msg || action.payload?.message || 'Error al buscar personas.';
          setSearchError(msg);
          setResultados([]);
          setOpen(true);
        }
      } catch {
        setSearchError('Error al buscar personas.');
        setOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, personaSeleccionada]);

  const handleSelect = (persona) => {
    setOpen(false);
    setQuery(
      [persona.nombre, persona.apellido_paterno, persona.apellido_materno]
        .filter(Boolean)
        .join(' ')
    );
    onSelect(persona);
  };

  const handleClear = () => {
    setQuery('');
    setResultados([]);
    setOpen(false);
    setSearchError('');
    onClear();
  };

  const handlePersonaCreada = (persona) => {
    setModalOpen(false);
    handleSelect(persona);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      )}

      {/* Advertencia opcional */}
      {advertencia && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <span className="material-symbols-outlined text-amber-500 text-[16px] mt-0.5 flex-shrink-0">
            warning
          </span>
          <p className="text-xs text-amber-700 dark:text-amber-400">{advertencia}</p>
        </div>
      )}

      {/* Persona ya seleccionada */}
      {personaSeleccionada ? (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0">
              check_circle
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate">
                {personaSeleccionada.nombre} {personaSeleccionada.apellido_paterno}{' '}
                {personaSeleccionada.apellido_materno}
              </p>
              {personaSeleccionada.carnet_identidad && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  CI: {personaSeleccionada.carnet_identidad}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            title="Cambiar persona"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ) : (
        /* Campo de búsqueda */
        <div className="relative">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => (resultados.length > 0 || searchError) && setOpen(true)}
              placeholder={placeholder}
              className={[
                'w-full pl-9 pr-10 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-white outline-none transition-colors',
                error
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
              ].join(' ')}
            />
            {isSearching && (
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px] animate-spin">
                progress_activity
              </span>
            )}
            {!isSearching && query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Dropdown resultados */}
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
              {searchError ? (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">error</span>
                    {searchError}
                  </p>
                  {permitirCrear && (
                    <button
                      type="button"
                      onClick={() => { setOpen(false); setModalOpen(true); }}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                      Registrar nueva persona
                    </button>
                  )}
                </div>
              ) : resultados.length === 0 ? (
                <div className="px-4 py-3 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sin resultados para <strong>"{query}"</strong>
                  </p>
                  {permitirCrear && (
                    <button
                      type="button"
                      onClick={() => { setOpen(false); setModalOpen(true); }}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                      Registrar nueva persona
                    </button>
                  )}
                </div>
              ) : (
                <ul className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {resultados.map((p) => (
                    <li key={p.id_persona}>
                      <button
                        type="button"
                        onClick={() => handleSelect(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-gray-400 text-[18px]">
                          person
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                          </p>
                          {p.carnet_identidad && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              CI: {p.carnet_identidad}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                  {permitirCrear && (
                    <li>
                      <button
                        type="button"
                        onClick={() => { setOpen(false); setModalOpen(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-primary hover:bg-primary/5 transition-colors border-t border-gray-100 dark:border-gray-700"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        <span className="text-xs font-medium">Registrar nueva persona</span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error de validación externo — con salida clara hacia "registrar nueva persona"
          en vez de dejar al usuario con un input en rojo sin saber qué hacer. */}
      {error && (
        <div className="space-y-1.5">
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">error</span>
            {error}
          </p>
          {!personaSeleccionada && permitirCrear && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">person_add</span>
              {query.trim().length > 0
                ? `No encontramos a "${query.trim()}" — registrar como persona nueva`
                : 'Registrar nueva persona'}
            </button>
          )}
        </div>
      )}

      {/* Modal nueva persona */}
      <NuevaPersonaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPersonaCreada={handlePersonaCreada}
        datosOcr={{ ...datosOcr, nombre_completo: datosOcr.nombre_completo || query }}
      />
    </div>
  );
}
