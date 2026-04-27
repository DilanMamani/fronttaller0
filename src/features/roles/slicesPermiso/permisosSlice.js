import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPermisos,
  fetchPermisoById,
  createPermiso,
  updatePermiso,
} from './permisosThunk';

const initialState = {
  permisos: [],
  permisoSeleccionado: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

const permisosSlice = createSlice({
  name: 'permisos',
  initialState,
  reducers: {
    clearPermisoSeleccionado: (state) => {
      state.permisoSeleccionado = null;
    },
    clearPermisosError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPermisos
      .addCase(fetchPermisos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermisos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permisos = action.payload.permisos || action.payload.data || action.payload || [];
      })
      .addCase(fetchPermisos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // fetchPermisoById
      .addCase(fetchPermisoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermisoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permisoSeleccionado = action.payload.permiso || action.payload.data || action.payload;
      })
      .addCase(fetchPermisoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // createPermiso
      .addCase(createPermiso.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPermiso.fulfilled, (state, action) => {
        state.isCreating = false;
        const nuevoPermiso = action.payload.permiso || action.payload.data || action.payload;
        if (nuevoPermiso) state.permisos.unshift(nuevoPermiso);
      })
      .addCase(createPermiso.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || action.error?.message;
      })

      // updatePermiso
      .addCase(updatePermiso.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePermiso.fulfilled, (state, action) => {
        state.isUpdating = false;
        const actualizado = action.payload.permiso || action.payload.data || action.payload;

        if (actualizado?.id_permiso) {
          state.permisos = state.permisos.map((p) =>
            p.id_permiso === actualizado.id_permiso ? actualizado : p
          );
        }

        state.permisoSeleccionado = actualizado;
      })
      .addCase(updatePermiso.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const {
  clearPermisoSeleccionado,
  clearPermisosError,
} = permisosSlice.actions;

export const selectPermisos = (state) => state.permisos.permisos;
export const selectPermisoSeleccionado = (state) => state.permisos.permisoSeleccionado;
export const selectPermisosLoading = (state) => state.permisos.isLoading;
export const selectPermisosCreating = (state) => state.permisos.isCreating;
export const selectPermisosUpdating = (state) => state.permisos.isUpdating;
export const selectPermisosError = (state) => state.permisos.error;

export default permisosSlice.reducer;