import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/login/slices/loginSelectors';
import { hasAccess, getDefaultRoute } from '../config/roleConfig';

export default function ProtectedRoute({ children, requiredRoute }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // verifica permisos
  if (requiredRoute && !hasAccess(user.rol, requiredRoute)) {
    const defaultRoute = getDefaultRoute(user.rol);
    return <Navigate to={defaultRoute} replace />;
  }

  // si tiene acceso se renderiza el componente
  return children;
}