import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import { useOcr } from './hooks/useOcr';
import { resetFlujo, setActiveTab } from './slices/ocrSlice';

import Paso1Upload from './components/Paso1Upload';
import Paso2Bautismo from './components/Paso2Bautismo';
import Paso2PrimeraComunion from './components/Paso2PrimeraComunion';
import Paso2Matrimonio from './components/Paso2Matrimonio';
import Paso3Parroquia from './components/Paso3Parroquia';
import OcrSuccess from './components/OcrSuccess';
import OcrHistorico from './components/OcrHistorico';
import { fetchParroquias } from '../sacramentos/slices/sacramentosTrunk';

const TABS = [
  { key: 'registrar', label: 'Registrar documento', icon: 'document_scanner' },
  { key: 'historico', label: 'Histórico OCR', icon: 'history' },
];

// Mapa canónico — debe coincidir con el backend y con ocrSlice
// 1 = Bautismo, 2 = Matrimonio, 3 = Primera Comunión
const TIPO_ID_MAP = {
  1: 'bautismo',
  2: 'matrimonio',
  3: 'primera_comunion',
};

export default function Ocr() {
  const dispatch = useDispatch();
  const { paso, tipoSacramento, tipoSacramentoId } = useOcr();
  const activeTab = useSelector((s) => s.ocr.activeTab);
  const parroquias = useSelector(
    (s) => s.sacramentos?.parroquias ?? s.parroquias?.parroquias ?? []
  );

  // Cargar parroquias para Paso1 (selector opcional)
  useEffect(() => {
    dispatch(fetchParroquias({ page: 1, limit: 200 }));
  }, [dispatch]);

  // Determinar componente de paso 2
  const tipoKey =
    TIPO_ID_MAP[parseInt(tipoSacramentoId)] ??
    (() => {
      const t = tipoSacramento?.toLowerCase() ?? '';
      if (t.includes('bautis')) return 'bautismo';
      if (t.includes('matrimon')) return 'matrimonio';
      if (t.includes('primera') || t.includes('comuni')) return 'primera_comunion';
      return null;
    })();

  const Paso2Component = {
    bautismo: Paso2Bautismo,
    primera_comunion: Paso2PrimeraComunion,
    matrimonio: Paso2Matrimonio,
  }[tipoKey] || null;

  return (
    <Layout title="Registro OCR de Sacramentos">
      {/* Tabs principales */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => dispatch(setActiveTab(tab.key))}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
              activeTab === tab.key
                ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
                : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'historico' && <OcrHistorico />}

      {activeTab === 'registrar' && (
        <div className="max-w-2xl mx-auto">
          {/* Barra de progreso */}
          {paso !== 'success' && <StepIndicator paso={paso} />}

          {/* Paso 1 — Subir imagen */}
          {paso === 1 && <Paso1Upload parroquias={parroquias} />}

          {/* Paso 3 — Confirmar parroquia */}
          {paso === 3 && <Paso3Parroquia />}

          {/* Paso 2 — Revisión de datos según tipo */}
          {paso === 2 && Paso2Component && <Paso2Component />}
          {paso === 2 && !Paso2Component && (
            <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-xl text-amber-700 text-sm">
              <span className="material-symbols-outlined">warning</span>
              Tipo de sacramento no reconocido:{' '}
              <strong>{tipoSacramento || tipoSacramentoId || '(vacío)'}</strong>.
              <button
                onClick={() => dispatch(resetFlujo())}
                className="ml-auto text-xs underline"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {/* Éxito */}
          {paso === 'success' && <OcrSuccess />}
        </div>
      )}
    </Layout>
  );
}

/* ── Indicador de pasos ────────────────────────────────────────────────────────── */
function StepIndicator({ paso }) {
  const pasos = [
    { num: 1, label: 'Subir imagen' },
    { num: 3, label: 'Parroquia' },
    { num: 2, label: 'Revisar datos' },
  ];
  const ordenLineal = { 1: 0, 3: 1, 2: 2 };
  const current = ordenLineal[paso] ?? 0;

  return (
    <div className="flex items-center mb-8">
      {pasos.map((p, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={p.num} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {done ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  p.num
                )}
              </div>
              <span
                className={`text-xs hidden sm:block whitespace-nowrap ${
                  active
                    ? 'text-primary font-medium'
                    : done
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400'
                }`}
              >
                {p.label}
              </span>
            </div>
            {idx < pasos.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full mx-2 ${
                  done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
