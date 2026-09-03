// src/features/ocr/components/OcrSuccess.jsx
import { useDispatch, useSelector } from 'react-redux';
import { resetFlujo, setActiveTab, selectOcrSuccessData, selectOcrTipoSacramento } from '../slices/ocrSlice';

const TIPO_INFO = {
  bautismo: { icon: 'church', label: 'Bautismo' },
  matrimonio: { icon: 'favorite', label: 'Matrimonio' },
  primera_comunion: { icon: 'volunteer_activism', label: 'Primera Comunión' },
};

export default function OcrSuccess() {
  const dispatch = useDispatch();
  const successData = useSelector(selectOcrSuccessData);
  const tipoSacramento = useSelector(selectOcrTipoSacramento);

  const sacramento = successData?.sacramento;
  const personaCreada = successData?.persona_creada;
  const tipoInfo = TIPO_INFO[tipoSacramento] ?? { icon: 'check_circle', label: 'Sacramento' };

  const handleVerHistorico = () => {
    dispatch(setActiveTab('historico'));
    dispatch(resetFlujo());
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      {/* Icono */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-[18px]">{tipoInfo.icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wide">{tipoInfo.label}</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Sacramento registrado exitosamente
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          El documento fue procesado y el sacramento quedó guardado en el sistema.
        </p>
      </div>

      {/* Datos del sacramento — información útil, no IDs internos */}
      {sacramento && (sacramento.fecha_sacramento || sacramento.foja || sacramento.numero) && (
        <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-left space-y-2">
          {sacramento.fecha_sacramento && (
            <DataRow label="Fecha" value={sacramento.fecha_sacramento} />
          )}
          {sacramento.foja && <DataRow label="Foja" value={sacramento.foja} />}
          {sacramento.numero && <DataRow label="Número" value={sacramento.numero} />}
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
          onClick={handleVerHistorico}
          className="px-5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          Ver en histórico
        </button>
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
