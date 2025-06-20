import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import { useTableForm } from '@/hooks/useTableForm';

export default function LogicalTableForm({ initialValues, onSubmit, mode = 'create', validate, loading, error, inputStyle }) {
  const {
    values,
    errors,
    submitting,
    submitError,
    handleChange,
    handleSubmit,
  } = useTableForm({ initialValues, onSubmit, validate, mode });

  return (
    <form onSubmit={handleSubmit} style={{ minWidth: 320 }} autoComplete="off">
      <h3 style={{ marginTop: 0 }}>{mode === 'edit' ? 'Editar tabla lógica' : 'Nueva tabla lógica'}</h3>
      <FormInput
        label="Nombre"
        name="name"
        value={values.name || ''}
        onChange={handleChange}
        error={errors.name}
        required
        style={inputStyle}
      />
      <FormInput
        label="Descripción"
        name="description"
        value={values.description || ''}
        onChange={handleChange}
        error={errors.description}
        as="textarea"
        rows={3}
        style={inputStyle}
      />
      <SubmitButton loading={submitting || loading}>
        {mode === 'edit' ? 'Guardar cambios' : 'Crear tabla'}
      </SubmitButton>
      {(submitError || error) && <div style={{ color: 'red', marginTop: 8 }}>{submitError || error}</div>}
    </form>
  );
}
