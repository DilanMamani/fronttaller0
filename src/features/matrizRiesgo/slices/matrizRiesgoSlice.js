import { createSlice } from '@reduxjs/toolkit';
import { fetchRiesgos, createRiesgo, updateRiesgo } from './matrizRiesgoThunk';

const initialState = {
  riesgos: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

const matrizRiesgoSlice = createSlice({
  name: 'matrizRiesgo',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiesgos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiesgos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.riesgos = action.payload.riesgos || [];
      })
      .addCase(fetchRiesgos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error al cargar riesgos';
      })

      .addCase(createRiesgo.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRiesgo.fulfilled, (state, action) => {
        state.isCreating = false;
        const nuevo = action.payload.riesgo || action.payload;
        if (nuevo) state.riesgos = [nuevo, ...state.riesgos];
      })
      .addCase(createRiesgo.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Error al crear riesgo';
      })

      .addCase(updateRiesgo.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRiesgo.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updated = action.payload.riesgo || action.payload;
        if (updated) {
          state.riesgos = state.riesgos.map((r) =>
            r.id_riesgo === updated.id_riesgo ? updated : r
          );
        }
      })
      .addCase(updateRiesgo.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Error al actualizar riesgo';
      });
  },
});

export const { clearError } = matrizRiesgoSlice.actions;

export const selectRiesgos    = (state) => state.matrizRiesgo.riesgos;
export const selectIsLoading  = (state) => state.matrizRiesgo.isLoading;
export const selectIsCreating = (state) => state.matrizRiesgo.isCreating;
export const selectIsUpdating = (state) => state.matrizRiesgo.isUpdating;
export const selectError      = (state) => state.matrizRiesgo.error;

export const matrizRiesgoReducer = matrizRiesgoSlice.reducer;
export default matrizRiesgoSlice.reducer;
