import { createSlice } from '@reduxjs/toolkit';
import {
  fetchConfiguracionSeguridad,
  updateConfiguracionSeguridad,
} from './configuracionSeguridadThunk';

const initialState = {
  config: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

const configuracionSeguridadSlice = createSlice({
  name: 'configuracionSeguridad',
  initialState,
  reducers: {
    clearConfigSeguridadError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfiguracionSeguridad.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfiguracionSeguridad.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config =
          action.payload.config ||
          action.payload.configuracion ||
          action.payload.data ||
          action.payload;
      })
      .addCase(fetchConfiguracionSeguridad.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(updateConfiguracionSeguridad.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateConfiguracionSeguridad.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.config =
          action.payload.config ||
          action.payload.configuracion ||
          action.payload.data ||
          action.payload;
      })
      .addCase(updateConfiguracionSeguridad.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { clearConfigSeguridadError } = configuracionSeguridadSlice.actions;

export const selectConfigSeguridad = (state) => state.configuracionSeguridad.config;
export const selectConfigSeguridadLoading = (state) => state.configuracionSeguridad.isLoading;
export const selectConfigSeguridadUpdating = (state) => state.configuracionSeguridad.isUpdating;
export const selectConfigSeguridadError = (state) => state.configuracionSeguridad.error;

export default configuracionSeguridadSlice.reducer;