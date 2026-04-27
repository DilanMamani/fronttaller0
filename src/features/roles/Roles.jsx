import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../shared/components/layout/Layout";

import {
  fetchRoles,
  createRol,
  updateRol,
} from "./slicesRol/rolesThunk";

import {
  selectRoles,
  selectRolesLoading,
  selectRolesCreating,
  selectRolesUpdating,
} from "./slicesRol/rolesSlice";

import {
  fetchPermisos,
  createPermiso,
} from "./slicesPermiso/permisosThunk";

import {
  selectPermisos,
  selectPermisosLoading,
  selectPermisosCreating,
} from "./slicesPermiso/permisosSlice";

export default function RolesPermisos() {
  const dispatch = useDispatch();

  const roles = useSelector(selectRoles);
  const permisosDisponibles = useSelector(selectPermisos);
  const [searchPermiso, setSearchPermiso] = useState('');

  const isLoadingRoles = useSelector(selectRolesLoading);
  const isCreatingRol = useSelector(selectRolesCreating);
  const isUpdatingRol = useSelector(selectRolesUpdating);

  const isLoadingPermisos = useSelector(selectPermisosLoading);
  const isCreatingPermiso = useSelector(selectPermisosCreating);

  const [activeTab, setActiveTab] = useState("agregar");
  const [toast, setToast] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formAdd, setFormAdd] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
    permisos: [],
  });

  const [formPermiso, setFormPermiso] = useState({
    nombre: "",
    descripcion: "",
  });

  const [filters, setFilters] = useState({
    nombre: "",
    activo: "",
  });

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermisos());
  }, [dispatch]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizarPermisos = (permisos = []) => {
    return permisos.map((p) =>
      typeof p === "object" ? p.id_permiso : p
    );
  };

  const filteredRoles = useMemo(() => {
    return roles.filter((rol) => {
      const matchNombre =
        !filters.nombre ||
        rol.nombre?.toLowerCase().includes(filters.nombre.toLowerCase());

      const matchActivo =
        filters.activo === ""
          ? true
          : String(rol.activo) === String(filters.activo);

      return matchNombre && matchActivo;
    });
  }, [roles, filters]);

  const getModuloPermiso = (nombre = '') => {
  if (nombre.includes('USUARIO')) return 'Usuarios';
  if (nombre.includes('ROL') || nombre.includes('PERMISO')) return 'Roles y permisos';
  if (nombre.includes('PERSONA')) return 'Personas';
  if (nombre.includes('SACRAMENTO')) return 'Sacramentos';
  if (nombre.includes('CERTIFICADO')) return 'Certificados';
  if (nombre.includes('PARROQUIA')) return 'Parroquias';
  if (nombre.includes('AUDITORIA')) return 'Auditoría';
  if (nombre.includes('CONFIG_SEGURIDAD')) return 'Configuración de seguridad';
  if (nombre.includes('REPORTE')) return 'Reportes';
  if (nombre.includes('DASHBOARD')) return 'Dashboard';
  return 'Otros';
};


const permisosFiltrados = permisosDisponibles.filter((permiso) => {
  const texto = searchPermiso.toLowerCase().trim();
  if (!texto) return true;

  const modulo = getModuloPermiso(permiso.nombre).toLowerCase();

  return (
    permiso.nombre?.toLowerCase().includes(texto) ||
    permiso.descripcion?.toLowerCase().includes(texto) ||
    modulo.includes(texto)
  );
});

const permisosAgrupados = permisosFiltrados.reduce((acc, permiso) => {
  const modulo = getModuloPermiso(permiso.nombre);

  if (!acc[modulo]) acc[modulo] = [];
  acc[modulo].push(permiso);

  return acc;
}, {});
  const togglePermisoAdd = (idPermiso) => {
    setFormAdd((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(idPermiso)
        ? prev.permisos.filter((id) => id !== idPermiso)
        : [...prev.permisos, idPermiso],
    }));
  };

  const togglePermisoEdit = (idPermiso) => {
    if (!selectedRole) return;

    const permisosActuales = selectedRole.permisos || [];

    setSelectedRole((prev) => ({
      ...prev,
      permisos: permisosActuales.includes(idPermiso)
        ? permisosActuales.filter((id) => id !== idPermiso)
        : [...permisosActuales, idPermiso],
    }));
  };

  const handleCreatePermiso = async (e) => {
    e.preventDefault();

    if (!formPermiso.nombre.trim()) {
      showToast("error", "El nombre del permiso es obligatorio.");
      return;
    }

    const payload = {
      nombre: formPermiso.nombre.trim(),
      descripcion: formPermiso.descripcion.trim(),
    };

    const action = await dispatch(createPermiso(payload));

    if (action.meta.requestStatus === "fulfilled") {
      showToast("success", "Permiso creado correctamente.");
      setFormPermiso({ nombre: "", descripcion: "" });
      dispatch(fetchPermisos());
    } else {
      showToast("error", "No se pudo crear el permiso.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formAdd.nombre.trim()) {
      showToast("error", "El nombre del rol es obligatorio.");
      return;
    }

    const payload = {
      nombre: formAdd.nombre.trim(),
      descripcion: formAdd.descripcion.trim(),
      permisos: formAdd.permisos,
    };

    const action = await dispatch(createRol(payload));

    if (action.meta.requestStatus === "fulfilled") {
      showToast("success", "Rol creado correctamente.");
      setFormAdd({
        nombre: "",
        descripcion: "",
        activo: true,
        permisos: [],
      });
      dispatch(fetchRoles());
    } else {
      showToast("error", "No se pudo crear el rol.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedRole) return;

    const id = selectedRole.id_rol || selectedRole.id;

    if (!id) {
      showToast("error", "No se encontró el ID del rol.");
      return;
    }

    const payload = {
      nombre: selectedRole.nombre?.trim(),
      descripcion: selectedRole.descripcion?.trim(),
      activo: selectedRole.activo,
      permisos: selectedRole.permisos || [],
    };

    const action = await dispatch(updateRol({ id, data: payload }));

    if (action.meta.requestStatus === "fulfilled") {
      showToast("success", "Rol actualizado correctamente.");
      setSelectedRole(null);
      dispatch(fetchRoles());
    } else {
      showToast("error", "No se pudo actualizar el rol.");
    }
  };

  const handleResetAdd = () => {
    setFormAdd({
      nombre: "",
      descripcion: "",
      activo: true,
      permisos: [],
    });
  };

  const handleResetSearch = () => {
    setFilters({
      nombre: "",
      activo: "",
    });
    setSelectedRole(null);
  };

  const getPermisosPreview = (permisos = []) => {
    if (!permisos.length) return "Sin permisos";

    const permisosIds = normalizarPermisos(permisos);

    const nombres = permisosIds.map((id) => {
      const permiso = permisosDisponibles.find((p) => p.id_permiso === id);
      return permiso?.nombre || `Permiso ${id}`;
    });

    if (nombres.length <= 3) return nombres.join(", ");
    return `${nombres.slice(0, 3).join(", ")} +${nombres.length - 3}`;
  };

  return (
    <Layout title="Gestión de Roles y Permisos">
      <div className="space-y-8">
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("agregar")}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
              activeTab === "agregar"
                ? "bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px"
                : "bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent"
            }`}
          >
            Agregar Rol
          </button>

          <button
            onClick={() => setActiveTab("buscar")}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
              activeTab === "buscar"
                ? "bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px"
                : "bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent"
            }`}
          >
            Buscar / Editar
          </button>
        </div>

        {activeTab === "agregar" && (
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Agregar Rol
            </h3>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={handleCreate}
            >
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Nombre del rol
                </label>
                <input
                  type="text"
                  placeholder="Ej. SECRETARIO_PARROQUIAL"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  value={formAdd.nombre}
                  onChange={(e) =>
                    setFormAdd({ ...formAdd, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Estado
                </label>
                <select
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  value={String(formAdd.activo)}
                  onChange={(e) =>
                    setFormAdd({
                      ...formAdd,
                      activo: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  placeholder="Describa la función principal del rol"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  value={formAdd.descripcion}
                  onChange={(e) =>
                    setFormAdd({ ...formAdd, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Agregar nuevo permiso
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del permiso"
                    value={formPermiso.nombre}
                    onChange={(e) =>
                      setFormPermiso({
                        ...formPermiso,
                        nombre: e.target.value,
                      })
                    }
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  />

                  <input
                    type="text"
                    placeholder="Descripción"
                    value={formPermiso.descripcion}
                    onChange={(e) =>
                      setFormPermiso({
                        ...formPermiso,
                        descripcion: e.target.value,
                      })
                    }
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  />

                  <button
                    type="button"
                    onClick={handleCreatePermiso}
                    disabled={isCreatingPermiso}
                    className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isCreatingPermiso ? "Agregando..." : "Agregar permiso"}
                  </button>
                </div>
              </div>

             <div className="md:col-span-2">
  <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-gray-300">
    Permisos asignados
  </label>
  <div className="mb-4">
  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
    Buscar permiso
  </label>

  <input
    type="text"
    placeholder="Buscar por módulo, nombre o descripción..."
    value={searchPermiso}
    onChange={(e) => setSearchPermiso(e.target.value)}
    className="w-full bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block p-2.5"
  />
</div>

  {isLoadingPermisos ? (
    <div className="text-sm text-gray-500">Cargando permisos...</div>
  ) : (
    <div className="space-y-6">
      {Object.entries(permisosAgrupados).map(([modulo, permisos]) => (
        <div
          key={modulo}
          className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/20"
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {modulo}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {permisos.map((permiso) => (
              <label
                key={permiso.id_permiso}
                className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer bg-background-light dark:bg-gray-800/40 hover:border-primary/60 transition"
              >
                <input
                  type="checkbox"
                  checked={formAdd.permisos.includes(permiso.id_permiso)}
                  onChange={() => togglePermisoAdd(permiso.id_permiso)}
                  className="w-4 h-4 mt-1 text-primary"
                />

                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {permiso.nombre}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {permiso.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

              <div className="md:col-span-2 mt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isCreatingRol}
                  className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreatingRol ? "Creando..." : "Crear Rol"}
                </button>

                <button
                  type="button"
                  onClick={handleResetAdd}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "buscar" && (
          <>
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Buscar Rol
              </h3>

              <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="text"
                  placeholder="Nombre del rol"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  value={filters.nombre}
                  onChange={(e) =>
                    setFilters({ ...filters, nombre: e.target.value })
                  }
                />

                <select
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  value={filters.activo}
                  onChange={(e) =>
                    setFilters({ ...filters, activo: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>

                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Limpiar
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3">Rol</th>
                      <th className="px-6 py-3">Descripción</th>
                      <th className="px-6 py-3">Permisos</th>
                      <th className="px-6 py-3">Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoadingRoles && (
                      <tr>
                        <td className="px-6 py-4" colSpan={4}>
                          Cargando roles...
                        </td>
                      </tr>
                    )}

                    {!isLoadingRoles && filteredRoles.length === 0 && (
                      <tr>
                        <td className="px-6 py-4" colSpan={4}>
                          Sin resultados
                        </td>
                      </tr>
                    )}

                    {!isLoadingRoles &&
                      filteredRoles.map((rol) => (
                        <tr
                          key={rol.id_rol || rol.id}
                          onClick={() =>
                            setSelectedRole({
                              ...rol,
                              permisos: normalizarPermisos(rol.permisos || []),
                            })
                          }
                          className="cursor-pointer bg-white dark:bg-background-dark border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {rol.nombre}
                          </td>
                          <td className="px-6 py-4">{rol.descripcion}</td>
                          <td className="px-6 py-4">
                            {getPermisosPreview(rol.permisos)}
                          </td>
                          <td className="px-6 py-4">
                            {rol.activo ? (
                              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Activo
                              </span>
                            ) : (
                              <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Inactivo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRole && (
              <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Editar Rol
                </h3>

                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  onSubmit={handleUpdate}
                >
                  <input
                    type="text"
                    value={selectedRole.nombre || ""}
                    onChange={(e) =>
                      setSelectedRole({
                        ...selectedRole,
                        nombre: e.target.value,
                      })
                    }
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  />

                  <select
                    value={String(selectedRole.activo)}
                    onChange={(e) =>
                      setSelectedRole({
                        ...selectedRole,
                        activo: e.target.value === "true",
                      })
                    }
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>

                  <textarea
                    rows="3"
                    value={selectedRole.descripcion || ""}
                    onChange={(e) =>
                      setSelectedRole({
                        ...selectedRole,
                        descripcion: e.target.value,
                      })
                    }
                    className="md:col-span-2 bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                  />

                  <div className="md:col-span-2">
  <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-gray-300">
    Permisos del rol
  </label>
  <div className="mb-4">
  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
    Buscar permiso
  </label>

  <input
    type="text"
    placeholder="Buscar por módulo, nombre o descripción..."
    value={searchPermiso}
    onChange={(e) => setSearchPermiso(e.target.value)}
    className="w-full bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block p-2.5"
  />
</div>

  <div className="space-y-6">
    {Object.entries(permisosAgrupados).map(([modulo, permisos]) => (
      <div
        key={modulo}
        className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/20"
      >
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {modulo}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {permisos.map((permiso) => (
            <label
              key={permiso.id_permiso}
              className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer bg-background-light dark:bg-gray-800/40 hover:border-primary/60 transition"
            >
              <input
                type="checkbox"
                checked={(selectedRole.permisos || []).includes(
                  permiso.id_permiso
                )}
                onChange={() => togglePermisoEdit(permiso.id_permiso)}
                className="w-4 h-4 mt-1 text-primary"
              />

              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {permiso.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {permiso.descripcion || 'Sin descripción'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>

                  <div className="md:col-span-2 flex justify-end gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isUpdatingRol}
                      className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isUpdatingRol ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg px-4 py-3 text-white ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </Layout>
  );
}