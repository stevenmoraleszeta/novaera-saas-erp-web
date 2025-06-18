"use client";
import React, { useState, useEffect } from 'react';
import FormInput from './FormInput';
import PermissionSelector from './PermissionSelector';
import Button from './Button';

export default function RoleForm({ initialData = {}, permissions = [], onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState(initialData.permissions || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(initialData.name || '');
    setDescription(initialData.description || '');
    setSelectedPermissions(initialData.permissions || []);
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

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <FormInput label="Nombre" value={name} onChange={e => setName(e.target.value)} autoFocus minLength={3} />
      <FormInput label="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
      <PermissionSelector value={selectedPermissions} onChange={setSelectedPermissions} permissions={permissions} />
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        <Button type="button" onClick={onCancel} style={{ background: '#ccc', color: '#232526' }}>Cancelar</Button>
      </div>
    </form>
  );
}
