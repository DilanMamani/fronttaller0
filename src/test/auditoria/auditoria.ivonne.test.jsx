//npx vitest src/test/auditoria/auditoria.ivonne.test.jsx

import { describe, test, expect } from 'vitest';
import auditoriaAplicacionReducer, { fetchAuditoriasAplicacion } from '../../features/auditoria/slices/auditoriaSlice';

describe('fetchAuditoriasAplicacion.fulfilled actualiza el estado con la lista de auditorías', () => {
  test('Se debe llenar la data, actualizar el total, la página, los filtros y apagar el loading', () => {

    // 1. Preparación de la prueba
    const estadoPrevio = {
      data:           [],
      total:          0,
      currentPage:    1,
      itemsPerPage:   10,
      appliedFilters: {},
      detalle:        null,
      loading:        true,  // Simulamos que estaba en 'true' por el estado pending previo
      loadingDetalle: false,
      error:          null,
    };

    const mockPayload = {
      data: [
        { id: 1, user_name: 'admin', accion: 'LOGIN' },
        { id: 2, user_name: 'carlos.mendez', accion: 'UPDATE' }
      ],
      total: 2,
      page: 1,
      applied_filters: { user_name: 'admin' }
    };

    const accion = {
      // Usamos .type para obtener el string exacto generado por createAsyncThunk
      type: fetchAuditoriasAplicacion.fulfilled.type, 
      payload: mockPayload,
    };

    // 2. Lógica de la Prueba
    const nuevoEstado = auditoriaAplicacionReducer(estadoPrevio, accion);

    // 3. Verificación (Assert)
    expect(nuevoEstado.loading).toBe(false); // El loading debe apagarse
    expect(nuevoEstado.data).toEqual(mockPayload.data); // La data debe ser igual al payload
    expect(nuevoEstado.data).toHaveLength(2); // Debemos tener 2 elementos en la lista
    expect(nuevoEstado.total).toBe(2); // El total debe actualizarse
    expect(nuevoEstado.currentPage).toBe(1); // La página actual debe ser 1
    expect(nuevoEstado.appliedFilters).toEqual({ user_name: 'admin' }); // Los filtros deben guardarse
  });
});