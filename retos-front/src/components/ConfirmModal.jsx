import { useEffect } from 'react';

// Modal de Bootstrap controlado con estado de React (sin necesitar bootstrap.js).
export default function ConfirmModal({ abierto, titulo, mensaje, textoConfirmar = 'Confirmar', onConfirmar, onCancelar, cargando }) {
  // Cerrar con la tecla Escape: listener directo sobre el DOM.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => e.key === 'Escape' && onCancelar();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog" onClick={onCancelar}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCancelar} />
            </div>
            <div className="modal-body">{mensaje}</div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onCancelar} disabled={cargando}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={onConfirmar} disabled={cargando}>
                {cargando ? 'Eliminando…' : textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
