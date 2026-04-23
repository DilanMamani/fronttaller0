import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPersonasParaSacramento,
  fetchParroquias,  // búsqueda filtrada por rol sacramento
  crearSacramentoCompleto, // nuevo sacramento con todas sus relaciones
  actualizarSacramentoCompleto, // actualizar sacramento completo
  buscarSacramentos, // buscar sacramentos
  fetchSacramentoCompleto, // obtener información completa de un sacramento
  buscarPersonasConTodosLosSacramentos,
  
} from './sacramentosTrunk';

const initialState = {
  personas: [],          // paginado normal
  personasBusqueda: [],  // resultados del autocomplete sacramentos
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,

  allPersonas: [],
  personaSeleccionada: null,

  isLoading: false,
  isLoadingAll: false,
  isLoadingById: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  //todo lo que tenga que ver con parroquias
    parroquias: [],
  //para buscar sacramentos
  sacramentosEncontrados: [],
  personasConTodos: [],
  sacramentoSeleccionado: null,
};

const sacramentosSlice = createSlice({
  name: 'sacramentos',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearPersonaSeleccionada(state) {
      state.personaSeleccionada = null;
    },
    resetPagination(state) {
      state.personas = [];
      state.totalItems = 0;
      state.totalPages = 1;
      state.currentPage = 1;
    },
  },

  extraReducers: (builder) => {
  builder
    // 🔵 Buscar personas para sacramento
    .addCase(fetchPersonasParaSacramento.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.personasBusqueda = [];
    })
    .addCase(fetchPersonasParaSacramento.fulfilled, (state, action) => {
      state.isLoading = false;
      state.personasBusqueda = action.payload.personas;
    })
    .addCase(fetchPersonasParaSacramento.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Error al buscar personas';
    })

    //  Buscar parroquias
    .addCase(fetchParroquias.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchParroquias.fulfilled, (state, action) => {
      state.isLoading = false;
      const p = action.payload;
      const list = Array.isArray(p) ? p : (p?.parroquias || p?.items || []);
      state.parroquias = list;
      state.totalItems = p?.totalItems ?? list.length ?? 0;
      state.totalPages = p?.totalPages ?? 1;
      state.currentPage = p?.currentPage ?? 1;
    })
    .addCase(fetchParroquias.rejected, (state, action) => {
      state.isLoading = false;
      state.parroquias = [];
      state.error = action.payload?.message || 'Error al cargar parroquias';
    })

    // Crear sacramento completo
    .addCase(crearSacramentoCompleto.pending, (state) => {
      state.isCreating = true;
      state.error = null;
    })
    .addCase(crearSacramentoCompleto.fulfilled, (state, action) => {
      state.isCreating = false;
      // podrías guardar el sacramento creado si quieres
      state.lastCreated = action.payload.sacramento;
    })
    .addCase(crearSacramentoCompleto.rejected, (state, action) => {
      state.isCreating = false;
      state.error = action.payload || 'Error al crear sacramento';
    })

    // 🔵 Buscar sacramentos
    .addCase(buscarSacramentos.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(buscarSacramentos.fulfilled, (state, action) => {
      state.isLoading = false;
      state.sacramentosEncontrados = action.payload.items || [];
    })
    .addCase(buscarSacramentos.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Error al buscar sacramentos';
    })

    // 🔵 Obtener sacramento completo (para editar)
    .addCase(fetchSacramentoCompleto.pending, (state) => {
      state.isLoadingById = true;
      state.error = null;
    })
    .addCase(fetchSacramentoCompleto.fulfilled, (state, action) => {
      state.isLoadingById = false;
      state.sacramentoSeleccionado = action.payload.sacramento || null;
    })
    .addCase(fetchSacramentoCompleto.rejected, (state, action) => {
      state.isLoadingById = false;
      state.error = action.payload || 'Error al cargar sacramento';
    })

    // 🔵 Buscar personas con bautizo + comunión + matrimonio
    .addCase(buscarPersonasConTodosLosSacramentos.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.personasConTodos = [];
    })
    .addCase(buscarPersonasConTodosLosSacramentos.fulfilled, (state, action) => {
      state.isLoading = false;
      state.personasConTodos = action.payload.personas || [];
    })
    .addCase(buscarPersonasConTodosLosSacramentos.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Error al buscar personas con todos los sacramentos';
    })
    

}
});


export const {
  clearError,
  clearPersonaSeleccionada,
  resetPagination,
} = sacramentosSlice.actions;

export const selectPersonas = (state) => state.personas.personas;
export const selectPersonasBusqueda = (state) => state.personas.personasBusqueda;
export const selectParroquias = (state) => state.personas.parroquias;



export const selectIsLoading = (state) => state.personas.isLoading;
export const selectIsLoadingAll = (state) => state.personas.isLoadingAll;
export const selectIsLoadingById = (state) => state.personas.isLoadingById;
export const selectError = (state) => state.personas.error;
export const selectIsCreating = (state) => state.personas.isCreating;
export const selectIsUpdating = (state) => state.personas.isUpdating;
export const selectIsDeleting = (state) => state.personas.isDeleting;
export const selectSacramentosEncontrados = (state) => state.personas.sacramentosEncontrados;
export const selectSacramentoSeleccionado = (state) => state.personas.sacramentoSeleccionado;
export const selectPersonasConTodos = (state) => state.personas.personasConTodos;

export const sacramentosReducer = sacramentosSlice.reducer;
export default sacramentosSlice.reducer;