import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadOcrPreview } from '../slices/ocrThunk';
import {
  selectOcrIsUploading,
  selectOcrError,
  clearError,
  setTipoSacramentoId as setTipoSacramentoIdAction,
} from '../slices/ocrSlice';
import { parroquiasApi } from '../../../lib/api';

// IDs coinciden con el backend: 1=Bautismo, 2=Matrimonio, 3=Primera Comunión
const TIPOS_SACRAMENTO = [
  { id: 1, label: 'Bautismo' },
  { id: 2, label: 'Matrimonio' },
  { id: 3, label: 'Primera Comunión' },
];

export default function Paso1Upload() {
  const dispatch = useDispatch();
  const isUploading = useSelector(selectOcrIsUploading);
  const error = useSelector(selectOcrError);

  const [tipoSacramentoId, setTipoSacramentoId] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

  // ── Buscador de parroquia ─────────────────────────────────────────
  const [parroquiaQuery, setParroquiaQuery] = useState('');
  const [parroquiaResultados, setParroquiaResultados] = useState([]);
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState(null);
  const [isSearchingParroquia, setIsSearchingParroquia] = useState(false);
  const [openParroquia, setOpenParroquia] = useState(false);
  const parroquiaRef = useRef(null);
  const parroquiaDebounce = useRef(null);

  // Cerrar dropdown parroquia al clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (parroquiaRef.current && !parroquiaRef.current.contains(e.target)) {
        setOpenParroquia(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Búsqueda de parroquias con debounce
  useEffect(() => {
    if (parroquiaSeleccionada) return;
    clearTimeout(parroquiaDebounce.current);

    if (parroquiaQuery.trim().length < 2) {
      setParroquiaResultados([]);
      setOpenParroquia(false);
      return;
    }

    parroquiaDebounce.current = setTimeout(async () => {
      setIsSearchingParroquia(true);
      try {
        const data = await parroquiasApi.fetchParroquias({ search: parroquiaQuery.trim(), limit: 20 });
        const lista = data?.parroquias ?? data?.rows ?? [];
        setParroquiaResultados(lista);
        setOpenParroquia(true);
      } catch {
        setParroquiaResultados([]);
      } finally {
        setIsSearchingParroquia(false);
      }
    }, 350);

    return () => clearTimeout(parroquiaDebounce.current);
  }, [parroquiaQuery, parroquiaSeleccionada]);

  const handleSelectParroquia = (p) => {
    setParroquiaSeleccionada(p);
    setParroquiaQuery(p.nombre ?? p.nombre_parroquia ?? '');
    setOpenParroquia(false);
  };

  const handleClearParroquia = () => {
    setParroquiaSeleccionada(null);
    setParroquiaQuery('');
    setParroquiaResultados([]);
  };
  // ─────────────────────────────────────────────────────────────────

  const handleArchivo = (file) => {
    if (!file) return;
    setArchivo(file);
    setLocalError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleArchivo(file);
  };

  const handleSubmit = () => {
    if (!tipoSacramentoId) return setLocalError('Selecciona el tipo de sacramento.');
    if (!archivo) return setLocalError('Adjunta una imagen del documento.');

    dispatch(clearError());
    dispatch(setTipoSacramentoIdAction(parseInt(tipoSacramentoId)));

    const fd = new FormData();
    fd.append('imagen', archivo);
    fd.append('tipo_sacramento_id', tipoSacramentoId);
    if (parroquiaSeleccionada?.id_parroquia) {
      fd.append('institucion_parroquia_id', parroquiaSeleccionada.id_parroquia);
    }

    dispatch(uploadOcrPreview(fd));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subir documento para OCR
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Selecciona el tipo de sacramento y adjunta una imagen clara del documento.
        </p>
      </div>

      {/* Tipo de sacramento */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Tipo de sacramento *
        </label>
        <select
          value={tipoSacramentoId}
          onChange={(e) => setTipoSacramentoId(e.target.value)}
          className={inputCls(!tipoSacramentoId && !!localError)}
        >
          <option value="">Seleccionar...</option>
          {TIPOS_SACRAMENTO.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Buscador de parroquia */}
      <div className="flex flex-col gap-1.5" ref={parroquiaRef}>
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Parroquia <span className="text-gray-400 font-normal">(opcional — si ya la conoces)</span>
        </label>

        {parroquiaSeleccionada ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0">
                church
              </span>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate">
                {parroquiaSeleccionada.nombre ?? parroquiaSeleccionada.nombre_parroquia}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearParroquia}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={parroquiaQuery}
              onChange={(e) => setParroquiaQuery(e.target.value)}
              onFocus={() => parroquiaResultados.length > 0 && setOpenParroquia(true)}
              placeholder="Escribir nombre de parroquia (mín. 2 caracteres)..."
              className={inputCls(false, true)}
            />
            {isSearchingParroquia && (
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px] animate-spin">
                progress_activity
              </span>
            )}

            {openParroquia && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
                {parroquiaResultados.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    Sin resultados para "{parroquiaQuery}"
                  </div>
                ) : (
                  <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {parroquiaResultados.map((p) => (
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

      {/* Zona de carga */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          archivo
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleArchivo(e.target.files?.[0])}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-48 rounded-lg object-contain shadow"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setArchivo(null);
                setPreview(null);
              }}
              className="text-xs text-red-500 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">delete</span>
              Quitar imagen
            </button>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-4xl text-gray-400">upload_file</span>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Arrastra aquí la imagen o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — máx. 10 MB</p>
            </div>
          </>
        )}

        {archivo && !preview && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {archivo.name}
          </p>
        )}
      </div>

      {/* Errores */}
      {(localError || error) && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {localError || (typeof error === 'string' ? error : JSON.stringify(error))}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isUploading}
        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <span className="material-symbols-outlined text-[16px] animate-spin">
              progress_activity
            </span>
            Procesando imagen...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">document_scanner</span>
            Procesar con OCR
          </>
        )}
      </button>
    </div>
  );
}

function inputCls(hasError = false, withPadding = false) {
  return [
    'w-full py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
    withPadding ? 'pl-9 pr-3' : 'px-3',
    'text-gray-900 dark:text-white outline-none transition-colors',
    hasError
      ? 'border-red-500 focus:ring-2 focus:ring-red-300'
      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
  ].join(' ');
}
