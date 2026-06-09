import { describe, test, expect } from 'vitest';
import personasReducer from '../../features/personas/slices/personasSlice';

// PRUEBA — createPersona.fulfilled agrega la nueva persona al inicio de la lista
describe('createPersona.fulfilled agrega la nueva persona al inicio de la lista', () => {
  test('Se debe insertar la persona al inicio, aumentar totalItems y setearla como seleccionada', () => {

    // 1. Preparación de la prueba
    const estadoPrevio = {
      personas: [
        {
          id_persona:       1,
          nombre:           'Juan',
          apellido_paterno: 'Pérez',
          apellido_materno: 'López',
          carnet_identidad: '1234567',
        },
        {
          id_persona:       2,
          nombre:           'María',
          apellido_paterno: 'Flores',
          apellido_materno: 'Quispe',
          carnet_identidad: '7654321',
        },
      ],
      totalItems:           2,
      totalPages:           1,
      currentPage:          1,
      allPersonas:          [],
      personaSeleccionada:  null,
      isLoading:            false,
      isLoadingAll:         false,
      isLoadingById:        false,
      isCreating:           false,
      isUpdating:           false,
      isDeleting:           false,
      error:                null,
    };

    const nuevaPersona = {
      id_persona:       3,
      nombre:           'Carlos Andres',
      apellido_paterno: 'Mamani',
      apellido_materno: 'Condori',
      carnet_identidad: '9876543',
      fecha_nacimiento: '1995-08-15',
      lugar_nacimiento: 'La Paz',
      nombre_padre:     'Pedro Mamani',
      nombre_madre:     'Rosa Condori',
      estado:           'soltero',
    };

    const accion = {
      type:    'personas/createPersona/fulfilled',
      payload: nuevaPersona,
    };

    // 2. Lógica de la Prueba
    const nuevoEstado = personasReducer(estadoPrevio, accion);

    // 3. Verificación (Assert)
    expect(nuevoEstado.isCreating).toBe(false);
    expect(nuevoEstado.personas[0]).toEqual(nuevaPersona);          // insertada al inicio
    expect(nuevoEstado.personas).toHaveLength(3);                   // lista creció en 1
    expect(nuevoEstado.totalItems).toBe(3);                         // contador actualizado
    expect(nuevoEstado.personaSeleccionada).toEqual(nuevaPersona);  // queda seleccionada
  });
});