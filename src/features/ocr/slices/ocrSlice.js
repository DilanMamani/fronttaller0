import { createSlice } from '@reduxjs/toolkit';
import { extraerMensaje } from '../../../store/middleware/ocrErrorMiddleware';
import {
  uploadOcrPreview,
  asignarParroquiaOcr,
  crearParroquiaOcr,
  confirmarOcr,
  rechazarOcr,
  fetchOcrHistorico,
} from './ocrThunk';

// Mapa canónico de tipos de sacramento (coincide con el backend)
// 1 = Bautismo, 2 = Matrimonio, 3 = Primera Comunión
const TIPO_ID_MAP = {
  1: 'bautismo',
  2: 'matrimonio',
  3: 'primera_comunion',
};

const initialState = {
  // ── Flujo activo ──────────────────────────────────────────────
  paso: 1,
  historicoId: null,
  tipoSacramento: '',
  tipoSacramentoId: null,
  parroquiaId: null,
  datosDetectados: null,
  requiereConfirmacionParroquia: false,

  // ── Histórico (server-side pagination) ────────────────────────
  historico: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,

  // ── Loading flags ─────────────────────────────────────────────
  isUploading: false,
  isConfirming: false,
  isRechazando: false,
  isLoadingHistorico: false,
  isSavingParroquia: false,

  // ── Errores ───────────────────────────────────────────────────
  error: null,
  successData: null,
  activeTab: 'registrar',
};

const ocrSlice = createSlice({
  name: 'ocr',
  initialState,
  reducers: {
    resetFlujo(state) {
      state.paso = 1;
      state.historicoId = null;
      state.tipoSacramento = '';
      state.tipoSacramentoId = null;
      state.parroquiaId = null;
      state.datosDetectados = null;
      state.requiereConfirmacionParroquia = false;
      state.error = null;
      state.successData = null;
    },
    setPaso(state, action) {
      state.paso = action.payload;
    },
    setParroquiaId(state, action) {
      state.parroquiaId = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setTipoSacramentoId(state, action) {
      state.tipoSacramentoId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },

    /**
     * Reanuda el flujo OCR desde un registro histórico.
     * esperando_parroquia → paso 3
     * pendiente           → paso 2
     */
    reanudarFlujo(state, action) {
      const item = action.payload;
      state.error = null;
      state.successData = null;
      state.historicoId = item.id;
      state.datosDetectados = item.datos_extraidos ?? null;
      state.parroquiaId = item.institucion_parroquia_id ?? null;

      const tipoId = item.tipo_sacramento_id ?? item.tipoSacramento?.id_tipo ?? null;
      state.tipoSacramentoId = tipoId;
      state.tipoSacramento = tipoId ? (TIPO_ID_MAP[tipoId] ?? '') : '';

      if (item.estado === 'esperando_parroquia') {
        state.requiereConfirmacionParroquia = true;
        state.paso = 3;
      } else {
        // pendiente → ir a revisar datos
        state.requiereConfirmacionParroquia = false;
        state.paso = 2;
      }

      state.activeTab = 'registrar';
    },
  },

  extraReducers: (builder) => {
    builder
      // ── PASO 1: Subir imagen OCR ─────────────────────────────
      .addCase(uploadOcrPreview.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadOcrPreview.fulfilled, (state, action) => {
        state.isUploading = false;
        const payload = action.payload;

        state.historicoId = payload.historico_id ?? payload.historicoId ?? null;
        state.datosDetectados = payload.datos_ocr ?? payload.datosDetectados ?? null;

        if (payload.tipo_sacramento_id != null) {
          state.tipoSacramentoId = payload.tipo_sacramento_id;
          state.tipoSacramento = TIPO_ID_MAP[payload.tipo_sacramento_id] ?? '';
        }

        state.requiereConfirmacionParroquia = !!payload.requiere_confirmacion_parroquia;
        state.paso = payload.requiere_confirmacion_parroquia ? 3 : 2;
      })
      .addCase(uploadOcrPreview.rejected, (state, action) => {
        state.isUploading = false;
        state.error = state.error = extraerMensaje(action.payload);
      })

      // ── PASO 3a: Asignar parroquia existente ─────────────────
      .addCase(asignarParroquiaOcr.pending, (state) => {
        state.isSavingParroquia = true;
        state.error = null;
      })
      .addCase(asignarParroquiaOcr.fulfilled, (state) => {
        state.isSavingParroquia = false;
        state.paso = 2;
      })
      .addCase(asignarParroquiaOcr.rejected, (state, action) => {
        state.isSavingParroquia = false;
        state.error = extraerMensaje(action.payload) || 'Error al asignar parroquia';
      })

      // ── PASO 3b: Crear y asignar nueva parroquia ─────────────
      .addCase(crearParroquiaOcr.pending, (state) => {
        state.isSavingParroquia = true;
        state.error = null;
      })
      .addCase(crearParroquiaOcr.fulfilled, (state, action) => {
        state.isSavingParroquia = false;
        state.parroquiaId = action.payload?.parroquia?.id_parroquia || null;
        state.paso = 2;
      })
      .addCase(crearParroquiaOcr.rejected, (state, action) => {
        state.isSavingParroquia = false;
        state.error = extraerMensaje(action.payload) || 'Error al crear parroquia';
      })

      // ── PASO 4: Confirmar sacramento ─────────────────────────
      .addCase(confirmarOcr.pending, (state) => {
        state.isConfirming = true;
        state.error = null;
      })
      .addCase(confirmarOcr.fulfilled, (state, action) => {
        state.isConfirming = false;
        state.successData = action.payload;
        state.paso = 'success';
      })
      .addCase(confirmarOcr.rejected, (state, action) => {
        state.isConfirming = false;
        state.error = extraerMensaje(action.payload);
      })

      // ── Rechazar ─────────────────────────────────────────────
      .addCase(rechazarOcr.pending, (state) => {
        state.isRechazando = true;
        state.error = null;
      })
      .addCase(rechazarOcr.fulfilled, (state) => {
        state.isRechazando = false;
        state.paso = 1;
        state.historicoId = null;
        state.datosDetectados = null;
      })
      .addCase(rechazarOcr.rejected, (state, action) => {
        state.isRechazando = false;
        state.error = extraerMensaje(action.payload);
      })

      // ── Histórico ─────────────────────────────────────────────
      .addCase(fetchOcrHistorico.pending, (state) => {
        state.isLoadingHistorico = true;
        state.error = null;
      })
      .addCase(fetchOcrHistorico.fulfilled, (state, action) => {
        state.isLoadingHistorico = false;
        state.historico = action.payload.historico || action.payload.items || [];
        state.totalItems = action.payload.totalItems ?? 0;
        state.totalPages = action.payload.totalPages ?? 1;
        state.currentPage = action.payload.currentPage ?? 1;
      })
      .addCase(fetchOcrHistorico.rejected, (state, action) => {
        state.isLoadingHistorico = false;
        state.error = extraerMensaje(action.payload) || 'Error al cargar histórico';
      })
  },
});

export const {
  resetFlujo,
  setPaso,
  setParroquiaId,
  clearError,
  setActiveTab,
  setTipoSacramentoId,
  reanudarFlujo,
} = ocrSlice.actions;

// ── Selectores ────────────────────────────────────────────────────────────────
export const selectOcrPaso = (state) => state.ocr.paso;
export const selectOcrHistoricoId = (state) => state.ocr.historicoId;
export const selectOcrDatosDetectados = (state) => state.ocr.datosDetectados;
export const selectOcrTipoSacramento = (state) => state.ocr.tipoSacramento;
export const selectOcrTipoSacramentoId = (state) => state.ocr.tipoSacramentoId;
export const selectOcrParroquiaId = (state) => state.ocr.parroquiaId;
export const selectOcrRequiereParroquia = (state) => state.ocr.requiereConfirmacionParroquia;
export const selectOcrError = (state) => state.ocr.error;
export const selectOcrSuccessData = (state) => state.ocr.successData;
export const selectOcrIsUploading = (state) => state.ocr.isUploading;
export const selectOcrIsConfirming = (state) => state.ocr.isConfirming;
export const selectOcrIsRechazando = (state) => state.ocr.isRechazando;
export const selectOcrIsSavingParroquia = (state) => state.ocr.isSavingParroquia;
export const selectOcrHistorico = (state) => state.ocr.historico;
export const selectOcrIsLoadingHistorico = (state) => state.ocr.isLoadingHistorico;
export const selectOcrTotalItems = (state) => state.ocr.totalItems;
export const selectOcrTotalPages = (state) => state.ocr.totalPages;
export const selectOcrCurrentPage = (state) => state.ocr.currentPage;

export { ocrSlice };
export const ocrReducer = ocrSlice.reducer;
export default ocrSlice.reducer;
