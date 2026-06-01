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
  const [loadingSacramento, setLoadingSacramento] = useState(false);
  const [results, setResults] = useState([]);

  // --- Formularios ---
  const [form, setForm] = useState({ ...initialSacramentoForm });
  const [matrimonio, setMatrimonio] = useState({ ...initialMatrimonioForm });
  const [filters, setFilters] = useState({ ...initialSacramentoFilters });

  // --- Queries de texto para los campos de búsqueda ---
  const [queryPersona, setQueryPersona] = useState('');
  const [queryPadrino, setQueryPadrino] = useState('');
  const [queryMinistro, setQueryMinistro] = useState('');
  const [queryParroquia, setQueryParroquia] = useState('');
  const [queryEsposo, setQueryEsposo] = useState('');
  const [queryEsposa, setQueryEsposa] = useState('');

  // --- Flags de selección (evitan re-disparar búsquedas al cargar un registro) ---
  const [personaSelected, setPersonaSelected] = useState(false);
  const [padrinoSelected, setPadrinoSelected] = useState(false);
  const [ministroSelected, setMinistroSelected] = useState(false);
  const [parroquiaSelected, setParroquiaSelected] = useState(false);

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
    setQueryMinistro('');
    setQueryParroquia('');
    setQueryEsposo('');
    setQueryEsposa('');
    setPersonaSelected(false);
    setPadrinoSelected(false);
    setMinistroSelected(false);
    setParroquiaSelected(false);
    personaSearch.setOpen(false);
    padrinoSearch.setOpen(false);
    ministroSearch.setOpen(false);
    parroquiaSearch.setOpen(false);
    esposoSearch.setOpen(false);
    esposaSearch.setOpen(false);
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
      const esposoId = matrimonio.esposoId || relOriginalEsposo?.persona_id_persona;
      const esposaId = matrimonio.esposaId || relOriginalEsposa?.persona_id_persona;
      if (esposoId) relaciones.push({ persona_id: esposoId, rol_sacramento_id: ROL_IDS.ESPOSO });
      if (esposaId) relaciones.push({ persona_id: esposaId, rol_sacramento_id: ROL_IDS.ESPOSA });
    } else {
      if (form.personaId) {
        relaciones.push({ persona_id: form.personaId, rol_sacramento_id: ROLES_SACRAMENTO_IDS[tipoSacramento] });
      }
    }

    // Padrino: usa el nuevo si fue seleccionado, si no conserva el original
    const relOriginalPadrino = relacionesOriginales.find(
      (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.PADRINO
    );
    if (form.padrinoId) {
      relaciones.push({ persona_id: form.padrinoId, rol_sacramento_id: ROL_IDS.PADRINO });
    } else if (relOriginalPadrino) {
      relaciones.push({ persona_id: relOriginalPadrino.persona_id_persona, rol_sacramento_id: ROL_IDS.PADRINO });
    }

    // Ministro: igual que padrino
    const relOriginalMinistro = relacionesOriginales.find(
      (r) => r.rolSacramento?.id_rol_sacra === ROL_IDS.MINISTRO
    );
    if (form.ministroId) {
      relaciones.push({ persona_id: form.ministroId, rol_sacramento_id: ROL_IDS.MINISTRO });
    } else if (relOriginalMinistro) {
      relaciones.push({ persona_id: relOriginalMinistro.persona_id_persona, rol_sacramento_id: ROL_IDS.MINISTRO });
    }

    return {
      fecha_sacramento: safe(form.fecha_sacramento),
      foja: safe(form.foja),
      numero: safe(form.numero),
      tipo_sacramento_id_tipo: selectedPerson.tipoSacramento.id_tipo,
      parroquiaId: safe(form.parroquiaId),
      matrimonioDetalle: tipoSacramento === 'matrimonio'
        ? {
            lugar_ceremonia: matrimonio.lugar_ceremonia || undefined,
            reg_civil:        matrimonio.reg_civil        || undefined,
            numero_acta:      matrimonio.numero_acta      || undefined,
          }
        : undefined,
      relaciones,
    };
  };

  // ---------------------------------------------------------------------------
  // Búsqueda programática — puede llamarse con o sin evento de formulario
  // ---------------------------------------------------------------------------
  const ejecutarBusqueda = (filtrosOverride = filters) => {
    setLoadingSacramento(true);
    setSelectedPerson(null);
    dispatch(buscarSacramentos({
      ...filtrosOverride,
      tipo_sacramento_id_tipo: TIPO_SACRAMENTO_IDS[tipoSacramento],
      rol_principal: ROLES_SACRAMENTO_IDS[tipoSacramento],
    }))
      .unwrap()
      .then((res) => {
        const planos = [];
        res.resultados.forEach((sac) => {
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
      })
      .catch(() => setToast({ type: 'error', message: 'No se pudo realizar la búsqueda' }))
      .finally(() => setLoadingSacramento(false));
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
    dispatch(crearSacramentoCompleto(buildPayloadCrear()))
      .unwrap()
      .then(() => {
        setToast({ type: 'success', message: 'Sacramento registrado correctamente' });
        resetForm();
      })
      .catch((err) => {
        const msg = typeof err === 'string' ? err : err?.message || err?.msg || 'Error al registrar sacramento';
        setToast({ type: 'error', message: msg });
      });
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
    const relMinistro  = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.MINISTRO);
    const relEsposo    = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSO);
    const relEsposa    = relaciones.find((r) => r.rol_sacramento_id_rol_sacra === ROL_IDS.ESPOSA);

    const nombreCompleto = (p) => p ? `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}` : '';

    setForm({
      personaId: relPrincipal?.persona_id_persona || row.persona_id || null,
      padrinoId: relPadrino?.persona_id_persona || null,
      ministroId: relMinistro?.persona_id_persona || null,
      parroquiaId: row.parroquia?.id_parroquia || null,
      foja: row.foja || '',
      numero: row.numero || '',
      fecha_sacramento: row.fecha_sacramento || '',
      activo: true,
    });

    // Cargar queries (sin disparar búsqueda porque ponemos selected=true)
    setQueryPersona(nombreCompleto(relPrincipal?.persona));
    setQueryPadrino(nombreCompleto(relPadrino?.persona));
    setQueryMinistro(nombreCompleto(relMinistro?.persona));
    setQueryParroquia(row.parroquia?.nombre || '');

    setPersonaSelected(true);
    setPadrinoSelected(!!relPadrino?.persona);
    setMinistroSelected(!!relMinistro?.persona);
    setParroquiaSelected(!!row.parroquia);

    if (tipoSacramento === 'matrimonio') {
      setQueryEsposo(nombreCompleto(relEsposo?.persona));
      setQueryEsposa(nombreCompleto(relEsposa?.persona));
      setMatrimonio({
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
        resetForm();
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
    resetForm();
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
    loadingSacramento,
    results,
    isLoading,
    isUpdating,

    // Formularios
    form, matrimonio, filters,
    handleChange, handleMatChange, handleFilterChange,
    resetForm, resetFilters,

    // Queries y búsquedas
    queryPersona, setQueryPersona, personaSelected, setPersonaSelected, personaSearch,
    queryPadrino, setQueryPadrino, padrinoSelected, setPadrinoSelected, padrinoSearch,
    queryMinistro, setQueryMinistro, ministroSelected, setMinistroSelected, ministroSearch,
    queryParroquia, setQueryParroquia, parroquiaSelected, setParroquiaSelected, parroquiaSearch,
    queryEsposo, setQueryEsposo, esposoSearch,
    queryEsposa, setQueryEsposa, esposaSearch,

    // Acciones
    handleSubmitAgregar,
    handleBuscar,
    handleSelectResultado,
    handleGuardarEdicion,
  };
}