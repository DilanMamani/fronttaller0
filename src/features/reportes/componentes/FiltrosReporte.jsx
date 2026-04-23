import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParroquias } from '../../parroquias/slices/parroquiasThunk';
import { selectParroquias, selectIsLoading } from '../../parroquias/slices/parroquiasSlice';

function FiltrosReporte({ filtros, setFiltros }) {
  const dispatch = useDispatch();
  const parroquias = useSelector(selectParroquias);
  const isLoadingParroquias = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(fetchParroquias());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo_sacramento_id_tipo: '',
      institucion_parroquia_id_parroquia: '',
      usuario_id_usuario: '',
      activo: '',
      foja: '',
      numero_desde: '',
      numero_hasta: '',
      anio_sacramento: '',
      mes_sacramento: '',
      fecha_sacramento_desde: '',
      fecha_sacramento_hasta: '',
      fecha_registro_desde: '',
      fecha_registro_hasta: '',
      search: ''
    });
  };

  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros de Búsqueda</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure los criterios para generar el reporte</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo de Sacramento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Sacramento
            </label>
            <select
              value={filtros.tipo_sacramento_id_tipo}
              onChange={(e) => handleChange('tipo_sacramento_id_tipo', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="1">Bautizo</option>
              <option value="2">Primera Comunión</option>
              <option value="3">Matrimonio</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={filtros.activo}
              onChange={(e) => handleChange('activo', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {/* Parroquia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parroquia
            </label>
            <select
              value={filtros.institucion_parroquia_id_parroquia}
              onChange={(e) => handleChange('institucion_parroquia_id_parroquia', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
              disabled={isLoadingParroquias}
            >
              <option value="">Todas</option>
              {parroquias && parroquias.length > 0 ? (
                parroquias.map((parroquia) => (
                  <option 
                    key={parroquia.id_parroquia} 
                    value={parroquia.id_parroquia}
                  >
                    {parroquia.nombre}
                  </option>
                ))
              ) : (
                !isLoadingParroquias && <option disabled>No hay parroquias disponibles</option>
              )}
            </select>
          </div>

          {/* Foja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Foja
            </label>
            <input
              type="text"
              value={filtros.foja}
              onChange={(e) => handleChange('foja', e.target.value)}
              placeholder="Ej. A-1"
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Número Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número Desde
            </label>
            <input
              type="number"
              value={filtros.numero_desde}
              onChange={(e) => handleChange('numero_desde', e.target.value)}
              placeholder="1"
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Número Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número Hasta
            </label>
            <input
              type="number"
              value={filtros.numero_hasta}
              onChange={(e) => handleChange('numero_hasta', e.target.value)}
              placeholder="100"
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Año Sacramento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Año Sacramento
            </label>
            <input
              type="number"
              value={filtros.anio_sacramento}
              onChange={(e) => handleChange('anio_sacramento', e.target.value)}
              placeholder="2024"
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Mes Sacramento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mes Sacramento
            </label>
            <select
              value={filtros.mes_sacramento}
              onChange={(e) => handleChange('mes_sacramento', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            >
              <option value="">Todos</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          {/* Fecha Sacramento Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Sacramento Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_sacramento_desde}
              onChange={(e) => handleChange('fecha_sacramento_desde', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Fecha Sacramento Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Sacramento Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_sacramento_hasta}
              onChange={(e) => handleChange('fecha_sacramento_hasta', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Fecha Registro Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Registro Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_registro_desde}
              onChange={(e) => handleChange('fecha_registro_desde', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Fecha Registro Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Registro Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_registro_hasta}
              onChange={(e) => handleChange('fecha_registro_hasta', e.target.value)}
              className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 text-sm"
            />
          </div>

          {/* Búsqueda General */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Búsqueda General
            </label>
            <div className="relative">
              <input
                type="text"
                value={filtros.search}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Buscar por nombre, CI, etc..."
                className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2.5 pr-10 text-sm"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
} export default FiltrosReporte;