import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  solicitarReset, 
  validarToken, 
  cambiarPassword, 
  resetPasswordState 
} from '../slices/passwordSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success } = useSelector((state) => state.password);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetPasswordState());

    const result = await dispatch(solicitarReset(email));

    if (solicitarReset.fulfilled.match(result)) {
      const { url } = result.payload;

      if (url) {
        const urlObj = new URL(url);
        const tokenFromUrl = urlObj.searchParams.get('token');
        if (tokenFromUrl) {
          setToken(tokenFromUrl);
          setShowPasswordForm(true);
          dispatch(validarToken(tokenFromUrl));
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Revisa tu correo',
            text: 'Te enviamos un enlace para restablecer tu contraseña.',
            timer: 5000,
          });
        }
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Revisa tu correo',
          text: 'Si el correo existe, te enviamos un enlace.',
        });
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden' });
      return;
    }
    if (password.length < 8) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Mínimo 8 caracteres' });
      return;
    }

    const result = await dispatch(cambiarPassword({ token, newPassword: password }));

    if (cambiarPassword.fulfilled.match(result)) {
      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Ahora puedes iniciar sesión.',
        timer: 3000,
      }).then(() => {
        navigate('/login');
      });
    }
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
              ? 'Ingresa tu nueva contraseña segura' 
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
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="text-center px-4 py-3 bg-primary/5 rounded-lg border border-primary/20 mb-6">
                <span className="text-sm text-muted-light dark:text-muted-dark">Cuenta: </span>
                <span className="font-semibold text-foreground-light dark:text-foreground-dark">{email}</span>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light dark:text-muted-dark z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-border-light dark:border-border-dark bg-card-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light dark:text-muted-dark z-10" />
                <input
                  type={showConfirm ? "text" : "password"}
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

              <div className="text-xs text-muted-light dark:text-muted-dark bg-background-light dark:bg-background-dark px-4 py-3 rounded-lg">
                ✓ Mínimo 8 caracteres
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : 'Cambiar contraseña'}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
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