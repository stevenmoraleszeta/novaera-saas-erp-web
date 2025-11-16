import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DialogActions({
  primaryAction,
  secondaryAction,
  cancelAction,
  loading = false,
  disabled = false,
  className = "",
}) {
  return (
    <DialogFooter className={`gap-2 ${className}`}>
      {cancelAction && (
        <Button
          type="button"
          variant="outline"
          onClick={cancelAction.onClick}
          disabled={loading || disabled || cancelAction.disabled}
          className={cancelAction.className}
        >
          {cancelAction.icon && <cancelAction.icon className="w-4 h-4 mr-2" />}
          {cancelAction.label || "Cancelar"}
        </Button>
      )}

      {secondaryAction && (
        <Button
          type="button"
          variant={secondaryAction.variant || "outline"}
          onClick={secondaryAction.onClick}
          disabled={loading || disabled || secondaryAction.disabled}
          className={secondaryAction.className}
        >
          {secondaryAction.icon && (
            <secondaryAction.icon className="w-4 h-4 mr-2" />
          )}
          {secondaryAction.label}
        </Button>
      )}

      {primaryAction && (
        <Button
          type="submit"
          variant={primaryAction.variant || "default"}
          onClick={primaryAction.onClick}
          disabled={loading || disabled || primaryAction.disabled}
          className={primaryAction.className}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          )}
          {primaryAction.icon && !loading && (
            <primaryAction.icon className="w-4 h-4 mr-2" />
          )}
          {primaryAction.label}
        </Button>
      )}
    </DialogFooter>
  );
}
