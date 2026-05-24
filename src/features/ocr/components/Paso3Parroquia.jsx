import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { asignarParroquiaOcr, crearParroquiaOcr } from '../slices/ocrThunk';
import {
  selectOcrHistoricoId,
  selectOcrIsSavingParroquia,
  selectOcrError,
  clearError,
} from '../slices/ocrSlice';

/**
 * Paso 3 — Confirmar parroquia.
 * Se llega aquí cuando el OCR no pudo determinar la parroquia con certeza
 * (requiere_confirmacion_parroquia: true).
 *
 * Props:
 *  - parroquias: array de parroquias disponibles para selección
 */
export default function Paso3Parroquia({ parroquias = [] }) {
  const dispatch = useDispatch();
  const historicoId = useSelector(selectOcrHistoricoId);
  const isSaving = useSelector(selectOcrIsSavingParroquia);
  const errorGlobal = useSelector(selectOcrError);

  const [modo, setModo] = useState('existente'); // 'existente' | 'nueva'
  const [parroquiaId, setParroquiaId] = useState('');
  const [nuevaParroquia, setNuevaParroquia] = useState({
    nombre_parroquia: '',
    direccion: '',
    ciudad: '',
  });
  const [localError, setLocalError] = useState('');

  const handleSubmit = () => {
    dispatch(clearError());
    setLocalError('');

    if (modo === 'existente') {
      if (!parroquiaId) return setLocalError('Selecciona una parroquia.');
      console.log('>>> enviando:', { historicoId, parroquiaId: Number(parroquiaId) });
      dispatch(asignarParroquiaOcr({ historicoId, parroquiaId: Number(parroquiaId) }));
    }
    else {
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
          El OCR no pudo identificar la parroquia con certeza. Selecciona una existente o registra
          una nueva.
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
            onClick={() => {
              setModo(opt.key);
              setLocalError('');
            }}
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

      {/* Parroquia existente — lista scrolleable */}
      {modo === 'existente' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Seleccionar parroquia *
          </label>

          <div
            className={`rounded-xl border-2 overflow-hidden transition-colors ${
              localError && !parroquiaId
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {parroquias.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 bg-gray-50 dark:bg-gray-800/40">
                <span className="material-symbols-outlined text-3xl text-gray-400">church</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay parroquias disponibles
                </p>
              </div>
            ) : (
              <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                {parroquias.map((p) => {
                  const selected = String(p.id_parroquia) === String(parroquiaId);
                  return (
                    <li key={p.id_parroquia}>
                      <button
                        type="button"
                        onClick={() => {
                          setParroquiaId(p.id_parroquia);
                          setLocalError('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          selected
                            ? 'bg-emerald-50 dark:bg-emerald-950/20'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] flex-shrink-0 ${
                            selected
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {selected ? 'check_circle' : 'church'}
                        </span>
                        <span
                          className={`font-medium ${
                            selected
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {p.nombre_parroquia ?? p.nombre}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {parroquiaId && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              {parroquias.find(
                (p) => String(p.id_parroquia) === String(parroquiaId)
              )?.nombre_parroquia ?? parroquias.find(
                (p) => String(p.id_parroquia) === String(parroquiaId)
              )?.nombre}
            </p>
          )}
        </div>
      )}

      {/* Nueva parroquia */}
      {modo === 'nueva' && (
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Nombre de la parroquia *
            </label>
            <input
              type="text"
              value={nuevaParroquia.nombre_parroquia}
              onChange={(e) =>
                setNuevaParroquia((p) => ({ ...p, nombre_parroquia: e.target.value }))
              }
              className={ic(!!localError && !nuevaParroquia.nombre_parroquia)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Dirección
            </label>
            <input
              type="text"
              value={nuevaParroquia.direccion}
              onChange={(e) =>
                setNuevaParroquia((p) => ({ ...p, direccion: e.target.value }))
              }
              className={ic()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Ciudad
            </label>
            <input
              type="text"
              value={nuevaParroquia.ciudad}
              onChange={(e) =>
                setNuevaParroquia((p) => ({ ...p, ciudad: e.target.value }))
              }
              className={ic()}
            />
          </div>
        </div>
      )}

      {/* Errores */}
      {(localError || errorGlobal) && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {localError || errorGlobal}
        </p>
      )}

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="material-symbols-outlined text-[16px] animate-spin">
              progress_activity
            </span>
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

const ic = (err = false) =>
  [
    'w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-white outline-none transition-colors',
    err
      ? 'border-red-500 focus:ring-2 focus:ring-red-300'
      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
  ].join(' ');
