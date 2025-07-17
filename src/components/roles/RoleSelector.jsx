"use client";
import { useRoles } from "../../hooks/useRoles";
import ReusableCombobox from "@/components/ui/ReusableCombobox";

export default function RoleSelector({ value, onChange }) {
  const { roles, loading } = useRoles();

  const roleOptions = roles.map(role => ({
    label: role.name,
    value: role.id
  }));

  if (loading) {
    return <p>Cargando roles...</p>;
  }

  return (
    <ReusableCombobox
      label="Selecciona un rol:"
      placeholder="-- Selecciona un rol --"
      options={roleOptions}
      value={value}
      onChange={onChange}
    />
  );
}
