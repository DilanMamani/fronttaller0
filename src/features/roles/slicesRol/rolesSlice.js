import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRoles,
  fetchRolById,
  createRol,
  updateRol,
} from './rolesThunk';

const initialState = {
  roles: [],
  rolSeleccionado: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearRolSeleccionado: (state) => {
      state.rolSeleccionado = null;
    },
    clearRolesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.roles || action.payload.data || action.payload || [];
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // fetchRolById
      .addCase(fetchRolById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRolById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rolSeleccionado = action.payload.rol || action.payload.data || action.payload;
      })
      .addCase(fetchRolById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // createRol
      .addCase(createRol.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRol.fulfilled, (state, action) => {
        state.isCreating = false;
        const nuevoRol = action.payload.rol || action.payload.data || action.payload;
        if (nuevoRol) state.roles.unshift(nuevoRol);
      })
      .addCase(createRol.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || action.error?.message;
      })

      // updateRol
      .addCase(updateRol.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRol.fulfilled, (state, action) => {
        state.isUpdating = false;
        const actualizado = action.payload.rol || action.payload.data || action.payload;

        if (actualizado?.id_rol) {
          state.roles = state.roles.map((r) =>
            r.id_rol === actualizado.id_rol ? actualizado : r
          );
        }

        state.rolSeleccionado = actualizado;
      })
      .addCase(updateRol.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const {
  clearRolSeleccionado,
  clearRolesError,
} = rolesSlice.actions;

export const selectRoles = (state) => state.roles.roles;
export const selectRolSeleccionado = (state) => state.roles.rolSeleccionado;
export const selectRolesLoading = (state) => state.roles.isLoading;
export const selectRolesCreating = (state) => state.roles.isCreating;
export const selectRolesUpdating = (state) => state.roles.isUpdating;
export const selectRolesError = (state) => state.roles.error;

export default rolesSlice.reducer;