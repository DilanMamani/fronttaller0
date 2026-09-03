import { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import SearchField from './SearchField';
import CamposComunes from './CamposComunes';
import SacramentoEditModal from './SacramentoEditModal';

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Tabla de resultados
// ---------------------------------------------------------------------------
function TablaResultados({ results, onSelect }) {
  const [page, setPage] = useState(1);

  if (results.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        No se encontraron resultados para esta búsqueda.
      </div>
    );
  }

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginated = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
          <tr>
            {['Nombre completo', 'CI', 'Fecha del sacramento', 'Rol', 'Foja', 'Número'].map((h) => (
              <th key={h} className="px-6 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row) => (
            <tr
              key={`${row.id_sacramento}-${row.carnet_identidad}`}
              onClick={() => onSelect(row)}
              className="cursor-pointer bg-white dark:bg-background-dark/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-6 py-4">{row.nombre} {row.apellido_paterno} {row.apellido_materno}</td>
              <td className="px-6 py-4">{row.carnet_identidad}</td>
              <td className="px-6 py-4">{row.fecha_sacramento}</td>
              <td className="px-6 py-4">{row.rol_nombre}</td>
              <td className="px-6 py-4">{row.foja}</td>
              <td className="px-6 py-4">{row.numero}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, results.length)} de <strong>{results.length}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              title="Primera página"
            >
              <span className="material-symbols-outlined text-sm">first_page</span>
            </button>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[28px] h-7 rounded text-xs font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
              title="Última página"
            >
              <span className="material-symbols-outlined text-sm">last_page</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal exportado
// ---------------------------------------------------------------------------
export default function FormBuscarEditar({ ctx }) {
  const {
    tipoSacramento,
    filters, handleFilterChange, resetFilters,
    handleBuscar,
    results,
    loadingSacramento,
    selectedPerson,
    modalOpen, closeModal,
    handleSelectResultado,
  } = ctx;

  const [filtersOpen, setFiltersOpen] = useState(false);

  const LABELS_TIPO = {
    bautizo: 'Bautizo',
    comunion: 'Primera Comunión',
    confirmacion: 'Confirmación',
    matrimonio: 'Matrimonio',
  };
  const labelTipo = LABELS_TIPO[tipoSacramento]
    || tipoSacramento.charAt(0).toUpperCase() + tipoSacramento.slice(1);

  const FILTER_FIELDS = [
    { id: 'nombre',           label: 'Nombre',              type: 'text', placeholder: 'Nombre' },
    { id: 'apellido_paterno', label: 'Apellido paterno',    type: 'text', placeholder: 'Apellido paterno' },
    { id: 'apellido_materno', label: 'Apellido materno',    type: 'text', placeholder: 'Apellido materno' },
    { id: 'carnet_identidad', label: 'Carnet de identidad', type: 'text', placeholder: 'CI' },
    { id: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', placeholder: '' },
    { id: 'lugar_nacimiento', label: 'Lugar de nacimiento', type: 'text', placeholder: 'Lugar' },
  ];

  // Cuenta cuántos filtros tienen valor para mostrarlo en el botón
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  ).length;

  return (
    <>
      {/* Panel de filtros colapsable */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">

        {/* Header siempre visible — al hacer click colapsa/expande */}
        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="w-full p-6 flex items-center justify-between text-left group"
        >
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros de búsqueda
              </h3>
              {activeFilterCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white font-medium">
                  {activeFilterCount} activo{activeFilterCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {!filtersOpen && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Haga click para filtrar los resultados de <span className="font-medium">{labelTipo}</span>.
              </p>
            )}
          </div>
          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {/* Cuerpo colapsable */}
        {filtersOpen && (
          <form
            className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4"
            onSubmit={handleBuscar}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FILTER_FIELDS.map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label
                    htmlFor={`f-${id}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {label}
                  </label>
                  <input
                    id={`f-${id}`}
                    type={type}
                    placeholder={placeholder}
                    value={filters[id]}
                    onChange={(e) => handleFilterChange(id, e.target.value)}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="f-activo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  id="f-activo"
                  value={filters.activo}
                  onChange={(e) => handleFilterChange('activo', e.target.value)}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                >
                  <option value="">Todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => { resetFilters(); setFiltersOpen(false); }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                Limpiar filtros
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Resultados */}
      <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Mostrando resultados de <strong>{labelTipo}</strong>. Seleccione una fila para editar.
          </p>
        </div>

        <div className="overflow-x-auto">
          {loadingSacramento
            ? <div className="flex justify-center items-center py-10"><ClipLoader size={40} color="#4f46e5" /></div>
            : <TablaResultados results={results} onSelect={handleSelectResultado} />
          }
        </div>
      </div>

      {/* Modal de edición — se monta sobre toda la página */}
      {modalOpen && selectedPerson && (
        <SacramentoEditModal ctx={ctx} onClose={closeModal} />
      )}
    </>
  );
}