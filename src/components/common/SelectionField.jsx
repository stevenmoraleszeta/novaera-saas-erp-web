// "use client";

// import React from "react";
// import { Label } from "@/components/ui/label";
// import ReusableCombobox from '@/components/ui/reusableCombobox';

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useColumnOptions } from "@/hooks/useColumnOptions";

// export default function SelectionField({
//   columnId,
//   value,
//   onChange,
//   required = false,
//   disabled = false,
//   label,
//   placeholder = "Selecciona una opción",
// }) {
//   const { options, loading, error } = useColumnOptions(columnId);
  
//   console.log('SelectionField - columnId:', columnId, 'options:', options, 'loading:', loading, 'error:', error);

//   // Filtrar opciones válidas (que tengan valor no vacío)
//   const validOptions = options.filter(option => 
//     option && 
//     option.value !== null && 
//     option.value !== undefined && 
//     option.value !== ""
//   );

//   // Si no hay columnId válido, mostrar campo deshabilitado
//   if (!columnId || columnId === null || columnId === undefined) {
//     return (
//       <div className="space-y-2">
//         <Label className="text-sm font-medium text-gray-700">
//           {label} {required && <span className="text-red-500">*</span>}
//         </Label>
//         <div className="h-11 px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
//           <div className="text-gray-500 text-sm">Configuración de columna incompleta</div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="space-y-2">
//         <Label className="text-sm font-medium text-gray-700">
//           {label} {required && <span className="text-red-500">*</span>}
//         </Label>
//         <div className="h-11 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
//           <div className="text-gray-500">Cargando opciones...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="space-y-2">
//         <Label className="text-sm font-medium text-gray-700">
//           {label} {required && <span className="text-red-500">*</span>}
//         </Label>
//         <div className="h-11 px-3 py-2 border border-red-300 rounded-md bg-red-50">
//           <div className="text-red-500 text-sm">Error: {error}</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       <Label className="text-sm font-medium text-gray-700">
//         {label} {required && <span className="text-red-500">*</span>}
//       </Label>

//       <Select
//         value={value?.toString() || "clear-selection"}
//         onValueChange={(val) => onChange(val === "clear-selection" ? "" : val)}
//         disabled={disabled}
//       >
//         <SelectTrigger className="w-full h-11 focus:border-black focus:ring-blue-500/20 transition-colors">
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>
//         <SelectContent>
//           {/* Opción para limpiar selección */}
//           <SelectItem value="clear-selection">-- Ninguno --</SelectItem>
          
//           {validOptions.length === 0 ? (
//             <SelectItem value="no-options" disabled>
//               No hay opciones disponibles
//             </SelectItem>
//           ) : (
//             validOptions.map((option) => (
//               <SelectItem 
//                 key={option.value} 
//                 value={option.value.toString()}
//               >
//                 {option.label}
//               </SelectItem>
//             ))
//           )}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// }

// DUDA NO SE SI ESTÄ BIEN!!!!!!!!!!!!!!!!!!


"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import ReusableCombobox from "@/components/ui/reusableCombobox";
import { useColumnOptions } from "@/hooks/useColumnOptions";

export default function SelectionField({
  columnId,
  value,
  onChange,
  required = false,
  disabled = false,
  label,
  placeholder = "Selecciona una opción",
}) {
  const { options, loading, error } = useColumnOptions(columnId);

  // Muestra un estado deshabilitado si no hay columnId
  if (!columnId) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="h-11 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm flex items-center">
          Configuración de columna incompleta
        </div>
      </div>
    );
  }

  // Prepara el array de opciones, añadiendo la opción para limpiar la selección
  const finalOptions = [
    { label: "-- Ninguno --", value: "clear-selection" },
    ...options.filter(option => option && option.value !== null && option.value !== undefined && option.value !== "")
  ];

  return (
    <div className="space-y-2">
      <ReusableCombobox
        label={`${label} ${required ? '*' : ''}`}
        placeholder={loading ? "Cargando opciones..." : (error ? "Error al cargar" : placeholder)}
        options={loading || error ? [] : finalOptions}
        value={value || "clear-selection"}
        onChange={(val) => onChange(val === "clear-selection" ? "" : val)}
        disabled={disabled || loading || !!error}
        error={error} // Pasa el mensaje de error al combobox si tiene esa prop
      />
    </div>
  );
}