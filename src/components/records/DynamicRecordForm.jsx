import React, { useState, useEffect, useCallback } from 'react';
import { getLogicalTableStructure, createLogicalTableRecord } from '@/services/logicalTableService';
import FieldRenderer from '../commmon/FieldRenderer';

export default function DynamicRecordForm({ tableId, onSubmitSuccess }) {
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Carga columnas y valores iniciales
  useEffect(() => {
    if (!tableId) return;
    (async () => {
      try {
        const cols = await getLogicalTableStructure(tableId);
        setColumns(cols);
        const initialValues = {};
        cols.forEach(col => {
          initialValues[col.name] = col.data_type === 'boolean' ? false : '';
        });
        setValues(initialValues);
        setErrors({});
        setSubmitError(null);
      } catch {
        setColumns([]);
        setValues({});
      }
    })();
  }, [tableId]);

  // Validación simple
  const validate = useCallback(() => {
    const errs = {};
    columns.forEach(col => {
      if (col.is_required && (values[col.name] === '' || values[col.name] == null)) {
        errs[col.name] = 'Requerido';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [columns, values]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined })); // Limpiar error al cambiar
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await createLogicalTableRecord(tableId, values);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  }, [tableId, values, validate, onSubmitSuccess]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {columns.map(col => (
        <div key={col.id} style={{ marginBottom: 16 }}>
          <label
            htmlFor={`field-${col.name}`}
            style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}
          >
            {col.name} {col.is_required && <span style={{ color: 'red' }}>*</span>}
          </label>
          <FieldRenderer
            id={`field-${col.name}`}
            column={col}
            value={values[col.name]}
            onChange={e => handleChange(col.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value)}
            error={errors[col.name]}
          />
          {errors[col.name] && (
            <div style={{ color: 'red', fontSize: 12 }}>{errors[col.name]}</div>
          )}
        </div>
      ))}
      {submitError && <div style={{ color: 'red', marginBottom: 8 }}>{submitError}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 18px',
          fontWeight: 500,
          fontSize: 16,
          width: '100%',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
