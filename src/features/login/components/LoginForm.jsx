import InputField from './InputField';
import { useNavigate } from 'react-router-dom';
import TurnstileWidget from './TurnstileWidget';

export default function LoginForm({
  onSubmit,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  setTurnstileToken,
  isLoading,
}) {
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    onSubmit();
  };

  return (
    <div className="space-y-6">
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

      <TurnstileWidget
        onVerify={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken('')}
        onError={() => setTurnstileToken('')}
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
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>
    </div>
  );
}