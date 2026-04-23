import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';
import Swal from "sweetalert2";

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
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('agregar')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === 'agregar'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          Agregar Parroquia
        </button>
        <button
          onClick={() => setActiveTab('buscar')}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === 'buscar'
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          Buscar Parroquia
        </button>
      </div>

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
          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Buscar Parroquia</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Use uno o más campos para filtrar y luego presione Buscar.
              </p>
            </div>
            <form className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="f-nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    id="f-nombre"
                    placeholder="Buscar por nombre"
                    type="text"
                    value={filters.nombre}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
                <div>
                  <label htmlFor="f-direccion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dirección
                  </label>
                  <input
                    id="f-direccion"
                    placeholder="Buscar por dirección"
                    type="text"
                    value={filters.direccion}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary p-3"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBuscar}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Buscar
                </button>
                <button
                  type="reset"
                  onClick={() => setFilters({ nombre: '', direccion: '' })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de resultados */}
          <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Dirección</th>
                      <th className="px-6 py-3">Teléfono</th>
                      <th className="px-6 py-3">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parroquiasLocal && parroquiasLocal.length > 0 ? (
                      parroquiasLocal.map((p) => (
                        <tr
                          key={p.id_parroquia}
                          onClick={() => handleSelectParroquia(p)}
                          className="cursor-pointer bg-white dark:bg-background-dark/50 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.nombre}</td>
                          <td className="px-6 py-4">{p.direccion}</td>
                          <td className="px-6 py-4">{p.telefono}</td>
                          <td className="px-6 py-4">{p.email}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No se encontraron resultados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Editar Parroquia */}
            
            {boolSelected && (
  <div className="mt-8 bg-white dark:bg-background-dark/50 rounded-xl shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Editar Parroquia
    </h3>

    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre
        </label>
        <input
          type="text"
          value={parroquiaSeleccionada.nombre || ''}
          onChange={(e) =>
            setParroquiaSeleccionada({
              ...parroquiaSeleccionada,
              nombre: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
        />
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dirección
        </label>
        <input
          type="text"
          value={parroquiaSeleccionada.direccion || ''}
          onChange={(e) =>
            setParroquiaSeleccionada({
              ...parroquiaSeleccionada,
              direccion: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Teléfono
        </label>
        <input
          type="text"
          value={parroquiaSeleccionada.telefono || ''}
          onChange={(e) =>
            setParroquiaSeleccionada({
              ...parroquiaSeleccionada,
              telefono: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="text"
          value={parroquiaSeleccionada.email || ''}
          onChange={(e) =>
            setParroquiaSeleccionada({
              ...parroquiaSeleccionada,
              email: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-background-light dark:bg-background-dark"
        />
      </div>

      {/* Encargado (Sacerdote) */}
      <div className="relative md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Encargado de la Parroquia (Sacerdote)
        </label>

        <div className="mb-4 relative">
          <input
            type="search"
            placeholder="Buscar sacerdote (nombre o CI)"
            value={queryEncargadoEdit}
            onChange={(e) => {
              setQueryEncargadoEdit(e.target.value);
              setOpenEncargadoEdit(true);
              setListaEncargadosEdit([]);
            }}
            className="w-full rounded-lg bg-background-light dark:bg-background-dark 
              border border-gray-300 dark:border-gray-700 
              focus:outline-none focus:ring-2 focus:ring-primary 
              p-3 pr-10"
          />

          {/* DROPDOWN ENCARGADO (EDICIÓN) */}
          {openEncargadoEdit && (
            <div
              style={{
                position: "absolute",
                background: "white",
                border: "1px solid #dcdcdc",
                borderRadius: "8px",
                marginTop: "4px",
                width: "100%",
                maxHeight: "220px",
                overflowY: "auto",
                overflowX: "hidden",
                zIndex: 40,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                padding: "5px",
              }}
            >
              {loadingEncargadoEdit && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {!loadingEncargadoEdit &&
                listaEncargadosEdit.length === 0 &&
                queryEncargadoEdit.length > 0 && parroquiaSeleccionada.id_persona === null && (
                  <div className="py-3 text-center text-sm text-gray-500">
                    No se encontraron sacerdotes.
                  </div>
                )}

              {!loadingEncargadoEdit &&
                listaEncargadosEdit.map((p) => (
                  <div
                    key={p.id_persona}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setParroquiaSeleccionada({
                        ...parroquiaSeleccionada,
                        id_persona: p.id_persona,
                      });
                      setQueryEncargadoEdit(
                        `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`
                      );
                      setListaEncargadosEdit([]);
                      setOpenEncargadoEdit(false);
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
          Puede cambiar el sacerdote encargado de la parroquia.
        </p>
      </div>

      {/* Botones */}
      <div className="mt-4 col-span-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleEditarParroquia}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={handleCancelarEdicion}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40"
        >
          Cerrar
        </button>
      </div>
    </form>
  </div>
)}

          </div>
        </>
      )}

      <DuplicatesMergeModal open={mergeOpen} onClose={() => setMergeOpen(false)} />
    </Layout>
  );
}

