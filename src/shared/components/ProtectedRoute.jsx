import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/login/slices/loginSelectors';
import { ROUTES } from '../config/roleConfig';

export default function ProtectedRoute({ children, requiredRoute }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const hasAccess =
    !requiredRoute ||
    requiredRoute === ROUTES.DASHBOARD ||
    user.menu?.some((item) => item.to === requiredRoute);

  if (!hasAccess) {
    return <Navigate to={user.menu?.[0]?.to || '/'} replace />;
  }

  return children;
}