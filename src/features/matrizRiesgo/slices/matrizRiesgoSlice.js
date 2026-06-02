import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRiesgos, createRiesgo, updateRiesgo, deleteRiesgo,
  publicarRiesgo, createControl, updateControl, deleteControl,
} from './matrizRiesgoThunk';

const initialState = {
  riesgos: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

const patchRiesgo = (riesgos, updated) =>
  riesgos.map((r) => r.id_riesgo === updated.id_riesgo ? updated : r);

const matrizRiesgoSlice = createSlice({
  name: 'matrizRiesgo',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchRiesgos.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchRiesgos.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.riesgos = payload.riesgos || [];
      })
      .addCase(fetchRiesgos.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })

      // create riesgo
      .addCase(createRiesgo.pending,   (state) => { state.isCreating = true; state.error = null; })
      .addCase(createRiesgo.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        const nuevo = payload.riesgo || payload;
        if (nuevo) state.riesgos = [nuevo, ...state.riesgos];
      })
      .addCase(createRiesgo.rejected,  (state, { payload }) => { state.isCreating = false; state.error = payload; })

      // update riesgo
      .addCase(updateRiesgo.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateRiesgo.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const updated = payload.riesgo || payload;
        if (updated) state.riesgos = patchRiesgo(state.riesgos, updated);
      })
      .addCase(updateRiesgo.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // delete riesgo
      .addCase(deleteRiesgo.fulfilled, (state, { payload: id }) => {
        state.riesgos = state.riesgos.filter((r) => r.id_riesgo !== id);
      })

      // publicar
      .addCase(publicarRiesgo.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(publicarRiesgo.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const updated = payload.riesgo || payload;
        if (updated) state.riesgos = patchRiesgo(state.riesgos, updated);
      })
      .addCase(publicarRiesgo.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // create control
      .addCase(createControl.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(createControl.fulfilled, (state, { payload, meta }) => {
        state.isUpdating = false;
        // Si el API devuelve el riesgo completo actualizado, parchamos directamente
        const updatedRiesgo = payload?.riesgo;
        if (updatedRiesgo?.id_riesgo) {
          state.riesgos = patchRiesgo(state.riesgos, updatedRiesgo);
          return;
        }
        // Si el API devuelve solo el control, lo agregamos al array del riesgo
        const { riesgoId } = meta.arg;
        const control = payload?.control || payload;
        if (control?.id_control) {
          const riesgo = state.riesgos.find(r => r.id_riesgo === riesgoId);
          if (riesgo) riesgo.controles = [...(riesgo.controles || []), control];
        }
      })
      .addCase(createControl.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // update control
      .addCase(updateControl.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateControl.fulfilled, (state, { payload, meta }) => {
        state.isUpdating = false;
        const updatedRiesgo = payload?.riesgo;
        if (updatedRiesgo?.id_riesgo) {
          state.riesgos = patchRiesgo(state.riesgos, updatedRiesgo);
          return;
        }
        const { riesgoId, controlId } = meta.arg;
        const control = payload?.control || payload;
        if (control?.id_control) {
          const riesgo = state.riesgos.find(r => r.id_riesgo === riesgoId);
          if (riesgo) {
            riesgo.controles = (riesgo.controles || []).map(c =>
              c.id_control === controlId ? control : c
            );
          }
        }
      })
      .addCase(updateControl.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // delete control — el thunk devuelve { riesgoId, controlId }
      .addCase(deleteControl.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(deleteControl.fulfilled, (state, { payload }) => {
        state.isUpdating = false;
        const { riesgoId, controlId } = payload;
        const riesgo = state.riesgos.find(r => r.id_riesgo === riesgoId);
        if (riesgo) {
          riesgo.controles = (riesgo.controles || []).filter(c => c.id_control !== controlId);
        }
      })
      .addCase(deleteControl.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; });
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
