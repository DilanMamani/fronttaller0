import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';
//refactor
import FormFields from '../../shared/components/pages/FormFields.jsx';
import DataTable from '../../shared/components/pages/DataTable.jsx';
import FilterPanel from '../../shared/components/pages/FilterPanel.jsx';
import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import { useEditEntityModal } from '../../shared/components/pages/EditEntityModal.jsx';
import { extractError } from '../../shared/utils/extractError';
import Toast from '../../shared/components/ui/Toast.jsx';
//refactor campos 
import { personaFields, initialPersonaForm, personaSearchFields, initialPersonaFilters } from './config/personasForm.js';
import { personaColumns } from './config/personasColumns.jsx';
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
  //para refactorizar el formulario, definir los campos en un array de objetos con { name, label, type?, options? } y mapearlo
  
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
  const { open, close, modal } = useEditEntityModal();

  const [formAdd, setFormAdd] = useState({ ...initialPersonaForm });
  const [filters, setFilters] = useState({ ...initialPersonaFilters });
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
  const error = extractError;

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
  setFilters({ ...initialPersonaFilters });
  setSelectedPerson(null);
  dispatch(fetchAllPersonas());
};

const handleRowClick = async (id) => {
  open({
    title: 'Editar Persona',
    entity: {},
    fields: personaFields,
    loading: true,
    onSave: async () => false,
  });

  const action = await dispatch(fetchPersonaById(id));

  if (action.meta.requestStatus !== 'fulfilled') {
    setToast({ type: 'error', message: extractError(action) });
    close();
    return;
  }

  const persona = action.payload?.persona || action.payload;

  open({
    title: 'Editar Persona',
    entity: persona,
    fields: personaFields,
    loading: false,
    isSaving: isUpdating,
    onSave: async (editedPerson) => {
      const personId = editedPerson.id || editedPerson.id_persona;
      const { id, id_persona, ...data } = editedPerson;

      const result = await dispatch(updatePersona({ id: personId, data }));

      if (result.meta.requestStatus === 'fulfilled') {
        setToast({
          type: 'success',
          message: 'Persona actualizada correctamente.',
        });

        if (hasFilters) {
          dispatch(fetchPersonas(filters));
        } else {
          dispatch(fetchAllPersonas());
        }

        return true;
      }

      setToast({
        type: 'error',
        message: extractError(result),
      });

      return false;
    },
  });
};
  
  const handleCreate = async (e) => {
      e.preventDefault();

      try {
        const action = await dispatch(createPersona(formAdd));

        if (action.meta.requestStatus === 'fulfilled') {
          setToast({ type: 'success', message: 'Persona creada correctamente.' });

          setFormAdd(initialPersonaForm);
          setSelectedPerson(null);

          dispatch(fetchAllPersonas());
        } else {
          setToast({ type: 'error', message: extractError(action) });
        }
      } catch (err) {
        setToast({ type: 'error', message: extractError(err) });
      }
  };

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
     <PageTabs
  activeTab={activeTab}
  onChange={(tab) => {
    setActiveTab(tab);
    setSelectedPerson(null);
  }}
  tabs={[
    { key: 'agregar', label: 'Agregar Persona' },
    { key: 'buscar', label: 'Buscar Persona' },
  ]}
/>

      {/* Contenido dinámico según la pestaña */}
      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos Personales</h3>
          </div>
          <form className="p-6" onSubmit={handleCreate}>
            <FormFields
              fields={personaFields}
              values={formAdd}
              setValues={setFormAdd}
            />

            <div className="mt-6 flex items-center gap-3">
              <button type="submit" disabled={isCreating} className="inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium bg-primary hover:bg-primary/90">
                {isCreating ? 'Guardando...' : 'Agregar Persona'}
              </button>

              <button
                type="reset"
                onClick={() => {

                    setFormAdd(initialPersonaForm);

                    setSelectedPerson(null);

                  }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700"
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
            
           <FilterPanel
              title="Buscar Persona"
              description="Despliegue los filtros para realizar una búsqueda avanzada."
              fields={personaSearchFields}
              values={filters}
              setValues={setFilters}
              onSearch={handleSearch}
              onReset={handleResetSearch}
            />
          </div>

          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Para editar alguno de los resultados, seleccione la fila deseada.</p>
            </div>
            <div className="overflow-x-auto">
              <DataTable
                  columns={personaColumns}
                  data={people}
                  loading={loading}
                  loadingMessage="Cargando datos..."
                  emptyMessage="Sin resultados"
                  onRowClick={(p) => handleRowClick(p.id || p.id_persona)}
                  getRowKey={(p) => p.id || p.id_persona}
                />
            </div>
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
        {modal}
        <Toast toast={toast} />
   
    </Layout>
  )
}