import { createSlice } from '@reduxjs/toolkit';
import { fetchActivos, createActivo, updateActivo, deleteActivo } from './activosThunk';

const activosSlice = createSlice({
  name: 'activos',
  initialState: { activos: [], isLoading: false, isSaving: false, error: null },
  reducers: {
    clearActivosError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivos.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchActivos.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.activos = payload.activos || payload || [];
      })
      .addCase(fetchActivos.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })

      .addCase(createActivo.pending,   (state) => { state.isSaving = true; state.error = null; })
      .addCase(createActivo.fulfilled, (state, { payload }) => {
        state.isSaving = false;
        const nuevo = payload.activo || payload;
        if (nuevo) state.activos = [nuevo, ...state.activos];
      })
      .addCase(createActivo.rejected,  (state, { payload }) => { state.isSaving = false; state.error = payload; })

      .addCase(updateActivo.pending,   (state) => { state.isSaving = true; state.error = null; })
      .addCase(updateActivo.fulfilled, (state, { payload }) => {
        state.isSaving = false;
        const updated = payload.activo || payload;
        if (updated) state.activos = state.activos.map(a => a.id_activo === updated.id_activo ? updated : a);
      })
      .addCase(updateActivo.rejected,  (state, { payload }) => { state.isSaving = false; state.error = payload; })

      .addCase(deleteActivo.pending,   (state) => { state.isSaving = true; state.error = null; })
      .addCase(deleteActivo.fulfilled, (state, { payload: id }) => {
        state.isSaving = false;
        state.activos = state.activos.filter(a => a.id_activo !== id);
      })
      .addCase(deleteActivo.rejected,  (state, { payload }) => { state.isSaving = false; state.error = payload; });
  },
});

export const { clearActivosError } = activosSlice.actions;
export const selectActivos    = (state) => state.activos.activos;
export const selectActivosLoading = (state) => state.activos.isLoading;
export const selectActivosSaving  = (state) => state.activos.isSaving;
export default activosSlice.reducer;
