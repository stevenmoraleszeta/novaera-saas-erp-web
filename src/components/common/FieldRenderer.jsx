import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function FieldRenderer({ id, column, value, onChange, error }) {
  const baseClassName = `w-full ${
    error ? "border-red-500 focus:border-red-500" : ""
  }`;

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
        <Input
          id={id}
          type="date"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
        />
      );

    case "datetime":
    case "timestamp":
      return (
        <Input
          id={id}
          type="datetime-local"
          value={value || ""}
          onChange={onChange}
          className={baseClassName}
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
      // For select/enum types, you might want to pass options as a prop
      const options = column.options || [];
      return (
        <Select
          value={value || ""}
          onValueChange={(val) => onChange({ target: { value: val } })}
        >
          <SelectTrigger className={baseClassName}>
            <SelectValue placeholder={`Selecciona ${column.name}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
