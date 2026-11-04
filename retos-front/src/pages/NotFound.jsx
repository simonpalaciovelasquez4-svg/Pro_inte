import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container text-center" style={{ paddingTop: '15vh' }}>
      <h1 className="display-5">Página no encontrada</h1>
      <p className="text-secondary">La dirección que abriste no existe.</p>
      <Link to="/" className="btn btn-primary">Ir a mis retos</Link>
    </div>
  );
}
