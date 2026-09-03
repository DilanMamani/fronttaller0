import SearchField from './SearchField';

/**
 * CamposComunes — padrino, ministro, parroquia, foja, número y fecha.
 * Usado tanto en el formulario de Agregar como en el de Editar.
 */
export default function CamposComunes({
  // Form values
  form,
  onFormChange,

  // Padrino
  queryPadrino, setQueryPadrino,
  padrinoSelected, setPadrinoSelected,
  padrinoSearch,
  onSelectPadrino,

  // Madrina
  queryMadrina, setQueryMadrina,
  madrinaSelected, setMadrinaSelected,
  madrinaSearch,
  onSelectMadrina,

  // Ministro
  queryMinistro, setQueryMinistro,
  ministroSelected, setMinistroSelected,
  ministroSearch,
  onSelectMinistro,

  // Parroquia
  queryParroquia, setQueryParroquia,
  parroquiaSelected, setParroquiaSelected,
  parroquiaSearch,
  onSelectParroquia,

  // Extras modo edición
  modoEdicion = false,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Padrino */}
      <div>
        {modoEdicion && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Actual: <span className="font-medium">{queryPadrino || '—'}</span>
          </p>
        )}
        <SearchField
          label={modoEdicion ? 'Nuevo padrino (opcional)' : 'Padrino'}
          placeholder="Buscar padrino por nombre o CI"
          value={queryPadrino}
          onChange={(v) => {
            setQueryPadrino(v);
            setPadrinoSelected(false);
          }}
          onSelect={onSelectPadrino}
          items={padrinoSearch.lista}
          loading={padrinoSearch.loading}
          open={padrinoSearch.open}
          selected={padrinoSelected}
          getKey={(p) => p.id_persona}
          getTitle={(p) => `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`}
          getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
          emptyMessage="No se encontraron padrinos."
          helpText="Escriba nombre o CI para buscar."
        />
      </div>

      {/* Madrina */}
      <div>
        {modoEdicion && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Actual: <span className="font-medium">{queryMadrina || '—'}</span>
          </p>
        )}
        <SearchField
          label={modoEdicion ? 'Nueva madrina (opcional)' : 'Madrina'}
          placeholder="Buscar madrina por nombre o CI"
          value={queryMadrina}
          onChange={(v) => {
            setQueryMadrina(v);
            setMadrinaSelected(false);
          }}
          onSelect={onSelectMadrina}
          items={madrinaSearch.lista}
          loading={madrinaSearch.loading}
          open={madrinaSearch.open}
          selected={madrinaSelected}
          getKey={(p) => p.id_persona}
          getTitle={(p) => `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`}
          getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
          emptyMessage="No se encontraron madrinas."
          helpText="Escriba nombre o CI para buscar."
        />
      </div>

      {/* Ministro */}
      <div>
        {modoEdicion && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Actual: <span className="font-medium">{queryMinistro || '—'}</span>
          </p>
        )}
        <SearchField
          label={modoEdicion ? 'Nuevo ministro (opcional)' : 'Ministro'}
          placeholder="Buscar ministro por nombre o CI"
          value={queryMinistro}
          onChange={(v) => {
            setQueryMinistro(v);
            setMinistroSelected(false);
          }}
          onSelect={onSelectMinistro}
          items={ministroSearch.lista}
          loading={ministroSearch.loading}
          open={ministroSearch.open}
          selected={ministroSelected}
          getKey={(p) => p.id_persona}
          getTitle={(p) => `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`}
          getSubtitle={(p) => `CI: ${p.carnet_identidad}`}
          emptyMessage="No se encontraron ministros."
          helpText="Escriba nombre o CI para buscar."
        />
      </div>

      {/* Parroquia */}
      <div>
        {modoEdicion && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Actual: <span className="font-medium">{queryParroquia || '—'}</span>
          </p>
        )}
        <SearchField
          label="Parroquia"
          placeholder="Buscar parroquia por nombre"
          value={queryParroquia}
          onChange={(v) => {
            setQueryParroquia(v);
            setParroquiaSelected(false);
          }}
          onSelect={onSelectParroquia}
          items={parroquiaSearch.lista}
          loading={parroquiaSearch.loading}
          open={parroquiaSearch.open}
          selected={parroquiaSelected}
          getKey={(p) => p.id_parroquia}
          getTitle={(p) => p.nombre}
          getSubtitle={(p) => `Email: ${p.email} – Tel: ${p.telefono}`}
          emptyMessage="No se encontraron parroquias."
          helpText="Escriba nombre o email para buscar."
        />
      </div>

      {/* Foja */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Foja
        </label>
        <input
          type="text"
          placeholder="Ej. 123-A"
          value={form.foja}
          onChange={(e) => onFormChange('foja', e.target.value)}
          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
        />
      </div>

      {/* Número */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Número
        </label>
        <input
          type="text"
          placeholder="Ej. 456"
          value={form.numero}
          onChange={(e) => onFormChange('numero', e.target.value)}
          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha del Sacramento
        </label>
        <input
          type="date"
          value={form.fecha_sacramento}
          onChange={(e) => onFormChange('fecha_sacramento', e.target.value)}
          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
        />
      </div>

    </div>
  );
}