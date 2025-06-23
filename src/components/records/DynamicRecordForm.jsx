import React, { useState, useEffect } from 'react';
import { getLogicalTableStructure, createLogicalTableRecord } from '@/services/logicalTableService';
import FieldRenderer from '../commmon/FieldRenderer';

export default function DynamicRecordForm({ tableId, onSubmitSuccess }) {
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchColumns = async () => {
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      // Set default values
      const initial = {};
      cols.forEach(col => {
        initial[col.name] = col.data_type === 'boolean' ? false : '';
      });
      setValues(initial);
    };
    if (tableId) fetchColumns();
  }, [tableId]);

  const validate = () => {
    const errs = {};
    columns.forEach(col => {
      if (col.is_required && (values[col.name] === '' || values[col.name] === null || values[col.name] === undefined)) {
        errs[col.name] = 'Requerido';
      }
      // Puedes agregar más validaciones aquí (regex, longitud, etc.)
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
  };

  const handleSubmit = async e => {
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
  };

  return (
    <form onSubmit={handleSubmit}>
      {columns.map(col => (
        <div key={col.id} style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>{col.name} {col.is_required && <span style={{ color: 'red' }}>*</span>}</label>
          <FieldRenderer
            column={col}
            value={values[col.name]}
            onChange={e => handleChange(col.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value)}
            error={errors[col.name]}
          />
          {errors[col.name] && <div style={{ color: 'red', fontSize: 12 }}>{errors[col.name]}</div>}
        </div>
      ))}
      {submitError && <div style={{ color: 'red', marginBottom: 8 }}>{submitError}</div>}
      <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 16, width: '100%' }}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
