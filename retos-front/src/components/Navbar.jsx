import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-sm bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-mark" aria-hidden="true">🎯</span>
          Nexo Retos
        </Link>
        <div className="navbar-nav me-auto">
          <NavLink className="nav-link" to="/" end>Retos</NavLink>
          <NavLink className="nav-link" to="/retos/nuevo">Publicar reto</NavLink>
          <NavLink className="nav-link" to="/gestion/empresas">Empresas</NavLink>
          <NavLink className="nav-link" to="/gestion/prioridades">Prioridades</NavLink>
          <NavLink className="nav-link" to="/gestion/usuarios">Usuarios</NavLink>
          <NavLink className="nav-link" to="/gestion/categorias">Categorías</NavLink>
          <NavLink className="nav-link" to="/gestion/registros">Inscripciones</NavLink>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary small">{usuario?.nombre} · {usuario?.rol}</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
