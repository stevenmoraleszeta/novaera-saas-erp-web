import React from "react";
import ConfirmationModal from "./ConfirmationModal";

/**
 * Props:
 *  - open: boolean
 *  - onOpenChange: function
 *  - title: string (optional, defaults to "¿Eliminar elemento?")
 *  - message: string (optional, defaults to generic delete message)
 *  - itemName: string (optional, for more specific messages)
 *  - onConfirm: function
 *  - onCancel: function (optional)
 *  - loading: boolean (default: false)
 */
export default function DeleteConfirmationModal({
  open = false,
  onOpenChange,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const defaultTitle = "¿Eliminar elemento?";
  const defaultMessage =
    "Esta acción no se puede deshacer. Se eliminará permanentemente el elemento.";

  const finalTitle = title || defaultTitle;
  const finalMessage =
    message ||
    (itemName
      ? `Esta acción no se puede deshacer. Se eliminará permanentemente "${itemName}".`
      : defaultMessage);

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={finalTitle}
      message={finalMessage}
      confirmText="Sí, eliminar"
      cancelText="Cancelar"
      type="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}
