import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";

export default function AuditLogModal({ open, onClose, recordId, tableName }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !recordId) return;
    setLoading(true);
    setError(null);
    axios
      .get(`/audit-log/record/${recordId}`)
      .then((res) => setLogs(res.data))
      .catch((err) => setError("Error al cargar el historial de cambios"))
      .finally(() => setLoading(false));
  }, [open, recordId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => {
        e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle>Historial de Cambios</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Cargando...</div>
        ) : error ? (
          <div className="text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No hay cambios registrados para este registro.</div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{log.action}</Badge>
                  <span className="text-xs text-gray-500">{new Date(log.changed_at).toLocaleString()}</span>
                  {log.changed_by && (
                    <span className="flex items-center gap-1 text-xs text-gray-600 ml-2">
                      <User className="w-3 h-3" />
                      {log.user_name || log.user_username || log.user_email || `Usuario ${log.changed_by}`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.old_data && (
                    <div>
                      <div className="font-semibold text-sm mb-1">Datos Anteriores</div>
                      <ChangeDataView data={log.old_data} />
                    </div>
                  )}
                  {log.new_data && (
                    <div>
                      <div className="font-semibold text-sm mb-1">Datos Nuevos</div>
                      <ChangeDataView data={log.new_data} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onClose(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChangeDataView({ data }) {
  if (!data || typeof data !== "object") return null;
  // Si viene como string, intentar parsear
  let obj = data;
  if (typeof data === "string") {
    try {
      obj = JSON.parse(data);
    } catch {
      return <div className="text-xs text-gray-400">No se pudo leer el dato</div>;
    }
  }
  // Si tiene record_data, mostrar solo eso
  if (obj.record_data) obj = obj.record_data;
  return (
    <div className="space-y-1">
      {Object.entries(obj).map(([key, value]) => (
        <div key={key} className="flex gap-2 text-sm">
          <span className="font-medium text-gray-700">{key}:</span>
          <span className="text-gray-900">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
