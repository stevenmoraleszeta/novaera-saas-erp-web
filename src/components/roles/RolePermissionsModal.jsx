import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, X, Loader2 } from "lucide-react";
import RolePermissionsView from "./RolePermissionsView";
import { getTables } from "../../services/tablesService";

export default function RolePermissionsModal({
  open = false,
  onOpenChange,
  permissions = [],
  loading = false,
  error = null,
}) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (open) {
      getTables().then(setTables);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Permisos Asignados
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Visualiza los permisos asignados a este rol
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Cargando permisos...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <RolePermissionsView permissions={permissions} tables={tables} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="h-11 px-6">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
