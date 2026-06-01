/**
 * PRUEBAS UNITARIAS - MÓDULO DE SACRAMENTOS
 * ============================================
 * Lenguaje     : JavaScript (JSX)
 * Framework    : Vitest + React Testing Library + @testing-library/jest-dom
 *
 * Archivos/clases bajo prueba:
 *
 *  1. src/features/sacramentos/config/sacramentos.constants.js
 *     → obtenerNombreRol(id)
 *     Función pura que recibe el ID numérico de un rol de sacramento
 *     y devuelve su nombre legible (ej. 1 → "Bautizado", 5 → "Padrino").
 *     Si el ID no existe devuelve "Otro".
 *
 *  2. src/shared/components/pages/FormAgregar.jsx
 *     → Componente React que renderiza el formulario de alta de sacramento.
 *     Recibe todo su estado a través de la prop `ctx` (inyectada por
 *     useSacramentos). Calcula internamente si el formulario es válido
 *     (isFormValid) y qué campos faltan (camposFaltantes), y desactiva
 *     el botón "Registrar Sacramento" mientras haya campos requeridos vacíos.
 *
 * Estructura de cada prueba (TDD):
 *   // === 1. PREPARACIÓN  ===  (Arrange)  datos y mocks necesarios
 *   // === 2. LÓGICA        ===  (Act)      ejecución de la unidad bajo prueba
 *   // === 3. VERIFICACIÓN  ===  (Assert)   comprobación del resultado esperado
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { obtenerNombreRol } from '../../features/sacramentos/config/sacramentos.constants';
import FormAgregar from '../../shared/components/pages/FormAgregar';

// ---------------------------------------------------------------------------
// Utilidades para construir el ctx simulado que espera <FormAgregar />
// ---------------------------------------------------------------------------

/** Crea un objeto de búsqueda vacío para los campos de autocompletado. */
const emptySearch = () => ({
  lista: [],
  loading: false,
  open: false,
  setOpen: vi.fn(),
  setLista: vi.fn(),
});

/**
 * Genera un ctx completo con todos los campos vacíos.
 * Se puede sobreescribir parcialmente con el parámetro `overrides`.
 */
const crearCtxVacio = (overrides = {}) => ({
  tipoSacramento: 'bautizo',
  form: {
    personaId: null,
    padrinoId: null,
    ministroId: null,
    parroquiaId: null,
    foja: '',
    numero: '',
    fecha_sacramento: '',
    activo: true,
  },
  matrimonio: {
    esposoId: null,
    esposaId: null,
    lugar_ceremonia: '',
    reg_civil: '',
    numero_acta: '',
  },
  handleChange: vi.fn(),
  handleMatChange: vi.fn(),
  resetForm: vi.fn(),
  handleSubmitAgregar: vi.fn((e) => e.preventDefault()),
  // Persona principal
  queryPersona: '', setQueryPersona: vi.fn(),
  personaSelected: false, setPersonaSelected: vi.fn(),
  personaSearch: emptySearch(),
  // Padrino
  queryPadrino: '', setQueryPadrino: vi.fn(),
  padrinoSelected: false, setPadrinoSelected: vi.fn(),
  padrinoSearch: emptySearch(),
  // Ministro
  queryMinistro: '', setQueryMinistro: vi.fn(),
  ministroSelected: false, setMinistroSelected: vi.fn(),
  ministroSearch: emptySearch(),
  // Parroquia
  queryParroquia: '', setQueryParroquia: vi.fn(),
  parroquiaSelected: false, setParroquiaSelected: vi.fn(),
  parroquiaSearch: emptySearch(),
  // Matrimonio
  queryEsposo: '', setQueryEsposo: vi.fn(), esposoSearch: emptySearch(),
  queryEsposa: '', setQueryEsposa: vi.fn(), esposaSearch: emptySearch(),
  ...overrides,
});

// ===========================================================================
// GRUPO 1 — función pura obtenerNombreRol
// ===========================================================================

describe('obtenerNombreRol — mapeo de ID de rol a nombre legible', () => {

  /**
   * PRUEBA 1
   * Objetivo: verificar que la función devuelve el nombre correcto
   * para cada ID de rol que el sistema maneja (bautizado, padrino,
   * ministro, esposo, esposa, confirmado, comulgado).
   */
  it('devuelve el nombre correcto para todos los IDs de rol conocidos', () => {

    // === 1. PREPARACIÓN ===
    // Tabla de casos esperados según la definición en sacramentos.constants.js
    const casosEsperados = [
      { id: 1, nombreEsperado: 'Bautizado'  },
      { id: 2, nombreEsperado: 'Esposo'     },
      { id: 3, nombreEsperado: 'Esposa'     },
      { id: 4, nombreEsperado: 'Confirmado' },
      { id: 5, nombreEsperado: 'Padrino'    },
      { id: 7, nombreEsperado: 'Ministro'   },
      { id: 8, nombreEsperado: 'Comulgado'  },
    ];

    // === 2. LÓGICA ===
    // Invocar la función con cada ID definido en la tabla
    const resultados = casosEsperados.map(({ id }) => obtenerNombreRol(id));

    // === 3. VERIFICACIÓN ===
    // Cada resultado debe coincidir con el nombre esperado
    casosEsperados.forEach(({ nombreEsperado }, index) => {
      expect(resultados[index]).toBe(nombreEsperado);
    });
  });

  /**
   * PRUEBA 2
   * Objetivo: verificar que la función maneja de forma segura cualquier ID
   * que no exista en el catálogo de roles, devolviendo el valor "Otro"
   * en lugar de lanzar un error o retornar undefined.
   */
  it('devuelve "Otro" cuando el ID de rol no existe en el catálogo', () => {

    // === 1. PREPARACIÓN ===
    // IDs que no están definidos en el sistema
    const idInexistente     = 999;
    const idNegativo        = -1;
    const idCero            = 0;

    // === 2. LÓGICA ===
    const resultadoInexistente = obtenerNombreRol(idInexistente);
    const resultadoNegativo    = obtenerNombreRol(idNegativo);
    const resultadoCero        = obtenerNombreRol(idCero);

    // === 3. VERIFICACIÓN ===
    expect(resultadoInexistente).toBe('Otro');
    expect(resultadoNegativo).toBe('Otro');
    expect(resultadoCero).toBe('Otro');
  });

});

// ===========================================================================
// GRUPO 2 — componente FormAgregar
// ===========================================================================

describe('FormAgregar — formulario de registro de sacramento', () => {

  /**
   * PRUEBA 3
   * Objetivo: verificar que el botón "Registrar Sacramento" aparece
   * deshabilitado cuando el formulario de tipo "bautizo" está completamente
   * vacío, impidiendo envíos accidentales sin datos.
   */
  it('el botón "Registrar Sacramento" está deshabilitado cuando el formulario de bautizo está vacío', () => {

    // === 1. PREPARACIÓN ===
    // ctx con tipoSacramento='bautizo' y todos los campos del form en null/vacío
    const ctx = crearCtxVacio({ tipoSacramento: 'bautizo' });

    // === 2. LÓGICA ===
    render(<FormAgregar ctx={ctx} />);
    const boton = screen.getByRole('button', { name: /Registrar Sacramento/i });

    // === 3. VERIFICACIÓN ===
    // El botón debe estar deshabilitado porque isFormValid es false
    expect(boton).toBeDisabled();
  });

  /**
   * PRUEBA 4
   * Objetivo: verificar que el botón "Registrar Sacramento" se habilita
   * cuando todos los campos obligatorios de un bautizo están completos
   * (personaId, padrinoId, ministroId, parroquiaId, foja, numero,
   * fecha_sacramento).
   */
  it('el botón "Registrar Sacramento" está habilitado cuando todos los campos obligatorios del bautizo están completos', () => {

    // === 1. PREPARACIÓN ===
    // ctx con todos los campos requeridos para bautizo rellenos
    const ctx = crearCtxVacio({
      tipoSacramento: 'bautizo',
      form: {
        personaId:        1,
        padrinoId:        2,
        ministroId:       3,
        parroquiaId:      4,
        foja:             '12-A',
        numero:           '45',
        fecha_sacramento: '2024-05-20',
        activo:           true,
      },
    });

    // === 2. LÓGICA ===
    render(<FormAgregar ctx={ctx} />);
    const boton = screen.getByRole('button', { name: /Registrar Sacramento/i });

    // === 3. VERIFICACIÓN ===
    // Con todos los campos completos, isFormValid es true → botón habilitado
    expect(boton).not.toBeDisabled();
  });

  /**
   * PRUEBA 5
   * Objetivo: verificar que el tooltip del botón deshabilitado lista
   * exactamente los 7 campos obligatorios faltantes cuando el formulario
   * de bautizo está completamente vacío, orientando al usuario sobre
   * qué debe completar.
   */
  it('el tooltip muestra todos los campos obligatorios faltantes cuando el formulario de bautizo está vacío', () => {

    // === 1. PREPARACIÓN ===
    // ctx vacío para bautizo; camposFaltantes debe incluir los 7 campos requeridos
    const ctx = crearCtxVacio({ tipoSacramento: 'bautizo' });
    const camposEsperadosEnTooltip = [
      'Persona',
      'Padrino',
      'Ministro',
      'Parroquia',
      'Foja',
      'Número',
      'Fecha del Sacramento',
    ];

    // === 2. LÓGICA ===
    render(<FormAgregar ctx={ctx} />);

    // === 3. VERIFICACIÓN ===
    // El tooltip se renderiza en el DOM (aunque CSS lo oculte visualmente).
    // Acotamos la búsqueda al contenedor del tooltip para evitar colisiones
    // con los labels del formulario que comparten nombres (ej. "Persona").
    const encabezadoTooltip = screen.getByText('Campos requeridos:');
    const contenedorTooltip = encabezadoTooltip.closest('div');

    camposEsperadosEnTooltip.forEach((campo) => {
      expect(within(contenedorTooltip).getByText(campo)).toBeInTheDocument();
    });
  });

});
