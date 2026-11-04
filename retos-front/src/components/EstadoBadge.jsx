const COLORES = {
  Abierto: 'success',
  'En revisión': 'warning',
  Cerrado: 'dark',
  Pendiente: 'warning',
  Aprobado: 'success',
  Rechazado: 'danger',
};

export default function EstadoBadge({ estado }) {
  return <span className={`badge text-bg-${COLORES[estado] || 'secondary'}`}>{estado || '—'}</span>;
}
