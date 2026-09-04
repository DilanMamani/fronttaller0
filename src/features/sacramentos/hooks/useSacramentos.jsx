import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchPersonasParaSacramento,
  fetchParroquias,
  crearSacramentoCompleto,
  actualizarSacramentoCompleto,
  buscarSacramentos,
} from '../slices/sacramentosTrunk';

import {
  selectIsLoading,
  selectIsUpdating,
} from '../slices/sacramentosSlices';

import {
  ROL_IDS,
  TIPO_SACRAMENTO_IDS,
  ROLES_SACRAMENTO_IDS,
  obtenerNombreRol,
} from '../config/sacramentos.constants';

import {
  initialSacramentoForm,
  initialMatrimonioForm,
  initialSacramentoFilters,
} from '../config/sacramentosInitialState';

// ---------------------------------------------------------------------------
// Hook de búsqueda genérico — encapsula el patrón debounce + dispatch
// ---------------------------------------------------------------------------
function usePersonaSearch({ query, fetchArgs, enabled = true }) {
  const dispatch = useDispatch();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      dispatch(fetchPersonasParaSacramento(fetchArgs(query)))
        .unwrap()
        .then((data) => {
          setLista(data.personas || []);
          setOpen(true);
        })
        .catch(() => setLista([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return { lista, loading, open, setOpen, setLista };
}

function useParroquiaSearch(query) {
  const dispatch = useDispatch();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      dispatch(fetchParroquias({ search: query }))
        .unwrap()
        .then((data) => {
          setLista(data.parroquias || []);
          setOpen(true);
        })
        .catch(() => setLista([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return { lista, loading, open, setOpen, setLista };
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
export function useSacramentos() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const isUpdating = useSelector(selectIsUpdating);

  // --- UI state ---
  const [activeTab, setActiveTab] = useState('agregar');
  const [tipoSacramento, setTipoSacramento] = useState('bautizo');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [forceUpdateLoading, setForceUpdateLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSacramento, setLoadingSacramento] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- Formularios (tab "Agregar") ---
  const [form, setForm] = useState({ ...initialSacramentoForm });
  const [matrimonio, setMatrimonio] = useState({ ...initialMatrimonioForm });
  const [filters, setFilters] = useState({ ...initialSacramentoFilters });

  // --- Queries de texto para los campos de búsqueda (tab "Agregar") ---
  const [queryPersona, setQueryPersona] = useState('');
  const [queryPadrino, setQueryPadrino] = useState('');
  const [queryMadrina, setQueryMadrina] = useState('');
  const [queryMinistro, setQueryMinistro] = useState('');
  const [queryParroquia, setQueryParroquia] = useState('');
  const [queryEsposo, setQueryEsposo] = useState('');
  const [queryEsposa, setQueryEsposa] = useState('');

  // --- Flags de selección (evitan re-disparar búsquedas al cargar un registro) ---
  const [personaSelected, setPersonaSelected] = useState(false);
  const [padrinoSelected, setPadrinoSelected] = useState(false);
  const [madrinaSelected, setMadrinaSelected] = useState(false);
  const [ministroSelected, setMinistroSelected] = useState(false);
  const [parroquiaSelected, setParroquiaSelected] = useState(false);

  // --- Formulario de edición (modal "Buscar / Editar") ---
  // Estado independiente del de "Agregar" para que seleccionar un resultado
  // de búsqueda no pise lo que el usuario esté llenando en la otra pestaña.
  const [editForm, setEditForm] = useState({ ...initialSacramentoForm });
  const [editMatrimonio, setEditMatrimonio] = useState({ ...initialMatrimonioForm });

  const [editQueryPersona, setEditQueryPersona] = useState('');
  const [editQueryPadrino, setEditQueryPadrino] = useState('');
  const [editQueryMadrina, setEditQueryMadrina] = useState('');
  const [editQueryMinistro, setEditQueryMinistro] = useState('');
  const [editQueryParroquia, setEditQueryParroquia] = useState('');
  const [editQueryEsposo, setEditQueryEsposo] = useState('');
  const [editQueryEsposa, setEditQueryEsposa] = useState('');

  const [editPadrinoSelected, setEditPadrinoSelected] = useState(false);
  const [editMadrinaSelected, setEditMadrinaSelected] = useState(false);
  const [editMinistroSelected, setEditMinistroSelected] = useState(false);
  const [editParroquiaSelected, setEditParroquiaSelected] = useState(false);

  // --- Búsquedas ---
  const personaSearch = usePersonaSearch({
    query: queryPersona,
    enabled: !personaSelected,
    fetchArgs: (q) => ({ search: q, rol: tipoSacramento, tipo: 'sacramento' }),
  });

  const padrinoSearch = usePersonaSearch({
    query: queryPadrino,
    enabled: !padrinoSelected,
    fetchArgs: (q) => ({ search: q, rol: 'padrino', tipo: 'rol' }),
  });

  const madrinaSearch = usePersonaSearch({
    query: queryMadrina,
    enabled: !madrinaSelected,
    fetchArgs: (q) => ({ search: q, rol: 'madrina', tipo: 'rol' }),
  });

  const ministroSearch = usePersonaSearch({
    query: queryMinistro,
    enabled: !ministroSelected,
    fetchArgs: (q) => ({ search: q, rol: 'ministro', tipo: 'rol' }),
  });

  const parroquiaSearch = useParroquiaSearch(parroquiaSelected ? '' : queryParroquia);

  const esposoSearch = usePersonaSearch({
    query: queryEsposo,
    fetchArgs: (q) => ({ search: q, rol: tipoSacramento, tipo: 'sacramento' }),
  });

  const esposaSearch = usePersonaSearch({
    query: queryEsposa,
    fetchArgs: (q) => ({ search: q, rol: tipoSacramento, tipo: 'sacramento' }),
  });

  // --- Búsquedas del modal de edición (independientes de las de "Agregar") ---
  const editPadrinoSearch = usePersonaSearch({
    query: editQueryPadrino,
    enabled: !editPadrinoSelected,
    fetchArgs: (q) => ({ search: q, rol: 'padrino', tipo: 'rol' }),
  });

  const editMadrinaSearch = usePersonaSearch({
    query: editQueryMadrina,
    enabled: !editMadrinaSelected,
    fetchArgs: (q) => ({ search: q, rol: 'madrina', tipo: 'rol' }),
  });

  const editMinistroSearch = usePersonaSearch({
    query: editQueryMinistro,
    enabled: !editMinistroSelected,
    fetchArgs: (q) => ({ search: q, rol: 'ministro', tipo: 'rol' }),
  });

  const editParroquiaSearch = useParroquiaSearch(editParroquiaSelected ? '' : editQueryParroquia);

  const editEsposoSearch = usePersonaSearch({
    query: editQueryEsposo,
    fetchArgs: (q) => ({ search: q, rol: tipoSacramento, tipo: 'sacramento' }),
  });

  const editEsposaSearch = usePersonaSearch({
    query: editQueryEsposa,
    fetchArgs: (q) => ({ search: q, rol: tipoSacramento, tipo: 'sacramento' }),
  });

  // --- Toast auto-dismiss ---
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // --- Helpers de formulario ---
  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleMatChange = (key, value) => setMatrimonio((prev) => ({ ...prev, [key]: value }));
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({ ...initialSacramentoForm });
    setMatrimonio({ ...initialMatrimonioForm });
    setQueryPersona('');
    setQueryPadrino('');
    setQueryMadrina('');
    setQueryMinistro('');
    setQueryParroquia('');
    setQueryEsposo('');
    setQueryEsposa('');
    setPersonaSelected(false);
    setPadrinoSelected(false);
    setMadrinaSelected(false);
    setMinistroSelected(false);
    setParroquiaSelected(false);
    personaSearch.setOpen(false);
    padrinoSearch.setOpen(false);
    madrinaSearch.setOpen(false);
    ministroSearch.setOpen(false);
    parroquiaSearch.setOpen(false);
    esposoSearch.setOpen(false);
    esposaSearch.setOpen(false);
  };

  // --- Helpers del formulario de edición (modal "Buscar / Editar") ---
  const handleEditChange = (key, value) => setEditForm((prev) => ({ ...prev, [key]: value }));
  const handleEditMatChange = (key, value) => setEditMatrimonio((prev) => ({ ...prev, [key]: value }));

  const resetEditForm = () => {
    setEditForm({ ...initialSacramentoForm });
    setEditMatrimonio({ ...initialMatrimonioForm });
    setEditQueryPersona('');
    setEditQueryPadrino('');
    setEditQueryMadrina('');
    setEditQueryMinistro('');
    setEditQueryParroquia('');
    setEditQueryEsposo('');
    setEditQueryEsposa('');
    setEditPadrinoSelected(false);
    setEditMadrinaSelected(false);
    setEditMinistroSelected(false);
    setEditParroquiaSelected(false);
    editPadrinoSearch.setOpen(false);
    editMadrinaSearch.setOpen(false);
    editMinistroSearch.setOpen(false);
    editParroquiaSearch.setOpen(false);
    editEsposoSearch.setOpen(false);
    editEsposaSearch.setOpen(false);
  };

  // --- Payload builders ---
  const buildPayloadCrear = () => {
    const relaciones = [];

    if (form.personaId) {
      relaciones.push({ persona_id: form.personaId, rol_sacramento_id: ROLES_SACRAMENTO_IDS[tipoSacramento] });
    }
    if (form.padrinoId) {
      relaciones.push({ persona_id: form.padrinoId, rol_sacramento_id: ROL_IDS.PADRINO });
    }
    if (form.madrinaId) {
      relaciones.push({ persona_id: form.madrinaId, rol_sacramento_id: ROL_IDS.MADRINA });
    }
    if (form.ministroId) {
      relaciones.push({ persona_id: form.ministroId, rol_sacramento_id: ROL_IDS.MINISTRO });
    }
    if (tipoSacramento === 'matrimonio') {
      if (matrimonio.esposoId) relaciones.push({ persona_id: matrimonio.esposoId, rol_sacramento_id: ROL_IDS.ESPOSO });
      if (matrimonio.esposaId) relaciones.push({ persona_id: matrimonio.esposaId, rol_sacramento_id: ROL_IDS.ESPOSA });
    }

    return {
      fecha_sacramento: form.fecha_sacramento,
      foja: form.foja,
      numero: form.numero,
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoSacramento],
      parroquiaId: form.parroquiaId,
      matrimonioDetalle: tipoSacramento === 'matrimonio'
        ? { lugar_ceremonia: matrimonio.lugar_ceremonia, reg_civil: matrimonio.reg_civil, numero_acta: matrimonio.numero_acta }
        : null,
      relaciones,
    };
  };

  const buildPayloadEditar = () => {
    const safe = (v) => (v && String(v).trim() !== '' ? v : undefined);
    const relacionesOriginales = selectedPerson?.todasRelaciones || [];
    const relaciones = [];

    if (tipoSacramento === 'matrimonio') {
      const relOriginalEsposo = relacionesOriginales.find(
        (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.ESPOSO
      );
      const relOriginalEsposa = relacionesOriginales.find(
        (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.ESPOSA
      );
      const esposoId = editMatrimonio.esposoId || relOriginalEsposo?.persona_id_persona;
      const esposaId = editMatrimonio.esposaId || relOriginalEsposa?.persona_id_persona;
      if (esposoId) relaciones.push({ persona_id: esposoId, rol_sacramento_id: ROL_IDS.ESPOSO });
      if (esposaId) relaciones.push({ persona_id: esposaId, rol_sacramento_id: ROL_IDS.ESPOSA });
    } else {
      if (editForm.personaId) {
        relaciones.push({ persona_id: editForm.personaId, rol_sacramento_id: ROLES_SACRAMENTO_IDS[tipoSacramento] });
      }
    }

    // Padrino: usa el nuevo si fue seleccionado, si no conserva el original
    const relOriginalPadrino = relacionesOriginales.find(
      (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.PADRINO
    );
    if (editForm.padrinoId) {
      relaciones.push({ persona_id: editForm.padrinoId, rol_sacramento_id: ROL_IDS.PADRINO });
    } else if (relOriginalPadrino) {
      relaciones.push({ persona_id: relOriginalPadrino.persona_id_persona, rol_sacramento_id: ROL_IDS.PADRINO });
    }

    // Madrina: igual que padrino
    const relOriginalMadrina = relacionesOriginales.find(
      (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.MADRINA
    );
    if (editForm.madrinaId) {
      relaciones.push({ persona_id: editForm.madrinaId, rol_sacramento_id: ROL_IDS.MADRINA });
    } else if (relOriginalMadrina) {
      relaciones.push({ persona_id: relOriginalMadrina.persona_id_persona, rol_sacramento_id: ROL_IDS.MADRINA });
    }

    // Ministro: igual que padrino
    const relOriginalMinistro = relacionesOriginales.find(
      (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.MINISTRO
    );
    if (editForm.ministroId) {
      relaciones.push({ persona_id: editForm.ministroId, rol_sacramento_id: ROL_IDS.MINISTRO });
    } else if (relOriginalMinistro) {
      relaciones.push({ persona_id: relOriginalMinistro.persona_id_persona, rol_sacramento_id: ROL_IDS.MINISTRO });
    }

    return {
      fecha_sacramento: safe(editForm.fecha_sacramento),
      foja: safe(editForm.foja),
      numero: safe(editForm.numero),
      tipo_sacramento_id_tipo: selectedPerson.tipoSacramento.id_tipo,
      parroquiaId: safe(editForm.parroquiaId),
      matrimonioDetalle: tipoSacramento === 'matrimonio'
        ? {
            lugar_ceremonia: editMatrimonio.lugar_ceremonia || undefined,
            reg_civil:        editMatrimonio.reg_civil        || undefined,
            numero_acta:      editMatrimonio.numero_acta      || undefined,
          }
        : undefined,
      relaciones,
    };
  };

  // ---------------------------------------------------------------------------
  // Búsqueda programática — puede llamarse con o sin evento de formulario
  // ---------------------------------------------------------------------------
  const ejecutarBusqueda = (filtrosOverride = filters, page = 1) => {
    setLoadingSacramento(true);
    setSelectedPerson(null);
    dispatch(buscarSacramentos({
      ...filtrosOverride,
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoSacramento],
      rol_principal: ROLES_SACRAMENTO_IDS[tipoSacramento],
      page,
    }))
      .unwrap()
      .then((res) => {
        const planos = [];
        (res.resultados || []).forEach((sac) => {
          sac.personaSacramentos.forEach((rel) => {
            if (!rel.persona) return;
            planos.push({
              id_sacramento: sac.id_sacramento,
              nombre: rel.persona.nombre,
              apellido_paterno: rel.persona.apellido_paterno,
              apellido_materno: rel.persona.apellido_materno,
              carnet_identidad: rel.persona.carnet_identidad,
              fecha_sacramento: sac.fecha_sacramento,
              rol_nombre: obtenerNombreRol(rel.rol_sacramento_id_rol_sacra),
              foja: sac.foja,
              numero: sac.numero,
              persona_id: rel.persona.id_persona,
              persona: rel.persona,
              todasRelaciones: sac.todasRelaciones,
              parroquia: sac.parroquia,
              tipoSacramento: sac.tipoSacramento,
              matrimonio_detalle: sac.matrimonioDetalle,
            });
          });
        });
        setResults(planos);
        setCurrentPage(res.currentPage || page);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total ?? planos.length);
      })
      .catch(() => setToast({ type: 'error', message: 'No se pudo realizar la búsqueda' }))
      .finally(() => setLoadingSacramento(false));
  };

  const handlePageChange = (page) => {
    ejecutarBusqueda(filters, page);
  };

  // Carga automática al entrar al tab "buscar"
  useEffect(() => {
    if (activeTab === 'buscar') ejecutarBusqueda();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Al cambiar tipo de sacramento estando en "buscar": limpia filtros y recarga
  useEffect(() => {
    if (activeTab !== 'buscar') return;
    const filtrosLimpios = { ...initialSacramentoFilters };
    setFilters(filtrosLimpios);
    setSelectedPerson(null);
    setResults([]);
    ejecutarBusqueda(filtrosLimpios);
  }, [tipoSacramento]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Acciones ---
  const handleSubmitAgregar = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(crearSacramentoCompleto(buildPayloadCrear()))
      .unwrap()
      .then(() => {
        setToast({ type: 'success', message: 'Sacramento registrado correctamente' });
        resetForm();
      })
      .catch((err) => {
        const msg = typeof err === 'string' ? err : err?.message || err?.msg || 'Error al registrar sacramento';
        setToast({ type: 'error', message: msg });
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleBuscar = (e) => {
    if (e) e.preventDefault();
    ejecutarBusqueda();
  };

  const handleSelectResultado = (row) => {
    setSelectedPerson(row);
    setModalOpen(true);
    const relaciones = row.todasRelaciones || [];

    const relPrincipal = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROLES_SACRAMENTO_IDS[tipoSacramento]);
    const relPadrino   = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.PADRINO);
    const relMadrina   = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.MADRINA);
    const relMinistro  = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.MINISTRO);
    const relEsposo    = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSO);
    const relEsposa    = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSA);

    const nombreCompleto = (p) => p ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}` : '';

    setEditForm({
      personaId: relPrincipal?.persona_id_persona || row.persona_id || null,
      padrinoId: relPadrino?.persona_id_persona || null,
      madrinaId: relMadrina?.persona_id_persona || null,
      ministroId: relMinistro?.persona_id_persona || null,
      parroquiaId: row.parroquia?.id_parroquia || null,
      foja: row.foja || '',
      numero: row.numero || '',
      fecha_sacramento: row.fecha_sacramento || '',
      activo: true,
    });

    // Cargar queries (sin disparar búsqueda porque ponemos selected=true)
    setEditQueryPersona(nombreCompleto(relPrincipal?.persona));
    setEditQueryPadrino(nombreCompleto(relPadrino?.persona));
    setEditQueryMadrina(nombreCompleto(relMadrina?.persona));
    setEditQueryMinistro(nombreCompleto(relMinistro?.persona));
    setEditQueryParroquia(row.parroquia?.nombre || '');

    setEditPadrinoSelected(!!relPadrino?.persona);
    setEditMadrinaSelected(!!relMadrina?.persona);
    setEditMinistroSelected(!!relMinistro?.persona);
    setEditParroquiaSelected(!!row.parroquia);

    if (tipoSacramento === 'matrimonio') {
      setEditQueryEsposo(nombreCompleto(relEsposo?.persona));
      setEditQueryEsposa(nombreCompleto(relEsposa?.persona));
      setEditMatrimonio({
        esposoId: relEsposo?.persona_id_persona || null,
        esposaId: relEsposa?.persona_id_persona || null,
        lugar_ceremonia: row.matrimonio_detalle?.lugar_ceremonia || '',
        reg_civil: row.matrimonio_detalle?.reg_civil || '',
        numero_acta: row.matrimonio_detalle?.numero_acta || '',
      });
    }
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    setForceUpdateLoading(true);
    dispatch(actualizarSacramentoCompleto({ id: selectedPerson.id_sacramento, sacramentoData: buildPayloadEditar() }))
      .unwrap()
      .then(() => {
        setToast({ type: 'success', message: 'Sacramento actualizado correctamente' });
        setModalOpen(false);
        setSelectedPerson(null);
        resetEditForm();
        ejecutarBusqueda();
      })
      .catch((err) => {
        const msg = typeof err === 'string' ? err : err?.message || err?.msg || 'No se pudo actualizar el sacramento';
        setToast({ type: 'error', message: msg });
      })
      .finally(() => setTimeout(() => setForceUpdateLoading(false), 500));
  };

  const closeModal = () => {
    if (forceUpdateLoading || isUpdating) return;
    setModalOpen(false);
    setSelectedPerson(null);
    resetEditForm();
  };

  const resetFilters = () => {
    const filtrosLimpios = { ...initialSacramentoFilters };
    setFilters(filtrosLimpios);
    setSelectedPerson(null);
    ejecutarBusqueda(filtrosLimpios);
  };

  return {
    // UI
    activeTab, setActiveTab,
    tipoSacramento, setTipoSacramento,
    selectedPerson, setSelectedPerson,
    modalOpen, closeModal,
    toast,
    forceUpdateLoading,
    isSubmitting,
    loadingSacramento,
    results,
    currentPage, totalPages, totalItems, handlePageChange,
    isLoading,
    isUpdating,

    // Formularios (tab "Agregar")
    form, matrimonio, filters,
    handleChange, handleMatChange, handleFilterChange,
    resetForm, resetFilters,

    // Queries y búsquedas (tab "Agregar")
    queryPersona, setQueryPersona, personaSelected, setPersonaSelected, personaSearch,
    queryPadrino, setQueryPadrino, padrinoSelected, setPadrinoSelected, padrinoSearch,
    queryMadrina, setQueryMadrina, madrinaSelected, setMadrinaSelected, madrinaSearch,
    queryMinistro, setQueryMinistro, ministroSelected, setMinistroSelected, ministroSearch,
    queryParroquia, setQueryParroquia, parroquiaSelected, setParroquiaSelected, parroquiaSearch,
    queryEsposo, setQueryEsposo, esposoSearch,
    queryEsposa, setQueryEsposa, esposaSearch,

    // Formulario de edición (modal "Buscar / Editar") — estado independiente
    editForm, editMatrimonio,
    handleEditChange, handleEditMatChange, resetEditForm,
    editQueryPersona,
    editQueryPadrino, setEditQueryPadrino, editPadrinoSelected, setEditPadrinoSelected, editPadrinoSearch,
    editQueryMadrina, setEditQueryMadrina, editMadrinaSelected, setEditMadrinaSelected, editMadrinaSearch,
    editQueryMinistro, setEditQueryMinistro, editMinistroSelected, setEditMinistroSelected, editMinistroSearch,
    editQueryParroquia, setEditQueryParroquia, editParroquiaSelected, setEditParroquiaSelected, editParroquiaSearch,
    editQueryEsposo, editEsposoSearch,
    editQueryEsposa, editEsposaSearch,

    // Acciones
    handleSubmitAgregar,
    handleBuscar,
    handleSelectResultado,
    handleGuardarEdicion,
  };
}