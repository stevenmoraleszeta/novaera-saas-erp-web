"use client";
import React, { useState, useEffect } from 'react';
import FormInput from './FormInput';
import PermissionSelector from './PermissionSelector';
import Button from './Button';

export default function RoleForm({ initialData = {}, permissions = [], onSubmit, onCancel, loading }) {
  const safeData = initialData || {};
  const [name, setName] = useState(safeData.name || '');
  const [description, setDescription] = useState(safeData.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState(safeData.permissions || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    const safeData = initialData || {};
    setName(safeData.name || '');
    setDescription(safeData.description || '');
    // Solo setea permisos si es creación, no si es edición
    if (!safeData.id) {
      setSelectedPermissions(safeData.permissions || []);
    }
    setError(null);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || name.length < 3) {
      setError('El nombre es obligatorio y debe tener al menos 3 caracteres.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setError('Debes asignar al menos un permiso.');
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim(), permissions: selectedPermissions });
  };

  if (!permissions || permissions.length === 0) {
    return (
      <div style={{ padding: '2em', textAlign: 'center' }}>
        <span>Cargando permisos...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="role-form">
      {error && <div className="form-error-msg">{error}</div>}
      <FormInput label="Nombre del rol" value={name} onChange={e => setName(e.target.value)} autoFocus minLength={3} placeholder="Ej: Administrador" />
      <FormInput label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe brevemente el rol" />
      <PermissionSelector value={selectedPermissions} onChange={setSelectedPermissions} permissions={permissions} />
      <div className="role-form-actions">
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        <Button type="button" onClick={onCancel} variant="secondary">Cancelar</Button>
      </div>
      <style jsx>{`
        .role-form {
          background: #fff;
          border-radius: 1.1rem;
          padding: 2.2rem 2.2rem 1.5rem 2.2rem;
          box-shadow: 0 4px 32px 0 rgba(0,0,0,0.07);
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .form-error-msg {
          color: #e53935;
          background: #fff6f6;
          border: 1px solid #e53935;
          border-radius: 8px;
          padding: 0.7em 1em;
          margin-bottom: 0.5em;
          font-weight: 500;
          font-size: 1.05em;
        }
        .role-form-actions {
          display: flex;
          gap: 1em;
          margin-top: 1.2em;
          justify-content: flex-end;
        }
        @media (max-width: 600px) {
          .role-form {
            padding: 1.2rem 0.7rem 1rem 0.7rem;
          }
        }
      `}</style>
    </form>
  );
}
