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


export default function Usuarios() {
  const dispatch = useDispatch();
  const usuarios = useSelector(selectUsuarios);
  const allUsuarios = useSelector(selectAllUsuarios);
  const isLoading = useSelector(selectIsLoading);
  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);
  const usuarioSeleccionado = useSelector(selectUsuarioSeleccionado);
  const [activeTab, setActiveTab] = useState('agregar')
  const [selectedUser, setSelectedUser] = useState(null)

  // ===== activos par a preparar consumo de API (sin endpoints aún) =====
  const [formAdd, setFormAdd] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    rol: '',
    activo: '',
  })

  const [filters, setFilters] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    rol: '',
    activo: '',
  })

  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

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

  // ¿Hay filtros?
  const hasFilters = Object.values(filters).some(
    (value) => value !== '' && value !== null && value !== undefined
  );

  // Fuente de datos según filtros (como Personas)
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

  const handleCreate = async (e) => {
    e.preventDefault();
    // Normalizar activo: '' | 'true' | 'false'  => 'Activo' | 'Inactivo' | undefined
    const payload = {
      nombre: formAdd.nombre?.trim(),
      apellido_paterno: formAdd.apellido_paterno?.trim() || undefined,
      apellido_materno: formAdd.apellido_materno?.trim() || undefined,
      email: formAdd.email?.trim(),
      password: formAdd.password || undefined,                 // requerido u opcional según tu backend
      fecha_nacimiento: formAdd.fecha_nacimiento || undefined, // yyyy-mm-dd
      rol: formAdd.rol || '',
      activo: formAdd.activo === '' ? undefined : (formAdd.activo ? 'Activo' : 'Inactivo'),
    };
    try {
      const action = await dispatch(createUsuarioAndSendReset(payload));
      console.debug('createUsuario result:', action);
      if (action.meta.requestStatus === 'fulfilled') {
        setToast({ type: 'success', message: 'Usuario creado correctamente.' });
        setFormAdd({ nombre: '', email: '', rol: '', activo: '' });
        // refrescar lista si estamos en la pestaña buscar
        if (activeTab === 'buscar') dispatch(fetchUsuarios({}));
      } else {
        setToast({ type: 'error', message: extractError(action) });
      }
    } catch (err) {
      console.error('createUsuario threw:', err);
      setToast({ type: 'error', message: extractError(err) });
    }
  }

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
    };
    try {
      let action;
      if (hasFilters) {
        action = await dispatch(fetchUsuarios(query));
      } else {
        action = await dispatch(fetchAllUsuarios());
      }
      console.debug('search usuarios result:', action);
      if (action.meta && action.meta.requestStatus !== 'fulfilled') {
        setToast({ type: 'error', message: extractError(action) });
      } else {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('fetchUsuarios threw:', err);
      setToast({ type: 'error', message: extractError(err) });
    }
  }

  const handleResetAdd = () => {
    setFormAdd({ nombre: '', email: '', rol: '', activo: '', apellido_paterno: '', apellido_materno: '', password: '', fecha_nacimiento: '' });
  }

  const handleResetSearch = () => {
    setFilters({ nombre: '', email: '', rol: '', activo: '', apellido_paterno: '', apellido_materno: '', fecha_nacimiento: '' });
    dispatch(fetchAllUsuarios());
    setSelectedUser(null);
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const id = selectedUser.id || selectedUser.id_usuario;
    if (!id) {
      setToast({ type: 'error', message: 'No se encontró el ID del usuario.' });
      return;
    }
    const { id_usuario, id: _omit, ...data } = selectedUser;
    // Normalizar estado a 'Activo'|'Inactivo'
   // Normalizar estado a boolean para backend
    if (data.activo === 'Activo') data.activo = true;
    if (data.activo === 'Inactivo') data.activo = false;
    if (data.activo === 'true') data.activo = true;
    if (data.activo === 'false') data.activo = false;
    if (typeof data.activo !== 'boolean' && data.activo !== undefined && data.activo !== '') {
      data.activo = Boolean(data.activo);
    }
    try {
      const action = await dispatch(updateUsuario({ id, data }));
      console.debug('updateUsuario result:', action);
      if (action.meta.requestStatus === 'fulfilled') {
        setToast({ type: 'success', message: 'Cambios guardados correctamente.' });
        // refrescar lista con filtros vigentes
        const query = {
          nombre: filters.nombre?.trim() || undefined,
          email: filters.email?.trim() || undefined,
          rol: filters.rol || undefined,
           activo: filters.activo === '' ? undefined : Boolean(filters.activo),
        };
        dispatch(fetchUsuarios(query));
      } else {
        setToast({ type: 'error', message: extractError(action) });
      }
    } catch (err) {
      console.error('updateUsuario threw:', err);
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

          {activeTab === 'agregar' && (
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agregar Usuario</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreate}>
                <div>
                  <label htmlFor="a-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nombre</label>
                  <input
                    id="a-name"
                    type="text"
                    placeholder="Nombre completo"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={formAdd.nombre}
                    onChange={(e)=>setFormAdd({ ...formAdd, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="a-lastp" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido paterno</label>
                  <input
                    id="a-lastp"
                    type="text"
                    placeholder="Apellido paterno"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={formAdd.apellido_paterno}
                    onChange={(e)=>setFormAdd({ ...formAdd, apellido_paterno: e.target.value })}
                  />
                </div>
                <div>
                    <label htmlFor="a-lastm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido materno</label>
                    <input
                      id="a-lastm"
                      type="text"
                      placeholder="Apellido materno"
                      className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      value={formAdd.apellido_materno}
                      onChange={(e)=>setFormAdd({ ...formAdd, apellido_materno: e.target.value })}
                    />
                </div>
                <div>
                  <label htmlFor="a-birth" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fecha de nacimiento</label>
                  <input
                    id="a-birth"
                    type="date"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={formAdd.fecha_nacimiento}
                    onChange={(e)=>setFormAdd({ ...formAdd, fecha_nacimiento: e.target.value })}
                  />
                </div>
                  <div>
                <label htmlFor="a-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                  <input
                    id="a-email"
                    type="email"
                    placeholder="correo@dominio.com"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={formAdd.email}
                    onChange={(e)=>setFormAdd({ ...formAdd, email: e.target.value })}
                  />
                </div>
                <div>
            <label htmlFor="a-role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rol</label>
            <select
              id="a-role"
              className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              value={formAdd.rol}
              onChange={(e)=>setFormAdd({ ...formAdd, rol: e.target.value })}
            >
              <option value="">Seleccione</option>
              <option value="Administrador">Administrador</option>
              <option value="Consultor">Consultor</option>
            </select>
                </div>
                <div>
            <label htmlFor="a-status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Estado</label>
            <select
              id="a-status"
              className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              value={formAdd.activo === '' ? '' : String(formAdd.activo)}
              onChange={(e)=>{
                const val = e.target.value === '' ? '' : (e.target.value === 'true');
                setFormAdd({ ...formAdd, activo: val })
              }}
            >
              <option value="">Seleccione</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
                </div>
                <div className="md:col-span-2 mt-2 flex gap-3">
            <button type="submit" disabled={isCreating} className={`px-6 py-2 rounded-lg text-white ${isCreating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
              {isCreating ? 'Guardando…' : 'Crear Usuario'}
            </button>
            <button type="reset" className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600" onClick={handleResetAdd}>Limpiar</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'buscar' && (
            <>
              {/* Filtros de búsqueda */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buscar Usuario</h3>
                      <form className="grid grid-cols-1 md:grid-cols-4 gap-6" onSubmit={handleSearch}>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-name">Nombre</label>
                        <input
                        id="f-name"
                        type="text"
                        placeholder="Nombre"
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        value={filters.nombre}
                        onChange={(e)=>setFilters({ ...filters, nombre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-email">Email</label>
                        <input
                        id="f-email"
                        type="email"
                        placeholder="correo@dominio.com"
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        value={filters.email}
                        onChange={(e)=>setFilters({ ...filters, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-role">Rol</label>
                        <select
                        id="f-role"
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        value={filters.rol}
                        onChange={(e)=>setFilters({ ...filters, rol: e.target.value })}
                        >
                        <option value="">Todos</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Consultor">Consultor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2" htmlFor="f-status">Estado</label>
                        <select
                        id="f-status"
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        value={filters.activo === '' ? '' : String(filters.activo)}
                        onChange={(e)=>{
                          const val = e.target.value === '' ? '' : (e.target.value === 'true');
                          setFilters({ ...filters, activo: val })
                        }}
                        >
                        <option value="">Todos</option>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                        </select>
                      </div>
                      <div className="md:col-span-4 flex gap-3">
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Buscar</button>
                        <button type="reset" className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600" onClick={handleResetSearch}>Limpiar</button>
                      </div>
                      </form>
                    </div>

                    {/* Resultados */}
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nombre</th>
                      <th scope="col" className="px-6 py-3">Email</th>
                      <th scope="col" className="px-6 py-3">Rol</th>
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
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{getFullName(u.nombre, u.apellido_paterno, u.apellido_materno)}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4"><span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{u.rol}</span></td>
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

            {selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-8">
                <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Editar Usuario</h3>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdate}>
                    <div>
                      <label htmlFor="e-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nombre</label>
                      <input
                        id="e-name"
                        type="text"
                        value={selectedUser.nombre || ''}
                        onChange={(e)=>setSelectedUser({ ...selectedUser, nombre: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="e-lastp" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido paterno</label>
                      <input
                        id="e-lastp"
                        type="text"
                        value={selectedUser.apellido_paterno || ''}
                        onChange={(e)=>setSelectedUser({ ...selectedUser, apellido_paterno: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="e-lastm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apellido materno</label>
                      <input
                        id="e-lastm"
                        type="text"
                        value={selectedUser.apellido_materno || ''}
                        onChange={(e)=>setSelectedUser({ ...selectedUser, apellido_materno: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="e-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                      <input
                        id="e-email"
                        type="email"
                        value={selectedUser.email || ''}
                        onChange={(e)=>setSelectedUser({ ...selectedUser, email: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="e-birth" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fecha de nacimiento</label>
                      <input
                        id="e-birth"
                        type="date"
                        value={selectedUser.fecha_nacimiento || ''}
                        onChange={(e)=>setSelectedUser({ ...selectedUser, fecha_nacimiento: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="e-role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rol</label>
                      <select
                        id="e-role"
                        value={selectedUser.rol || ''}
                        onChange={(e)=>setSelectedUser({ ...selectedUser, rol: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      >
                        <option value="Administrador">Administrador</option>
                        <option value="Consultor">Consultor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="e-status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Estado</label>
                      <select
                        id="e-status"
                        value={(selectedUser.activo === true || selectedUser.activo === 'true' || selectedUser.activo === 'Activo') ? 'true': (selectedUser.activo === false || selectedUser.activo === 'false' || selectedUser.activo === 'Inactivo') ? 'false' : ''} onChange={(e)=>setSelectedUser({ ...selectedUser, activo: e.target.value })}
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 pt-2">
                      <button type="button" onClick={() => setSelectedUser(null)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                      <button type="submit" disabled={isUpdating} className={`px-6 py-2 rounded-lg text-white ${isUpdating ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}>
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
