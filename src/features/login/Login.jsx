// src/features/login/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { loginUser, verify2FAUser } from './slices/loginThunks';
import { clearError } from './slices/loginSlice';
import { selectIsLoading, selectError, selectUser } from './slices/loginSelectors';
import { getDefaultRoute } from '../../shared/config/roleConfig';

import LoginPanel from './components/LoginPanel';
import LoginForm from './components/LoginForm';
import HeroPanel from './components/HeroPanel';

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

  const [turnstileToken, setTurnstileToken] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [token2FA, setToken2FA] = useState('');

  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  useEffect(() => {
    if (user && user.token && !requires2FA) {
      const defaultRoute = getDefaultRoute(user.rol);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, navigate, requires2FA]);

  const resetStates = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setToken2FA('');
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

    const result = await dispatch(
      loginUser({
        ...formData,
        turnstileToken,
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
        text: `Hola ${data.name}`,
        timer: 1500,
        showConfirmButton: false,
      });

      const defaultRoute = getDefaultRoute(data.rol);
      navigate(defaultRoute, { replace: true });
    } else {
      const errorData = result.payload || {};

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

      resetStates();

      const defaultRoute = getDefaultRoute(data.rol);
      navigate(defaultRoute, { replace: true });
    } else {
      const errorData = result.payload || {};

      Swal.fire({
        icon: errorData.type || 'error',
        title: 'Código incorrecto',
        text: errorData.message || 'No se pudo verificar el código',
      });
    }
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