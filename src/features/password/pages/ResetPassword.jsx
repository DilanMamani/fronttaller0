import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  solicitarReset,
  validarToken,
  cambiarPassword,
  resetPasswordState
} from '../slices/passwordSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { seguridadApi } from '../../../lib/api';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  KeyRound,
  Check,
  X
} from 'lucide-react';

const toBool = (value) => {
  return value === true || value === 'true' || value === 'TRUE' || value === 1 || value === '1';
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordConfig, setPasswordConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, email: maskedEmail } = useSelector((state) => state.password);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        setLoadingConfig(true);

        const resp = await seguridadApi.fetchConfiguracion();

        let config = null;

        if (resp?.configuracion) {
          config = resp.configuracion;
        } else if (Array.isArray(resp)) {
          config = resp[0];
        } else if (Array.isArray(resp?.configuracion)) {
          config = resp.configuracion[0];
        } else {
          config = resp;
        }

        if (!config) {
          setPasswordConfig(null);
          return;
        }

        setPasswordConfig({
          longitud_minima: Number(config.longitud_minima),
          longitud_maxima: Number(config.longitud_maxima),
          requiere_mayuscula: toBool(config.requiere_mayuscula),
          requiere_minuscula: toBool(config.requiere_minuscula),
          requiere_numero: toBool(config.requiere_numero),
          requiere_caracter_especial: toBool(config.requiere_caracter_especial),
        });

      } catch (error) {
        console.error('Error cargando configuración de seguridad:', error);
        setPasswordConfig(null);
      } finally {
        setLoadingConfig(false);
      }
    };

    cargarConfiguracion();
  }, []);

  const passwordChecks = useMemo(() => {
    if (!passwordConfig) return {};

    const hasPassword = password.length > 0;

    return {
      length: hasPassword && password.length >= passwordConfig.longitud_minima,
      maxLength: hasPassword && password.length <= passwordConfig.longitud_maxima,
      uppercase: hasPassword && /[A-Z]/.test(password),
      lowercase: hasPassword && /[a-z]/.test(password),
      number: hasPassword && /[0-9]/.test(password),
      symbol: hasPassword && /[^A-Za-z0-9]/.test(password),
    };
  }, [password, passwordConfig]);

  const activeChecks = useMemo(() => {
    if (!passwordConfig) return [];

    const checks = [
      passwordChecks.length,
      passwordChecks.maxLength,
    ];

    if (passwordConfig.requiere_mayuscula) {
      checks.push(passwordChecks.uppercase);
    }

    if (passwordConfig.requiere_minuscula) {
      checks.push(passwordChecks.lowercase);
    }

    if (passwordConfig.requiere_numero) {
      checks.push(passwordChecks.number);
    }

    if (passwordConfig.requiere_caracter_especial) {
      checks.push(passwordChecks.symbol);
    }

    return checks;
  }, [passwordChecks, passwordConfig]);

  const passedChecksCount = activeChecks.filter(Boolean).length;
  const totalChecks = activeChecks.length;

  const isPasswordValid =
    passwordConfig &&
    password.length > 0 &&
    activeChecks.length > 0 &&
    activeChecks.every(Boolean);

  const doPasswordsMatch = password && confirm && password === confirm;

  const passwordStrength = useMemo(() => {
    if (!password || !passwordConfig || totalChecks === 0) {
      return {
        label: 'Sin evaluar',
        width: '0%',
        color: 'bg-gray-300',
        textColor: 'text-muted-light dark:text-muted-dark',
      };
    }

    const percent = Math.round((passedChecksCount / totalChecks) * 100);

    if (percent < 50) {
      return {
        label: 'Débil',
        width: `${percent}%`,
        color: 'bg-red-500',
        textColor: 'text-red-500',
      };
    }

    if (percent < 75) {
      return {
        label: 'Media',
        width: `${percent}%`,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600 dark:text-yellow-400',
      };
    }

    if (percent < 100) {
      return {
        label: 'Buena',
        width: `${percent}%`,
        color: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
      };
    }

    return {
      label: 'Muy segura',
      width: '100%',
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
    };
  }, [password, passwordConfig, passedChecksCount, totalChecks]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetPasswordState());

    const result = await dispatch(solicitarReset(email));

    if (solicitarReset.fulfilled.match(result)) {
      Swal.fire({
        icon: 'info',
        title: 'Revisa tu correo',
        text: 'Si el correo existe, se enviará un enlace de recuperación.',
        confirmButtonText: 'Volver al login',
      }).then(() => {
        navigate('/login');
      });

      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: result.payload?.msg || 'No se pudo enviar el enlace de recuperación.',
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetPasswordState());

    if (!passwordConfig) {
      Swal.fire({
        icon: 'error',
        title: 'Configuración no disponible',
        text: 'No se pudo cargar la configuración de seguridad.',
      });
      return;
    }

    if (!password || !confirm) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Ingresa y confirma tu nueva contraseña.',
      });
      return;
    }

    if (!isPasswordValid) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña no válida',
        text: 'La contraseña debe cumplir con la configuración de seguridad actual.',
      });
      return;
    }

    if (password !== confirm) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }

    const result = await dispatch(
      cambiarPassword({ token, newPassword: password })
    );

    if (cambiarPassword.fulfilled.match(result)) {
      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Ahora puedes iniciar sesión.',
        timer: 3000,
      }).then(() => {
        navigate('/login');
      });

      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Contraseña no válida',
      text: result.payload?.msg || 'No se pudo cambiar la contraseña.',
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setShowPasswordForm(true);
      dispatch(validarToken(tokenFromUrl));
    }
  }, [dispatch]);

  const RequirementItem = ({ valid, text }) => (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
          valid
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-400'
        }`}
      >
        {valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>

      <span
        className={`text-sm ${
          valid
            ? 'text-green-600 dark:text-green-400'
            : 'text-muted-light dark:text-muted-dark'
        }`}
      >
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark p-8 transition-all">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-foreground-light dark:text-foreground-dark">
            {showPasswordForm ? 'Nueva Contraseña' : 'Recuperar Cuenta'}
          </h2>

          <p className="text-center text-muted-light dark:text-muted-dark mb-8 text-sm">
            {showPasswordForm
              ? 'Crea una nueva contraseña para proteger tu cuenta'
              : 'Ingresa tu correo para recibir el enlace de recuperación'}
          </p>

          {!showPasswordForm && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light dark:text-muted-dark" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border-light dark:border-border-dark bg-card-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark placeholder-muted-light dark:placeholder-muted-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="text-center px-4 py-3 bg-primary/5 rounded-lg border border-primary/20 mb-2">
                <span className="text-sm text-muted-light dark:text-muted-dark">
                  Cuenta:{' '}
                </span>
                <span className="font-semibold text-foreground-light dark:text-foreground-dark">
                  {maskedEmail || 'Restableciendo contraseña'}
                </span>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light dark:text-muted-dark z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-border-light dark:border-border-dark bg-card-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-3 px-4 py-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                    Seguridad de la contraseña
                  </span>
                  <span className={`text-sm font-semibold ${passwordStrength.textColor}`}>
                    {passwordStrength.label}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>

                {loadingConfig && (
                  <p className="text-sm text-muted-light dark:text-muted-dark">
                    Cargando reglas de seguridad...
                  </p>
                )}

                {!loadingConfig && !passwordConfig && (
                  <p className="text-sm text-red-600">
                    No se pudo cargar la configuración de seguridad.
                  </p>
                )}

                {!loadingConfig && passwordConfig && (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <RequirementItem
                      valid={passwordChecks.length}
                      text={`Mínimo ${passwordConfig.longitud_minima} caracteres`}
                    />

                    <RequirementItem
                      valid={passwordChecks.maxLength}
                      text={`Máximo ${passwordConfig.longitud_maxima} caracteres`}
                    />

                    {passwordConfig.requiere_mayuscula === true && (
                      <RequirementItem
                        valid={passwordChecks.uppercase}
                        text="Al menos una letra mayúscula"
                      />
                    )}

                    {passwordConfig.requiere_minuscula === true && (
                      <RequirementItem
                        valid={passwordChecks.lowercase}
                        text="Al menos una letra minúscula"
                      />
                    )}

                    {passwordConfig.requiere_numero === true && (
                      <RequirementItem
                        valid={passwordChecks.number}
                        text="Al menos un número"
                      />
                    )}

                    {passwordConfig.requiere_caracter_especial === true && (
                      <RequirementItem
                        valid={passwordChecks.symbol}
                        text="Al menos un símbolo"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light dark:text-muted-dark z-10" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-border-light dark:border-border-dark bg-card-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {confirm.length > 0 && (
                <div
                  className={`text-sm px-4 py-3 rounded-lg border ${
                    doPasswordsMatch
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  }`}
                >
                  {doPasswordsMatch
                    ? 'Las contraseñas coinciden'
                    : 'Las contraseñas no coinciden'}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  loadingConfig ||
                  !passwordConfig ||
                  !isPasswordValid ||
                  !doPasswordsMatch
                }
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
              >
                {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}