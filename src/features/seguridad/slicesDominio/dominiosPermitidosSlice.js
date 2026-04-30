import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDominiosPermitidos,
  createDominioPermitido,
  updateDominioPermitido,
  deleteDominioPermitido,
} from './dominiosPermitidosThunk';

const initialState = {
  dominios: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

const dominiosPermitidosSlice = createSlice({
  name: 'dominiosPermitidos',
  initialState,
  reducers: {
    clearDominiosPermitidosError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDominiosPermitidos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDominiosPermitidos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dominios =
          action.payload.dominios ||
          action.payload.data ||
          action.payload ||
          [];
      })
      .addCase(fetchDominiosPermitidos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(createDominioPermitido.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDominioPermitido.fulfilled, (state, action) => {
        state.isCreating = false;
        const nuevo = action.payload.dominio || action.payload.data || action.payload;
        if (nuevo) state.dominios.unshift(nuevo);
      })
      .addCase(createDominioPermitido.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(updateDominioPermitido.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDominioPermitido.fulfilled, (state, action) => {
        state.isUpdating = false;
        const actualizado = action.payload.dominio || action.payload.data || action.payload;

        if (actualizado?.id_dominio) {
          state.dominios = state.dominios.map((d) =>
            d.id_dominio === actualizado.id_dominio ? actualizado : d
          );
        }
      })
      .addCase(updateDominioPermitido.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(deleteDominioPermitido.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteDominioPermitido.fulfilled, (state, action) => {
        state.isDeleting = false;
        const id = action.meta.arg;

        state.dominios = state.dominios.map((d) =>
          d.id_dominio === id ? { ...d, activo: false } : d
        );
      })
      .addCase(deleteDominioPermitido.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { clearDominiosPermitidosError } = dominiosPermitidosSlice.actions;

export const selectDominiosPermitidos = (state) => state.dominiosPermitidos.dominios;
export const selectDominiosPermitidosLoading = (state) => state.dominiosPermitidos.isLoading;
export const selectDominiosPermitidosCreating = (state) => state.dominiosPermitidos.isCreating;
export const selectDominiosPermitidosUpdating = (state) => state.dominiosPermitidos.isUpdating;
export const selectDominiosPermitidosDeleting = (state) => state.dominiosPermitidos.isDeleting;
export const selectDominiosPermitidosError = (state) => state.dominiosPermitidos.error;

export default dominiosPermitidosSlice.reducer;