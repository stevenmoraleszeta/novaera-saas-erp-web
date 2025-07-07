import React, { useState, useEffect } from 'react';
import { useScheduledNotifications } from '../../hooks/useScheduledNotifications';
import { getUsers } from '../../services/userService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { toast } from 'sonner';

const ScheduledNotificationForm = ({ 
  isOpen, 
  onClose, 
  tableId, 
  recordId, 
  initialData = null, 
  onSuccess 
}) => {
  const { createScheduledNotification, getDateColumns } = useScheduledNotifications();
  const [formData, setFormData] = useState({
    column_id: '',
    target_date: '',
    notification_title: '',
    notification_message: '',
    notify_before_days: 0,
    assigned_users: []
  });
  const [dateColumns, setDateColumns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && tableId) {
      loadDateColumns();
      loadUsers();
    }
  }, [isOpen, tableId]);

  // Cargar datos para edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        column_id: initialData.column_id || '',
        target_date: initialData.target_date ? new Date(initialData.target_date).toISOString().slice(0, 16) : '',
        notification_title: initialData.notification_title || '',
        notification_message: initialData.notification_message || '',
        notify_before_days: initialData.notify_before_days || 0,
        assigned_users: initialData.assigned_users || []
      });
    } else {
      setFormData({
        column_id: '',
        target_date: '',
        notification_title: '',
        notification_message: '',
        notify_before_days: 0,
        assigned_users: []
      });
    }
  }, [initialData]);

  const loadDateColumns = async () => {
    try {
      setLoading(true);
      const columns = await getDateColumns(tableId);
      setDateColumns(columns);
    } catch (error) {
      console.error('Error loading date columns:', error);
      toast.error('Error al cargar columnas de fecha');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers({ limit: 1000 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.column_id || !formData.target_date || !formData.notification_title) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        table_id: tableId,
        record_id: recordId,
        ...formData,
        target_date: new Date(formData.target_date).toISOString()
      };

      if (initialData) {
        await updateNotification(initialData.id, data);
        toast.success('Notificación actualizada exitosamente');
      } else {
        await createNotification(data);
        toast.success('Notificación programada creada exitosamente');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error(error.message || 'Error al guardar la notificación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigned_users: prev.assigned_users.includes(userId)
        ? prev.assigned_users.filter(id => id !== userId)
        : [...prev.assigned_users, userId]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Notificación Programada' : 'Crear Notificación Programada'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="notification-form">
        {/* Columna de fecha */}
        <div className="form-group">
          <label htmlFor="column_id">
            Columna de Fecha <span className="required">*</span>
          </label>
          <select
            id="column_id"
            value={formData.column_id}
            onChange={(e) => setFormData(prev => ({ ...prev, column_id: e.target.value }))}
            required
            disabled={loading}
          >
            <option value="">Seleccione una columna de fecha</option>
            {dateColumns.map(column => (
              <option key={column.id} value={column.id}>
                {column.name} ({column.data_type})
              </option>
            ))}
          </select>
        </div>

        {/* Fecha objetivo */}
        <div className="form-group">
          <label htmlFor="target_date">
            Fecha Objetivo <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="target_date"
            value={formData.target_date}
            onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
            required
          />
        </div>

        {/* Título de la notificación */}
        <div className="form-group">
          <label htmlFor="notification_title">
            Título de la Notificación <span className="required">*</span>
          </label>
          <input
            type="text"
            id="notification_title"
            value={formData.notification_title}
            onChange={(e) => setFormData(prev => ({ ...prev, notification_title: e.target.value }))}
            placeholder="Ej: Reunión importante"
            maxLength={200}
            required
          />
        </div>

        {/* Mensaje de la notificación */}
        <div className="form-group">
          <label htmlFor="notification_message">
            Mensaje de la Notificación
          </label>
          <textarea
            id="notification_message"
            value={formData.notification_message}
            onChange={(e) => setFormData(prev => ({ ...prev, notification_message: e.target.value }))}
            placeholder="Descripción adicional de la notificación"
            rows={3}
          />
        </div>

        {/* Días antes para notificar */}
        <div className="form-group">
          <label htmlFor="notify_before_days">
            Notificar con Anticipación (días)
          </label>
          <input
            type="number"
            id="notify_before_days"
            value={formData.notify_before_days}
            onChange={(e) => setFormData(prev => ({ ...prev, notify_before_days: parseInt(e.target.value) || 0 }))}
            min="0"
            max="365"
            placeholder="0"
          />
          <small className="help-text">
            0 = notificar solo en la fecha, 1 = notificar 1 día antes, etc.
          </small>
        </div>

        {/* Usuarios asignados */}
        <div className="form-group">
          <label>Usuarios Asignados</label>
          <div className="user-selection">
            {users.map(user => (
              <div key={user.id} className="user-checkbox">
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={formData.assigned_users.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                />
                <label htmlFor={`user-${user.id}`}>
                  {user.name} ({user.email})
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
          >
            {initialData ? 'Actualizar' : 'Crear'} Notificación
          </Button>
        </div>

        <style jsx>{`
          .notification-form {
            padding: 1rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
          }

          .required {
            color: #ef4444;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          }

          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .help-text {
            display: block;
            margin-top: 0.25rem;
            color: #6b7280;
            font-size: 0.75rem;
          }

          .user-selection {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            padding: 0.5rem;
          }

          .user-checkbox {
            display: flex;
            align-items: center;
            padding: 0.25rem;
            margin-bottom: 0.25rem;
          }

          .user-checkbox input {
            margin-right: 0.5rem;
            width: auto;
          }

          .user-checkbox label {
            margin-bottom: 0;
            cursor: pointer;
            font-weight: normal;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
          }
        `}</style>
      </form>
    </Modal>
  );
};

export default ScheduledNotificationForm;
