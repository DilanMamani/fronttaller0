import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { asignarParroquiaOcr, crearParroquiaOcr } from '../slices/ocrThunk';
import {
  selectOcrHistoricoId,
  selectOcrIsSavingParroquia,
  selectOcrError,
  clearError,
} from '../slices/ocrSlice';
import { parroquiasApi } from '../../../lib/api';

/**
 * Paso 3 — Confirmar parroquia.
 * Usa campo de texto con búsqueda para seleccionar parroquia existente
 * o crear una nueva.
 */
export default function Paso3Parroquia() {
  const dispatch = useDispatch();
  const historicoId = useSelector(selectOcrHistoricoId);
  const isSaving = useSelector(selectOcrIsSavingParroquia);
  const errorGlobal = useSelector(selectOcrError);

  const [modo, setModo] = useState('existente');
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [nuevaParroquia, setNuevaParroquia] = useState({
    nombre_parroquia: '',
    direccion: '',
    ciudad: '',
  });
  const [localError, setLocalError] = useState('');

  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (parroquiaSeleccionada || modo !== 'existente') return;
    clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResultados([]);
      setOpenDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await parroquiasApi.fetchParroquias({ search: query.trim(), limit: 20 });
        const lista = data?.parroquias ?? data?.rows ?? [];
        setResultados(lista);
        setOpenDropdown(true);
      } catch {
        setResultados([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, parroquiaSeleccionada, modo]);

  const handleSelectParroquia = (p) => {
    setParroquiaSeleccionada(p);
    setQuery(p.nombre ?? p.nombre_parroquia ?? '');
    setOpenDropdown(false);
    setLocalError('');
  };

  const handleClearParroquia = () => {
    setParroquiaSeleccionada(null);
    setQuery('');
    setResultados([]);
  };

  const handleSubmit = () => {
    dispatch(clearError());
    setLocalError('');

    if (modo === 'existente') {
      if (!parroquiaSeleccionada) return setLocalError('Selecciona una parroquia.');
      dispatch(
        asignarParroquiaOcr({
          historicoId,
          parroquiaId: parroquiaSeleccionada.id_parroquia,
        })
      );
    } else {
      if (!nuevaParroquia.nombre_parroquia.trim())
        return setLocalError('Ingresa el nombre de la parroquia.');
      dispatch(crearParroquiaOcr({ historicoId, data: nuevaParroquia }));
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Confirmar parroquia
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          El OCR no pudo identificar la parroquia con certeza. Búscala por nombre o registra una
          nueva.
        </p>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2">
        {[
          { key: 'existente', label: 'Parroquia existente' },
          { key: 'nueva', label: 'Nueva parroquia' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => { setModo(opt.key); setLocalError(''); }}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              modo === opt.key
                ? 'bg-primary/10 border-primary text-primary font-medium'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Búsqueda de parroquia existente */}
      {modo === 'existente' && (
        <div className="flex flex-col gap-1.5" ref={containerRef}>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Buscar parroquia *
          </label>

          {parroquiaSeleccionada ? (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {parroquiaSeleccionada.nombre ?? parroquiaSeleccionada.nombre_parroquia}
                  </p>
                  <p className="text-xs text-emerald-600">ID: {parroquiaSeleccionada.id_parroquia}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearParroquia}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => resultados.length > 0 && setOpenDropdown(true)}
                  placeholder="Escribir nombre de parroquia (mín. 2 caracteres)..."
                  className={[
                    'w-full pl-9 pr-9 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-white outline-none transition-colors',
                    localError && !parroquiaSeleccionada
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
                  ].join(' ')}
                />
                {isSearching && (
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px] animate-spin">
                    progress_activity
                  </span>
                )}
              </div>

              {openDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
                  {resultados.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      Sin resultados para "{query}". Puedes crear una nueva parroquia.
                    </div>
                  ) : (
                    <ul className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {resultados.map((p) => (
                        <li key={p.id_parroquia}>
                          <button
                            type="button"
                            onClick={() => handleSelectParroquia(p)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">
                              church
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {p.nombre ?? p.nombre_parroquia}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Nueva parroquia */}
      {modo === 'nueva' && (
        <div className="space-y-3">
          <Field label="Nombre de la parroquia *">
            <input
              type="text"
              value={nuevaParroquia.nombre_parroquia}
              onChange={(e) =>
                setNuevaParroquia((p) => ({ ...p, nombre_parroquia: e.target.value }))
              }
              className={ic(!!localError && !nuevaParroquia.nombre_parroquia)}
            />
          </Field>
          <Field label="Dirección">
            <input
              type="text"
              value={nuevaParroquia.direccion}
              onChange={(e) => setNuevaParroquia((p) => ({ ...p, direccion: e.target.value }))}
              className={ic()}
            />
          </Field>
          <Field label="Ciudad">
            <input
              type="text"
              value={nuevaParroquia.ciudad}
              onChange={(e) => setNuevaParroquia((p) => ({ ...p, ciudad: e.target.value }))}
              className={ic()}
            />
          </Field>
        </div>
      )}

      {/* Errores */}
      {(localError || errorGlobal) && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {localError || errorGlobal}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            Guardando...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">check</span>
            Confirmar parroquia y continuar
          </>
        )}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const ic = (err = false) =>
  [
    'w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-white outline-none transition-colors',
    err
      ? 'border-red-500 focus:ring-2 focus:ring-red-300'
      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
  ].join(' ');
