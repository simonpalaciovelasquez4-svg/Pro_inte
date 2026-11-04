import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Cargando from './Cargando.jsx';

export default function ProtectedRoute() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();
  if (cargando) return <Cargando texto="Verificando sesión…" />;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
