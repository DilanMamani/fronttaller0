import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditoriaAplicacionApi } from '../../../lib/api';

// Thunk para obtener auditoría de aplicación
export const fetchAuditoriasAplicacion = createAsyncThunk(
  'auditoriaAplicacion/fetchAuditorias',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = {};

      // Fechas
      if (params.startDate)      queryParams.start_date        = params.startDate;
      if (params.endDate)        queryParams.end_date          = params.endDate;

      // Duración
      if (params.minDuration)    queryParams.min_duration      = params.minDuration;
      if (params.maxDuration)    queryParams.max_duration      = params.maxDuration;

      // Textos
      if (params.username)       queryParams.user_name         = params.username;
      if (params.appName)        queryParams.application_name  = params.appName;
      if (params.endpoint)       queryParams.url               = params.endpoint;
      if (params.userAgent)      queryParams.user_agent        = params.userAgent;

      // HTTP
      if (params.httpMethod)     queryParams.http_method       = params.httpMethod;
      if (params.httpStatus)     queryParams.http_status_code  = params.httpStatus;

      // Red
      if (params.ipAddress)      queryParams.ip_address        = params.ipAddress;
      if (params.correlationId)  queryParams.correlation_id    = params.correlationId;

      // Nuevos filtros de aplicación
      if (params.entidad)        queryParams.entidad           = params.entidad;
      if (params.accion)         queryParams.accion            = params.accion;

      // Excepción
      if (params.hasException !== '') queryParams.has_exception = params.hasException;

      // Paginación
      queryParams.page  = params.page  || 1;
      queryParams.limit = params.limit || 10;

      // ← nuevo endpoint
      const response = await auditoriaAplicacionApi.fetchAuditoriasAplicacion(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener auditoría de aplicación');
    }
  }
);

// Thunk para obtener el detalle de un registro (dato anterior/nuevo/diff)
export const fetchAuditoriaAplicacionDetalle = createAsyncThunk(
  'auditoriaAplicacion/fetchDetalle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await auditoriaAplicacionApi.fetchAuditoriaAplicacionDetalle(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener detalle');
    }
  }
);

const auditoriaAplicacionSlice = createSlice({
  name: 'auditoriaAplicacion',
  initialState: {
    data:           [],
    total:          0,
    currentPage:    1,
    itemsPerPage:   10,
    appliedFilters: {},
    detalle:        null,   // dato_anterior, dato_nuevo, campos_modificados
    loading:        false,
    loadingDetalle: false,
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
    clearDetalle: (state) => {
      state.detalle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Lista
      .addCase(fetchAuditoriasAplicacion.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAuditoriasAplicacion.fulfilled, (state, action) => {
        state.loading         = false;
        state.data            = action.payload.data            || [];
        state.total           = action.payload.total           || 0;
        state.currentPage     = action.payload.page            || 1;
        state.appliedFilters  = action.payload.applied_filters || {};
      })
      .addCase(fetchAuditoriasAplicacion.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.data    = [];
        state.total   = 0;
      })

      // Detalle
      .addCase(fetchAuditoriaAplicacionDetalle.pending, (state) => {
        state.loadingDetalle = true;
      })
      .addCase(fetchAuditoriaAplicacionDetalle.fulfilled, (state, action) => {
        state.loadingDetalle = false;
        state.detalle        = action.payload.data || null;
      })
      .addCase(fetchAuditoriaAplicacionDetalle.rejected, (state, action) => {
        state.loadingDetalle = false;
        state.error          = action.payload;
      });
  },
});

export const { setCurrentPage, setItemsPerPage, clearDetalle, clearError } = auditoriaAplicacionSlice.actions;
export const auditoriaAplicacionReducer = auditoriaAplicacionSlice.reducer;
export default auditoriaAplicacionSlice.reducer;