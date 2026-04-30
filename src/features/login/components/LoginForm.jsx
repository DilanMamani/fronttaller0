import InputField from './InputField';
import TurnstileWidget from './TurnstileWidget';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({
  onSubmit,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  setTurnstileToken,
  isLoading,
  captchaVerified,
  setCaptchaVerified,

  requires2FA = false,
  twoFactorCode = '',
  setTwoFactorCode = () => {},
  onVerify2FA = () => {},
  onCancel2FA = () => {},

  blocked = false,
  blockMessage = '',
}) {
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    onSubmit(e);
  };

  const handleVerifyCode = (e) => {
    e?.preventDefault();
    onVerify2FA();
  };

  return (
    <div className="space-y-6">
      {!requires2FA ? (
        <>
          <InputField
            id="email"
            label="Email"
            type="email"
            placeholder="Ingresa tu email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
          />

          <InputField
            id="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="current-password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {blocked && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {blockMessage || 'Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos.'}
            </div>
          )}

          <TurnstileWidget
            onVerify={(token) => {
              setTurnstileToken(token);
              setCaptchaVerified(true);
            }}
            onExpire={() => {
              setTurnstileToken('');
              setCaptchaVerified(false);
            }}
            onError={() => {
              setTurnstileToken('');
              setCaptchaVerified(false);
            }}
          />

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="font-medium text-primary hover:text-accent-gold transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isLoading || blocked || !captchaVerified}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verificación en dos pasos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ingresa el código enviado a tu correo electrónico para completar el inicio de sesión.
            </p>
          </div>

          <InputField
            id="twoFactorCode"
            label="Código de verificación"
            type="text"
            placeholder="Ingresa el código"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            autoComplete="one-time-code"
          />

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={onCancel2FA}
              className="font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="font-medium text-primary hover:text-accent-gold transition-colors duration-200"
            >
              ¿Problemas para ingresar?
            </button>
          </div>

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isLoading || blocked}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </button>
        </>
      )}
    </div>
  );
}