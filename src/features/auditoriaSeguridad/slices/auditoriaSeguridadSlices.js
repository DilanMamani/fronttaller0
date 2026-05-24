import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditoriaSeguridadApi } from '../../../lib/api';

export const fetchAuditoriasSeguridad = createAsyncThunk(
  'auditoriaSeguridad/fetchAuditoriasSeguridad',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = {};

      if (params.startDate)      queryParams.start_date      = params.startDate;
      if (params.endDate)        queryParams.end_date        = params.endDate;
      if (params.username)       queryParams.user_name       = params.username;
      if (params.evento)         queryParams.evento          = params.evento;
      if (params.ipAddress)      queryParams.ip_address      = params.ipAddress;
      if (params.correlationId)  queryParams.correlation_id  = params.correlationId;
      if (params.exitoso !== '')  queryParams.exitoso         = params.exitoso;

      queryParams.page  = params.page  || 1;
      queryParams.limit = params.limit || 10;

      const response = await auditoriaSeguridadApi.fetchAuditoriasSeguridad(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener auditoría de seguridad');
    }
  }
);

const auditoriaSeguriadSlice = createSlice({
  name: 'auditoriaSeguridad',
  initialState: {
    data:           [],
    total:          0,
    currentPage:    1,
    itemsPerPage:   10,
    appliedFilters: {},
    loading:        false,
    error:          null,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage  = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditoriasSeguridad.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAuditoriasSeguridad.fulfilled, (state, action) => {
        state.loading        = false;
        state.data           = action.payload.data            || [];
        state.total          = action.payload.total           || 0;
        state.currentPage    = action.payload.page            || 1;
        state.appliedFilters = action.payload.applied_filters || {};
      })
      .addCase(fetchAuditoriasSeguridad.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.data    = [];
        state.total   = 0;
      });
  },
});

export const { setCurrentPage, setItemsPerPage, clearError } = auditoriaSeguriadSlice.actions;
export const auditoriaSeguriadReducer = auditoriaSeguriadSlice.reducer;
export default auditoriaSeguriadSlice.reducer;