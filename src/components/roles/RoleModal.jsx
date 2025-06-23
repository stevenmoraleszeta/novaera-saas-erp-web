"use client";
import React, { useState, useEffect } from 'react';
import Modal from '../commmon/Modal';
import FormInput from '../commmon/FormInput';
import Button from '../commmon/Button';

export default function RoleModal({ open, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
    setError(null);
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2>{initialData ? 'Editar Rol' : 'Crear Rol'}</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <FormInput label="Nombre" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <FormInput label="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button type="submit">Guardar</Button>
          <Button type="button" onClick={onClose} style={{ background: '#ccc', color: '#232526' }}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}
