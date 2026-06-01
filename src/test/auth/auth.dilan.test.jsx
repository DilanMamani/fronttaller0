/**
 * PRUEBA UNITARIA - MÓDULO DE AUTENTICACIÓN
 * ==========================================
 * Autor        : Dilan Mamani
 * Lenguaje     : JavaScript (JSX)
 * Framework    : Vitest + React Testing Library + @testing-library/jest-dom
 *
 * Archivo/clase bajo prueba:
 *
 *  1. src/features/login/components/LoginForm.jsx
 *     → Componente React que renderiza el formulario de inicio de sesión.
 *     Recibe el correo y la contraseña mediante la prop `formData`.
 *     Cuando el usuario presiona el botón "Iniciar Sesión", el componente
 *     ejecuta la función `onSubmit` recibida por props, que representa la
 *     lógica de autenticación del módulo Auth.
 *
 * Caso cubierto:
 *
 *  - Login correcto.
 *
 * Datos usados en la prueba:
 *
 *  - Correo      : dilan.mamani@ucb.edu.bo
 *  - Contraseña  : AVFLash2403.0
 *
 * Estructura de la prueba (TDD):
 *   // === 1. PREPARACIÓN  ===  (Arrange)  datos y mocks necesarios
 *   // === 2. LÓGICA        ===  (Act)      ejecución de la unidad bajo prueba
 *   // === 3. VERIFICACIÓN  ===  (Assert)   comprobación del resultado esperado
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../../features/login/components/LoginForm';

// ---------------------------------------------------------------------------
// Utilidades para construir los datos simulados que espera <LoginForm />
// ---------------------------------------------------------------------------

/** Credenciales asignadas para la prueba de Dilan - Auth. */
const credencialesDilan = {
  email: 'dilan.mamani@ucb.edu.bo',
  password: 'AVFLash2403.0',
};

/**
 * Renderiza <LoginForm /> dentro de MemoryRouter porque el componente usa
 * useNavigate para el enlace de recuperación de contraseña.
 */
const renderLoginForm = (overrides = {}) => {
  const propsBase = {
    onSubmit: vi.fn(),
    formData: { ...credencialesDilan },
    setFormData: vi.fn(),
    showPassword: false,
    setShowPassword: vi.fn(),
    showCaptcha: false,
    setTurnstileToken: vi.fn(),
    isLoading: false,
    captchaVerified: true,
    setCaptchaVerified: vi.fn(),
    requires2FA: false,
    twoFactorCode: '',
    setTwoFactorCode: vi.fn(),
    onVerify2FA: vi.fn(),
    onCancel2FA: vi.fn(),
    blocked: false,
    blockMessage: '',
    ...overrides,
  };

  return render(
    <MemoryRouter>
      <LoginForm {...propsBase} />
    </MemoryRouter>
  );
};

// ===========================================================================
// GRUPO 1 - componente LoginForm
// ===========================================================================

describe('LoginForm - caso de login correcto', () => {

  /**
   * PRUEBA 1
   * Objetivo: verificar que el formulario de autenticación permite realizar
   * un intento de inicio de sesión cuando el usuario ingresa un correo y una
   * contraseña válidos, sin bloqueo activo y sin captcha pendiente.
   */
  it('ejecuta onSubmit al presionar "Iniciar Sesión" con las credenciales de Dilan', () => {

    // === 1. PREPARACIÓN ===
    // Se prepara un mock para representar la lógica de login del módulo Auth.
    // También se cargan las credenciales válidas asignadas a Dilan.
    const onSubmit = vi.fn();

    // === 2. LÓGICA ===
    // Se renderiza el formulario con las credenciales completas y se simula
    // el clic del usuario sobre el botón principal de inicio de sesión.
    renderLoginForm({ onSubmit });
    const botonLogin = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(botonLogin);

    // === 3. VERIFICACIÓN ===
    // El botón debe estar habilitado y el formulario debe llamar exactamente
    // una vez al handler encargado de procesar el login correcto.
    expect(botonLogin).not.toBeDisabled();
    expect(screen.getByLabelText(/Email/i)).toHaveValue(credencialesDilan.email);
    expect(screen.getByLabelText(/Contraseña/i)).toHaveValue(credencialesDilan.password);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

});
