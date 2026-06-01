import SearchField from '../../../shared/components/pages/SearchField.jsx';

export default function TabEncargado({
  queryEncargado, setQueryEncargado,
  encargadoSelected,
  encargadoSearch,
  onSelect, onClear,
  isLoading,
}) {
  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Buscar Encargado de Iglesia
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Seleccione a una persona que cumpla los requisitos para ser encargado.
        </p>
      </div>

      <div className="p-6">
        <SearchField
          label="Encargado"
          placeholder="Buscar por nombre o CI"
          value={queryEncargado}
          onChange={(v) => {
            setQueryEncargado(v);
            if (!v.trim()) onClear();
          }}
          onSelect={onSelect}
          items={encargadoSearch.lista}
          loading={encargadoSearch.loading || isLoading}
          open={encargadoSearch.open}
          selected={!!encargadoSelected}
          getKey={(p) => p.id_persona}
          getTitle={(p) => `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`}
          getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
          emptyMessage="No se encontraron posibles encargados."
          helpText="Escriba nombre o CI para buscar."
        />

        {encargadoSelected && (
          <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {encargadoSelected.nombre} {encargadoSelected.apellido_paterno} {encargadoSelected.apellido_materno}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                CI: {encargadoSelected.carnet_identidad}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-700 shrink-0 mt-0.5"
            >
              Quitar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}