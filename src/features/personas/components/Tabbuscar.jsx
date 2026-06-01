import FilterPanel from '../../../shared/components/pages/FilterPanel.jsx';
import DataTable from '../../../shared/components/pages/DataTable.jsx';
import { personaSearchFields } from '../config/personasForm.js';
import { personaColumns } from '../config/personasColumns.jsx';

export default function TabBuscar({
  filters, setFilters,
  onSearch, onReset,
  tableData, loading,
  onRowClick,
  currentPage, totalPages, totalItems,
  onPageChange,
}) {
  return (
    <>
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">
        <FilterPanel
          title="Buscar Persona"
          description="Despliegue los filtros para realizar una búsqueda avanzada."
          fields={personaSearchFields}
          values={filters}
          setValues={setFilters}
          onSearch={onSearch}
          onReset={onReset}
        />
      </div>

      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Para editar alguno de los resultados, seleccione la fila deseada.
          </p>
        </div>

        <DataTable
          columns={personaColumns}
          data={tableData}
          loading={loading}
          loadingMessage="Cargando datos..."
          emptyMessage="Sin resultados"
          onRowClick={(p) => onRowClick(p.id || p.id_persona)}
          getRowKey={(p) => p.id || p.id_persona}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}