import { useMemo, useState } from "react";
import Layout from "../../shared/components/layout/Layout";

const PERMISOS_DISPONIBLES = [
  "VER_USUARIOS",
  "CREAR_USUARIO",
  "EDITAR_USUARIO",
  "VER_PERSONAS",
  "CREAR_PERSONA",
  "EDITAR_PERSONA",
  "VER_SACRAMENTOS",
  "CREAR_SACRAMENTO",
  "EDITAR_SACRAMENTO",
  "VER_PARROQUIAS",
  "CREAR_PARROQUIA",
  "EDITAR_PARROQUIA",
  "VER_AUDITORIA",
  "GESTIONAR_ROLES",
  "GENERAR_CERTIFICADOS",
];

const ROLES_INICIALES = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso amplio al sistema",
    activo: true,
    permisos: [
      "VER_USUARIOS",
      "CREAR_USUARIO",
      "EDITAR_USUARIO",
      "VER_PERSONAS",
      "CREAR_PERSONA",
      "EDITAR_PERSONA",
      "VER_SACRAMENTOS",
      "CREAR_SACRAMENTO",
      "EDITAR_SACRAMENTO",
      "VER_PARROQUIAS",
      "CREAR_PARROQUIA",
      "EDITAR_PARROQUIA",
      "VER_AUDITORIA",
      "GESTIONAR_ROLES",
      "GENERAR_CERTIFICADOS",
    ],
  },
  {
    id: 2,
    nombre: "Consultor",
    descripcion: "Solo consulta y certificados",
    activo: true,
    permisos: [
      "VER_PERSONAS",
      "VER_SACRAMENTOS",
      "VER_PARROQUIAS",
      "GENERAR_CERTIFICADOS",
    ],
  },
  {
    id: 3,
    nombre: "Secretario Parroquial",
    descripcion: "Registro y edición operativa",
    activo: true,
    permisos: [
      "VER_PERSONAS",
      "CREAR_PERSONA",
      "EDITAR_PERSONA",
      "VER_SACRAMENTOS",
      "CREAR_SACRAMENTO",
      "EDITAR_SACRAMENTO",
      "VER_PARROQUIAS",
      "GENERAR_CERTIFICADOS",
    ],
  },
];

export default function RolesPermisos() {
  const [activeTab, setActiveTab] = useState("agregar");
  const [toast, setToast] = useState(null);
  const [roles, setRoles] = useState(ROLES_INICIALES);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formAdd, setFormAdd] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
    permisos: [],
  });

  const [filters, setFilters] = useState({
    nombre: "",
    activo: "",
  });

  const filteredRoles = useMemo(() => {
    return roles.filter((rol) => {
      const matchNombre =
        !filters.nombre ||
        rol.nombre.toLowerCase().includes(filters.nombre.toLowerCase());

      const matchActivo =
        filters.activo === ""
          ? true
          : String(rol.activo) === String(filters.activo);

      return matchNombre && matchActivo;
    });
  }, [roles, filters]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePermisoAdd = (permiso) => {
    setFormAdd((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter((p) => p !== permiso)
        : [...prev.permisos, permiso],
    }));
  };

  const togglePermisoEdit = (permiso) => {
    if (!selectedRole) return;

    setSelectedRole((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter((p) => p !== permiso)
        : [...prev.permisos, permiso],
    }));
  };

  const handleCreate = (e) => {
    e.preventDefault();

    if (!formAdd.nombre.trim()) {
      showToast("error", "El nombre del rol es obligatorio.");
      return;
    }

    const exists = roles.some(
      (r) => r.nombre.toLowerCase() === formAdd.nombre.trim().toLowerCase()
    );

    if (exists) {
      showToast("error", "Ya existe un rol con ese nombre.");
      return;
    }

    const nuevoRol = {
      id: Date.now(),
      nombre: formAdd.nombre.trim(),
      descripcion: formAdd.descripcion.trim(),
      activo: Boolean(formAdd.activo),
      permisos: formAdd.permisos,
    };

    setRoles((prev) => [nuevoRol, ...prev]);
    setFormAdd({
      nombre: "",
      descripcion: "",
      activo: true,
      permisos: [],
    });

    showToast("success", "Rol creado correctamente.");
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!selectedRole) return;

    setRoles((prev) =>
      prev.map((rol) =>
        rol.id === selectedRole.id ? { ...selectedRole } : rol
      )
    );

    showToast("success", "Rol actualizado correctamente.");
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

  const getPermisosPreview = (permisos) => {
    if (!permisos?.length) return "Sin permisos";
    if (permisos.length <= 3) return permisos.join(", ");
    return `${permisos.slice(0, 3).join(", ")} +${permisos.length - 3}`;
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
                <label
                  htmlFor="a-nombre-rol"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Nombre del rol
                </label>
                <input
                  id="a-nombre-rol"
                  type="text"
                  placeholder="Ej. Secretario Parroquial"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.nombre}
                  onChange={(e) =>
                    setFormAdd({ ...formAdd, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="a-estado-rol"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Estado
                </label>
                <select
                  id="a-estado-rol"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
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
                <label
                  htmlFor="a-descripcion-rol"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Descripción
                </label>
                <textarea
                  id="a-descripcion-rol"
                  rows="3"
                  placeholder="Describa la función principal del rol"
                  className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  value={formAdd.descripcion}
                  onChange={(e) =>
                    setFormAdd({ ...formAdd, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Permisos asignados
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PERMISOS_DISPONIBLES.map((permiso) => (
                    <label
                      key={permiso}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer bg-background-light dark:bg-gray-800/40"
                    >
                      <input
                        type="checkbox"
                        checked={formAdd.permisos.includes(permiso)}
                        onChange={() => togglePermisoAdd(permiso)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {permiso}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 mt-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90"
                >
                  Crear Rol
                </button>

                <button
                  type="reset"
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
                <div>
                  <label
                    className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
                    htmlFor="f-nombre-rol"
                  >
                    Nombre
                  </label>
                  <input
                    id="f-nombre-rol"
                    type="text"
                    placeholder="Nombre del rol"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={filters.nombre}
                    onChange={(e) =>
                      setFilters({ ...filters, nombre: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2"
                    htmlFor="f-estado-rol"
                  >
                    Estado
                  </label>
                  <select
                    id="f-estado-rol"
                    className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    value={filters.activo}
                    onChange={(e) =>
                      setFilters({ ...filters, activo: e.target.value })
                    }
                  >
                    <option value="">Todos</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Buscar
                  </button>
                  <button
                    type="reset"
                    onClick={handleResetSearch}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Limpiar
                  </button>
                </div>
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
                    {filteredRoles.length === 0 && (
                      <tr>
                        <td className="px-6 py-4" colSpan={4}>
                          Sin resultados
                        </td>
                      </tr>
                    )}

                    {filteredRoles.map((rol) => (
                      <tr
                        key={rol.id}
                        onClick={() => setSelectedRole({ ...rol })}
                        className="cursor-pointer bg-white dark:bg-background-dark border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {rol.nombre}
                        </td>
                        <td className="px-6 py-4">{rol.descripcion}</td>
                        <td className="px-6 py-4">{getPermisosPreview(rol.permisos)}</td>
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
              <div className="grid grid-cols-1 gap-8 mt-8">
                <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Editar Rol
                  </h3>

                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    onSubmit={handleUpdate}
                  >
                    <div>
                      <label
                        htmlFor="e-nombre-rol"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Nombre del rol
                      </label>
                      <input
                        id="e-nombre-rol"
                        type="text"
                        value={selectedRole.nombre || ""}
                        onChange={(e) =>
                          setSelectedRole({
                            ...selectedRole,
                            nombre: e.target.value,
                          })
                        }
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="e-estado-rol"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Estado
                      </label>
                      <select
                        id="e-estado-rol"
                        value={String(selectedRole.activo)}
                        onChange={(e) =>
                          setSelectedRole({
                            ...selectedRole,
                            activo: e.target.value === "true",
                          })
                        }
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="e-descripcion-rol"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Descripción
                      </label>
                      <textarea
                        id="e-descripcion-rol"
                        rows="3"
                        value={selectedRole.descripcion || ""}
                        onChange={(e) =>
                          setSelectedRole({
                            ...selectedRole,
                            descripcion: e.target.value,
                          })
                        }
                        className="bg-background-light dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Permisos del rol
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {PERMISOS_DISPONIBLES.map((permiso) => (
                          <label
                            key={permiso}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer bg-background-light dark:bg-gray-800/40"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRole.permisos.includes(permiso)}
                              onChange={() => togglePermisoEdit(permiso)}
                              className="w-4 h-4 text-primary"
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {permiso}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole(null)}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90"
                      >
                        Guardar Cambios
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
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg px-4 py-3 text-white ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </Layout>
  );
}