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
  const [showPassword, setShowPassword] = useState(false);

  // Redirige al usuario si ya está autenticado
  useEffect(() => {
    if (user && user.token) {
      const defaultRoute = getDefaultRoute(user.rol);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor ingrese email y contraseña',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${result.payload.name}`,
        timer: 1500,
        showConfirmButton: false,
      });
      
      const defaultRoute = getDefaultRoute(result.payload.rol);
      navigate(defaultRoute, { replace: true });
    } else {
      const errorData = result.payload || {};
      
      Swal.fire({
        icon: errorData.type || 'error',
        title: 'Error al iniciar sesión',
        text: errorData.message || 'Credenciales incorrectas',
        confirmButtonColor: '#3b82f6',
      });
      
      dispatch(clearError());
    }
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
          error={error}
        />
      </LoginPanel>

      <HeroPanel />
    </div>
  );
}