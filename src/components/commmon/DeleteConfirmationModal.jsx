export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
        <h3 style={{ marginTop: 0, color: '#dc2626' }}>Confirmar eliminación</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#e5e7eb', border: 'none', borderRadius: 6, padding: 10, fontWeight: 500 }}>Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: 10, fontWeight: 500 }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
