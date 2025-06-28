import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/confirmation_dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmationDialog({
  open,
  onClose,
  title = "¿Está seguro?",
  message = "Esta acción no se puede deshacer.",
  actions = [], // Array of { label, onClick, variant }
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-2 border-black p-8 max-w-lg w-full text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-lg font-normal leading-relaxed text-gray-900 not-only-of-type:mt-2">
          {message}
        </div>
        <DialogFooter className="flex justify-center gap-4">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              onClick={action.onClick}
              className="font-bold py-2 px-8 text-base"
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
