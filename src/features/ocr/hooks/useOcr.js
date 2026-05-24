import { useSelector } from 'react-redux';
import {
  selectOcrPaso,
  selectOcrTipoSacramento,
  selectOcrDatosDetectados,
  selectOcrError,
  selectOcrSuccessData,
  selectOcrTipoSacramentoId
} from '../slices/ocrSlice';
 
/**
 * Hook ligero que expone el estado del flujo OCR para la vista principal.
 * La lógica pesada (thunks) se despacha directamente desde los componentes
 * de cada paso para mantener el aislamiento.
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