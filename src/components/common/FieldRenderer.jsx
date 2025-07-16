import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useUsers } from "@/hooks/useUsers";
import SelectionField from "./SelectionField";
import { Label } from "@/components/ui/label";
import { getLogicalTableRecords } from "@/services/logicalTableService";
import Modal from "./Modal";
import DynamicRecordFormDialog from "../records/DynamicRecordFormDialog";
import FileUpload from "./FileUpload";
import FileDisplay from "./FileDisplay";
import DateFieldWithNotifications from "../records/DateFieldWithNotifications";
import AssignedUsersCell from "../tables/AssignedUsersCell";

import ReusableCombobox from "@/components/ui/reusableCombobox"; 

export default function FieldRenderer({ 
  id, 
  column, 
  value, 
  onChange, 
  error, 
  colName, 
  tableId, 
  recordId, 
  isEditing = false,
  pendingNotifications = [],
  onAddPendingNotification,
  onRemovePendingNotification,
  createdRecordId
}) {
  const baseClassName = `w-full ${error ? "border-red-500 focus:border-red-500" : ""}`;
  const [foreignOptions, setForeignOptions] = useState([]);
  const { users, loadUsers } = useUsers();
  const [showForeignModal, setShowForeignModal] = useState(false);
  const [foreignDisplay, setForeignDisplay] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        // Solo cargar opciones si hay una tabla foránea válida
        if ((column.data_type === "select" || column.is_foreign_key) && 
            column.foreign_table_id && 
            column.foreign_table_id !== null && 
            column.foreign_column_name) {
          console.log('Cargando opciones para foreign key:', {
            foreign_table_id: column.foreign_table_id,
            foreign_column_name: column.foreign_column_name,
            column_name: column.name
          });
          
          const records = await getLogicalTableRecords(column.foreign_table_id);
          
          // Usar colName si está disponible, sino usar foreign_column_name
          const displayColumn = colName || column.foreign_column_name;
          
          const opts = records.map((record) => ({
            value: record.id, // Usar el ID del registro como valor
            label: record.record_data[displayColumn], // Mostrar la columna especificada
          }));

          console.log('Opciones cargadas:', opts);
          setForeignOptions(opts);
        } else if (column.data_type === "user") {
          await loadUsers();
        }
      } catch (err) {
        console.error("Error cargando opciones:", err);
      }
    }

    loadOptions();
  }, [column, colName]);


    // Llave foránea: usar SelectionField que maneja tanto opciones personalizadas como de tabla foránea
    if (column.data_type === "select" && column.is_foreign_key && column.foreign_table_id && column.foreign_column_name) {
      console.log('Rendering foreign key select field:', {
        columnId: column.column_id,
        foreign_table_id: column.foreign_table_id,
        foreign_column_name: column.foreign_column_name
      });
      
      return (
        <SelectionField
          columnId={column.column_id}
          value={value}
          onChange={(val) => onChange({ target: { value: val === "none" ? "" : val } })}
          required={column.is_required}
          label={column.name}
          placeholder={`Selecciona ${column.name}`}
        />
      );
    }

    // Tipo selección sin foreign key: usar SelectionField para opciones personalizadas
    if (column.data_type === "select") {
      return (
        <SelectionField
          columnId={column.column_id}
          value={value}
          onChange={(val) => onChange({ target: { value: val === "none" ? "" : val } })}
          required={column.is_required}
          label={column.name}
          placeholder={`Selecciona ${column.name}`}
        />
      );
    }

    // Llave foránea legacy: usar Select manual (mantener como fallback)
    if (column.is_foreign_key && column.foreign_table_id && column.foreign_column_name) {
      console.log('Rendering legacy foreign key field - this should not be used for new intermediate tables');
      const legacyFkOptions = [
        { label: "-- Ninguno --", value: "none" },
        ...foreignOptions.filter((option) => option.value !== "")
      ];
      return (
        <ReusableCombobox
          placeholder={`Selecciona ${column.name}`}
          options={legacyFkOptions}
          value={value || "none"}
          onChange={(val) => onChange({ target: { value: val === "none" ? "" : val } })}
        />

        // <Select
        //   value={value?.toString() || "none"}
        //   onValueChange={(val) => onChange({ target: { value: val === "none" ? "" : val } })}
        // >
        //   <SelectTrigger className={baseClassName}>
        //     <SelectValue placeholder={`Selecciona ${column.name}`} />
        //   </SelectTrigger>
        //   <SelectContent>
        //     <SelectItem value="none">-- Ninguno --</SelectItem>
        //     {foreignOptions
        //       .filter((option) => option.value !== "")
        //       .map((option) => (
        //         <SelectItem key={option.value} value={option.value}>
        //           {option.label}
        //         </SelectItem>
        //       ))}
        //   </SelectContent>
        // </Select>
      );
    }

    // Tipo especial: "user"
    if (column.data_type === "user") {
      const userOptions = users.map((u) => ({
        value: u.id,
        label: u.name || `Usuario #${u.id}`,
      }));

      // const selectedLabel =
      //   options.find((opt) => opt.value === (value?.toString() || ""))?.label || "";

      return (
        <ReusableCombobox
          placeholder={`Selecciona ${column.name}`}
          options={userOptions}
          value={value}
          onChange={(val) => onChange({ target: { value: val ? parseInt(val, 10) : null } })}
        />

        // <Select
        //   value={value?.toString() || ""}
        //   onValueChange={(val) => onChange({ target: { value: parseInt(val, 10) } })}
        // >
        //   <SelectTrigger className={baseClassName}>
        //     <SelectValue placeholder={`Selecciona ${column.name}`}>
        //       {selectedLabel}
        //     </SelectValue>
        //   </SelectTrigger>
        //   <SelectContent>
        //     {options.map((option) => (
        //       <SelectItem key={option.value} value={option.value}>
        //         {option.label}
        //       </SelectItem>
        //     ))}
        //   </SelectContent>
        // </Select>
      );
    }

    // Tipo especial: "assigned_users"
    if (column.data_type === "assigned_users") {
      return (
        <AssignedUsersCell
          value={value || []}
          onChange={(newUsers) => onChange({ target: { value: newUsers } })}
          tableId={tableId}
          recordId={recordId}
          isEditing={isEditing}
          className="w-full"
        />
      );
    }



  // Resto de tipos
  switch (column.data_type) {
    case "text":
    case "varchar":
    case "string":
      return (
        <Input
          id={id}
          type="text"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
        />
      );

    case "int":
    case "integer":
    case "number":
      return (
        <Input
          id={id}
          type="number"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
        />
      );

    case "decimal":
    case "float":
    case "double":
      return (
        <Input
          id={id}
          type="number"
          step="0.01"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
        />
      );

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={id}
            checked={value || false}
            onCheckedChange={(checked) => onChange({ target: { checked } })}
          />
          <Label htmlFor={id} className="text-sm font-normal">
            {column.name}
          </Label>
        </div>
      );

    case "date":
      return (
        <DateFieldWithNotifications
          id={id}
          type="date"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          column={column}
          tableId={tableId}
          recordId={recordId}
          isEditing={isEditing}
          pendingNotifications={pendingNotifications}
          onAddPendingNotification={onAddPendingNotification}
          onRemovePendingNotification={onRemovePendingNotification}
          createdRecordId={createdRecordId}
        />
      );

    case "datetime":
    case "timestamp":
      return (
        <DateFieldWithNotifications
          id={id}
          type="datetime-local"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          column={column}
          tableId={tableId}
          recordId={recordId}
          isEditing={isEditing}
          pendingNotifications={pendingNotifications}
          onAddPendingNotification={onAddPendingNotification}
          onRemovePendingNotification={onRemovePendingNotification}
          createdRecordId={createdRecordId}
        />
      );

    case "textarea":
    case "text_long":
      return (
        <Textarea
          id={id}
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
          rows={4}
        />
      );

    case "email":
      return (
        <Input
          id={id}
          type="email"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
        />
      );

    case "url":
      return (
        <Input
          id={id}
          type="url"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
        />
      );

    case "select":
    case "enum":
      // const options = column.options || [];
      const customOptions = (column.options || []).map(opt => 
        typeof opt === 'string' ? { label: opt, value: opt } : opt
      );
      return (
        <ReusableCombobox
          placeholder={`Selecciona ${column.name}`}
          options={customOptions}
          value={value}
          onChange={(val) => onChange({ target: { value: val } })}
        />

        // <Select
        //   value={value || ""}
        //   onValueChange={(val) => onChange({ target: { value: val } })}
        // >
        //   <SelectTrigger className={baseClassName}>
        //     <SelectValue placeholder={`Selecciona ${column.name}`} />
        //   </SelectTrigger>
        //   <SelectContent>
        //     {options.map((option) => (
        //       <SelectItem key={option.value} value={option.value}>
        //         {option.label}
        //       </SelectItem>
        //     ))}
        //   </SelectContent>
        // </Select>
      );

    case "file":
      return (
        <FileUpload
          value={value}
          onChange={(fileData) => onChange({ target: { value: fileData } })}
          error={error}
          multiple={false}
          placeholder={`Seleccionar archivo para ${column.name}`}
        />
      );

    case "file_array":
      return (
        <FileUpload
          value={value}
          onChange={(fileData) => onChange({ target: { value: fileData } })}
          error={error}
          multiple={true}
          placeholder={`Seleccionar archivos para ${column.name}`}
        />
      );

    default:
      return (
        <Input
          id={id}
          type="text"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
          placeholder={`Ingresa ${column.name}`}
        />
      );
  }
}
