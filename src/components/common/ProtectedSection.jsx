// Componente para proteger secciones basadas en permisos
import React from 'react';
import useUserPermissions from '../../hooks/useUserPermissions';
import PermissionDenied from './PermissionDenied';
import Loader from './Loader';

const ProtectedSection = ({ 
  tableId, 
  requiredPermissions = [], 
  requireAny = false, // Si true, requiere cualquiera de los permisos; si false, requiere todos
  fallback = null, // Componente personalizado para mostrar cuando no hay permisos
  children,
  showLoader = true,
  permissionDeniedProps = {}
}) => {
  const { permissions, loading, error, hasPermission, hasPermissions, hasAnyPermission } = useUserPermissions(tableId);

  // Mostrar loader mientras se cargan los permisos
  if (loading && showLoader) {
    return <Loader text="Verificando permisos..." />;
  }

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <PermissionDenied 
        title="Error al verificar permisos"
        message="Hubo un problema al verificar tus permisos. Por favor, recarga la página."
        {...permissionDeniedProps}
      />
    );
  }

  // Verificar permisos
  let hasRequiredPermissions = false;

  if (requiredPermissions.length === 0) {
    // Si no se especifican permisos, verificar si tiene algún permiso
    hasRequiredPermissions = hasAnyPermission();
  } else if (requireAny) {
    // Verificar si tiene al menos uno de los permisos requeridos
    hasRequiredPermissions = requiredPermissions.some(perm => hasPermission(perm));
  } else {
    // Verificar si tiene todos los permisos requeridos
    hasRequiredPermissions = hasPermissions(requiredPermissions);
  }

  // Si no tiene permisos, mostrar mensaje de denegación
  if (!hasRequiredPermissions) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <PermissionDenied 
        message="No tienes los permisos necesarios para acceder a esta sección."
        {...permissionDeniedProps}
      />
    );
  }

  // Si tiene permisos, mostrar el contenido
  return children;
};

export default ProtectedSection;
