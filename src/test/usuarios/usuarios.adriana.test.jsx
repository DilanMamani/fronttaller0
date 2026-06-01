import { describe, test, expect } from 'vitest';
import usuariosReducer from '../../features/usuarios/slices/usuariosSlice';

// PRUEBA 1 — createUsuario.fulfilled agrega el nuevo usuario al inicio de la lista
describe('createUsuario.fulfilled agrega el nuevo usuario al inicio de la lista', () => {
  test('Se debe insertar el usuario al inicio, aumentar totalItems y setearlo como seleccionado', () => {

    // 1. Preparación de la prueba
    const estadoPrevio = {
      usuarios: [
        { id_usuario: 1, nombre: 'Carlos', apellido_paterno: 'Mendez', email: 'carlos.mendez@ucb.edu.bo' },
        { id_usuario: 2, nombre: 'Ana',    apellido_paterno: 'Torres', email: 'ana.torres@ucb.edu.bo'   },
      ],
      totalItems:          2,
      totalPages:          1,
      currentPage:         1,
      allUsuarios:         [],
      usuarioSeleccionado: null,
      isLoading:           false,
      isLoadingAll:        false,
      isLoadingById:       false,
      isCreating:          false,
      isUpdating:          false,
      isDeleting:          false,
      error:               null,
      isResettingPassword: false,
      isChangingPassword:  false,
      lastResetEmail:      null,
      lastResetResponse:   null,
      lastChangeResponse:  null,
    };

    const nuevoUsuario = {
      id_usuario:       3,
      nombre:           'Isabel Antonella',
      apellido_paterno: 'Rocha',
      apellido_materno: 'Vedia',
      email:            'isabel.rocha.v@ucb.edu.bo',
    };

    const accion = {
      type:    'usuarios/createUsuario/fulfilled',
      payload: nuevoUsuario,
    };

    // 2. Lógica de la Prueba
    const nuevoEstado = usuariosReducer(estadoPrevio, accion);

    
    // 3. Verificación (Assert)
    expect(nuevoEstado.isCreating).toBe(false);
    expect(nuevoEstado.usuarios[0]).toEqual(nuevoUsuario);         
    expect(nuevoEstado.usuarios).toHaveLength(3);                  
    expect(nuevoEstado.totalItems).toBe(3);                        
    expect(nuevoEstado.usuarioSeleccionado).toEqual(nuevoUsuario); 
  });
});