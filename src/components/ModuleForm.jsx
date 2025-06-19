import React, { useState, useEffect } from 'react';

const categories = [
  { value: '', label: 'Seleccione una categoría' },
  { value: 'inventory', label: 'Inventario' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'finance', label: 'Finanzas' },
  // Agrega más categorías según tu sistema
];

export default function ModuleForm({ mode = 'create', initialData = {}, onSubmit, onCancel, loading, error }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    isActive: true,
    category: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        iconUrl: initialData.iconUrl || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        category: initialData.category || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!formData.category) {
      alert('La categoría es obligatoria');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="module-form" noValidate>
      <h2>{mode === 'create' ? 'Crear Nuevo Módulo' : 'Editar Módulo'}</h2>

      <label htmlFor="name">Nombre *</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre del módulo"
        disabled={loading}
        required
      />

      <label htmlFor="description">Descripción</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Descripción del módulo"
        disabled={loading}
        rows={3}
      />

      <label htmlFor="iconUrl">URL del Ícono</label>
      <input
        type="url"
        id="iconUrl"
        name="iconUrl"
        value={formData.iconUrl}
        onChange={handleChange}
        placeholder="https://example.com/icon.png"
        disabled={loading}
      />

      <label htmlFor="category">Categoría *</label>
      <select
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        disabled={loading}
        required
      >
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          disabled={loading}
        />
        Módulo activo
      </label>

      {error && <p className="error-message">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} className="cancel-btn">
          Cancelar
        </button>
      </div>

      <style jsx>{`
        .module-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        label {
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #374151;
        }

        input[type="text"],
        input[type="url"],
        select,
        textarea {
          padding: 0.5em 0.75em;
          border: 1.5px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input[type="text"]:focus,
        input[type="url"]:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #7ed957;
          box-shadow: 0 0 5px #7ed957aa;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .error-message {
          color: #b91c1c;
          font-weight: 600;
          background: #fee2e2;
          padding: 0.5em 1em;
          border-radius: 6px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        button {
          padding: 0.6em 1.2em;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s;
        }

        button[type="submit"] {
          background-color: #7ed957;
          color: white;
        }

        button[type="submit"]:disabled {
          background-color: #a7d97d;
          cursor: not-allowed;
        }

        .cancel-btn {
          background-color: #e5e7eb;
          color: #374151;
        }

        .cancel-btn:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
