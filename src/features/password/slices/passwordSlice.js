import { createSlice } from '@reduxjs/toolkit';
import { solicitarReset, validarToken, cambiarPassword } from '../thunks/passwordThunks';

const initialState = {
  email: '',
  token: '',
  purpose: '',
  isLoading: false,
  error: null,
  success: false,
};

const passwordSlice = createSlice({
  name: 'password',
  initialState,
  reducers: {
    resetPasswordState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Solicitar
      .addCase(solicitarReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(solicitarReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(solicitarReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.msg;
      })

      // Validar
      .addCase(validarToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validarToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.email = action.payload.email;
        state.purpose = action.payload.purpose;
      })
      .addCase(validarToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.msg;
      })

      // Cambiar
      .addCase(cambiarPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cambiarPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
        state.token = '';
      })
      .addCase(cambiarPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.msg;
      });
  },
});

export { solicitarReset, validarToken, cambiarPassword };

export const { resetPasswordState } = passwordSlice.actions;
export const passwordReducer = passwordSlice.reducer;
export default passwordSlice.reducer;