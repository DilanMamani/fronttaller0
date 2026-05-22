import Layout from '../../shared/components/layout/Layout';
import { useSacramentos } from './hooks/useSacramentos';
import FormAgregar from '../../shared/components/pages/FormAgregar';
import FormBuscarEditar from '../../shared/components/pages/FormBuscarEditar';
import Toast from '../../shared/components/ui/Toast.jsx';

const TIPO_OPTIONS = [
  { key: 'bautizo',    label: 'Bautizo' },
  { key: 'comunion',  label: 'Primera Comunión' },
  { key: 'matrimonio', label: 'Matrimonio' },
];

const TAB_OPTIONS = [
  { key: 'agregar', label: 'Agregar Sacramento' },
  { key: 'buscar',  label: 'Buscar / Editar' },
];

export default function Sacramentos() {
  const ctx = useSacramentos();
  const { activeTab, setActiveTab, tipoSacramento, setTipoSacramento, toast, setToast } = ctx;

  return (
    <Layout title="Gestión de Sacramentos">

      {/* Selector de tipo de sacramento */}
      <div className="flex justify-end mb-3">
        <div className="flex items-center gap-2">
          {TIPO_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors select-none ${
                tipoSacramento === opt.key
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <input
                type="radio"
                name="tipoSacramento"
                value={opt.key}
                checked={tipoSacramento === opt.key}
                onChange={() => setTipoSacramento(opt.key)}
                className="hidden"
              />
              <span className="material-symbols-outlined text-base">folder</span>
              <span className="text-sm whitespace-nowrap">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
              activeTab === tab.key
                ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
                : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'agregar' && <FormAgregar ctx={ctx} />}
      {activeTab === 'buscar'  && <FormBuscarEditar ctx={ctx} />}

      {/* Toast — usa el componente compartido */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </Layout>
  );
}