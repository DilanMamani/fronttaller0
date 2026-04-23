import { createSlice } from '@reduxjs/toolkit';
import { loginUser } from './loginThunks';

const initialState = {
  user: {
    uid: '',
    name: '',
    rol: '',
    email: '',
    token: null,
  },
  isLoading: false,
  error: null,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout(state) {
    state.user = { uid: '', name: '', email: '', rol: '', token: null };
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
        state.user = action.payload;
        state.error = null;
    
        const { expiresAt } = action.payload;
    
        // limpiar timeout previo
        if (state.logoutTimeout) clearTimeout(state.logoutTimeout);
    
        const ms = expiresAt - Date.now();
    
        // programar logout exacto
        state.logoutTimeout = setTimeout(() => {
          store.dispatch({ type: 'login/logout' });
        }, ms);
      });
      
  },
});

export const { logout, clearError } = loginSlice.actions;
export const loginReducer = loginSlice.reducer;

export default loginSlice.reducer;