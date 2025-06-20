import { useState, useEffect } from 'react';

export function useTableForm({ initialValues = {}, onSubmit, validate, mode = 'create' }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialValues]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validation = validate ? validate(values) : {};
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    values,
    errors,
    submitting,
    submitError,
    touched,
    setValues,
    handleChange,
    handleSubmit,
  };
}
