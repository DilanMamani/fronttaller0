import { createSlice } from '@reduxjs/toolkit';
import { loginUser, verify2FAUser } from './loginThunks';
const initialState = {
  user: {
    uid: '',
    name: '',
    rol: '',
    email: '',
    token: null,
    parroquia: null,
  },
  isLoading: false,
  error: null,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout(state) {
    state.user = { uid: '', name: '', email: '', rol: '', parroquia: null, token: null };
    state.isLoading = false;
    state.error = null;
  },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
  builder
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;

      if (action.payload?.token) {
        state.user = action.payload;
      }
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || {
        message: action.error?.message || 'Error al iniciar sesión',
        type: 'error',
      };
    })

    .addCase(verify2FAUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(verify2FAUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(verify2FAUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || {
        message: action.error?.message || 'Error al verificar código',
        type: 'error',
      };
    });
}
});

export const { logout, clearError } = loginSlice.actions;
export const loginReducer = loginSlice.reducer;

export default loginSlice.reducer;