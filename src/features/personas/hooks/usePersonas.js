import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';
import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import Toast from '../../shared/components/ui/Toast.jsx';

import { usePersonas } from './hooks/usePersonas';
import TabAgregar from './components/TabAgregar.jsx';
import TabBuscar from './components/TabBuscar.jsx';
import TabEncargado from './components/TabEncargado.jsx';

const TABS = [
  { key: 'agregar',   label: 'Agregar Persona' },
  { key: 'buscar',    label: 'Buscar Persona' },
  { key: 'encargado', label: 'Encargado de Iglesia' },
];

export default function Personas() {
  const ctx = usePersonas();

  const {
    activeTab, setActiveTab,
    toast, modal,
    formAdd, setFormAdd,
    filters, setFilters,
    tableData, isLoading, isCreating,
    queryEncargado, setQueryEncargado,
    encargadoSelected, encargadoSearch,
    handleSelectEncargado, handleClearEncargado,
    handleSearch, handleResetSearch,
    handleCreate, handleRowClick,
  } = ctx;

  return (
    <Layout title="Gestión de Personas">

      <PageTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
        }}
        tabs={TABS}
      />

      {activeTab === 'agregar' && (
        <TabAgregar
          formAdd={formAdd}
          setFormAdd={setFormAdd}
          onSubmit={handleCreate}
          isCreating={isCreating}
        />
      )}

      {activeTab === 'buscar' && (
        <TabBuscar
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          onReset={handleResetSearch}
          tableData={tableData}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      )}

      {activeTab === 'encargado' && (
        <TabEncargado
          queryEncargado={queryEncargado}
          setQueryEncargado={setQueryEncargado}
          encargadoSelected={encargadoSelected}
          encargadoSearch={encargadoSearch}
          onSelect={handleSelectEncargado}
          onClear={handleClearEncargado}
          isLoading={isLoading}
        />
      )}

      <DuplicatesMergeModal open={false} onClose={() => {}} />
      {modal}
      <Toast toast={toast} />

    </Layout>
  );
}