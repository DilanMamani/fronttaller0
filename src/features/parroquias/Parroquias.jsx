import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import Layout from '../../shared/components/layout/Layout';
import DuplicatesMergeModal from './components/DuplicatesMergeModal';

import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import FormFields from '../../shared/components/pages/FormFields.jsx';
import FilterPanel from '../../shared/components/pages/FilterPanel.jsx';
import DataTable from '../../shared/components/pages/DataTable.jsx';
import { useEditEntityModal } from '../../shared/components/pages/EditEntityModal.jsx';

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
  selectIsLoading,
  selectError,
} from './slices/parroquiasSlice';

import {
  buscarPersonasConTodosLosSacramentos,
} from '../sacramentos/slices/sacramentosTrunk.js';

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
          sacerdote: true,
          search: queryEncargado,
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

  const cargarParroquias = async (filtros = filters) => {
    const result = await dispatch(fetchParroquias(filtros));

    if (fetchParroquias.fulfilled.match(result)) {
      const data = result.payload;

      if (Array.isArray(data)) {
        setParroquiasLocal(data);
      } else {
        setParroquiasLocal(data.parroquias || []);
      }
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
      Swal.fire({
        icon: 'success',
        title: 'Parroquia agregada',
        text: 'La parroquia fue creada exitosamente.',
        timer: 1800,
        showConfirmButton: false,
      });

      setFormData({ ...initialParroquiaForm });
      setQueryEncargado('');
      setListaEncargados([]);
      setOpenEncargadoList(false);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.payload?.msg || 'Hubo un problema al crear la parroquia.',
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

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la parroquia seleccionada.',
      });

      return;
    }

    const parroquia = result.payload?.parroquia || result.payload;

    open({
      title: 'Editar Parroquia',
      entity: parroquia,
      fields: parroquiaFields,
      loading: false,
      onSave: async (editedParroquia) => {
        const id = editedParroquia.id_parroquia;

        const resultUpdate = await dispatch(
          updateParroquia({
            id,
            data: editedParroquia,
          })
        );

        if (updateParroquia.fulfilled.match(resultUpdate)) {
          Swal.fire({
            icon: 'success',
            title: 'Parroquia actualizada',
            text: 'Los cambios se guardaron correctamente.',
            timer: 1600,
            showConfirmButton: false,
          });

          cargarParroquias();

          return true;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: resultUpdate.payload?.msg || 'No se pudieron guardar los cambios.',
        });

        return false;
      },
    });
  };

  return (
    <Layout title="Gestión de Parroquias">
      <PageTabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
        }}
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
                Encargado de la Parroquia (Sacerdote)
              </label>

              <input
                type="search"
                placeholder="Buscar sacerdote por nombre o CI"
                value={queryEncargado}
                onChange={(e) => {
                  setQueryEncargado(e.target.value);
                  setOpenEncargadoList(true);
                  setListaEncargados([]);
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
                    formData.id_persona == null && (
                      <div className="py-3 text-center text-sm text-gray-500">
                        No se encontraron sacerdotes.
                      </div>
                    )}

                  {!loadingEncargado &&
                    listaEncargados.map((p) => (
                      <div
                        key={p.id_persona}
                        className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-md"
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
                        <div className="text-xs text-gray-500">
                          CI: {p.carnet_identidad}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Seleccione el sacerdote encargado de la parroquia.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
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

      {modal}
    </Layout>
  );
}