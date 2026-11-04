import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Registro() {
  const { usuario, registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { document.title = 'Crear cuenta · Nexo Retos'; }, []);

  if (usuario) return <Navigate to="/" replace />;

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      await registrar(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '10vh' }}>
      <h1 className="h3 mb-4">Crear cuenta</h1>
      <form onSubmit={enviar} className="card card-body">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={cambiar} required autoFocus />
        </div>
        <div className="mb-3">
          <label htmlFor="correo" className="form-label">Correo</label>
          <input id="correo" name="correo" type="email" className="form-control" value={form.correo} onChange={cambiar} required />
        </div>
        <div className="mb-3">
          <label htmlFor="contrasena" className="form-label">Contraseña</label>
          <input id="contrasena" name="contrasena" type="password" minLength={8} className="form-control" value={form.contrasena} onChange={cambiar} required />
          <div className="form-text">Mínimo 8 caracteres.</div>
        </div>
        <button className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="text-center small mt-3">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}
