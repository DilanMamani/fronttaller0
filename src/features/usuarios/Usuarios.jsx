import { useState, useEffect } from 'react'
import Layout from '../../shared/components/layout/Layout';

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsuarios,
  fetchAllUsuarios,
  fetchUsuarioById,
  createUsuarioAndSendReset,
  updateUsuario,
} from './slices/usuariosTrunk';
import {
  selectIsLoading, 
  selectUsuarios,
  selectAllUsuarios,
  selectUsuarioSeleccionado,
  selectIsCreating,
  selectIsUpdating,
} from './slices/usuariosSlice';

import { fetchRoles } from './slicesRol/rolesThunk';
import { selectRoles, selectRolesLoading } from './slicesRol/rolesSlice';

import { fetchParroquias, } from './slicesParroquias/parroquiasThunk';
import {
  selectParroquias,
  selectIsLoading as selectParroquiasLoading,
} from './slicesParroquias/parroquiasSlice';

// Roles que requieren asignación de parroquia
const ROLES_CON_PARROQUIA = ['parroco', 'párroco', 'secretario_parroquial'];

export default function Usuarios() {
  const dispatch = useDispatch();
  const usuarios = useSelector(selectUsuarios);
  const allUsuarios = useSelector(selectAllUsuarios);
  const isLoading = useSelector(selectIsLoading);
  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);
  const usuarioSeleccionado = useSelector(selectUsuarioSeleccionado);
  const [activeTab, setActiveTab] = useState('agregar');
  const [selectedUser, setSelectedUser] = useState(null);
  const roles = useSelector(selectRoles);
  const isLoadingRoles = useSelector(selectRolesLoading);
  const parroquias = useSelector(selectParroquias);
  const isLoadingParroquias = useSelector(selectParroquiasLoading);

  //para verificacion de los datos antes de crear o actualizar un usuario
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [formAdd, setFormAdd] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    rol: '',
    id_parroquia: '',
    activo: '',
  });

  const [filters, setFilters] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    rol: '',
    id_parroquia: '',
    activo: '',
  });

  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchParroquias());
  }, [dispatch]);

  // Helper: ¿el rol seleccionado requiere parroquia?
  const rolRequiereParroquia = (idRol) => {
    const nombre = roles.find((r) => String(r.id_rol) === String(idRol))?.nombre?.toLowerCase() ?? '';
    return ROLES_CON_PARROQUIA.some((r) => nombre.includes(r));
  };

  const mostrarParroquiaEnAdd = rolRequiereParroquia(formAdd.rol);

  const extractError = (actionOrError) => {
    try {
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
        if (actionOrError.error) {
          const ae = actionOrError.error;
          if (typeof ae === 'string') return ae;
          if (ae?.message) return ae.message;
        }
      }
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

  const hasFilters = Object.values(filters).some(
    (value) => value !== '' && value !== null && value !== undefined
  );

  const users = hasFilters ? usuarios : allUsuarios;

  useEffect(() => {
    dispatch(fetchAllUsuarios());
  }, [dispatch]);

  useEffect(() => {
    if (usuarioSeleccionado) setSelectedUser(usuarioSeleccionado);
  }, [usuarioSeleccionado]);

  useEffect(() => {
    if (activeTab === 'buscar') {
      if (hasFilters) {
        const query = {
          nombre: filters.nombre?.trim() || undefined,
          email: filters.email?.trim() || undefined,
          rol: filters.rol || undefined,
          activo: filters.activo === '' ? undefined : (filters.activo ? 'Activo' : 'Inactivo'),
        };
        dispatch(fetchUsuarios(query));
      } else {
        dispatch(fetchAllUsuarios());
      }
    }
  }, [activeTab, hasFilters, filters, dispatch]);

  const handleConfirmCreate = async () => {
    setShowConfirm(false);
    try {
      const action = await dispatch(createUsuarioAndSendReset(pendingPayload));
      if (action.meta.requestStatus === 'fulfilled') {
        setToast({ type: 'success', message: 'Usuario creado correctamente.' });
        setFormAdd({ nombre: '', email: '', rol: '', activo: '', apellido_paterno: '', apellido_materno: '', password: '', fecha_nacimiento: '', id_parroquia: '' });
        setPendingPayload(null);
        if (activeTab === 'buscar') dispatch(fetchUsuarios({}));
      } else {
        setToast({ type: 'error', message: extractError(action) });
      }
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const payload = {
      nombre: formAdd.nombre?.trim(),
      apellido_paterno: formAdd.apellido_paterno?.trim() || undefined,
      apellido_materno: formAdd.apellido_materno?.trim() || undefined,
      email: formAdd.email?.trim(),
      password: formAdd.password || undefined,
      fecha_nacimiento: formAdd.fecha_nacimiento || undefined,
      id_rol: formAdd.rol ? Number(formAdd.rol) : undefined,
      id_parroquia: mostrarParroquiaEnAdd && formAdd.id_parroquia ? Number(formAdd.id_parroquia) : undefined,
      activo: formAdd.activo === '' ? undefined : (formAdd.activo ? 'Activo' : 'Inactivo'),
    };
    setPendingPayload(payload);
    setShowConfirm(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = {
      nombre: filters.nombre?.trim() || undefined,
      email: filters.email?.trim() || undefined,
      apellido_paterno: filters.apellido_paterno?.trim() || undefined,
      apellido_materno: filters.apellido_materno?.trim() || undefined,
      fecha_nacimiento: filters.fecha_nacimiento || undefined,
      rol: filters.rol || undefined,
      activo: formAdd.activo === '' ? undefined : Boolean(formAdd.activo),
      id_parroquia: filters.id_parroquia ? Number(filters.id_parroquia) : undefined,
    };
    try {
      let action;
      if (hasFilters) {
        action = await dispatch(fetchUsuarios(query));
      } else {
        action = await dispatch(fetchAllUsuarios());
      }
      if (action.meta && action.meta.requestStatus !== 'fulfilled') {
        setToast({ type: 'error', message: extractError(action) });
      } else {
        setSelectedUser(null);
      }
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) });
    }
  };

  const handleResetAdd = () => {
    setFormAdd({ nombre: '', email: '', rol: '', activo: '', apellido_paterno: '', apellido_materno: '', password: '', fecha_nacimiento: '', id_parroquia: '' });
    setSelectedUser(null);
  };

  const handleResetSearch = () => {
    setFilters({ nombre: '', email: '', rol: '', activo: '', apellido_paterno: '', apellido_materno: '', fecha_nacimiento: '', id_parroquia: '' });
    dispatch(fetchAllUsuarios());
    setSelectedUser(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const id = selectedUser.id || selectedUser.id_usuario;
    if (!id) {
      setToast({ type: 'error', message: 'No se encontró el ID del usuario.' });
      return;
    }
    // email omitido intencionalmente del payload de actualización
    const { id_usuario, id: _omit, email: _email, ...data } = selectedUser;
    if (data.activo === 'Activo') data.activo = true;
    if (data.activo === 'Inactivo') data.activo = false;
    if (data.activo === 'true') data.activo = true;
    if (data.activo === 'false') data.activo = false;
    if (typeof data.activo !== 'boolean' && data.activo !== undefined && data.activo !== '') {
      data.activo = Boolean(data.activo);
    }
    try {
      const action = await dispatch(updateUsuario({ id, data }));
      if (action.meta.requestStatus === 'fulfilled') {
        setSelectedUser(null);
        setToast({ type: 'success', message: 'Cambios guardados correctamente.' });
        const query = {
          nombre: filters.nombre?.trim() || undefined,
          email: filters.email?.trim() || undefined,
          rol: filters.rol || undefined,
          activo: filters.activo === '' ? undefined : Boolean(filters.activo),
        };
        dispatch(fetchUsuarios(query));
      } else {
        dispatch(fetchUsuarios());
        setToast({ type: 'error', message: extractError(action) });
      }
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) });
    }
  };

  const getFullName = (nombre, apellido_paterno, apellido_materno) => {
    return `${nombre} ${apellido_paterno} ${apellido_materno}`.trim();
  };

  return (
    <Layout title="Gestión de Usuarios">
      <div className="space-y-8">
        {/* Tabs estilo carpeta */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('agregar')}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
              activeTab === 'agregar'
                ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
                : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
            }`}
          >
            Agregar Usuario
          </button>
          <button
            onClick={() => setActiveTab('buscar')}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
              activeTab === 'buscar'
                ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
                : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
            }`}
          >
            Buscar / Editar
          </button>
        </div>

        {/* ── TAB: AGREGAR ── */}
        {activeTab === 'agregar' && (
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agregar Usuario</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreate}>
              <div>
                <label htmlFor="a-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nombre</label>
                <input id="a-name" type="text" placeholder="Nombre completo"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.nombre} onChange={(e) => setFormAdd({ ...formAdd, nombre: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-lastp" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido paterno</label>
                <input id="a-lastp" type="text" placeholder="Apellido paterno"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.apellido_paterno} onChange={(e) => setFormAdd({ ...formAdd, apellido_paterno: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-lastm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido materno</label>
                <input id="a-lastm" type="text" placeholder="Apellido materno"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.apellido_materno} onChange={(e) => setFormAdd({ ...formAdd, apellido_materno: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-birth" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fecha de nacimiento</label>
                <input id="a-birth" type="date"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.fecha_nacimiento} onChange={(e) => setFormAdd({ ...formAdd, fecha_nacimiento: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                <input id="a-email" type="email" placeholder="correo@dominio.com"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.email} onChange={(e) => setFormAdd({ ...formAdd, email: e.target.value })} />
              </div>
              <div>
                <label htmlFor="a-role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rol</label>
                <select id="a-role"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.rol}
                  onChange={(e) => {
                    const nuevoRol = e.target.value;
                    const requiereParroquia = rolRequiereParroquia(nuevoRol);
                    setFormAdd({
                      ...formAdd,
                      rol: nuevoRol,
                      id_parroquia: requiereParroquia ? formAdd.id_parroquia : '',
                    });
                  }}
                >
                  <option value="">Seleccione</option>
                  {isLoadingRoles ? (
                    <option disabled>Cargando roles...</option>
                  ) : (
                    roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Parroquia: visible solo si el rol es párroco o secretario parroquial */}
              {mostrarParroquiaEnAdd && (
                <div>
                  <label htmlFor="a-parroquia" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Parroquia asignada
                  </label>
                  <select id="a-parroquia"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={formAdd.id_parroquia}
                    onChange={(e) => setFormAdd({ ...formAdd, id_parroquia: e.target.value })}
                  >
                    <option value="">Seleccione una parroquia</option>
                    {isLoadingParroquias ? (
                      <option disabled>Cargando parroquias...</option>
                    ) : (
                      parroquias.map((p) => (
                        <option key={p.id_parroquia} value={p.id_parroquia}>{p.nombre}</option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="a-status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Estado</label>
                <select id="a-status"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.activo === '' ? '' : String(formAdd.activo)}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : (e.target.value === 'true');
                    setFormAdd({ ...formAdd, activo: val });
                  }}
                >
                  <option value="">Seleccione</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-2 flex gap-3">
                <button type="submit" disabled={isCreating}
                  className={`px-6 py-2 rounded-lg text-white ${isCreating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
                  {isCreating ? 'Guardando…' : 'Crear Usuario'}
                </button>
                <button type="reset"
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={handleResetAdd}>
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB: BUSCAR / EDITAR ── */}
        {activeTab === 'buscar' && (
          <>
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buscar Usuario</h3>
              <form className="grid grid-cols-1 md:grid-cols-4 gap-6" onSubmit={handleSearch}>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-name">Nombre</label>
                  <input id="f-name" type="text" placeholder="Nombre"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={filters.nombre} onChange={(e) => setFilters({ ...filters, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-email">Email</label>
                  <input id="f-email" type="email" placeholder="correo@dominio.com"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-role">Rol</label>
                  <select id="f-role"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={filters.rol} onChange={(e) => setFilters({ ...filters, rol: e.target.value })}>
                    <option value="">Todos</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-status">Estado</label>
                  <select id="f-status"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={filters.activo === '' ? '' : String(filters.activo)}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : (e.target.value === 'true');
                      setFilters({ ...filters, activo: val });
                    }}>
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div className="md:col-span-4 flex gap-3">
                  <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Buscar</button>
                  <button type="reset"
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={handleResetSearch}>
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nombre</th>
                      <th scope="col" className="px-6 py-3">Email</th>
                      <th scope="col" className="px-6 py-3">Rol</th>
                      <th scope="col" className="px-6 py-3">Parroquia</th>
                      <th scope="col" className="px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr><td className="px-6 py-4" colSpan={5}>Cargando...</td></tr>
                    )}
                    {!isLoading && users.length === 0 && (
                      <tr><td className="px-6 py-4" colSpan={5}>Sin resultados</td></tr>
                    )}
                    {!isLoading && users.map((u) => (
                      <tr
                        key={u.id ?? u.id_usuario}
                        onClick={async () => {
                          const rowId = u.id ?? u.id_usuario;
                          try {
                            const action = await dispatch(fetchUsuarioById(rowId));
                            if (action.meta.requestStatus !== 'fulfilled') {
                              setToast({ type: 'error', message: extractError(action) });
                            }
                          } catch (err) {
                            setToast({ type: 'error', message: extractError(err) });
                          }
                        }}
                        className="cursor-pointer bg-white dark:bg-background-dark border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {getFullName(u.nombre, u.apellido_paterno, u.apellido_materno)}
                        </td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{u.rol.nombre}</span>
                        </td>
                        <td className="px-6 py-4">
                          {u.parroquias?.length > 0 ? u.parroquias.map((p) => p.nombre).join(', ') : 'Sin parroquia'}
                        </td>
                        <td className="px-6 py-4">
                          {(u.activo === 'Activo' || u.activo === true || u.activo === 'true') ? (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Activo</span>
                          ) : (
                            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Inactivo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formulario de edición */}
            {selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-8">
                <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Editar Usuario</h3>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdate}>
                    <div>
                      <label htmlFor="e-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nombre</label>
                      <input id="e-name" type="text" value={selectedUser.nombre || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, nombre: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    </div>
                    <div>
                      <label htmlFor="e-lastp" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido paterno</label>
                      <input id="e-lastp" type="text" value={selectedUser.apellido_paterno || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, apellido_paterno: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    </div>
                    <div>
                      <label htmlFor="e-lastm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido materno</label>
                      <input id="e-lastm" type="text" value={selectedUser.apellido_materno || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, apellido_materno: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    </div>

                    {/* Email: solo lectura en edición */}
                    <div>
                      <label htmlFor="e-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Email{' '}
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">(no editable)</span>
                      </label>
                      <input
                        id="e-email"
                        type="email"
                        value={selectedUser.email || ''}
                        readOnly
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="e-birth" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fecha de nacimiento</label>
                      <input id="e-birth" type="date" value={selectedUser.fecha_nacimiento || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, fecha_nacimiento: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    </div>
                    <div>
                      <label htmlFor="e-role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rol</label>
                      <select id="e-role"
                        value={selectedUser.id_rol || selectedUser.rol?.id_rol || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, id_rol: Number(e.target.value) })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                        <option value="">Seleccione</option>
                        {isLoadingRoles ? (
                          <option disabled>Cargando roles...</option>
                        ) : (
                          roles.map((rol) => (
                            <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                          ))
                        )}
                      </select>
                    </div>
                    {rolRequiereParroquia(selectedUser.id_rol || selectedUser.rol?.id_rol) && (
                      <div>
                        <label htmlFor="e-parroquia" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                          Parroquia asignada
                        </label>
                        <select
                          id="e-parroquia"
                          value={
                            selectedUser.id_parroquia ??
                            selectedUser.parroquias?.[0]?.id_parroquia ??
                            ''
                          }
                          onChange={(e) =>
                            setSelectedUser({ ...selectedUser, id_parroquia: e.target.value ? Number(e.target.value) : null })
                          }
                          className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        >
                          <option value="">Sin parroquia</option>
                          {isLoadingParroquias ? (
                            <option disabled>Cargando parroquias...</option>
                          ) : (
                            parroquias.map((p) => (
                              <option key={p.id_parroquia} value={p.id_parroquia}>
                                {p.nombre}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}

                    <div>
                      <label htmlFor="e-status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Estado</label>
                      <select id="e-status"
                        value={
                          (selectedUser.activo === true || selectedUser.activo === 'true' || selectedUser.activo === 'Activo')
                            ? 'true'
                            : (selectedUser.activo === false || selectedUser.activo === 'false' || selectedUser.activo === 'Inactivo')
                            ? 'false'
                            : ''
                        }
                        onChange={(e) => setSelectedUser({ ...selectedUser, activo: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 pt-2">
                      <button type="button" onClick={() => setSelectedUser(null)}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                        Cancelar
                      </button>
                      <button type="submit" disabled={isUpdating}
                        className={`px-6 py-2 rounded-lg text-white ${isUpdating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
                        {isUpdating ? 'Guardando…' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showConfirm && pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <span className="material-symbols-outlined text-5xl text-amber-500">warning</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">¿Confirmar registro?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revisa los datos antes de continuar. El <strong>correo electrónico</strong> no podrá modificarse una vez creado el usuario.
              </p>
            </div>

            {/* Resumen de datos */}
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
              <li><span className="font-medium">Nombre:</span> {[pendingPayload.nombre, pendingPayload.apellido_paterno, pendingPayload.apellido_materno].filter(Boolean).join(' ')}</li>
              <li><span className="font-medium">Email:</span> {pendingPayload.email}</li>
              <li><span className="font-medium">Rol:</span> {roles.find(r => r.id_rol === pendingPayload.id_rol)?.nombre ?? '—'}</li>
              {pendingPayload.id_parroquia && (
                <li><span className="font-medium">Parroquia:</span> {parroquias.find(p => p.id_parroquia === pendingPayload.id_parroquia)?.nombre ?? '—'}</li>
              )}
              <li><span className="font-medium">Estado:</span> {pendingPayload.activo ?? '—'}</li>
            </ul>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowConfirm(false); setPendingPayload(null); }}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Corregir datos
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={isCreating}
                className={`px-5 py-2 rounded-lg text-white text-sm ${isCreating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isCreating ? 'Guardando…' : 'Sí, registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg px-4 py-3 text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </Layout>
  );
}