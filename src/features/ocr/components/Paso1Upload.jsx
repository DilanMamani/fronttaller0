import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadOcrPreview } from '../slices/ocrThunk';
import {
  selectOcrIsUploading,
  selectOcrError,
  clearError,
  setTipoSacramentoId as setTipoSacramentoIdAction,
} from '../slices/ocrSlice';

// IDs coinciden con el backend: 1=Bautismo, 2=Matrimonio, 3=Primera Comunión
const TIPOS_SACRAMENTO = [
  { id: 1, label: 'Bautismo' },
  { id: 2, label: 'Matrimonio' },
  { id: 3, label: 'Primera Comunión' },
];

/**
 * Paso 1 — Subir imagen para procesar OCR.
 * Props:
 *  - parroquias: array de parroquias disponibles (para selector opcional)
 */
export default function Paso1Upload({ parroquias = [] }) {
  const dispatch = useDispatch();
  const isUploading = useSelector(selectOcrIsUploading);
  const error = useSelector(selectOcrError);

  const [tipoSacramentoId, setTipoSacramentoId] = useState('');
  const [parroquiaId, setParroquiaId] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

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
    if (parroquiaId) fd.append('institucion_parroquia_id', parroquiaId);

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
          className={selectCls(!tipoSacramentoId && !!localError)}
        >
          <option value="">Seleccionar...</option>
          {TIPOS_SACRAMENTO.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Parroquia (opcional) — solo si hay parroquias cargadas */}
      {parroquias.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Parroquia (opcional — si ya la conoces)
          </label>
          <select
            value={parroquiaId}
            onChange={(e) => setParroquiaId(e.target.value)}
            className={selectCls()}
          >
            <option value="">Sin especificar</option>
            {parroquias.map((p) => (
              <option key={p.id_parroquia} value={p.id_parroquia}>
                {p.nombre ?? p.nombre_parroquia}
              </option>
            ))}
          </select>
        </div>
      )}

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
          <img
            src={preview}
            alt="Vista previa"
            className="max-h-48 rounded-lg object-contain shadow"
          />
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

        {archivo && (
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

function selectCls(hasError = false) {
  return [
    'w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-white outline-none transition-colors',
    hasError
      ? 'border-red-500 focus:ring-2 focus:ring-red-300'
      : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20',
  ].join(' ');
}
