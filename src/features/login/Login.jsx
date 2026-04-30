// src/features/login/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { loginUser } from './slices/loginThunks';
import { clearError } from './slices/loginSlice';
import { selectIsLoading, selectError, selectUser } from './slices/loginSelectors';
import { getDefaultRoute } from '../../shared/config/roleConfig';

import LoginPanel from './components/LoginPanel';
import LoginForm from './components/LoginForm';
import HeroPanel from './components/HeroPanel';

// Código 2FA estático (por ahora)
const STATIC_2FA_CODE = '123456';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const user = useSelector(selectUser);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // CAPTCHA (desactivado temporalmente)
  const [turnstileToken, setTurnstileToken] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(true); // siempre true por ahora

  const [showPassword, setShowPassword] = useState(false);

  // 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  // bloqueo
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // Redirección automática si ya hay sesión
  useEffect(() => {
    if (user && user.token) {
      const defaultRoute = getDefaultRoute(user.rol);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, navigate]);

  const resetStates = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setTempUserData(null);
    setBlocked(false);
    setBlockMessage('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor ingrese email y contraseña',
      });
      return;
    }

    // CAPTCHA DESACTIVADO
    /*
    if (!turnstileToken || !captchaVerified) {
      Swal.fire({
        icon: 'warning',
        title: 'Captcha requerido',
        text: 'Complete la verificación de Cloudflare antes de continuar',
      });
      return;
    }
    */

    const result = await dispatch(
      loginUser({
        ...formData,
        turnstileToken,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      const data = result.payload;

      // 🧠 Simulación de backend
      if (data?.blocked) {
        setBlocked(true);
        setBlockMessage(data.message || 'Cuenta bloqueada por múltiples intentos fallidos');
        return;
      }

      if (data?.requires2FA) {
        setRequires2FA(true);
        setTempUserData(data);

        Swal.fire({
          icon: 'info',
          title: 'Verificación en dos pasos',
          text: `Se envió un código al correo (${formData.email}). Código estático: ${STATIC_2FA_CODE}`,
        });

        return;
      }

      // Login directo (sin 2FA)
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${data.name}`,
        timer: 1500,
        showConfirmButton: false,
      });

      const defaultRoute = getDefaultRoute(data.rol);
      navigate(defaultRoute, { replace: true });

    } else {
      const errorData = result.payload || {};

      // detectar bloqueo desde error
      if (errorData.blocked) {
        setBlocked(true);
        setBlockMessage(errorData.message);
      }

      Swal.fire({
        icon: errorData.type || 'error',
        title: 'Error al iniciar sesión',
        text: errorData.message || 'Credenciales incorrectas',
      });

      resetStates();
      dispatch(clearError());
    }
  };

  const handleVerify2FA = () => {
    if (!twoFactorCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Código requerido',
        text: 'Ingrese el código de verificación',
      });
      return;
    }

    if (twoFactorCode !== STATIC_2FA_CODE) {
      Swal.fire({
        icon: 'error',
        title: 'Código incorrecto',
        text: 'El código no es válido',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Acceso concedido',
      timer: 1200,
      showConfirmButton: false,
    });

    const defaultRoute = getDefaultRoute(tempUserData?.rol);
    navigate(defaultRoute, { replace: true });
  };

  const handleCancel2FA = () => {
    resetStates();
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

          // CAPTCHA (simulado)
          setTurnstileToken={setTurnstileToken}
          captchaVerified={captchaVerified}
          setCaptchaVerified={setCaptchaVerified}

          // 2FA
          requires2FA={requires2FA}
          twoFactorCode={twoFactorCode}
          setTwoFactorCode={setTwoFactorCode}
          onVerify2FA={handleVerify2FA}
          onCancel2FA={handleCancel2FA}

          // bloqueo
          blocked={blocked}
          blockMessage={blockMessage}
        />

      </LoginPanel>

      <HeroPanel />
    </div>
  );
}