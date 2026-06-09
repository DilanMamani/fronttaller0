import { createSlice } from '@reduxjs/toolkit';
import { fetchModulos } from './modulosThunk';

const initialState = {
  modulos: [],
  isLoading: false,
  error: null,
};

const modulosSlice = createSlice({
  name: 'modulos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModulos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModulos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modulos = action.payload.modulos || action.payload.data || action.payload || [];
      })
      .addCase(fetchModulos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const selectModulos = (state) => state.modulos.modulos;
export const selectModulosLoading = (state) => state.modulos.isLoading;

export default modulosSlice.reducer;
