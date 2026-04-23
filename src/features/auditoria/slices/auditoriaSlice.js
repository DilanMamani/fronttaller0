import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditoriaApi } from '../../../lib/api';

// Thunk para obtener auditorías con filtros y paginación
export const fetchAuditorias = createAsyncThunk(
  'auditoria/fetchAuditorias',
  async (params, { rejectWithValue }) => {
    try {
      // Construir parámetros de query según el backend
      const queryParams = {};
      
      // Fechas
      if (params.startDate) queryParams.start_date = params.startDate;
      if (params.endDate) queryParams.end_date = params.endDate;
      
      // Duración
      if (params.minDuration) queryParams.min_duration = params.minDuration;
      if (params.maxDuration) queryParams.max_duration = params.maxDuration;
      
      // Textos de búsqueda
      if (params.nombre_usuario) queryParams.nombre_usuario= params.nombre_usuario;//Provisional mientras dilan manda nombre en bd
      if (params.username) queryParams.user_name = params.username;
      if (params.appName) queryParams.application_name = params.appName;
      if (params.endpoint) queryParams.url = params.endpoint;
      if (params.userAgent) queryParams.user_agent = params.userAgent;
      
      // Método y status HTTP
      if (params.httpMethod) queryParams.http_method = params.httpMethod;
      if (params.httpStatus) queryParams.http_status_code = params.httpStatus;
      
      // IP y correlación
      
      //if (params.cambio) queryParams.cambio = params.cambio;//Provisional mientras dilan manda nombre en bd
      if (params.ipAddress) queryParams.ip_address = params.ipAddress; //Deshabilitado temporalmente en ya que no sacamos ip :P
      if (params.correlationId) queryParams.correlation_id = params.correlationId;
      
      // Excepción
      if (params.hasException !== '') queryParams.has_exception = params.hasException;
      
      // Paginación
      queryParams.page = params.page || 1;
      queryParams.limit = params.limit || 10;
      
      const response = await auditoriaApi.fetchAuditorias(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener auditorías');
    }
  }
);

// Slice
const auditoriaSlice = createSlice({
  name: 'auditoria',
  initialState: {
    data: [],
    total: 0,
    currentPage: 1,
    itemsPerPage: 10,
    appliedFilters: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset a primera página
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditorias.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.appliedFilters = action.payload.applied_filters || {};
      })
      .addCase(fetchAuditorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
        state.total = 0;
      });
  },
});

export const { setCurrentPage, setItemsPerPage, clearError } = auditoriaSlice.actions;
export const auditoriaReducer = auditoriaSlice.reducer;
export default auditoriaSlice.reducer;