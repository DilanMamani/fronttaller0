import { createSlice } from '@reduxjs/toolkit';
import {
  fetchParroquias,
  fetchAllParroquias,
  fetchParroquiaById,
} from './parroquiasThunk';

const initialState = {
  parroquias: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,

  allParroquias: [],
  parroquiaSeleccionada: null,

  isLoading: false,
  isLoadingAll: false,
  isLoadingById: false,
  isSaving: false,
  error: null,
};

const parroquiasSlice = createSlice({
  name: 'parroquias',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setParroquiaSeleccionada: (state, action) => {
      state.parroquiaSeleccionada = action.payload;
    },
    clearParroquiaSeleccionada(state) {
      state.parroquiaSeleccionada = null;
    },
    resetPagination(state) {
      state.parroquias = [];
      state.totalItems = 0;
      state.totalPages = 1;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchParroquias (paginado)
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
        state.error = action.payload?.message || 'Error al cargar parroquias';
        state.parroquias = [];
      })

      // 🔹 fetchAllParroquias
      .addCase(fetchAllParroquias.pending, (state) => {
        state.isLoadingAll = true;
        state.error = null;
      })
      .addCase(fetchAllParroquias.fulfilled, (state, action) => {
        state.isLoadingAll = false;
        state.allParroquias = action.payload;
      })
      .addCase(fetchAllParroquias.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.error = action.payload?.message || 'Error al cargar todas las parroquias';
      })

      // 🔹 fetchParroquiaById
      .addCase(fetchParroquiaById.pending, (state) => {
        state.isLoadingById = true;
        state.error = null;
      })
      .addCase(fetchParroquiaById.fulfilled, (state, action) => {
        state.isLoadingById = false;
        const p = action.payload;
        // aceptar {parroquia: {...}}, {data: {...}} o el objeto directo
        state.parroquiaSeleccionada = p?.parroquia || p?.data || p || null;
      })
      .addCase(fetchParroquiaById.rejected, (state, action) => {
        state.isLoadingById = false;
        state.error = action.payload?.message || 'Error al cargar la parroquia';
      })

    
  },
});

// Acciones sincronas
export const { clearError, clearParroquiaSeleccionada, resetPagination , setParroquiaSeleccionada} = parroquiasSlice.actions;

// Selectores
export const selectParroquias = (state) => state.parroquias?.parroquias || []
export const selectTotalItems = (state) => state.parroquias.totalItems;
export const selectTotalPages = (state) => state.parroquias.totalPages;
export const selectCurrentPage = (state) => state.parroquias.currentPage;
export const selectAllParroquias = (state) => state.parroquias?.allParroquias ?? []
export const selectParroquiaSeleccionada = (state) => state.parroquias?.parroquiaSeleccionada ?? null
export const selectIsLoading = (state) => state.parroquias?.isLoading ?? false
export const selectIsLoadingAll = (state) => state.parroquias?.isLoadingAll ?? false
export const selectIsLoadingById = (state) => state.parroquias?.isLoadingById ?? false
export const selectIsSaving = (state) => state.parroquias.isSaving;
export const selectError = (state) => state.parroquias?.error ?? null

// 🚀 Exportar reducer
export const parroquiasReducer = parroquiasSlice.reducer;
export default parroquiasSlice.reducer;
