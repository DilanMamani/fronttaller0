import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import Layout from '../../shared/components/layout/Layout';
import PageTabs from '../../shared/components/pages/PageTabs.jsx';
import FormFields from '../../shared/components/pages/FormFields.jsx';
import FilterPanel from '../../shared/components/pages/FilterPanel.jsx';
import DataTable from '../../shared/components/pages/DataTable.jsx';
import Toast from '../../shared/components/ui/Toast.jsx';
import { useEditEntityModal } from '../../shared/components/pages/EditEntityModal.jsx';
import { extractError } from '../../shared/utils/extractError.js';

import {
  fetchUsuarios,
  fetchAllUsuarios,
  fetchUsuarioById,
  createUsuarioAndSendReset,
  updateUsuario,
  unlockUsuario,
} from './slices/usuariosTrunk';

import {
  selectIsLoading,
  selectUsuarios,
  selectAllUsuarios,
  selectIsCreating,
  selectIsUpdating,
  selectTotalItems,    // ← agregar
  selectTotalPages,    // ← agregar
  selectCurrentPage,   // ← agregar
} from './slices/usuariosSlice';

import { fetchRoles } from './slicesRol/rolesThunk';
import { selectRoles, selectRolesLoading } from './slicesRol/rolesSlice';

import { fetchParroquiasSinParroco } from './slicesParroquias/parroquiasThunk';
import {
  selectParroquias,
  selectIsLoading as selectParroquiasLoading,
} from './slicesParroquias/parroquiasSlice';

import {
  initialUsuarioForm,
  initialUsuarioFilters,
  buildUsuarioFields,
  buildUsuarioSearchFields,
} from './config/usuariosForm.js';

import { buildUsuarioColumns } from './config/usuariosColumns.jsx';

const ROLES_CON_PARROQUIA = ['PARROCO',  'SECRETARIO_PARROQUIAL']; // Substring para identificar roles que requieren asignación de parroquia

export default function Usuarios() {
  const dispatch = useDispatch();

  const usuarios = useSelector(selectUsuarios);
  const allUsuarios = useSelector(selectAllUsuarios);
  const isLoading = useSelector(selectIsLoading);
  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);

  const roles = useSelector(selectRoles);
  const isLoadingRoles = useSelector(selectRolesLoading);

  const parroquias = useSelector(selectParroquias);
  const isLoadingParroquias = useSelector(selectParroquiasLoading);

  const { open, close, modal } = useEditEntityModal();

  const [activeTab, setActiveTab] = useState('agregar');
  const [formAdd, setFormAdd] = useState({ ...initialUsuarioForm });
  const [filters, setFilters] = useState({ ...initialUsuarioFilters });
  const [toast, setToast] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const totalItems  = useSelector(selectTotalItems);
  const totalPages  = useSelector(selectTotalPages);
  const currentPage = useSelector(selectCurrentPage);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchParroquiasSinParroco());
    dispatch(fetchUsuarios({ page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const rolRequiereParroquia = (idRol) => {
  const nombre = roles
    .find((r) => String(r.id_rol) === String(idRol))
    ?.nombre
    ?.toLowerCase();

  return ROLES_CON_PARROQUIA.includes(nombre);
};

  const mostrarParroquiaEnAdd = rolRequiereParroquia(formAdd.id_rol);
  console.log('ROL:', formAdd.id_rol);
  console.log('MOSTRAR:', mostrarParroquiaEnAdd);

  const hasFilters = Object.values(filters).some(
    (v) => v !== '' && v !== null && v !== undefined
  );

  const users = usuarios;

  const parroquiasDisponibles = parroquias.filter(
    (p) => !p.parroco
  );

  const usuarioFields = useMemo(
  () =>
    buildUsuarioFields({
      roles,
      parroquias: parroquiasDisponibles,
      isLoadingRoles,
      isLoadingParroquias,
      mostrarParroquia: mostrarParroquiaEnAdd,
      editing: false,
    }),
  [
    roles,
    parroquias,
    isLoadingRoles,
    isLoadingParroquias,
    mostrarParroquiaEnAdd,
  ]
);

  const usuarioSearchFields = useMemo(
    () =>
      buildUsuarioSearchFields({
        roles,
      }),
    [roles]
  );

  const usuarioColumns = useMemo(
    () =>
      buildUsuarioColumns({
        onUnlock: handleDesbloquear,
      }),
    []
  );

  const isCreateValid =
  formAdd.nombre?.trim() &&
  formAdd.email?.trim() &&
  /\S+@\S+\.\S+/.test(formAdd.email) &&
  formAdd.id_rol &&
  formAdd.activo !== '' &&
  (!mostrarParroquiaEnAdd || formAdd.id_parroquias?.length > 0);

  const buildCreatePayload = () => ({
    nombre: formAdd.nombre?.trim(),
    apellido_paterno: formAdd.apellido_paterno?.trim() || undefined,
    apellido_materno: formAdd.apellido_materno?.trim() || undefined,
    email: formAdd.email?.trim(),
    password: formAdd.password || undefined,
    fecha_nacimiento: formAdd.fecha_nacimiento || undefined,
    id_rol: formAdd.id_rol ? Number(formAdd.id_rol) : undefined,
    id_parroquias:
      mostrarParroquiaEnAdd && formAdd.id_parroquias
        ? Number(formAdd.id_parroquia)
        : undefined,
    activo:
      formAdd.activo === ''
        ? undefined
        : formAdd.activo === true || formAdd.activo === 'true',
  });

  const buildSearchQuery = () => ({
    nombre: filters.nombre?.trim() || undefined,
    apellido_paterno: filters.apellido_paterno?.trim() || undefined,
    apellido_materno: filters.apellido_materno?.trim() || undefined,
    email: filters.email?.trim() || undefined,
    fecha_nacimiento: filters.fecha_nacimiento || undefined,
    rol: filters.rol || undefined,
    id_parroquia: filters.id_parroquia ? Number(filters.id_parroquia) : undefined,
    activo:
      filters.activo === ''
        ? undefined
        : filters.activo === true || filters.activo === 'true',
  });

  const resetAdd = () => {
    setFormAdd({ ...initialUsuarioForm });
  };

  const resetSearch = () => {
    setFilters({ ...initialUsuarioFilters });
    dispatch(fetchUsuarios({ page: 1 }));
  };

  const reloadUsers = (page = currentPage) => {
    dispatch(fetchUsuarios({ ...buildSearchQuery(), page }));
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchUsuarios({ ...buildSearchQuery(), page: newPage }));
  };


  const handleCreate = (e) => {
    e.preventDefault();

    if (!isCreateValid) {
      setToast({
        type: 'error',
        message: 'Complete los campos obligatorios antes de registrar.',
      });
      return;
    }

    setPendingPayload(buildCreatePayload());
    setShowConfirm(true);
  };

  const handleConfirmCreate = async () => {
    setShowConfirm(false);

    const action = await dispatch(createUsuarioAndSendReset(pendingPayload));

    if (action.meta.requestStatus === 'fulfilled') {
      setToast({
        type: 'success',
        message: 'Usuario creado correctamente.',
      });

      setPendingPayload(null);
      resetAdd();
      reloadUsers();
      return;
    }

    setToast({
      type: 'error',
      message: extractError(action),
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const action = await dispatch(fetchUsuarios({ ...buildSearchQuery(), page: 1 }));
    if (action.meta?.requestStatus !== 'fulfilled') {
      setToast({ type: 'error', message: extractError(action) });
    }
  };

 const buildUsuarioEditFields = (usuario) => {
  const nombreRol = usuario.rol?.nombre?.toLowerCase() || '';

  const requiereParroquia =
    nombreRol.includes('parroco') ||
    nombreRol.includes('párroco') ||
    nombreRol.includes('secretario_parroquial') ||
    rolRequiereParroquia(usuario.id_rol);

  return buildUsuarioFields({
    roles,
    parroquias,
    isLoadingRoles,
    isLoadingParroquias,
    mostrarParroquia: requiereParroquia,
    editing: true,
  });
};

  const buildUpdatePayload = (usuario) => ({
    nombre: usuario.nombre,
    apellido_paterno: usuario.apellido_paterno,
    apellido_materno: usuario.apellido_materno,
    fecha_nacimiento: usuario.fecha_nacimiento,
    id_rol: usuario.id_rol ? Number(usuario.id_rol) : undefined,
    id_parroquias: usuario.id_parroquias ? usuario.id_parroquias.map(Number) : [],
    activo:
      usuario.activo === true ||
      usuario.activo === 'true' ||
      usuario.activo === 'Activo',
  });

  const handleSaveUsuario = async (editedUser) => {
    const id = editedUser.id_usuario || editedUser.id;

    const action = await dispatch(
      updateUsuario({
        id,
        data: buildUpdatePayload(editedUser),
      })
    );

    if (action.meta.requestStatus === 'fulfilled') {
      setToast({
        type: 'success',
        message: 'Usuario actualizado correctamente.',
      });

      reloadUsers();
      return true;
    }

    setToast({
      type: 'error',
      message: extractError(action),
    });

    return false;
  };

  const handleSelectUsuario = async (u) => {
    open({
      title: 'Editar Usuario',
      entity: {},
      fields: [],
      loading: true,
      onSave: async () => false,
    });

    const id = u.id_usuario || u.id;
    const action = await dispatch(fetchUsuarioById(id));

    if (action.meta.requestStatus !== 'fulfilled') {
      close();
      setToast({
        type: 'error',
        message: extractError(action),
      });
      return;
    }

    const usuario = action.payload?.usuario || action.payload;

   const entity = {
    ...usuario,
    id_rol: String(usuario.id_rol || usuario.rol?.id_rol || ''),
    id_parroquias: usuario.parroquias?.map((p) => String(p.id_parroquia)) || [],
    activo: usuario.activo ? 'true' : 'false',
  };

    open({
      title: 'Editar Usuario',
      entity,
      fields: buildUsuarioEditFields(entity),
      loading: false,
      onSave: handleSaveUsuario,
    });
  };
  

  async function handleDesbloquear(u, e) {
    e?.stopPropagation();

    const result = await Swal.fire({
      title: '¿Desbloquear usuario?',
      html: `
        <p>El usuario <strong>${u.nombre} ${u.apellido_paterno || ''}</strong> está bloqueado.</p>
        <p>¿Confirmas que quieres desbloquearlo?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    const id = u.id_usuario || u.id;
    const action = await dispatch(unlockUsuario(Number(id)));

    if (action.meta.requestStatus === 'fulfilled') {
      setToast({
        type: 'success',
        message: 'Usuario desbloqueado correctamente.',
      });

      reloadUsers();
    } else {
      setToast({
        type: 'error',
        message: extractError(action),
      });
    }
  }

  return (
    <Layout title="Gestión de Usuarios">
      <PageTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { key: 'agregar', label: 'Agregar Usuario' },
          { key: 'buscar', label: 'Buscar / Editar' },
        ]}
      />

      {activeTab === 'agregar' && (
        <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos del Usuario
            </h3>
          </div>

          <form onSubmit={handleCreate} className="p-6">
            <FormFields
              fields={usuarioFields}
              values={formAdd}
              setValues={setFormAdd}
            />

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={!isCreateValid || isCreating}
                className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium ${
                  isCreateValid && !isCreating
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gray-400 cursor-not-allowed opacity-70'
                }`}
              >
                {isCreating ? 'Guardando...' : 'Crear Usuario'}
              </button>

              <button
                type="button"
                onClick={resetAdd}
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
            title="Buscar Usuario"
            description="Despliegue los filtros para realizar una búsqueda avanzada."
            fields={usuarioSearchFields}
            values={filters}
            setValues={setFilters}
            onSearch={handleSearch}
            onReset={resetSearch}
          />
           <div className="bg-white dark:bg-background-dark/50 rounded-xl shadow-sm">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Para editar alguno de los resultados, seleccione la fila deseada.</p>
                      </div>
                      <div className="overflow-x-auto">

                         <DataTable
                            columns={usuarioColumns}
                            data={users}
                            loading={isLoading}
                            loadingMessage="Cargando usuarios..."
                            emptyMessage="Sin resultados"
                            onRowClick={handleSelectUsuario}
                            getRowKey={(u) => u.id_usuario || u.id}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            onPageChange={handlePageChange}
                          />
                        
                      </div>
          </div>

         
        </>
      )}

      {showConfirm && pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <span className="material-symbols-outlined text-5xl text-amber-500">
                warning
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ¿Confirmar registro?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revisa los datos antes de continuar. El correo electrónico no podrá modificarse una vez creado.
              </p>
            </div>

            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
              <li>
                <strong>Nombre:</strong>{' '}
                {[pendingPayload.nombre, pendingPayload.apellido_paterno, pendingPayload.apellido_materno]
                  .filter(Boolean)
                  .join(' ')}
              </li>
              <li>
                <strong>Email:</strong> {pendingPayload.email}
              </li>
              <li>
                <strong>Rol:</strong>{' '}
                {roles.find((r) => r.id_rol === pendingPayload.id_rol)?.nombre || '—'}
              </li>
              {pendingPayload.id_parroquia && (
                <li>
                  <strong>Parroquia:</strong>{' '}
                  {parroquias.find((p) => p.id_parroquia === pendingPayload.id_parroquia)?.nombre || '—'}
                </li>
              )}
            </ul>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPendingPayload(null);
                }}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Corregir datos
              </button>

              <button
                onClick={handleConfirmCreate}
                disabled={isCreating}
                className={`px-5 py-2 rounded-lg text-white text-sm ${
                  isCreating
                    ? 'bg-primary/60 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isCreating ? 'Guardando...' : 'Sí, registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
      {modal}
    </Layout>
  );
}