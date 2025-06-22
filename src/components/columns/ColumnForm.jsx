import React, { useState, useEffect, useContext } from 'react';
import FormInput from '../FormInput';
import Button from '../Button';
import Alert from '../Alert';
import { AuthContext } from '../../context/AuthContext';
import ColumnTypeSelector from './ColumnTypeSelector';
import ForeignKeySelector from './ForeignKeySelector';
import { useForeignKeyOptions } from '@/hooks/useForeignKeyOptions';


export default function ColumnForm({
  mode = 'create',
  initialData = {},
  onSubmit,
  onCancel,
  onDelete,
  loading,
  error,
  tableId,
  lastPosition 
}) {
  const { user } = useContext(AuthContext);
  const [formError, setFormError] = useState(null);
    const { tables, columnsByTable } = useForeignKeyOptions();

        //'SELECT sp_crear_columna($1, $2, $3, $4, $5, $6, $7) AS message',
    //[Xtable_id, Xname, Xdata_type, Xis_required, Xis_foreign_key, Xforeign_table_id, Xforeign_column_name]

const [formData, setFormData] = useState({
  name: '',
  data_type: 'string',
  is_required: false,
  is_foreign_key: false,
  relation_type: '',
  foreign_table_id: 0,
  foreign_column_name: '',
  foreign_column_id: '',
  validations: '',
  table_id: tableId,
  created_by: user?.id || null,
  column_position: mode === 'create' ? lastPosition : 0 
});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('El nombre de la columna es obligatorio.');
      return;
    }
    try {
      setFormError(null);
      await onSubmit(formData);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al guardar la columna';
      setFormError(msg);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (onDelete && initialData?.id) {
      onDelete(initialData.id);
    }
  };

  return (
    <div className="column-form">
      <h2>{mode === 'create' ? 'Crear Columna' : 'Editar Columna'}</h2>

      {error && <Alert type="error" message={error} />}
      {formError && <Alert type="error" message={formError} />}

      <form onSubmit={handleSubmit} className="form-content">
          <FormInput
            label="Nombre de la columna"
            name="name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />

        <ColumnTypeSelector
          value={formData.data_type}
          onChange={(value) => handleChange('data_type', value)}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_required"
            checked={formData.is_required}
            onChange={(e) => handleChange('is_required', e.target.checked)}
          />
          ¿Obligatoria?
        </label>

        
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_foreign_key"
            checked={formData.is_foreign_key}
            onChange={(e) => handleChange('is_foreign_key', e.target.checked)}
          />
          ¿Es llave foránea?
        </label>

        <FormInput
          label="Tipo de Relación"
          name="relation_type"
          value={formData.relation_type}
          onChange={e => handleChange('relation_type', e.target.value)}
          placeholder="uno-a-uno, uno-a-muchos, etc."
        />

          {formData.is_foreign_key && (
                   
          <ForeignKeySelector
          tables={tables}
          columnsByTable={columnsByTable}
          selectedTableId={formData.foreign_table_id}
          selectedColumnId={formData.foreign_column_name}
          onChangeTable={(value) => handleChange('foreign_table_id', Number(value))}
          onChangeColumn={(value) => handleChange('foreign_column_name', value)}
          required={formData.relation_type !== ''}
          />
            
          )}
       
          <FormInput
            label="Validaciones (expresión o reglas)"
            name="validations"
            value={formData.validations}
            onChange={e => handleChange('validations', e.target.value)}
            as="textarea"
          />

        <div className="form-actions">
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Actualizar'}
          </Button>
          {mode === 'edit' && (
            <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}>
              Eliminar
            </Button>
          )}
        </div>
      </form>

      <style jsx>{`
        .column-form {
          background: white;
          padding: 2rem;
          border-radius: 0.75rem;
          max-width: 700px;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
