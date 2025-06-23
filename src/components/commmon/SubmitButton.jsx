export default function SubmitButton({ loading, children, ...props }) {
  return (
    <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} {...props}>
      {loading ? 'Guardando...' : children}
    </button>
  );
}
