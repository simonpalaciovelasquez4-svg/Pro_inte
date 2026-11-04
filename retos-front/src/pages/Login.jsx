import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { document.title = 'Iniciar sesión · Nexo Retos'; }, []);

  if (usuario) return <Navigate to="/" replace />;

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '12vh' }}>
      <h1 className="h3 mb-1 d-flex align-items-center gap-2">
        <span className="brand-mark" aria-hidden="true">🎯</span>
        Nexo Retos
      </h1>
      <p className="text-secondary mb-4">Inicia sesión para publicar y gestionar retos.</p>
      <form onSubmit={enviar} className="card card-body">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="mb-3">
          <label htmlFor="correo" className="form-label">Correo</label>
          <input id="correo" name="correo" type="email" className="form-control" value={form.correo} onChange={cambiar} required autoFocus />
        </div>
        <div className="mb-3">
          <label htmlFor="contrasena" className="form-label">Contraseña</label>
          <input id="contrasena" name="contrasena" type="password" className="form-control" value={form.contrasena} onChange={cambiar} required />
        </div>
        <button className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="text-center small mt-3">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </div>
  );
}
