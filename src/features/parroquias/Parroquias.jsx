import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';
import Swal from "sweetalert2";
import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import FormFields from '../../shared/components/pages/FormFields.jsx';
import FilterPanel from '../../shared/components/pages/FilterPanel.jsx';
import DataTable from '../../shared/components/pages/DataTable.jsx';

//refactor 
import {
  parroquiaFields,
  parroquiaSearchFields,
  initialParroquiaForm,
  initialParroquiaFilters,
} from './config/parroquiasForm.js';

import { parroquiaColumns } from './config/parroquiasColumns.js';

import {
  fetchParroquias,
  fetchParroquiaById,
  createParroquia,
  updateParroquia,
} from './slices/parroquiasThunk';

import {
   selectPersonasConTodos
} from '../sacramentos/slices/sacramentosSlices';
import {
  buscarPersonasConTodosLosSacramentos
}from '../sacramentos/slices/sacramentosTrunk.js';

import {
  selectParroquias,
  selectIsLoading,
  selectError,
  selectParroquiaSeleccionada,
  clearParroquiaSeleccionada,
} from './slices/parroquiasSlice';

export default function Parroquias() {
  const dispatch = useDispatch();

  // ====== ESTADOS ======
  const [mergeOpen, setMergeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agregar');
  const [boolSelected, setBoolSelected] = useState(false);
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    id_persona: null, // 👈 sacerdote encargado
  });
  // ====== BUSCADOR ENCARGADO (SACERDOTE) ======
  const [queryEncargado, setQueryEncargado] = useState("");
  const [listaEncargados, setListaEncargados] = useState([]);
  const [openEncargadoList, setOpenEncargadoList] = useState(false);
  const [loadingEncargado, setLoadingEncargado] = useState(false);

  // ====== BUSCADOR ENCARGADO (EDICIÓN) ======
  const [queryEncargadoEdit, setQueryEncargadoEdit] = useState("");
  const [listaEncargadosEdit, setListaEncargadosEdit] = useState([]);
  const [openEncargadoEdit, setOpenEncargadoEdit] = useState(false);
  const [loadingEncargadoEdit, setLoadingEncargadoEdit] = useState(false);
  useEffect(() => {
    if (activeTab !== 'agregar') return;

    if (queryEncargado.trim().length < 2) {
      setListaEncargados([]);
      setOpenEncargadoList(false);
      return;
    }

    setLoadingEncargado(true);

    const delay = setTimeout(() => {
      dispatch(
        buscarPersonasConTodosLosSacramentos({
          sacerdote: true,       // 👈 SOLO SACERDOTES
          search: queryEncargado
        })
      )
        .unwrap()
        .then((data) => {
          setListaEncargados(data.personas || []);
          setOpenEncargadoList(true);
        })
        .catch(() => {
          setListaEncargados([]);
        })
        .finally(() => setLoadingEncargado(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [queryEncargado, activeTab, dispatch]);
  const [filters, setFilters] = useState({ nombre: '', direccion: '' });
  useEffect(() => {
    if (!boolSelected || !queryEncargadoEdit || queryEncargadoEdit.trim().length < 2) {
      setListaEncargadosEdit([]);
      setOpenEncargadoEdit(false);
      return;
    }

    setLoadingEncargadoEdit(true);

    const delay = setTimeout(() => {
      dispatch(
        buscarPersonasConTodosLosSacramentos({
          sacerdote: true,
          search: queryEncargadoEdit,
        })
      )
        .unwrap()
        .then((data) => {
          setListaEncargadosEdit(data.personas || []);
          setOpenEncargadoEdit(true);
        })
        .catch(() => {
          setListaEncargadosEdit([]);
        })
        .finally(() => setLoadingEncargadoEdit(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [queryEncargadoEdit, boolSelected, dispatch]);

  // Precargar encargado actual en edición (buscar por id_persona)
  useEffect(() => {
    if (!parroquiaSeleccionada?.id_persona) return;

    dispatch(
      buscarPersonasConTodosLosSacramentos({
        sacerdote: true,
        search: String(parroquiaSeleccionada.id_persona),
      })
    )
      .unwrap()
      .then((data) => {
        const persona = data.personas?.find(
          (p) => p.id_persona === parroquiaSeleccionada.id_persona
        );

        if (persona) {
          setQueryEncargadoEdit(
            `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`
          );

          setParroquiaSeleccionada((prev) => ({
            ...prev,
            id_persona: persona.id_persona,
          }));
        }
      });
  }, [parroquiaSeleccionada?.id_persona, dispatch]);
  const [parroquiasLocal, setParroquiasLocal] = useState([]);

  //const parroquiaSeleccionada = useSelector(selectParroquiaSeleccionada);
  const parroquias = useSelector(selectParroquias);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);


  // ====== EFECTOS ======
  useEffect(() => {
    if (activeTab === 'buscar') {
      dispatch(fetchParroquias(filters));
    }
  }, [activeTab, filters, dispatch]);

  // ====== MANEJADORES ======
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.id.replace('f-', '')]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const result = await dispatch(createParroquia(formData));
  
    if (createParroquia.fulfilled.match(result)) {
      Swal.fire({
        icon: "success",
        title: "Parroquia agregada",
        text: "La parroquia fue creada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
  
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al crear la parroquia.",
      });
    }
  };
  

  const handleBuscar = async () => {
    const resultAction = await dispatch(fetchParroquias(filters));
    if (fetchParroquias.fulfilled.match(resultAction)) {
      const data = resultAction.payload;
      if (Array.isArray(data)) {
        setParroquiasLocal(data);
      } else if (data.parroquias) {
        setParroquiasLocal(data.parroquias);
      }
    }
  };
  const handleSelectParroquia = async (p) => {
    console.log('ID Parroquia seleccionada:', p.id_parroquia);
    const result = await dispatch(fetchParroquiaById(p.id_parroquia));
    
    if (fetchParroquiaById.fulfilled.match(result)) {
      console.log('✅ Parroquia cargada:', result.payload);
      setParroquiaSeleccionada(result.payload); 
    } else {
      console.error('❌ Error al cargar parroquia:', result.error);
    }
  };
  
  useEffect(() => {
    if (parroquiaSeleccionada) {
      console.log('🟢 parroquiaSeleccionada actualizada:', parroquiaSeleccionada);
      dispatch({
        type: 'parroquias/setParroquiaSeleccionada',
        payload: parroquiaSeleccionada,
      });
      setBoolSelected(true);
    }
  }, [parroquiaSeleccionada]);
  const handleEditarParroquia = async () => {
    if (!parroquiaSeleccionada?.id_parroquia) return;
  
    const result = await dispatch(
      updateParroquia({
        id: parroquiaSeleccionada.id_parroquia,
        data: parroquiaSeleccionada,
      })
    );
  
    if (updateParroquia.fulfilled.match(result)) {
      Swal.fire({
        icon: "success",
        title: "Parroquia actualizada",
        text: "Los cambios se guardaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "No se pudieron guardar los cambios.",
      });
    }
  };
  
  const handleCancelarEdicion = () => {
    dispatch(clearParroquiaSeleccionada());
    setBoolSelected(false); // 👈 RESETEAMOS LA BANDERA
  };

  // ====== RENDER ======
  return (
    <Layout title="Gestión de Parroquias">
      {/* Tabs */}
      <PageTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setParroquiaSeleccionada(null);
            setBoolSelected(false);
          }}
          tabs={[
            { key: 'agregar', label: 'Agregar Parroquia' },
            { key: 'buscar', label: 'Buscar Parroquia' },
          ]}
        />

      {/* TAB: Agregar */}
      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos de la Parroquia</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['nombre', 'direccion', 'telefono', 'email'].map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={`Ingrese ${field}`}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
              ))}

              {/* Encargado (Sacerdote) */}
              <div className="relative md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Encargado de la Parroquia (Sacerdote)
                </label>

                <div className="mb-6 relative">
                  <input
                    type="search"
                    placeholder="Buscar sacerdote (nombre o CI)"
                    value={queryEncargado}
                    onChange={(e) => {
                      setQueryEncargado(e.target.value);
                      setOpenEncargadoList(true);
                      setListaEncargados([]);
                    }}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark 
        border border-gray-300 dark:border-gray-700 
        focus:outline-none focus:ring-2 focus:ring-primary 
        p-3 pr-10"
                  />

                  {/* DROPDOWN ENCARGADO */}
                  {openEncargadoList && (
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
                        zIndex: 40,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                        padding: "5px",
                      }}
                    >
                      {/* Loading */}
                      {loadingEncargado && (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      )}

                      {/* Sin resultados */}
                      {!loadingEncargado &&
                        listaEncargados.length === 0 &&
                        queryEncargado.length > 0 &&
                        formData.id_persona == null && (
                          <div className="py-3 text-center text-sm text-gray-500">
                            No se encontraron sacerdotes.
                          </div>
                        )}

                      {/* Resultados */}
                      {!loadingEncargado &&
                        listaEncargados.length > 0 &&
                        listaEncargados.map((p) => (
                          <div
                            key={p.id_persona}
                            style={{
                              padding: "10px",
                              borderBottom: "1px solid #eee",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                id_persona: p.id_persona,
                              });
                              setQueryEncargado(
                                `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`
                              );
                              setListaEncargados([]);
                              setOpenEncargadoList(false);
                            }}
                          >
                            <strong>
                              {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                            </strong>
                            <div style={{ fontSize: "13px", color: "#666" }}>
                              CI: {p.carnet_identidad}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    search
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Seleccione el sacerdote encargado de la parroquia.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Agregar Parroquia
              </button>
              <button
                type="reset"
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Buscar */}
      {activeTab === 'buscar' && (
        <>
          <FilterPanel
            title="Buscar Parroquia"
            description="Despliegue los filtros para realizar una búsqueda avanzada."
            fields={parroquiaSearchFields}
            values={filters}
            setValues={setFilters}
            onSearch={(e) => {
              e.preventDefault();
              handleBuscar();
            }}
            onReset={() => {
              setFilters({ ...initialParroquiaFilters });
              setParroquiasLocal([]);
            }}
          />

          {/* Tabla de resultados */}
          <DataTable
  columns={parroquiaColumns}
  data={parroquiasLocal}
  loading={isLoading}
  loadingMessage="Cargando parroquias..."
  emptyMessage="No se encontraron resultados"
  onRowClick={(p) => handleSelectParroquia(p)}
  getRowKey={(p) => p.id_parroquia}
/>
        </>
      )}

      <DuplicatesMergeModal open={mergeOpen} onClose={() => setMergeOpen(false)} />
    </Layout>
  );
}

