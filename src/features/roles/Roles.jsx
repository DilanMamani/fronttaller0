import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../shared/components/layout/Layout";

import { fetchRoles, createRol, updateRol } from "./slicesRol/rolesThunk";
import {
  selectRoles,
  selectRolesLoading,
  selectRolesCreating,
  selectRolesUpdating,
} from "./slicesRol/rolesSlice";

import { fetchPermisos, createPermiso } from "./slicesPermiso/permisosThunk";
import {
  selectPermisos,
  selectPermisosLoading,
  selectPermisosCreating,
} from "./slicesPermiso/permisosSlice";

// ─── helpers ─────────────────────────────────────────────────────────────────

const toId = (p) => (typeof p === "object" ? p.id_permiso : p);

const isChecked = (permisos, id) => permisos.some((p) => toId(p) === id);

const getVisibleEnMenu = (permisos, id) => {
  const found = permisos.find((p) => toId(p) === id);
  if (!found || typeof found !== "object") return true;
  return found.visible_en_menu ?? true;
};

const normalizarPermisos = (permisos = []) =>
  permisos.map((p) =>
    typeof p === "object"
      ? { id_permiso: p.id_permiso, visible_en_menu: p.visible_en_menu ?? true }
      : { id_permiso: p, visible_en_menu: true }
  );

const getModuloPermiso = (nombre = "") => {
  if (nombre.includes("USUARIO")) return "Usuarios";
  if (nombre.includes("ROL") || nombre.includes("PERMISO")) return "Roles y permisos";
  if (nombre.includes("PERSONA")) return "Personas";
  if (nombre.includes("SACRAMENTO")) return "Sacramentos";
  if (nombre.includes("CERTIFICADO")) return "Certificados";
  if (nombre.includes("PARROQUIA")) return "Parroquias";
  if (nombre.includes("AUDITORIA")) return "Auditoría";
  if (nombre.includes("CONFIG_SEGURIDAD")) return "Configuración de seguridad";
  if (nombre.includes("REPORTE")) return "Reportes";
  if (nombre.includes("DASHBOARD")) return "Dashboard";
  return "Otros";
};

// ─── PermisoCard ─────────────────────────────────────────────────────────────

function PermisoCard({ permiso, formPermisos, onToggle, onToggleVisible }) {
  const checked = isChecked(formPermisos, permiso.id_permiso);
  const visible = getVisibleEnMenu(formPermisos, permiso.id_permiso);

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        checked
          ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
          : "border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800/40 hover:border-primary/40"
      }`}
    >
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(permiso.id_permiso)}
          className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
            {permiso.nombre}
          </p>
          {permiso.descripcion && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {permiso.descripcion}
            </p>
          )}
        </div>
      </label>

      {checked && (
        <div className="mt-2.5 pt-2 border-t border-primary/20 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              visibility
            </span>
            Visible en menú
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleVisible(permiso.id_permiso);
            }}
            aria-label="Visible en menú"
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              visible ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                visible ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PermisosGrid ─────────────────────────────────────────────────────────────

function PermisosGrid({
  permisosAgrupados,
  formPermisos,
  onToggle,
  onToggleVisible,
  onToggleModulo,
  isLoading,
}) {
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (modulo) =>
    setCollapsed((prev) => ({ ...prev, [modulo]: !prev[modulo] }));

  if (isLoading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando permisos...</p>;
  }

  if (Object.keys(permisosAgrupados).length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No se encontraron permisos con ese criterio.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(permisosAgrupados).map(([modulo, permisos]) => {
        const assignedCount = permisos.filter((p) =>
          isChecked(formPermisos, p.id_permiso)
        ).length;
        const todosSeleccionados = assignedCount === permisos.length;
        const isOpen = !collapsed[modulo];

        return (
          <div
            key={modulo}
            className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60">
              <button
                type="button"
                onClick={() => toggleCollapse(modulo)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <span
                  className="material-symbols-outlined text-gray-400 dark:text-gray-500 transition-transform"
                  style={{
                    fontSize: "18px",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  chevron_right
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {modulo}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                    assignedCount > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {assignedCount}/{permisos.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggleModulo(permisos, todosSeleccionados)}
                className="text-xs text-primary hover:underline flex-shrink-0 ml-3 font-medium"
              >
                {todosSeleccionados ? "Ninguno" : "Todos"}
              </button>
            </div>

            {isOpen && (
              <div className="p-3 bg-white dark:bg-gray-900/20">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {permisos.map((permiso) => (
                    <PermisoCard
                      key={permiso.id_permiso}
                      permiso={permiso}
                      formPermisos={formPermisos}
                      onToggle={onToggle}
                      onToggleVisible={onToggleVisible}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── RolesPermisos ────────────────────────────────────────────────────────────

export default function RolesPermisos() {
  const dispatch = useDispatch();

  const roles = useSelector(selectRoles);
  const permisosDisponibles = useSelector(selectPermisos);
  const [searchPermiso, setSearchPermiso] = useState("");

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
    permisos: [], // [{id_permiso, visible_en_menu}]
  });

  const [formPermiso, setFormPermiso] = useState({
    nombre: "",
    descripcion: "",
  });

  const [filters, setFilters] = useState({ nombre: "", activo: "" });

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermisos());
  }, [dispatch]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── filtered / grouped permisos ──────────────────────────────────────────

  const permisosFiltrados = useMemo(() => {
    const texto = searchPermiso.toLowerCase().trim();
    if (!texto) return permisosDisponibles;
    return permisosDisponibles.filter((p) => {
      const modulo = getModuloPermiso(p.nombre).toLowerCase();
      return (
        p.nombre?.toLowerCase().includes(texto) ||
        p.descripcion?.toLowerCase().includes(texto) ||
        modulo.includes(texto)
      );
    });
  }, [permisosDisponibles, searchPermiso]);

  const permisosAgrupados = useMemo(() =>
    permisosFiltrados.reduce((acc, p) => {
      const m = getModuloPermiso(p.nombre);
      if (!acc[m]) acc[m] = [];
      acc[m].push(p);
      return acc;
    }, {}),
  [permisosFiltrados]);

  const filteredRoles = useMemo(() =>
    roles.filter((rol) => {
      const matchNombre =
        !filters.nombre ||
        rol.nombre?.toLowerCase().includes(filters.nombre.toLowerCase());
      const matchActivo =
        filters.activo === "" ? true : String(rol.activo) === String(filters.activo);
      return matchNombre && matchActivo;
    }),
  [roles, filters]);

  // ── toggle helpers: add tab ──────────────────────────────────────────────

  const togglePermisoAdd = (id) => {
    setFormAdd((prev) => ({
      ...prev,
      permisos: isChecked(prev.permisos, id)
        ? prev.permisos.filter((p) => toId(p) !== id)
        : [...prev.permisos, { id_permiso: id, visible_en_menu: true }],
    }));
  };

  const toggleVisibleEnMenuAdd = (id) => {
    setFormAdd((prev) => ({
      ...prev,
      permisos: prev.permisos.map((p) =>
        toId(p) === id ? { ...p, visible_en_menu: !(p.visible_en_menu ?? true) } : p
      ),
    }));
  };

  const toggleModuloAdd = (permisosModulo, todosSeleccionados) => {
    setFormAdd((prev) => {
      if (todosSeleccionados) {
        const ids = new Set(permisosModulo.map((p) => p.id_permiso));
        return { ...prev, permisos: prev.permisos.filter((p) => !ids.has(toId(p))) };
      }
      const yaAsignados = new Set(prev.permisos.map(toId));
      const nuevos = permisosModulo
        .filter((p) => !yaAsignados.has(p.id_permiso))
        .map((p) => ({ id_permiso: p.id_permiso, visible_en_menu: true }));
      return { ...prev, permisos: [...prev.permisos, ...nuevos] };
    });
  };

  // ── toggle helpers: edit tab ─────────────────────────────────────────────

  const togglePermisoEdit = (id) => {
    if (!selectedRole) return;
    setSelectedRole((prev) => ({
      ...prev,
      permisos: isChecked(prev.permisos || [], id)
        ? (prev.permisos || []).filter((p) => toId(p) !== id)
        : [...(prev.permisos || []), { id_permiso: id, visible_en_menu: true }],
    }));
  };

  const toggleVisibleEnMenuEdit = (id) => {
    if (!selectedRole) return;
    setSelectedRole((prev) => ({
      ...prev,
      permisos: (prev.permisos || []).map((p) =>
        toId(p) === id ? { ...p, visible_en_menu: !(p.visible_en_menu ?? true) } : p
      ),
    }));
  };

  const toggleModuloEdit = (permisosModulo, todosSeleccionados) => {
    if (!selectedRole) return;
    setSelectedRole((prev) => {
      const actual = prev.permisos || [];
      if (todosSeleccionados) {
        const ids = new Set(permisosModulo.map((p) => p.id_permiso));
        return { ...prev, permisos: actual.filter((p) => !ids.has(toId(p))) };
      }
      const yaAsignados = new Set(actual.map(toId));
      const nuevos = permisosModulo
        .filter((p) => !yaAsignados.has(p.id_permiso))
        .map((p) => ({ id_permiso: p.id_permiso, visible_en_menu: true }));
      return { ...prev, permisos: [...actual, ...nuevos] };
    });
  };

  // ── form handlers ────────────────────────────────────────────────────────

  const handleCreatePermiso = async (e) => {
    e.preventDefault();
    if (!formPermiso.nombre.trim()) {
      showToast("error", "El nombre del permiso es obligatorio.");
      return;
    }
    const action = await dispatch(
      createPermiso({
        nombre: formPermiso.nombre.trim(),
        descripcion: formPermiso.descripcion.trim(),
      })
    );
    if (action.meta.requestStatus === "fulfilled") {
      showToast("success", "Permiso creado correctamente.");
      setFormPermiso({ nombre: "", descripcion: "" });
      dispatch(fetchPermisos());
    } else {
      showToast("error", action.payload?.msg || action.payload?.message || "No se pudo crear el permiso.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formAdd.nombre.trim()) {
      showToast("error", "El nombre del rol es obligatorio.");
      return;
    }
    const action = await dispatch(
      createRol({
        nombre: formAdd.nombre.trim(),
        descripcion: formAdd.descripcion.trim(),
        permisos: formAdd.permisos,
      })
    );
    if (action.meta.requestStatus === "fulfilled") {
      showToast("success", "Rol creado correctamente.");
      setFormAdd({ nombre: "", descripcion: "", activo: true, permisos: [] });
      dispatch(fetchRoles());
    } else {
      showToast("error", action.payload?.msg || action.payload?.message || "No se pudo crear el rol.");
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
    const action = await dispatch(
      updateRol({
        id,
        data: {
          nombre: selectedRole.nombre?.trim(),
          descripcion: selectedRole.descripcion?.trim(),
          activo: selectedRole.activo,
          permisos: selectedRole.permisos || [],
        },
      })
    );
    if (action.meta.requestStatus === "fulfilled") {
      showToast("success", "Rol actualizado correctamente.");
      setSelectedRole(null);
      dispatch(fetchRoles());
    } else {
      showToast("error", "No se pudo actualizar el rol.");
    }
  };

  const handleResetAdd = () =>
    setFormAdd({ nombre: "", descripcion: "", activo: true, permisos: [] });

  const handleResetSearch = () => {
    setFilters({ nombre: "", activo: "" });
    setSelectedRole(null);
  };

  const getPermisosPreview = (permisos = []) => {
    if (!permisos.length) return "Sin permisos";
    const nombres = permisos.map((p) => {
      const id = toId(p);
      return permisosDisponibles.find((x) => x.id_permiso === id)?.nombre || `Permiso ${id}`;
    });
    if (nombres.length <= 3) return nombres.join(", ");
    return `${nombres.slice(0, 3).join(", ")} +${nombres.length - 3}`;
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <Layout title="Gestión de Roles y Permisos">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "agregar", label: "Agregar Rol" },
            { id: "buscar", label: "Buscar / Editar" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
                activeTab === tab.id
                  ? "bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px"
                  : "bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Agregar ── */}
        {activeTab === "agregar" && (
          <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Agregar Rol
            </h3>

            <form className="space-y-6" onSubmit={handleCreate}>
              {/* Datos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre del rol
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. SECRETARIO_PARROQUIAL"
                    className="input-base w-full"
                    value={formAdd.nombre}
                    onChange={(e) => setFormAdd({ ...formAdd, nombre: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </label>
                  <select
                    className="input-base w-full"
                    value={String(formAdd.activo)}
                    onChange={(e) =>
                      setFormAdd({ ...formAdd, activo: e.target.value === "true" })
                    }
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Describa la función principal del rol"
                    className="input-base w-full"
                    value={formAdd.descripcion}
                    onChange={(e) =>
                      setFormAdd({ ...formAdd, descripcion: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Agregar permiso nuevo */}
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Crear nuevo permiso
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del permiso"
                    value={formPermiso.nombre}
                    onChange={(e) =>
                      setFormPermiso({ ...formPermiso, nombre: e.target.value })
                    }
                    className="input-base w-full"
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={formPermiso.descripcion}
                    onChange={(e) =>
                      setFormPermiso({ ...formPermiso, descripcion: e.target.value })
                    }
                    className="input-base w-full"
                  />
                  <button
                    type="button"
                    onClick={handleCreatePermiso}
                    disabled={isCreatingPermiso}
                    className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
                  >
                    {isCreatingPermiso ? "Agregando..." : "Agregar permiso"}
                  </button>
                </div>
              </div>

              {/* Permisos asignados */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permisos asignados
                    {formAdd.permisos.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        {formAdd.permisos.length} seleccionados
                      </span>
                    )}
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Buscar por módulo, nombre o descripción..."
                  value={searchPermiso}
                  onChange={(e) => setSearchPermiso(e.target.value)}
                  className="input-base w-full mb-4"
                />

                <PermisosGrid
                  permisosAgrupados={permisosAgrupados}
                  formPermisos={formAdd.permisos}
                  onToggle={togglePermisoAdd}
                  onToggleVisible={toggleVisibleEnMenuAdd}
                  onToggleModulo={toggleModuloAdd}
                  isLoading={isLoadingPermisos}
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isCreatingRol}
                  className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
                >
                  {isCreatingRol ? "Creando..." : "Crear Rol"}
                </button>
                <button
                  type="button"
                  onClick={handleResetAdd}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab: Buscar / Editar ── */}
        {activeTab === "buscar" && (
          <>
            {/* Filtros */}
            <div className="bg-white dark:bg-background-dark p-5 rounded-xl shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Buscar Rol
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del rol"
                  className="input-base w-full"
                  value={filters.nombre}
                  onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
                />
                <select
                  className="input-base w-full"
                  value={filters.activo}
                  onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Tabla de roles */}
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                  <thead className="text-xs text-gray-600 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3.5">Rol</th>
                      <th className="px-6 py-3.5">Descripción</th>
                      <th className="px-6 py-3.5">Permisos</th>
                      <th className="px-6 py-3.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {isLoadingRoles && (
                      <tr>
                        <td className="px-6 py-6 text-center" colSpan={4}>
                          <span className="text-gray-400 dark:text-gray-500">Cargando roles...</span>
                        </td>
                      </tr>
                    )}
                    {!isLoadingRoles && filteredRoles.length === 0 && (
                      <tr>
                        <td className="px-6 py-10 text-center" colSpan={4}>
                          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 block mb-2">
                            search_off
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">Sin resultados</span>
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
                          className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                            selectedRole?.id_rol === rol.id_rol
                              ? "bg-primary/5 dark:bg-primary/10"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            {rol.nombre}
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {rol.descripcion || "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                            {getPermisosPreview(rol.permisos)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                rol.activo
                                  ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                              }`}
                            >
                              {rol.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editar rol seleccionado */}
            {selectedRole && (
              <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Editar Rol
                    <span className="ml-2 text-base font-normal text-gray-400 dark:text-gray-500">
                      — {selectedRole.nombre}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Cerrar"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>close</span>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre del rol
                      </label>
                      <input
                        type="text"
                        value={selectedRole.nombre || ""}
                        onChange={(e) =>
                          setSelectedRole({ ...selectedRole, nombre: e.target.value })
                        }
                        className="input-base w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estado
                      </label>
                      <select
                        value={String(selectedRole.activo)}
                        onChange={(e) =>
                          setSelectedRole({
                            ...selectedRole,
                            activo: e.target.value === "true",
                          })
                        }
                        className="input-base w-full"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción
                      </label>
                      <textarea
                        rows="2"
                        value={selectedRole.descripcion || ""}
                        onChange={(e) =>
                          setSelectedRole({ ...selectedRole, descripcion: e.target.value })
                        }
                        className="input-base w-full"
                      />
                    </div>
                  </div>

                  {/* Permisos del rol */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Permisos del rol
                        {(selectedRole.permisos || []).length > 0 && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                            {(selectedRole.permisos || []).length} seleccionados
                          </span>
                        )}
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Buscar por módulo, nombre o descripción..."
                      value={searchPermiso}
                      onChange={(e) => setSearchPermiso(e.target.value)}
                      className="input-base w-full mb-4"
                    />

                    <PermisosGrid
                      permisosAgrupados={permisosAgrupados}
                      formPermisos={selectedRole.permisos || []}
                      onToggle={togglePermisoEdit}
                      onToggleVisible={toggleVisibleEnMenuEdit}
                      onToggleModulo={toggleModuloEdit}
                      isLoading={isLoadingPermisos}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingRol}
                      className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl shadow-lg px-4 py-3 text-white flex items-center gap-2 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </Layout>
  );
}
