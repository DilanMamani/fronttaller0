import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/index';
import ProtectedRoute from '../src/shared/components/ProtectedRoute';
import { ROUTES } from '../src/shared/config/roleConfig';
import Dashboard from './features/dashboard/Dashboard'
import Login from './features/login/Login'
import Personas from './features/personas/Personas'
import Auditoria from './features/auditoria/Auditoria'
import Sacramentos from './features/sacramentos/Sacramentos'
import Usuarios from './features/usuarios/Usuarios'
import Reportes from './features/reportes/Reportes'
import Certificados from './features/certificados/Certificados'
import Parroquias from './features/parroquias/Parroquias';
import ResetPassword from './features/password/pages/ResetPassword';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Cargando...</div>} persistor={persistor}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute requiredRoute={ROUTES.DASHBOARD}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PERSONAS}
            element={
              <ProtectedRoute requiredRoute={ROUTES.PERSONAS}>
                <Personas />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SACRAMENTOS}
            element={
              <ProtectedRoute requiredRoute={ROUTES.SACRAMENTOS}>
                <Sacramentos />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CERTIFICADOS}
            element={
              <ProtectedRoute requiredRoute={ROUTES.CERTIFICADOS}>
                <Certificados />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AUDITORIA}
            element={
              <ProtectedRoute requiredRoute={ROUTES.AUDITORIA}>
                <Auditoria />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.USUARIOS}
            element={
              <ProtectedRoute requiredRoute={ROUTES.USUARIOS}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.REPORTES}
            element={
              <ProtectedRoute requiredRoute={ROUTES.REPORTES}>
                <Reportes />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PARROQUIAS}
            element={
              <ProtectedRoute requiredRoute={ROUTES.PARROQUIAS}>
                <Parroquias />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PersistGate>
    </Provider>
  );
}
