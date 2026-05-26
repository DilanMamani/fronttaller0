import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/login/slices/loginSelectors';
import { hasAccess, getDefaultRoute } from '../config/roleConfig';
import { ROUTES } from '../config/roleConfig';

const checkAccess = (requiredRoute, user) => {
  if (!requiredRoute || requiredRoute === ROUTES.DASHBOARD) return true;
  // accesos dinámicos del backend
  if (user?.menu?.length > 0) {
    return user.menu.some((item) => item.to === requiredRoute);
  }
  // fallback al sistema estático mientras no haya menu cargado
  return hasAccess(user?.rol, requiredRoute);
};

export default function ProtectedRoute({ children, requiredRoute }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!checkAccess(requiredRoute, user)) {
    const defaultRoute = user?.menu?.[0]?.to || getDefaultRoute(user?.rol);
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}