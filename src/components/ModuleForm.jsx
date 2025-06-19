import React, { useState, useEffect, useContext } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import Alert from './Alert';
import { AuthContext } from '../context/AuthContext';
 

export default function ModuleForm({ mode = 'create', initialData = {}, onSubmit, onCancel, onDelete, loading, error }) {
  const { user, status } = useContext(AuthContext);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    isActive: true,
    category: '',
    created_by: user.id,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        iconUrl: initialData.iconUrl || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        category: initialData.category || '',
        created_by: user.id,
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

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.name.trim()) {
        setFormError('El nombre es obligatorio');
        return;
      }

      try {
        setFormError(null); 
        await onSubmit(formData);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.message ||
          'Error al guardar el módulo';
        setFormError(errorMessage);
      }
    };


    const handleDelete = (e) => {
    e.preventDefault();


    onDelete(initialData.id);
  };

  return (
      <div className="module-form">
        <div className="form-header">
            <h2>{mode === 'create' ? 'Crear Nuevo Módulo' : 'Editar Módulo'}</h2>
        </div>

        {error && (
            <Alert type="error" message={error} />
        )}
        {formError && (
          <Alert type="error" message={formError} />
        )}

    <form onSubmit={handleSubmit} className="module-content" noValidate>
      

        <FormInput
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre del módulo"
            autoFocus
        />

        <FormInput
            label="URL del Ícono"
            name="iconUrl"
            value={formData.iconUrl}
            onChange={handleChange}
            placeholder="Nombre del módulo"
            autoFocus
        />

      <div className="form-actions">

        <Button
            type="submit"
            variant="outline"
            disabled={loading}
        >
           {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
        </Button>
        {initialData && (
        <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
        >
            Eliminar
        </Button>
        )}
      </div>

      <style jsx>{`

        .module-form {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
        }
        .module-content {
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
    </div>
  );
}
