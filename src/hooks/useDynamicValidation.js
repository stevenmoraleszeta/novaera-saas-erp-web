// Hook para validaciones dinámicas por campo
// NOTE: JS does not support enums, use plain object
const ValidationType = {
  REQUIRED: 'required',
  REGEX: 'regex',
  LENGTH: 'length',
};

export function useDynamicValidation() {
  // TODO: aplicar validaciones según reglas
  return { ValidationType };
}
