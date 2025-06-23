// UserDetailView.jsx - Component to display detailed user information
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useUserStore from "./userStore";
import { Edit3, Trash2, Eye, EyeOff } from "lucide-react";
import UserStatusBadge from "./UserStatusBadge";
import ConfirmationModal from "./ConfirmationModal";
import Alert from "./Alert";
import { useConfirmationModal } from "../hooks/useModal";
import {
  PiPencilBold,
  PiTrashBold,
  PiCalendarBold,
  PiEnvelopeBold,
  PiUserBold,
  PiShieldBold,
  PiToggleLeftBold,
  PiToggleRightBold,
  PiLockBold,
  PiLockOpenBold,
} from "react-icons/pi";

/**
 * Props:
 *  - user: object (user data)
 *  - onEdit: function
 *  - onDelete: function
 *  - onToggleStatus: function
 *  - onBlockUser: function
 *  - onUnblockUser: function
 *  - onClose: function
 *  - loading: boolean (default: false)
 *  - error: string | null
 *  - success: string | null
 *  - onClearMessages: function
 *  - canEdit: boolean (default: true)
 *  - canDelete: boolean (default: true)
 *  - canManageStatus: boolean (default: true)
 *  - canBlockUsers: boolean (default: false)
 */
export default function UserDetailView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user: currentUser } = useUserStore();

  // Confirmation modal hook
  const {
    isOpen: isConfirmationOpen,
    confirmationData,
    openConfirmation,
    closeConfirmation,
    handleConfirm,
  } = useConfirmationModal();

  // Mock user data - replace with actual API call
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser = {
          id: parseInt(id),
          name: "Juan Pérez",
          email: "juan.perez@empresa.com",
          role: "Administrador",
          department: "IT",
          status: "Activo",
          createdAt: "2024-01-15",
          lastLogin: "2024-01-20T10:30:00Z",
          permissions: ["read", "write", "delete", "admin"],
          phone: "+1 234 567 8900",
          address: "123 Main St, City, State 12345",
        };

        setUser(mockUser);
      } catch (err) {
        setError("Error al cargar el usuario");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Handle delete logic here
    console.log("Deleting user:", user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    if (!role) return "Sin rol";

    const roleMap = {
      admin: "Administrador",
      manager: "Gerente",
      supervisor: "Supervisor",
      user: "Usuario",
    };

    const displayName = roleMap[role.toLowerCase()] || role;
    console.log(`🏷️ Role display mapping: "${role}" -> "${displayName}"`);
    return displayName;
  };

  // Check permissions based on current user role
  const hasPermission = (action) => {
    if (!currentUser) return false;

    const currentUserRole = currentUser.role?.toLowerCase();
    const targetUserRole = user.role?.toLowerCase();

    switch (action) {
      case "edit":
        return (
          canEdit &&
          (currentUserRole === "admin" ||
            (currentUserRole === "manager" && targetUserRole !== "admin"))
        );
      case "delete":
        return canDelete && currentUserRole === "admin";
      case "toggleStatus":
        return (
          canManageStatus &&
          (currentUserRole === "admin" ||
            (currentUserRole === "manager" && targetUserRole !== "admin"))
        );
      case "block":
        return canBlockUsers && currentUserRole === "admin";
      default:
        return false;
    }
  };

  // Handle status toggle with confirmation
  const handleToggleStatus = () => {
    const action = user.status === "Activo" ? "desactivar" : "activar";
    const actionCapitalized =
      user.status === "Activo" ? "Desactivar" : "Activar";

    openConfirmation({
      title: `${actionCapitalized} Usuario`,
      message: `¿Estás seguro de que deseas ${action} a ${user.name}? ${
        user.status === "Activo"
          ? "El usuario no podrá acceder al sistema."
          : "El usuario podrá acceder al sistema nuevamente."
      }`,
      confirmText: `Sí, ${action}`,
      cancelText: "Cancelar",
      type: user.status === "Activo" ? "warning" : "default",
      onConfirm: () => onToggleStatus && onToggleStatus(user),
    });
  };

  // Handle user blocking with confirmation
  const handleBlockUser = () => {
    openConfirmation({
      title: "Bloquear Usuario",
      message: `¿Estás seguro de que deseas bloquear a ${user.name}? El usuario no podrá acceder al sistema hasta ser desbloqueado.`,
      confirmText: "Sí, bloquear",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: () => onBlockUser && onBlockUser(user),
    });
  };

  // Handle user unblocking with confirmation
  const handleUnblockUser = () => {
    openConfirmation({
      title: "Desbloquear Usuario",
      message: `¿Estás seguro de que deseas desbloquear a ${user.name}? El usuario podrá acceder al sistema nuevamente.`,
      confirmText: "Sí, desbloquear",
      cancelText: "Cancelar",
      type: "default",
      onConfirm: () => onUnblockUser && onUnblockUser(user),
    });
  };

  // Handle user deletion with confirmation
  const handleDeleteUser = () => {
    openConfirmation({
      title: "Eliminar Usuario",
      message: `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: () => onDelete && onDelete(user),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Detalles del Usuario
        </h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
              >
                Guardar
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit} variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleDeleteUser} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Nombre
              </label>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Teléfono
              </label>
              <p className="text-lg">{user.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Dirección
              </label>
              <p className="text-lg">{user.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Rol</label>
              <Badge variant="secondary" className="text-sm">
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Departamento
              </label>
              <p className="text-lg">{user.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Estado
              </label>
              <Badge
                variant={user.status === "Activo" ? "default" : "destructive"}
                className="text-sm"
              >
                {user.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Fecha de Creación
              </label>
              <p className="text-lg">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Último Acceso
              </label>
              <p className="text-lg">{formatDate(user.lastLogin)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={isConfirmationOpen}
        onOpenChange={closeConfirmation}
        title={confirmationData.title}
        message={confirmationData.message}
        confirmText={confirmationData.confirmText}
        cancelText={confirmationData.cancelText}
        type={confirmationData.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={confirmationData.loading}
      />

      <style jsx>{`
        .user-detail-view {
          padding: 0;
          background: white;
        }

        .no-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary, #6b7280);
          text-align: center;
        }

        .no-user-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: var(--background, #f9fafb);
        }

        .user-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--primary-green, #7ed957);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          color: white;
          font-size: 2rem;
          font-weight: 600;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .user-email {
          margin: 0 0 1rem 0;
          color: var(--text-secondary, #6b7280);
          font-size: 1rem;
        }

        .user-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .blocked-badge {
          background: var(--error-bg, #fee2e2);
          color: var(--error-text, #dc2626);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .user-details {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.5rem;
          background: var(--background, #f9fafb);
        }

        .detail-icon {
          color: var(--primary-green, #7ed957);
          font-size: 1.25rem;
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .detail-content {
          flex: 1;
        }

        .detail-content label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.025em;
          margin-bottom: 0.25rem;
        }

        .detail-content span {
          display: block;
          color: var(--text-primary, #111827);
          font-weight: 500;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-badge.admin {
          background: #fef3c7;
          color: #d97706;
        }

        .role-badge.manager {
          background: #e0f2fe;
          color: #0369a1;
        }

        .role-badge.supervisor {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .role-badge.user {
          background: #f0f9ff;
          color: #0284c7;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.5rem;
          background: var(--background, #f9fafb);
        }

        .status-item.blocked {
          border-color: var(--error-text, #dc2626);
          background: var(--error-bg, #fee2e2);
        }

        .status-label {
          font-weight: 500;
          color: var(--text-primary, #111827);
          min-width: 60px;
        }

        .status-description {
          color: var(--text-secondary, #6b7280);
          font-size: 0.875rem;
        }

        .detail-actions {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border-color, #e5e7eb);
          background: var(--background, #f9fafb);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .primary-actions,
        .secondary-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .primary-actions {
          padding-bottom: 0.5rem;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .user-header {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }

          .user-details {
            padding: 1.5rem;
          }

          .detail-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .detail-actions {
            padding: 1.5rem;
          }

          .primary-actions,
          .secondary-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .secondary-actions {
            flex-direction: column-reverse;
          }

          .primary-actions :global(button),
          .secondary-actions :global(button) {
            width: 100%;
          }

          .status-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
