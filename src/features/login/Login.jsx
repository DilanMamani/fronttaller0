// src/features/login/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { loginUser, verify2FAUser } from './slices/loginThunks';
import { clearError } from './slices/loginSlice';
import {
  selectIsLoading,
  selectUser,
} from './slices/loginSelectors';

import { getDefaultRoute } from '../../shared/config/roleConfig';
import { seguridadApi } from '../../lib/api';

import LoginPanel from './components/LoginPanel';
import LoginForm from './components/LoginForm';
import HeroPanel from './components/HeroPanel';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [token2FA, setToken2FA] = useState('');

  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const resp = await seguridadApi.fetchConfiguracion();
        const config = resp?.configuracion || resp;

        const usaCaptcha =
          config?.usa_captcha === true ||
          config?.usa_captcha === 'true' ||
          config?.usa_captcha === 1 ||
          config?.usa_captcha === '1';

        setShowCaptcha(usaCaptcha);
        setCaptchaVerified(!usaCaptcha);
      } catch (error) {
        console.error('Error cargando configuración de seguridad:', error);
        setShowCaptcha(false);
        setCaptchaVerified(true);
      }
    };

    cargarConfiguracion();
  }, []);

  useEffect(() => {
    if (user?.token && !requires2FA) {
      const defaultRoute = getDefaultRoute(user.rol);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, navigate, requires2FA]);

  const reset2FAStates = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setToken2FA('');
  };

  const resetErrorStates = () => {
    setBlocked(false);
    setBlockMessage('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    resetErrorStates();

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor ingrese email y contraseña',
      });
      return;
    }

    if (showCaptcha && !captchaVerified) {
      Swal.fire({
        icon: 'warning',
        title: 'Verificación requerida',
        text: 'Complete la verificación captcha antes de iniciar sesión.',
      });
      return;
    }

    const result = await dispatch(
      loginUser({
        ...formData,
        turnstileToken: showCaptcha ? turnstileToken : null,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      const data = result.payload;

      if (data?.requiere2FA) {
        setRequires2FA(true);
        setToken2FA(data.token2FA);
        setTwoFactorCode('');

        Swal.fire({
          icon: 'info',
          title: 'Verificación en dos pasos',
          text: `Se envió un código de verificación al correo ${formData.email}`,
        });

        return;
      }

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${data.name || data.nombre || 'Usuario'}`,
        timer: 1500,
        showConfirmButton: false,
      });

      const defaultRoute = getDefaultRoute(data.rol);
      navigate(defaultRoute, { replace: true });
      return;
    }

    const errorData = result.payload || {};

    if (errorData.blocked || errorData.status === 403) {
      setBlocked(true);
      setBlockMessage(errorData.message || errorData.msg || 'Tu cuenta está bloqueada.');
    }

    Swal.fire({
      icon: errorData.type || 'error',
      title: 'Error al iniciar sesión',
      text: errorData.message || errorData.msg || 'Credenciales incorrectas',
    });

    dispatch(clearError());
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Código requerido',
        text: 'Ingrese el código de verificación',
      });
      return;
    }

    const result = await dispatch(
      verify2FAUser({
        token2FA,
        codigo: twoFactorCode.trim(),
      })
    );

    if (verify2FAUser.fulfilled.match(result)) {
      const data = result.payload;

      Swal.fire({
        icon: 'success',
        title: 'Acceso concedido',
        timer: 1200,
        showConfirmButton: false,
      });

      reset2FAStates();

      const defaultRoute = getDefaultRoute(data.rol);
      navigate(defaultRoute, { replace: true });
      return;
    }

    const errorData = result.payload || {};

    Swal.fire({
      icon: errorData.type || 'error',
      title: 'Código incorrecto',
      text: errorData.message || errorData.msg || 'No se pudo verificar el código',
    });
  };

  const handleCancel2FA = () => {
    reset2FAStates();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LoginPanel>
        <LoginForm
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          showCaptcha={showCaptcha}
          setTurnstileToken={setTurnstileToken}
          captchaVerified={captchaVerified}
          setCaptchaVerified={setCaptchaVerified}
          requires2FA={requires2FA}
          twoFactorCode={twoFactorCode}
          setTwoFactorCode={setTwoFactorCode}
          onVerify2FA={handleVerify2FA}
          onCancel2FA={handleCancel2FA}
          blocked={blocked}
          blockMessage={blockMessage}
        />
      </LoginPanel>

      <HeroPanel />
    </div>
  );
}