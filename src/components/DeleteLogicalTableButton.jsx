import { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function DeleteLogicalTableButton({ onDelete, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(true)} disabled={disabled} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
        Eliminar tabla
      </button>
      <DeleteConfirmationModal
        isOpen={show}
        onClose={() => setShow(false)}
        onConfirm={onDelete}
        message="¿Seguro que deseas eliminar esta tabla lógica? Esta acción no se puede deshacer."
      />
    </>
  );
}
