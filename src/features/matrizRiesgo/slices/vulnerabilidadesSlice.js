import { createSlice } from '@reduxjs/toolkit';
import { fetchVulnerabilidades, createVulnerabilidad, updateVulnerabilidad, deleteVulnerabilidad } from './vulnerabilidadesThunk';

const vulnerabilidadesSlice = createSlice({
  name: 'vulnerabilidades',
  initialState: { vulnerabilidades: [], isLoading: false, isSaving: false, error: null },
  reducers: {
    clearVulnerabilidadesError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVulnerabilidades.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchVulnerabilidades.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.vulnerabilidades = payload.vulnerabilidades || payload || [];
      })
      .addCase(fetchVulnerabilidades.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })

      .addCase(createVulnerabilidad.pending,   (state) => { state.isSaving = true; state.error = null; })
      .addCase(createVulnerabilidad.fulfilled, (state, { payload }) => {
        state.isSaving = false;
        const nuevo = payload.vulnerabilidad || payload;
        if (nuevo) state.vulnerabilidades = [nuevo, ...state.vulnerabilidades];
      })
      .addCase(createVulnerabilidad.rejected,  (state, { payload }) => { state.isSaving = false; state.error = payload; })

      .addCase(updateVulnerabilidad.pending,   (state) => { state.isSaving = true; state.error = null; })
      .addCase(updateVulnerabilidad.fulfilled, (state, { payload }) => {
        state.isSaving = false;
        const updated = payload.vulnerabilidad || payload;
        if (updated) state.vulnerabilidades = state.vulnerabilidades.map(v => v.id_vulnerabilidad === updated.id_vulnerabilidad ? updated : v);
      })
      .addCase(updateVulnerabilidad.rejected,  (state, { payload }) => { state.isSaving = false; state.error = payload; })

      .addCase(deleteVulnerabilidad.pending,   (state) => { state.isSaving = true; state.error = null; })
      .addCase(deleteVulnerabilidad.fulfilled, (state, { payload: id }) => {
        state.isSaving = false;
        state.vulnerabilidades = state.vulnerabilidades.filter(v => v.id_vulnerabilidad !== id);
      })
      .addCase(deleteVulnerabilidad.rejected,  (state, { payload }) => { state.isSaving = false; state.error = payload; });
  },
});

export const { clearVulnerabilidadesError } = vulnerabilidadesSlice.actions;
export const selectVulnerabilidades        = (state) => state.vulnerabilidades.vulnerabilidades;
export const selectVulnerabilidadesLoading = (state) => state.vulnerabilidades.isLoading;
export const selectVulnerabilidadesSaving  = (state) => state.vulnerabilidades.isSaving;
export default vulnerabilidadesSlice.reducer;
