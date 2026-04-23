import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPersonas,
  fetchAllPersonas,
  fetchPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  fetchPersonasParaSacramento,
} from './personasThunk';

const initialState = {
  personas: [],
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
};

const personasSlice = createSlice({
  name: 'personas',
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
      // fetchPersonas (paginado)
      .addCase(fetchPersonas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.personas = action.payload.personas;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Error al cargar personas';
      })

      // fetchAllPersonas
      .addCase(fetchAllPersonas.pending, (state) => {
        state.isLoadingAll = true;
        state.error = null;
      })
      .addCase(fetchAllPersonas.fulfilled, (state, action) => {
        state.isLoadingAll = false;
        state.allPersonas = action.payload;
      })
      .addCase(fetchAllPersonas.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.error = action.payload?.message || 'Error al cargar todas las personas';
      })

      // fetchPersonaById 
      .addCase(fetchPersonaById.pending, (state) => {
        state.isLoadingById = true;
        state.error = null;
      })
      .addCase(fetchPersonaById.fulfilled, (state, action) => {
        state.isLoadingById = false;
        state.personaSeleccionada = action.payload;
      })
      .addCase(fetchPersonaById.rejected, (state, action) => {
        state.isLoadingById = false;
        state.error = action.payload?.message || 'Error al cargar la persona';
      })

      // createPersona
      .addCase(createPersona.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.isCreating = false;
        const nueva = action.payload;
        // Si ya hay lista paginada cargada, insertamos al inicio (opcional)
        if (Array.isArray(state.personas)) {
          state.personas = [nueva, ...state.personas];
          state.totalItems = (state.totalItems || 0) + 1;
        }
        state.personaSeleccionada = nueva;
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Error al crear persona';
      })

      // updatePersona
      .addCase(updatePersona.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePersona.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updated = action.payload;
        state.personas = state.personas.map(p => p.id === updated.id ? updated : p);
        if (state.personaSeleccionada?.id === updated.id) {
          state.personaSeleccionada = updated;
        }
      })
      .addCase(updatePersona.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Error al actualizar persona';
      })

      // deletePersona
      .addCase(deletePersona.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePersona.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload.id;
        state.personas = state.personas.filter(p => p.id !== deletedId);
        if (state.personaSeleccionada?.id === deletedId) {
          state.personaSeleccionada = null;
        }
        state.totalItems = Math.max(0, (state.totalItems || 1) - 1);
      })
      .addCase(deletePersona.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Error al eliminar persona';
      })

      
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
  },
});

// Acciones síncronas
export const { clearError, clearPersonaSeleccionada, resetPagination } = personasSlice.actions;

// Selectores
export const selectPersonas = (state) => state.personas.personas;
export const selectTotalItems = (state) => state.personas.totalItems;
export const selectTotalPages = (state) => state.personas.totalPages;
export const selectCurrentPage = (state) => state.personas.currentPage;
export const selectAllPersonas = (state) => state.personas.allPersonas;
export const selectPersonaSeleccionada = (state) => state.personas.personaSeleccionada;

// Para loading maybe borrar si no tiene la wea esa que gira al cargar
export const selectIsLoading = (state) => state.personas.isLoading;
export const selectIsLoadingAll = (state) => state.personas.isLoadingAll;
export const selectIsLoadingById = (state) => state.personas.isLoadingById;
export const selectError = (state) => state.personas.error;
export const selectIsCreating = (state) => state.personas.isCreating;
export const selectIsUpdating = (state) => state.personas.isUpdating;
export const selectIsDeleting = (state) => state.personas.isDeleting;

// Exportar reducer
export const personasReducer = personasSlice.reducer;
export default personasSlice.reducer;