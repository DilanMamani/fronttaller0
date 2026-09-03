import { useSelector } from 'react-redux';
import {
  selectOcrPaso,
  selectOcrTipoSacramento,
  selectOcrDatosDetectados,
  selectOcrError,
  selectOcrSuccessData,
  selectOcrTipoSacramentoId,
} from '../slices/ocrSlice';

/**
 * Hook ligero que expone el estado del flujo OCR para la vista principal.
 * El error se muestra en línea en cada paso (Paso1Upload, Paso2*, Paso3,
 * OcrHistorico ya lo hacen) — no se duplica en un modal aquí.
 */
export function useOcr() {
  const paso = useSelector(selectOcrPaso);
  const tipoSacramento = useSelector(selectOcrTipoSacramento);
  const datosDetectados = useSelector(selectOcrDatosDetectados);
  const error = useSelector(selectOcrError);
  const successData = useSelector(selectOcrSuccessData);
  const tipoSacramentoId = useSelector(selectOcrTipoSacramentoId);

  return {
    paso,
    tipoSacramento,
    datosDetectados,
    error,
    successData,
    tipoSacramentoId,
  };
}