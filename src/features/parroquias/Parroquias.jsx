import { useState, useEffect, useRef } from 'react';
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

import MapaParroquias from './components/MapaParroquias.jsx';
import GeoPreviewMap from './components/GeoPreviewMap.jsx';

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
  selectParroquias,      // ← agregar
  selectTotalItems,      // ← agregar
  selectTotalPages,      // ← agregar
  selectCurrentPage,     // ← agregar
} from './slices/parroquiasSlice';

import { buscarPersonasConTodosLosSacramentos } from '../sacramentos/slices/sacramentosTrunk.js';

function EditParroquiaMapSection({ formData, setFormData }) {
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoAdjusted, setGeoAdjusted] = useState(false);
  // Guarda la dirección inicial cuando llegan los datos de la API,
  // para no disparar geocoding en la carga, solo cuando el usuario edita.
  const initialAddressRef = useRef(null);

  // Carga coordenadas desde la API cuando llegan (una sola vez)
  useEffect(() => {
    if (initialAddressRef.current !== null) return;
    if (!formData.nombre && !formData.direccion) return; // todavía vacío
    initialAddressRef.current = `${formData.nombre}|${formData.direccion}`;
    const lat = parseFloat(formData.latitud);
    const lng = parseFloat(formData.longitud);
    if (!isNaN(lat) && !isNaN(lng)) {
      setGeoCoords({ lat, lng, displayName: formData.direccion || '' });
    }
  }, [formData.nombre, formData.direccion, formData.latitud, formData.longitud]);

  // Geocodifica solo cuando el usuario cambia nombre o dirección
  useEffect(() => {
    if (initialAddressRef.current === null) return; // datos aún no cargados
    const current = `${formData.nombre}|${formData.direccion}`;
    if (initialAddressRef.current === current) return; // sin cambios del usuario

    const query = [formData.nombre, formData.direccion].filter(Boolean).join(', ').trim();
    if (query.length < 6) { setGeoCoords(null); return; }
    setGeoLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await res.json();
        if (data.length > 0) {
          const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
          setGeoCoords(coords);
          setGeoAdjusted(false);
          setFormData(prev => ({ ...prev, latitud: coords.lat, longitud: coords.lng }));
        }
      } catch { /* mantener coords anteriores */ }
      finally { setGeoLoading(false); }
    }, 700);
    return () => clearTimeout(timer);
  }, [formData.nombre, formData.direccion]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación en el mapa</span>
        {geoLoading && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
            Buscando dirección…
          </span>
        )}
        {!geoLoading && !geoCoords && (formData.direccion || '').trim().length > 5 && (
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <span className="material-symbols-outlined text-sm">warning</span>
            No se encontró la dirección
          </span>
        )}
      </div>
      {geoCoords ? (
        <GeoPreviewMap
          lat={geoCoords.lat}
          lng={geoCoords.lng}
          displayName={geoCoords.displayName}
          adjusted={geoAdjusted}
          onMove={({ lat, lng }) => {
            setGeoCoords(prev => ({ ...prev, lat, lng }));
            setGeoAdjusted(true);
            setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }));
          }}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600 text-sm" style={{ height: 100 }}>
          <span className="material-symbols-outlined text-2xl">map</span>
          <span>Ingrese nombre y dirección para ver la ubicación</span>
        </div>
      )}
    </div>
  );
}

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

  const parroquias  = useSelector(selectParroquias);
  const totalItems  = useSelector(selectTotalItems);
  const totalPages  = useSelector(selectTotalPages);
  const currentPage = useSelector(selectCurrentPage);

  const [toast, setToast] = useState(null);

  const [geoCoords, setGeoCoords]     = useState(null);   // { lat, lng, displayName }
  const [geoLoading, setGeoLoading]   = useState(false);
  const [geoAdjusted, setGeoAdjusted] = useState(false);  // true si el usuario movió el pin

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isFormValid =
    formData.nombre?.trim() &&
    formData.direccion?.trim() &&
    formData.telefono?.trim()?.length >= 7 &&
    /\S+@\S+\.\S+/.test(formData.email || '') &&
    formData.id_usuario;

  const resetForm = () => {
    setFormData({ ...initialParroquiaForm });
    setQueryEncargado('');
    setListaEncargados([]);
    setOpenEncargadoList(false);
    setGeoCoords(null);
    setGeoAdjusted(false);
  };

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

  const cargarParroquias = (filtros = filters, page = 1) => {
    dispatch(fetchParroquias({ ...filtros, page }));
  };

  const handlePageChange = (newPage) => {
    cargarParroquias(filters, newPage);
  };
  const buildParroquiaEditFields = (usuarios) => [
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

  const buildParroquiaPayload = (parroquia) => ({
    nombre: parroquia.nombre,
    direccion: parroquia.direccion,
    telefono: parroquia.telefono,
    email: parroquia.email,
    id_usuario: parroquia.id_usuario || null,
    ...(parroquia.latitud  != null && { latitud:  parroquia.latitud  }),
    ...(parroquia.longitud != null && { longitud: parroquia.longitud }),
  });

  const handleSaveParroquia = async (editedParroquia) => {
    const id = editedParroquia.id_parroquia;

    const action = await dispatch(
      updateParroquia({
        id,
        data: buildParroquiaPayload(editedParroquia),
      })
    );

    if (updateParroquia.fulfilled.match(action)) {
      setToast({
        type: 'success',
        message: 'Parroquia actualizada exitosamente.',
      });

      cargarParroquias();
      return true;
    }

    setToast({
      type: 'error',
      message: extractError(action),
    });

    return false;
  };

  useEffect(() => {
    if (activeTab === 'buscar') cargarParroquias();
  }, [activeTab]);

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

  // Geocodificación automática al escribir la dirección (debounce 700ms)
  useEffect(() => {
    if (activeTab !== 'agregar') return;
    const query = [formData.nombre, formData.direccion].filter(Boolean).join(', ').trim();
    if (query.length < 6) {
      setGeoCoords(null);
      return;
    }
    setGeoLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await res.json();
        if (data.length > 0) {
          setGeoCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name });
          setGeoAdjusted(false);
        } else {
          setGeoCoords(null);
          setGeoAdjusted(false);
        }
      } catch {
        setGeoCoords(null);
      } finally {
        setGeoLoading(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [formData.nombre, formData.direccion, activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setToast({
        type: 'error',
        message: 'Complete todos los campos y seleccione un párroco.',
      });
      return;
    }

    const payload = {
      ...formData,
      ...(geoCoords && { latitud: geoCoords.lat, longitud: geoCoords.lng }),
    };

    const action = await dispatch(createParroquia(payload));

    if (createParroquia.fulfilled.match(action)) {
      setToast({
        type: 'success',
        message: 'Parroquia creada exitosamente.',
      });

      resetForm();
    } else {
      setToast({
        type: 'error',
        message: extractError(action),
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

    const [parroquiaAction, usuarios] = await Promise.all([
      dispatch(fetchParroquiaById(p.id_parroquia)),
      cargarUsuariosParrocos(''),
    ]);

    if (!fetchParroquiaById.fulfilled.match(parroquiaAction)) {
      close();
      setToast({
        type: 'error',
        message: extractError(parroquiaAction),
      });
      return;
    }

    const parroquia = parroquiaAction.payload?.parroquia || parroquiaAction.payload;

    open({
      title: 'Editar Parroquia',
      entity: {
        ...parroquia,
        id_usuario: parroquia.parroco?.id_usuario || '',
      },
      fields: buildParroquiaEditFields(usuarios),
      loading: false,
      onSave: handleSaveParroquia,
      extra: (formData, setFormData) => (
        <EditParroquiaMapSection formData={formData} setFormData={setFormData} />
      ),
    });
  };

  return (
    <Layout title="Gestión de Parroquias">
      <PageTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { key: 'agregar', label: 'Agregar Parroquia' },
          { key: 'buscar',  label: 'Buscar Parroquia'  },
          { key: 'mapa',    label: 'Mapa'              },
        ]}
      />

      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos de la Parroquia
            </h3>
          </div>

          <form onSubmit={handleCreate} className="p-6">
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
                  setFormData({ ...formData, id_usuario: null });
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
                    queryEncargado.length > 0 && (
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
                          setFormData({ ...formData, id_usuario: u.id_usuario });
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
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Seleccione un usuario con rol PÁRROCO como encargado.
              </p>
            </div>

            {/* Previsualización de ubicación geocodificada */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación en el mapa</span>
                {geoLoading && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    Buscando dirección…
                  </span>
                )}
                {!geoLoading && !geoCoords && formData.direccion.trim().length > 5 && (
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    No se encontró la dirección
                  </span>
                )}
              </div>
              {geoCoords ? (
                <GeoPreviewMap
                  lat={geoCoords.lat}
                  lng={geoCoords.lng}
                  displayName={geoCoords.displayName}
                  adjusted={geoAdjusted}
                  onMove={({ lat, lng }) => {
                    setGeoCoords((prev) => ({ ...prev, lat, lng }));
                    setGeoAdjusted(true);
                  }}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600 text-sm" style={{ height: 100 }}>
                  <span className="material-symbols-outlined text-2xl">map</span>
                  <span>Ingrese nombre y dirección para ver la ubicación</span>
                </div>
              )}
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
                onClick={resetForm}
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
              data={parroquias}           // ← antes: parroquiasLocal
              loading={isLoading}
              loadingMessage="Cargando parroquias..."
              emptyMessage="No se encontraron resultados"
              onRowClick={handleSelectParroquia}
              getRowKey={(p) => p.id_parroquia}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {activeTab === 'mapa' && <MapaParroquias />}

      <DuplicatesMergeModal
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
      />

      <Toast toast={toast} />

      {modal}
    </Layout>
  );
}