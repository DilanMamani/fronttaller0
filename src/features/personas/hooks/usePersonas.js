import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { extractError } from '../../../shared/utils/extractError';
import { useEditEntityModal } from '../../../shared/components/pages/EditEntityModal.jsx';
import { personaFields, initialPersonaForm, initialPersonaFilters } from '../config/personasForm.js';

import {
  fetchPersonas,
  fetchAllPersonas,
  fetchPersonaById,
  createPersona,
  updatePersona,
} from '../slices/personasThunk';

import {
  selectIsLoading,
  selectIsLoadingAll,
  selectPersonas,
  selectAllPersonas,
  selectTotalItems,
  selectTotalPages,
  selectCurrentPage,
  selectIsCreating,
  selectIsUpdating,
} from '../slices/personasSlice';

import { buscarPersonasConTodosLosSacramentos } from '../../sacramentos/slices/sacramentosTrunk.js';

// ---------------------------------------------------------------------------
// Hook de búsqueda de encargado con debounce
// ---------------------------------------------------------------------------
function useEncargadoSearch({ query, activeTab }) {
  const dispatch = useDispatch();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (activeTab !== 'encargado') return;
    if (query.trim().length < 2) {
      setLista([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      dispatch(buscarPersonasConTodosLosSacramentos({ sacerdote: false, search: query }))
        .unwrap()
        .then((data) => { setLista(data || []); setOpen(true); })
        .catch(() => setLista([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return { lista, loading, open, setOpen, setLista };
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
export function usePersonas() {
  const dispatch = useDispatch();

  const isLoading    = useSelector(selectIsLoading);
  const isLoadingAll = useSelector(selectIsLoadingAll);
  const personas     = useSelector(selectPersonas);
  const allPersonas  = useSelector(selectAllPersonas);
  const totalItems   = useSelector(selectTotalItems);
  const totalPages   = useSelector(selectTotalPages);
  const currentPage  = useSelector(selectCurrentPage);
  const isCreating   = useSelector(selectIsCreating);
  const isUpdating   = useSelector(selectIsUpdating);
  console.log('PAGINACIÓN:', { totalPages, currentPage, totalItems });

  // --- UI state ---
  const [activeTab, setActiveTab]           = useState('agregar');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [toast, setToast]                   = useState(null);
  const [formAdd, setFormAdd]               = useState({ ...initialPersonaForm });
  const [filters, setFilters]               = useState({ ...initialPersonaFilters });

  // --- Encargado ---
  const [queryEncargado, setQueryEncargado]       = useState('');
  const [encargadoSelected, setEncargadoSelected] = useState(null);
  const encargadoSearch = useEncargadoSearch({ query: queryEncargado, activeTab });

  // --- Modal de edición ---
  const { open: openModal, close: closeModal, modal } = useEditEntityModal();

  // --- Toast auto-dismiss ---
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // --- Carga inicial ---
  useEffect(() => {
    dispatch(fetchPersonas({ page: 1 }));
  }, [dispatch]);


  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const isNonEmpty  = (v) => v !== null && v !== undefined && (typeof v !== 'string' || v.trim() !== '');
  const hasFilters  = Object.values(filters).some(isNonEmpty);

  // Con filtros usa la lista paginada; sin filtros usa allPersonas
  const tableData = personas;
  const loading   = isLoading;

  const ejecutarBusqueda = (filtrosOverride = filters, page = 1) => {
    const cleaned = Object.fromEntries(
      Object.entries(filtrosOverride)
        .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        .filter(([, v]) => isNonEmpty(v))
    );
    dispatch(fetchPersonas({ ...cleaned, page }));
    setSelectedPerson(null);
  };

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    ejecutarBusqueda(filters, 1);
  };

  const handleResetSearch = () => {
    setFilters({ ...initialPersonaFilters });
    setSelectedPerson(null);
    dispatch(fetchPersonas({ page: 1 }));
  };

  const handlePageChange = (newPage) => {
    ejecutarBusqueda(filters, newPage);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const action = await dispatch(createPersona(formAdd));
    if (action.meta.requestStatus === 'fulfilled') {
      setToast({ type: 'success', message: 'Persona creada correctamente.' });
      setFormAdd({ ...initialPersonaForm });
      setSelectedPerson(null);
      dispatch(fetchAllPersonas());
    } else {
      setToast({ type: 'error', message: extractError(action) });
    }
  };

  const handleRowClick = async (id) => {
    openModal({
      title: 'Editar Persona',
      entity: {},
      fields: personaFields,
      loading: true,
      onSave: async () => false,
    });

    const action = await dispatch(fetchPersonaById(id));
    if (action.meta.requestStatus !== 'fulfilled') {
      setToast({ type: 'error', message: extractError(action) });
      closeModal();
      return;
    }

    const persona = action.payload?.persona || action.payload;

    openModal({
      title: 'Editar Persona',
      entity: persona,
      fields: personaFields,
      loading: false,
      isSaving: isUpdating,
      onSave: async (editedPerson) => {
        const personId = editedPerson.id || editedPerson.id_persona;
        const { id, id_persona, ...data } = editedPerson;
        const result = await dispatch(updatePersona({ id: personId, data }));
        if (result.meta.requestStatus === 'fulfilled') {
          setToast({ type: 'success', message: 'Persona actualizada correctamente.' });
          ejecutarBusqueda(filters, currentPage);
          return true;
        }
        setToast({ type: 'error', message: extractError(result) });
        return false;
      },
    });
  };

  const handleSelectEncargado = (persona) => {
    setEncargadoSelected(persona);
    setQueryEncargado(`${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`);
    encargadoSearch.setOpen(false);
  };

  const handleClearEncargado = () => {
    setEncargadoSelected(null);
    setQueryEncargado('');
    encargadoSearch.setLista([]);
    encargadoSearch.setOpen(false);
  };

  return {
    // UI
    activeTab, setActiveTab,
    selectedPerson, setSelectedPerson,
    toast, setToast,
    modal,

    // Tabla y carga
    tableData,
    loading,
    isCreating,
    isUpdating,

    // Paginación
    currentPage,
    totalPages,
    totalItems,
    hasFilters,

    // Formulario alta
    formAdd, setFormAdd,

    // Filtros
    filters, setFilters,

    // Encargado
    queryEncargado, setQueryEncargado,
    encargadoSelected,
    encargadoSearch,
    handleSelectEncargado,
    handleClearEncargado,

    // Acciones
    handleSearch,
    handleResetSearch,
    handlePageChange,
    handleCreate,
    handleRowClick,
  };
}