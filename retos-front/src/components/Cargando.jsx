export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="text-center py-5 text-secondary">
      <div className="spinner-border spinner-border-sm me-2" role="status" />
      {texto}
    </div>
  );
}
