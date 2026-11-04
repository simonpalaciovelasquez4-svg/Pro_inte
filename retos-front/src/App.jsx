import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NuevoReto from './pages/NuevoReto.jsx';
import EditarReto from './pages/EditarReto.jsx';
import DetalleReto from './pages/DetalleReto.jsx';
import GestionEntidad from './pages/GestionEntidad.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Rutas privadas: solo con sesión iniciada */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/retos/nuevo" element={<NuevoReto />} />
          <Route path="/retos/:id" element={<DetalleReto />} />
          <Route path="/retos/:id/editar" element={<EditarReto />} />
          <Route path="/gestion/:recurso" element={<GestionEntidad />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
