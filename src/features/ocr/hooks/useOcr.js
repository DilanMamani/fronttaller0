import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import {
  selectOcrPaso,
  selectOcrTipoSacramento,
  selectOcrDatosDetectados,
  selectOcrError,
  selectOcrSuccessData,
  selectOcrTipoSacramentoId,
  clearError,
} from '../slices/ocrSlice';

/**
 * Hook ligero que expone el estado del flujo OCR para la vista principal.
 * Muestra automáticamente un SweetAlert2 cuando el slice registra un error
 * y lo limpia del store al cerrarlo.
 */
export function useOcr() {
  const dispatch = useDispatch();

  const paso = useSelector(selectOcrPaso);
  const tipoSacramento = useSelector(selectOcrTipoSacramento);
  const datosDetectados = useSelector(selectOcrDatosDetectados);
  const error = useSelector(selectOcrError);
  const successData = useSelector(selectOcrSuccessData);
  const tipoSacramentoId = useSelector(selectOcrTipoSacramentoId);

  useEffect(() => {
    if (!error) return;

    Swal.fire({
      icon: 'error',
      title: 'Error del sistema',
      text: typeof error === 'string' ? error : 'Ocurrió un error inesperado.',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#d33',
    }).then(() => {
      dispatch(clearError());
    });
  }, [error, dispatch]);

  return {
    paso,
    tipoSacramento,
    datosDetectados,
    error,
    successData,
    tipoSacramentoId,
  };
}