"use client";
import { useRoles } from "../hooks/useRoles";

export default function RoleSelector({ value, onChange }) {
  const { roles, loading } = useRoles();
  return (
    <div className="role-selector">
      <label>Selecciona un rol:</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)}>
        <option value="">-- Selecciona un rol --</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>{role.name}</option>
        ))}
      </select>
      <style jsx>{`
        .role-selector {
          margin-bottom: 1.5rem;
        }
        select {
          padding: 0.5em 1em;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
