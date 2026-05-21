import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';

import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import FormFields from '../../shared/components/pages/FormFields.jsx';
import FilterPanel from '../../shared/components/pages/FilterPanel.jsx';
import DataTable from '../../shared/components/pages/DataTable.jsx';
import Toast from '../../shared/components/ui/Toast.jsx';
import { useEditEntityModal } from '../../shared/components/pages/EditEntityModal.jsx';
import { extractError } from '../../shared/utils/extractError.js';

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

import { selectIsLoading, selectError } from './slices/parroquiasSlice';

import { buscarPersonasConTodosLosSacramentos } from '../sacramentos/slices/sacramentosTrunk.js';

export default function Parroquias() {
  const dispatch = useDispatch();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const { open, close, modal } = useEditEntityModal();

  const [mergeOpen, setMergeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agregar');

  const [formData, setFormData] = useState({ ...initialParroquiaForm });
  const [filters, setFilters] = useState({ ...initialParroquiaFilters });
  const [parroquiasLocal, setParroquiasLocal] = useState([]);

  const [queryEncargado, setQueryEncargado] = useState('');
  const [listaEncargados, setListaEncargados] = useState([]);
  const [openEncargadoList, setOpenEncargadoList] = useState(false);
  const [loadingEncargado, setLoadingEncargado] = useState(false);

  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const isFormValid =
  formData.nombre?.trim() &&
  formData.direccion?.trim() &&
  formData.telefono?.trim() && formData.telefono.trim().length >= 7 &&
  formData.email?.trim() && /\S+@\S+\.\S+/.test(formData.email) &&
  formData.id_usuario;

  const cargarUsuariosParrocos = async (search = '') => {
    const action = await dispatch(
      buscarPersonasConTodosLosSacramentos({
        rol: 'PARROCO',
        search,
        limit: 100,
      })
    );

    if (buscarPersonasConTodosLosSacramentos.fulfilled.match(action)) {
      return action.payload || [];
    }

    return [];
  };

  useEffect(() => {
    if (activeTab !== 'agregar') return;

    if (queryEncargado.trim().length < 2) {
      setListaEncargados([]);
      setOpenEncargadoList(false);
      return;
    }

    setLoadingEncargado(true);

    const delay = setTimeout(async () => {
      const usuarios = await cargarUsuariosParrocos(queryEncargado);

      setListaEncargados(usuarios);
      setOpenEncargadoList(true);
      setLoadingEncargado(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [queryEncargado, activeTab]);

  const cargarParroquias = async (filtros = filters) => {
    const result = await dispatch(fetchParroquias(filtros));

    if (fetchParroquias.fulfilled.match(result)) {
      const data = result.payload;
      setParroquiasLocal(Array.isArray(data) ? data : data.parroquias || []);
    }
  };

  useEffect(() => {
    if (activeTab === 'buscar') {
      cargarParroquias();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(createParroquia(formData));

    if (createParroquia.fulfilled.match(result)) {
      setToast({ type: 'success', message: 'Parroquia creada exitosamente.' });
      setFormData({ ...initialParroquiaForm });
      setQueryEncargado('');
      setListaEncargados([]);
      setOpenEncargadoList(false);
    } else {
        setToast({
          type: 'error',
          message: extractError(result),
        });

    }
  };

  const handleSelectParroquia = async (p) => {
    open({
      title: 'Editar Parroquia',
      entity: {},
      fields: parroquiaFields,
      loading: true,
      onSave: async () => false,
    });

    const result = await dispatch(fetchParroquiaById(p.id_parroquia));

    if (!fetchParroquiaById.fulfilled.match(result)) {
      close();

      setToast({ type: 'error', message: 'Error al cargar los datos de la parroquia.' });

      return;
    }

    const parroquia = result.payload?.parroquia || result.payload;
    const usuarios = await cargarUsuariosParrocos('');

    const parroquiaEditFields = [
      ...parroquiaFields,
      {
        name: 'id_usuario',
        label: 'Párroco encargado',
        type: 'select',
        options: [
          { value: '', label: 'Sin párroco asignado' },
          ...usuarios.map((u) => ({
            value: u.id_usuario,
            label: `${u.nombre} ${u.apellido_paterno || ''} ${u.apellido_materno || ''} - ${u.email}`,
          })),
        ],
      },
    ];

    const entity = {
      ...parroquia,
      id_usuario: parroquia.parroco?.id_usuario || '',
    };

    open({
      title: 'Editar Parroquia',
      entity,
      fields: parroquiaEditFields,
      loading: false,
      onSave: async (editedParroquia) => {
        const id = editedParroquia.id_parroquia;

        const data = {
          nombre: editedParroquia.nombre,
          direccion: editedParroquia.direccion,
          telefono: editedParroquia.telefono,
          email: editedParroquia.email,
          id_usuario: editedParroquia.id_usuario || null,
        };

        const resultUpdate = await dispatch(
          updateParroquia({
            id,
            data,
          })
        );

        if (updateParroquia.fulfilled.match(resultUpdate)) {
          setToast({ type: 'success', message: 'Parroquia actualizada exitosamente.' });

          cargarParroquias();
          return true;
        }

       setToast({
          type: 'error',
          message: extractError(resultUpdate),
        });

        return false;
      },
    });
  };

  return (
    <Layout title="Gestión de Parroquias">
      <PageTabs
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        tabs={[
          { key: 'agregar', label: 'Agregar Parroquia' },
          { key: 'buscar', label: 'Buscar Parroquia' },
        ]}
      />

      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos de la Parroquia
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <FormFields
              fields={parroquiaFields}
              values={formData}
              setValues={setFormData}
            />

            <div className="relative mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Encargado de la Parroquia (Párroco)
              </label>

              <input
                type="search"
                placeholder="Buscar usuario párroco por nombre o correo"
                value={queryEncargado}
                onChange={(e) => {
                  setQueryEncargado(e.target.value);
                  setOpenEncargadoList(true);
                  setListaEncargados([]);
                  setFormData({
                    ...formData,
                    id_usuario: null,
                  });
                }}
                className="w-full rounded-lg bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary p-3 pr-10"
              />

              <span className="material-symbols-outlined absolute right-3 top-10 text-gray-500">
                search
              </span>

              {openEncargadoList && (
                <div className="absolute bg-white border border-gray-200 rounded-lg mt-2 w-full max-h-56 overflow-y-auto z-40 shadow-lg p-2">
                  {loadingEncargado && (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  )}

                  {!loadingEncargado &&
                    listaEncargados.length === 0 &&
                    queryEncargado.length > 0 &&
                    formData.id_usuario == null && (
                      <div className="py-3 text-center text-sm text-gray-500">
                        No se encontraron usuarios con rol párroco.
                      </div>
                    )}

                  {!loadingEncargado &&
                    listaEncargados.map((u) => (
                      <div
                        key={u.id_usuario}
                        className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-md"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            id_usuario: u.id_usuario,
                          });

                          setQueryEncargado(
                            `${u.nombre} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`
                          );

                          setListaEncargados([]);
                          setOpenEncargadoList(false);
                        }}
                      >
                        <strong>
                          {u.nombre} {u.apellido_paterno} {u.apellido_materno}
                        </strong>
                        <div className="text-xs text-gray-500">
                          {u.email}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Seleccione un usuario con rol PÁRROCO como encargado.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium ${
                    isFormValid
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-gray-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  Agregar Parroquia
                </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...initialParroquiaForm });
                  setQueryEncargado('');
                  setListaEncargados([]);
                  setOpenEncargadoList(false);
                }}
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
          <FilterPanel
            title="Buscar Parroquia"
            description="Despliegue los filtros para realizar una búsqueda avanzada."
            fields={parroquiaSearchFields}
            values={filters}
            setValues={setFilters}
            onSearch={(e) => {
              e.preventDefault();
              cargarParroquias();
            }}
            onReset={() => {
              setFilters({ ...initialParroquiaFilters });
              setParroquiasLocal([]);
            }}
          />

          {error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <DataTable
              columns={parroquiaColumns}
              data={parroquiasLocal}
              loading={isLoading}
              loadingMessage="Cargando parroquias..."
              emptyMessage="No se encontraron resultados"
              onRowClick={(p) => handleSelectParroquia(p)}
              getRowKey={(p) => p.id_parroquia}
            />
          )}
        </>
      )}

      <DuplicatesMergeModal
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
      />
       <Toast toast={toast} />

      {modal}
    </Layout>
  );
}