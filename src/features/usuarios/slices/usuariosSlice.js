import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsuarios,
  fetchAllUsuarios,
  fetchUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  resetUsuarioPassword,
  changeUsuarioPassword,
  createUsuarioAndSendReset,
} from './usuariosTrunk';

// Re-export thunks so consumers can import from this slice file
export {
  fetchUsuarios,
  fetchAllUsuarios,
  fetchUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  resetUsuarioPassword,
  changeUsuarioPassword,
  createUsuarioAndSendReset,
};


const initialState = {
  usuarios: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,

  allUsuarios: [],
  usuarioSeleccionado: null,

  isLoading: false,
  isLoadingAll: false,
  isLoadingById: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  isResettingPassword: false,
  isChangingPassword: false,
  lastResetEmail: null,
  lastResetResponse: null,
  lastChangeResponse: null,
};

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearUsuarioSeleccionado(state) {
      state.usuarioSeleccionado = null;
    },
    resetPagination(state) {
      state.usuarios = [];
      state.totalItems = 0;
      state.totalPages = 1;
      state.currentPage = 1;
    },
    clearPasswordState(state) {
      state.isResettingPassword = false;
      state.isChangingPassword = false;
      state.lastResetEmail = null;
      state.lastResetResponse = null;
      state.lastChangeResponse = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsuarios (paginado)
      .addCase(fetchUsuarios.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.isLoading = false;
        const p = action.payload;
        const list = Array.isArray(p) ? p : (p?.usuarios || p?.items || []);
        state.usuarios = list;
        state.totalItems = p?.totalItems ?? list.length ?? 0;
        state.totalPages = p?.totalPages ?? 1;
        state.currentPage = p?.currentPage ?? 1;
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Error al cargar Usuarios';
      })

      // fetchAllUsuarios
      .addCase(fetchAllUsuarios.pending, (state) => {
        state.isLoadingAll = true;
        state.error = null;
      })
      .addCase(fetchAllUsuarios.fulfilled, (state, action) => {
        state.isLoadingAll = false;
        state.allUsuarios = action.payload;
      })
      .addCase(fetchAllUsuarios.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.error = action.payload?.message || 'Error al cargar todas las Usuarios';
      })

      // fetchUsuarioById 
      .addCase(fetchUsuarioById.pending, (state) => {
        state.isLoadingById = true;
        state.error = null;
      })
      .addCase(fetchUsuarioById.fulfilled, (state, action) => {
        state.isLoadingById = false;
        state.usuarioSeleccionado = action.payload;
      })
      .addCase(fetchUsuarioById.rejected, (state, action) => {
        state.isLoadingById = false;
        state.error = action.payload?.message || 'Error al cargar la Usuario';
      })

      // createUsuario
      .addCase(createUsuario.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUsuario.fulfilled, (state, action) => {
        state.isCreating = false;
        const nueva = action.payload;
        // Si ya hay lista paginada cargada, insertamos al inicio (opcional)
        if (Array.isArray(state.usuarios)) {
          state.usuarios = [nueva, ...state.usuarios];
          state.totalItems = (state.totalItems || 0) + 1;
        }
        state.usuarioSeleccionado = nueva;
      })
      .addCase(createUsuario.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Error al crear Usuario';
      })

      // updateUsuario
      .addCase(updateUsuario.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUsuario.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updated = action.payload;
        const getId = (x) => x?.id ?? x?.id_usuario;
        const upId = getId(updated);
        state.usuarios = (state.usuarios || []).map(u => (getId(u) === upId ? updated : u));
        if (getId(state.usuarioSeleccionado) === upId) {
          state.usuarioSeleccionado = updated;
        }
      })
      .addCase(updateUsuario.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Error al actualizar Usuario';
      })

      // deleteUsuario
      .addCase(deleteUsuario.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUsuario.fulfilled, (state, action) => {
        state.isDeleting = false;
        const payload = action.payload;
        const getId = (x) => x?.id ?? x?.id_usuario;
        const deletedId = getId(payload) ?? payload;
        state.usuarios = (state.usuarios || []).filter(u => getId(u) !== deletedId);
        if ((state.usuarioSeleccionado && getId(state.usuarioSeleccionado) === deletedId)) {
          state.usuarioSeleccionado = null;
        }
        state.totalItems = Math.max(0, (state.totalItems || 1) - 1);
      })
      .addCase(deleteUsuario.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Error al eliminar Usuario';
      })

      // resetUsuarioPassword
      .addCase(resetUsuarioPassword.pending, (state) => {
        state.isResettingPassword = true;
        state.error = null;
      })
      .addCase(resetUsuarioPassword.fulfilled, (state, action) => {
        state.isResettingPassword = false;
        state.lastResetResponse = action.payload || true;
        if (typeof action.meta?.arg === 'string') state.lastResetEmail = action.meta.arg;
      })
      .addCase(resetUsuarioPassword.rejected, (state, action) => {
        state.isResettingPassword = false;
        state.error = action.payload?.message || action.payload || 'Error al solicitar restablecimiento';
      })

      // changeUsuarioPassword
      .addCase(changeUsuarioPassword.pending, (state) => {
        state.isChangingPassword = true;
        state.error = null;
      })
      .addCase(changeUsuarioPassword.fulfilled, (state, action) => {
        state.isChangingPassword = false;
        state.lastChangeResponse = action.payload?.message || action.payload || 'Contraseña actualizada correctamente';
      })
      .addCase(changeUsuarioPassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.error = action.payload?.message || action.payload || 'Error al cambiar contraseña';
      })

      // createUsuarioAndSendReset
      .addCase(createUsuarioAndSendReset.pending, (state) => {
        state.isCreating = true;
        state.isResettingPassword = true;
        state.error = null;
      })
      .addCase(createUsuarioAndSendReset.fulfilled, (state, action) => {
        state.isCreating = false;
        state.isResettingPassword = false;
        const usuario = action.payload?.usuario;
        if (usuario) {
          state.usuarios = [usuario, ...(state.usuarios || [])];
          state.totalItems = (state.totalItems || 0) + 1;
          state.usuarioSeleccionado = usuario;
          state.lastResetEmail = usuario.email || null;
          state.lastResetResponse = action.payload?.reset || true;
        }
      })
      .addCase(createUsuarioAndSendReset.rejected, (state, action) => {
        state.isCreating = false;
        state.isResettingPassword = false;
        state.error = action.payload?.message || action.payload || 'Error al crear y enviar restablecimiento';
      });
  },
});

// Acciones síncronas
export const { clearError, clearUsuarioSeleccionado, resetPagination, clearPasswordState } = usuariosSlice.actions;

// Selectores
export const selectUsuarios = (state) => state.usuarios.usuarios;
export const selectTotalItems = (state) => state.usuarios.totalItems;
export const selectTotalPages = (state) => state.usuarios.totalPages;
export const selectCurrentPage = (state) => state.usuarios.currentPage;
export const selectAllUsuarios = (state) => state.usuarios.allUsuarios;
export const selectUsuarioSeleccionado = (state) => state.usuarios.usuarioSeleccionado;

// Para loading maybe borrar si no tiene la wea esa que gira al cargar
export const selectIsLoading = (state) => state.usuarios.isLoading;
export const selectIsLoadingAll = (state) => state.usuarios.isLoadingAll;
export const selectIsLoadingById = (state) => state.usuarios.isLoadingById;
export const selectError = (state) => state.usuarios.error;
export const selectIsCreating = (state) => state.usuarios.isCreating;
export const selectIsUpdating = (state) => state.usuarios.isUpdating;
export const selectIsDeleting = (state) => state.usuarios.isDeleting;

export const selectUsuariosIsResettingPassword = (state) => state.usuarios.isResettingPassword;
export const selectUsuariosIsChangingPassword = (state) => state.usuarios.isChangingPassword;
export const selectUsuariosLastResetEmail = (state) => state.usuarios.lastResetEmail;
export const selectUsuariosLastResetResponse = (state) => state.usuarios.lastResetResponse;
export const selectUsuariosLastChangeResponse = (state) => state.usuarios.lastChangeResponse;
export const selectUsuariosError = (state) => state.usuarios.error;

// Exportar reducer
export const usuariosReducer = usuariosSlice.reducer;
export default usuariosSlice.reducer;