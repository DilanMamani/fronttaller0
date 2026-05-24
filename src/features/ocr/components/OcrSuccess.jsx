// src/features/ocr/components/OcrSuccess.jsx
import { useDispatch, useSelector } from 'react-redux';
import { resetFlujo } from '../slices/ocrSlice';
import { selectOcrSuccessData } from '../slices/ocrSlice';

export default function OcrSuccess() {
  const dispatch = useDispatch();
  const successData = useSelector(selectOcrSuccessData);

  const sacramento = successData?.sacramento;
  const personaCreada = successData?.persona_creada;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      {/* Icono */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Sacramento registrado exitosamente
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          El documento fue procesado y el sacramento quedó guardado en el sistema.
        </p>
      </div>

      {/* Datos del sacramento */}
      {sacramento && (
        <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-left space-y-2">
          {sacramento.id_sacramento && (
            <DataRow label="ID Sacramento" value={`#${sacramento.id_sacramento}`} />
          )}
          {sacramento.tipo && <DataRow label="Tipo" value={sacramento.tipo} />}
          {sacramento.persona_id && (
            <DataRow label="ID Persona" value={`#${sacramento.persona_id}`} />
          )}
        </div>
      )}

      {/* Advertencia si se creó persona nueva */}
      {personaCreada && (
        <div className="w-full max-w-sm flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-left">
          <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">info</span>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Se creó una persona nueva con estado <strong>no verificado</strong>. Sus datos pueden
            estar incompletos. Puedes completarlos desde la sección Personas.
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={() => dispatch(resetFlujo())}
          className="px-5 py-2.5 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Registrar otro documento
        </button>
      </div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
