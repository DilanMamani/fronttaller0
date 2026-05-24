import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';
import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import Toast from '../../shared/components/ui/Toast.jsx';

import { usePersonas } from './hooks/usePersonas';
import TabAgregar from './components/Tabagregar.jsx';
import TabBuscar from './components/Tabbuscar.jsx';


const TABS = [
  { key: 'agregar',   label: 'Agregar Persona' },
  { key: 'buscar',    label: 'Buscar Persona' },
];

export default function Personas() {
  const ctx = usePersonas();

  const {
    activeTab, setActiveTab,
    toast, setToast,
    modal,
    formAdd, setFormAdd,
    filters, setFilters,
    tableData, loading, isCreating,
    currentPage, totalPages, totalItems, hasFilters,
    queryEncargado, setQueryEncargado,
    encargadoSelected, encargadoSearch,
    handleSelectEncargado, handleClearEncargado,
    handleSearch, handleResetSearch,
    handlePageChange,
    handleCreate, handleRowClick,
  } = ctx;

  return (
    <Layout title="Gestión de Personas">

      <PageTabs
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
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
          loading={loading}
          onRowClick={handleRowClick}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      )}

     

      <DuplicatesMergeModal open={false} onClose={() => {}} />
      {modal}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </Layout>
  );
}