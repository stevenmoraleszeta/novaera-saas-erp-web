"use client";
export default function PermissionCheckbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      style={{
        width: "1.2em",
        height: "1.2em",
        accentColor: "#7ed957",
        cursor: "pointer",
      }}
    />
  );
}
