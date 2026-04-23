import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';

import { ClipLoader } from "react-spinners";
import {
  fetchPersonas,
  fetchAllPersonas,
  fetchPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  fetchPersonasParaSacramento,
} from './slices/personasThunk';
import {
  selectIsLoading,
  selectPersonas,
  selectAllPersonas,
  selectPersonaSeleccionada,
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting
} from './slices/personasSlice';

import {
   selectPersonasConTodos
} from '../sacramentos/slices/sacramentosSlices';
import {
  buscarPersonasConTodosLosSacramentos
}from '../sacramentos/slices/sacramentosTrunk.js';


export default function Personas() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const personas = useSelector(selectPersonas);
  const allPersonas = useSelector(selectAllPersonas);
  const personaSeleccionada = useSelector(selectPersonaSeleccionada);
  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);
  const isDeleting = useSelector(selectIsDeleting);
  const personasConTodos = useSelector(selectPersonasConTodos);

  const [queryPersonas, setQueryPersonas] = useState("");

  const [openPersonaList, setOpenPersonaList] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agregar');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const [listaEncargados, setListaEncargados] = useState([]);
  const [loadingEncargado, setLoadingEncargado] = useState(false);
  const [openEncargadoList, setOpenEncargadoList] = useState(false);
  const [encargadoSelected, setEncargadoSelected] = useState(null);

  


  const [formAdd, setFormAdd] = useState({ /* ... */ });
  const [filters, setFilters] = useState({ /* ... */ });
  const [queryEncargado, setQueryEncargado] = useState("");

  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Cargar todos al inicio
  useEffect(() => {
    dispatch(fetchAllPersonas());
  }, [dispatch]);

  // Sincronizar persona seleccionada
  useEffect(() => {
    setSelectedPerson(personaSeleccionada);
  }, [personaSeleccionada]);

  // Extrae el mejor mensaje de error posible de un action (createAsyncThunk) o de un Error/axios
  const extractError = (actionOrError) => {
    try {
      // Caso: action de createAsyncThunk (tiene meta y payload)
      if (actionOrError && actionOrError.meta !== undefined) {
        const p = actionOrError.payload;
        if (p !== undefined) {
          if (typeof p === 'string') return p;
          if (p && typeof p === 'object') {
            if (p.message) return p.message;
            if (p.error) return typeof p.error === 'string' ? p.error : JSON.stringify(p.error);
            if (p.errors) return Array.isArray(p.errors) ? p.errors.map(e => e?.message || e).join(' | ') : JSON.stringify(p.errors);
            if (p.detail) return typeof p.detail === 'string' ? p.detail : JSON.stringify(p.detail);
            return JSON.stringify(p);
          }
        }
        // Si no hay payload, usar action.error
        if (actionOrError.error) {
          const ae = actionOrError.error;
          if (typeof ae === 'string') return ae;
          if (ae?.message) return ae.message;
        }
      }
      // Caso: Error de axios u otros
      const e = actionOrError;
      if (e && e.response && e.response.data) {
        const d = e.response.data;
        if (typeof d === 'string') return d;
        if (d.message) return d.message;
        if (d.error) return typeof d.error === 'string' ? d.error : JSON.stringify(d.error);
        if (d.errors) return Array.isArray(d.errors) ? d.errors.map(x => x?.message || x).join(' | ') : JSON.stringify(d.errors);
        if (d.detail) return typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail);
        return JSON.stringify(d);
      }
      if (e && e.message) return e.message;
      return 'Error desconocido';
    } catch (ex) {
      return `Error inesperado: ${ex?.message || ex}`;
    }
  };

  // ¿Hay filtros? (ignora espacios en blanco)
  const isNonEmpty = (v) => v !== null && v !== undefined && (typeof v !== 'string' || v.trim() !== '');
  const hasFilters = Object.values(filters).some(isNonEmpty);

  const people = hasFilters ? personas : allPersonas;
  const loading = isLoading;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    setQueryPersonas("");
    // Limpiar y enviar solo filtros con valor
    const cleaned = Object.fromEntries(
      Object.entries(filters)
        .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        .filter(([_, v]) => isNonEmpty(v))
    );

    if (Object.keys(cleaned).length > 0) {
      dispatch(fetchPersonas(cleaned));
      setQueryPersonas("");
    } else {
      dispatch(fetchAllPersonas());
    }
    setSelectedPerson(null);
  };

  const handleResetSearch = () => {
    const clean = { nombre: '', apellido_paterno: '', apellido_materno: '', carnet_identidad: '', fecha_nacimiento: '', lugar_nacimiento: '', nombre_padre: '', nombre_madre: '', activo: '', estado: '' };
    setFilters(clean);
    dispatch(fetchAllPersonas());
  };

  const handleRowClick = (id) => {
    dispatch(fetchPersonaById(id));
  };
  
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const action = await dispatch(createPersona(formAdd));
      console.debug('createPersona result:', action);
      if (action.meta.requestStatus === 'fulfilled') {
        setToast({ type: 'success', message: 'Persona creada correctamente.' });
        dispatch(fetchAllPersonas());
      } else {
        setToast({ type: 'error', message: extractError(action) });
      }
    } catch (err) {
      console.error('createPersona threw:', err);
      setToast({ type: 'error', message: extractError(err) });
    }
  }

 const handleUpdate = async (e) => {
  e.preventDefault();

  // ✅ aceptar tanto id como id_persona
  const id = selectedPerson.id || selectedPerson.id_persona;
  if (!id) {
    console.error("No se encontró el ID de la persona seleccionada");
    setToast({ type: 'error', message: 'No se pudo determinar el ID de la persona.' });
    return;
  }

  const { id_persona, id: _, ...data } = selectedPerson; // excluye ambos del body
  try {
    const action = await dispatch(updatePersona({ id, data }));
    console.debug('updatePersona result:', action);
    if (action.meta.requestStatus === 'fulfilled') {
      setToast({ type: 'success', message: 'Cambios guardados correctamente.' });
      if (hasFilters) {
        dispatch(fetchPersonas(filters));
      } else {
        dispatch(fetchAllPersonas());
      }
    } else {
      setToast({ type: 'error', message: extractError(action) });
    }
  } catch (err) {
    console.error('updatePersona threw:', err);
    setToast({ type: 'error', message: extractError(err) });
  }

};
useEffect(() => {
  if (activeTab !== 'encargado') return;

  if (queryEncargado.trim().length < 2) {
    setListaEncargados([]);
    setOpenEncargadoList(false);
    return;
  }

  setLoadingEncargado(true);

  const delay = setTimeout(() => {
    dispatch(
      buscarPersonasConTodosLosSacramentos({
        sacerdote: false,
        search: queryEncargado   // ✅ AHORA SE ENVÍA AL BACKEND
      })
    )
      .unwrap()
      .then((data) => {
        setListaEncargados(data || []);
        setOpenEncargadoList(true);
      })
      .catch(() => {
        setListaEncargados([]);
      })
      .finally(() => setLoadingEncargado(false));
  }, 300);
  console.log("Búsqueda de encargado con query:", listaEncargados);

  return () => clearTimeout(delay);
}, [queryEncargado, activeTab]);

  
  
  return (
    <Layout title="Gestión de Personas">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('agregar')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === 'agregar'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          Agregar Persona
        </button>
        <button
          onClick={() => setActiveTab('buscar')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === 'buscar'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          Buscar Persona
        </button>
      </div>

      {/* Contenido dinámico según la pestaña */}
      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos Personales</h3>
          </div>
          <form className="p-6" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  placeholder="Ingrese el nombre"
                  type="text"
                  value={formAdd.nombre}
                  onChange={e => setFormAdd({ ...formAdd, nombre: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="apellido_paterno">Apellido paterno</label>
                <input
                  id="apellido_paterno"
                  placeholder="Ingrese el apellido paterno"
                  type="text"
                  value={formAdd.apellido_paterno}
                  onChange={e => setFormAdd({ ...formAdd, apellido_paterno: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="apellido_materno">Apellido materno</label>
                <input
                  id="apellido_materno"
                  placeholder="Ingrese el apellido materno"
                  type="text"
                  value={formAdd.apellido_materno}
                  onChange={e => setFormAdd({ ...formAdd, apellido_materno: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="carnet_identidad">Carnet de identidad</label>
                <input
                  id="carnet_identidad"
                  placeholder="Ingrese el CI"
                  type="text"
                  value={formAdd.carnet_identidad}
                  onChange={e => setFormAdd({ ...formAdd, carnet_identidad: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
                <input
                  id="fecha_nacimiento"
                  type="date"
                  value={formAdd.fecha_nacimiento}
                  onChange={e => setFormAdd({ ...formAdd, fecha_nacimiento: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="lugar_nacimiento">Lugar de nacimiento</label>
                <input
                  id="lugar_nacimiento"
                  placeholder="Ingrese el lugar"
                  type="text"
                  value={formAdd.lugar_nacimiento}
                  onChange={e => setFormAdd({ ...formAdd, lugar_nacimiento: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="nombre_padre">Nombre del padre</label>
                <input
                  id="nombre_padre"
                  placeholder="Ingrese el nombre del padre"
                  type="text"
                  value={formAdd.nombre_padre}
                  onChange={e => setFormAdd({ ...formAdd, nombre_padre: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="nombre_madre">Nombre de la madre</label>
                <input
                  id="nombre_madre"
                  placeholder="Ingrese el nombre de la madre"
                  type="text"
                  value={formAdd.nombre_madre}
                  onChange={e => setFormAdd({ ...formAdd, nombre_madre: e.target.value })}
                  className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Estado</label>
                  <select
                    id="activo"
                    value={String(!!formAdd.activo)}
                    onChange={e => setFormAdd({ ...formAdd, activo: e.target.value === 'true' })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="estado" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Estado de verificación</label>
                  <select
                    id="estado"
                    value={formAdd.estado}
                    onChange={e => setFormAdd({ ...formAdd, estado: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2"
                  >
                    <option value="">Seleccione</option>
                    <option value="Verificado">Verificado</option>
                    <option value="No verificado">No Verificado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isCreating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isCreating ? (
                  <>
                    <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
                    Guardando...
                  </>
                ) : (
                  'Agregar Persona'
                )}
              </button>
              <button
                type="reset"
                onClick={() => setFormAdd({ nombre: '', apellido_paterno: '', apellido_materno: '', carnet_identidad: '', activo: false, estado: '' , fecha_nacimiento: '', lugar_nacimiento: '', nombre_padre: '', nombre_madre: ''})}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'buscar' && (
        <>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Buscar Persona</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use uno o más campos para filtrar y luego presione Buscar.</p>
            </div>
            <form className="p-6" onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-nombre">Nombre</label>
                  <input
                    id="f-nombre"
                    placeholder="Nombre"
                    type="text"
                    value={filters.nombre}
                    onChange={e => setFilters({ ...filters, nombre: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-apellido_paterno">Apellido paterno</label>
                  <input
                    id="f-apellido_paterno"
                    placeholder="Apellido paterno"
                    type="text"
                    value={filters.apellido_paterno}
                    onChange={e => setFilters({ ...filters, apellido_paterno: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-apellido_materno">Apellido materno</label>
                  <input
                    id="f-apellido_materno"
                    placeholder="Apellido materno"
                    type="text"
                    value={filters.apellido_materno}
                    onChange={e => setFilters({ ...filters, apellido_materno: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-carnet_identidad">Carnet de identidad</label>
                  <input
                    id="f-carnet_identidad"
                    placeholder="CI"
                    type="text"
                    value={filters.carnet_identidad}
                    onChange={e => setFilters({ ...filters, carnet_identidad: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-fecha_nacimiento">Fecha de nacimiento</label>
                  <input
                    id="f-fecha_nacimiento"
                    type="date"
                    value={filters.fecha_nacimiento}
                    onChange={e => setFilters({ ...filters, fecha_nacimiento: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-lugar_nacimiento">Lugar de nacimiento</label>
                  <input
                    id="f-lugar_nacimiento"
                    placeholder="Lugar"
                    type="text"
                    value={filters.lugar_nacimiento}
                    onChange={e => setFilters({ ...filters, lugar_nacimiento: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-nombre_padre">Nombre del padre</label>
                  <input
                    id="f-nombre_padre"
                    placeholder="Padre"
                    type="text"
                    value={filters.nombre_padre}
                    onChange={e => setFilters({ ...filters, nombre_padre: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-nombre_madre">Nombre de la madre</label>
                  <input
                    id="f-nombre_madre"
                    placeholder="Madre"
                    type="text"
                    value={filters.nombre_madre}
                    onChange={e => setFilters({ ...filters, nombre_madre: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-activo">Estado</label>
                  <select
                    id="f-activo"
                    value={filters.activo}
                    onChange={e => setFilters({ ...filters, activo: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="f-estado">Estado de verificación</label>
                  <select
                    id="f-estado"
                    value={filters.estado}
                    onChange={e => setFilters({ ...filters, estado: e.target.value })}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3"
                  >
                    <option value="">Todos</option>
                    <option value="Verificado">Verificado</option>
                    <option value="No verificado">No verificado</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button type="submit" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Buscar</button>
                <button type="reset" onClick={handleResetSearch} className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40">Limpiar</button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Para editar alguno de los resultados, seleccione la fila deseada.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3" scope="col">Nombre</th>
                    <th className="px-6 py-3" scope="col">Apellido paterno</th>
                    <th className="px-6 py-3" scope="col">Apellido materno</th>
                    <th className="px-6 py-3" scope="col">CI</th>
                    <th className="px-6 py-3" scope="col">Fecha nac.</th>
                    <th className="px-6 py-3" scope="col">Lugar nac.</th>
                    <th className="px-6 py-3" scope="col">Estado</th>
                    <th className="px-6 py-3" scope="col">Estado de verificación</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td className="px-6 py-4" colSpan={8}>Cargando...</td></tr>
                  )}
                  {!loading && people.length === 0 && (
                    <tr><td className="px-6 py-4" colSpan={8}>Sin resultados</td></tr>
                  )}
                  {!loading && people.map((p) => (
                    <tr
                      key={p.id || p.id_persona}
                      onClick={() => handleRowClick(p.id || p.id_persona)}
                      className="cursor-pointer bg-white dark:bg-background-dark/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">{p.nombre}</td>
                      <td className="px-6 py-4">{p.apellido_paterno}</td>
                      <td className="px-6 py-4">{p.apellido_materno}</td>
                      <td className="px-6 py-4">{p.carnet_identidad}</td>
                      <td className="px-6 py-4">{p.fecha_nacimiento}</td>
                      <td className="px-6 py-4">{p.lugar_nacimiento}</td>
                      <td className="px-6 py-4">
                        {p.activo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Activo</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Inactivo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {p.estado === 'Verificado' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Verificado</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">No verificado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedPerson && (
              <div className="mt-8 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Editar Persona</h3>
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={selectedPerson.nombre || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, nombre: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido paterno</label>
                    <input
                      type="text"
                      value={selectedPerson.apellido_paterno || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, apellido_paterno: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido materno</label>
                    <input
                      type="text"
                      value={selectedPerson.apellido_materno || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, apellido_materno: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carnet de identidad</label>
                    <input
                      type="text"
                      value={selectedPerson.carnet_identidad || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, carnet_identidad: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={selectedPerson.fecha_nacimiento || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, fecha_nacimiento: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lugar de nacimiento</label>
                    <input
                      type="text"
                      value={selectedPerson.lugar_nacimiento || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, lugar_nacimiento: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del padre</label>
                    <input
                      type="text"
                      value={selectedPerson.nombre_padre || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, nombre_padre: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la madre</label>
                    <input
                      type="text"
                      value={selectedPerson.nombre_madre || ''}
                      onChange={e => setSelectedPerson({ ...selectedPerson, nombre_madre: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
                    />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="e-activo" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Estado</label>
                      <select
                        id="e-activo"
                        value={String(!!selectedPerson.activo)}
                        onChange={e => setSelectedPerson({ ...selectedPerson, activo: e.target.value === 'true' })}
                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    {/* Campo SACERDOTE — Solo mostrar si no es null */}
                    {selectedPerson.sacerdote !== null && (
                      <div>
                        <label
                          htmlFor="e-sacerdote"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
                        >
                          Encargado / Sacerdote
                        </label>

                        <select
                          id="e-sacerdote"
                          value={String(!!selectedPerson.sacerdote)}
                          onChange={e =>
                            setSelectedPerson({
                              ...selectedPerson,
                              sacerdote: e.target.value === "true"
                            })
                          }
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2"
                        >
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label htmlFor="e-estado" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Estado de verificación</label>
                      <select
                        id="e-estado"
                        value={selectedPerson.estado || ''}
                        onChange={e => setSelectedPerson({ ...selectedPerson, estado: e.target.value })}
                        className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-2"
                      >
                        <option value="">Seleccione</option>
                        <option value="Verificado">Verificado</option>
                        <option value="No verificado">No verificado</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 col-span-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedPerson(null)} className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40">Cancelar</button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isUpdating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                    >
                      {isUpdating ? (
                        <>
                          <span className="material-symbols-outlined mr-2 animate-spin">progress_activity</span>
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      )}
      {activeTab === 'encargado' && (
        <>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Buscar Encargado de Iglesia
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Seleccione a una persona que cumpla los requisitos para ser encargado.
              </p>
            </div>
             <div>
    
                    <div className="relative">
                      <input
                          type="search"
                          placeholder="Buscar encargado (persona registrada)"
                          value={queryEncargado}
                          onChange={e => {
                            setQueryEncargado(e.target.value);
                            setEncargadoSelected(false);
                            setOpenEncargadoList(true);
                            setListaEncargados([]);
                          }}
                          className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
                        />
                        {/* DROPDOWN ENCARGADO */}
{!encargadoSelected && openEncargadoList && (
  <div
    style={{
      position: "absolute",
      background: "white",
      border: "1px solid #dcdcdc",
      borderRadius: "8px",
      marginTop: "4px",
      width: "95%",
      maxHeight: "220px",
      overflowY: "auto",
      zIndex: 9999,
      padding: "5px",
    }}
  >
    {(loadingEncargado || isLoading) && (
      <div className="flex justify-center items-center py-4">
        <ClipLoader size={28} color="#4f46e5" />
      </div>
    )}

    {!encargadoSelected && listaEncargados.length === 0 && queryEncargado.length > 0 && (
      <div className="py-3 text-center text-sm text-gray-500">
        No se encontraron posibles encargados con ese valor.
      </div>
    )}

    {!loadingEncargado && !isLoading && listaEncargados.length > 0 && (
      listaEncargados.map((p) => (
        <div
          key={p.id_persona}
          style={{
            padding: "10px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
          onClick={() => {
            handleChange("padrinoId", p.id_persona);
            setQueryPadrino(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`);
            setListaPadrinos([]);
            setPadrinoSelected(true);
            setOpenPadrinoList(false);
          }}
        >
          <strong>{p.nombre} {p.apellido_paterno} {p.apellido_materno}</strong>
          <div style={{ fontSize: "13px", color: "#666" }}>
            CI: {p.carnet_identidad}
          </div>
        </div>
      ))
    )}
  </div>
)}
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escriba nombre o CI para buscar en Personas.</p>
                  </div>
      
          </div>
        </>
      )}

      <DuplicatesMergeModal open={mergeOpen} onClose={() => setMergeOpen(false)} />
    {toast && (
      <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg px-4 py-3 text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    )}
    </Layout>
  )
}