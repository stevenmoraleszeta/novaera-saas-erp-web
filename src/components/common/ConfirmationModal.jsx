// ConfirmationModal.jsx - Reusable confirmation modal component
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";

/**
 * Props:
 *  - open: boolean
 *  - onOpenChange: function
 *  - title: string
 *  - message: string
 *  - confirmText: string (default: 'Confirmar')
 *  - cancelText: string (default: 'Cancelar')
 *  - type: 'default' | 'danger' | 'warning' (default: 'default')
 *  - onConfirm: function
 *  - onCancel: function
 *  - loading: boolean (default: false)
 */
export default function ConfirmationModal({
  open = false,
  onOpenChange,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "default",
  onConfirm,
  onCancel,
  loading = false,
}) {
  const handleConfirm = () => {
    if (onConfirm && !loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (loading) return;

    if (onCancel) {
      onCancel();
    } else {
      onOpenChange?.(false);
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  // Get icon background color based on type
  const getIconBgColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-100";
      case "warning":
        return "bg-yellow-100";
      default:
        return "bg-blue-100";
    }
  };

  // Get confirm button variant based on type
  const getConfirmVariant = () => {
    switch (type) {
      case "danger":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
