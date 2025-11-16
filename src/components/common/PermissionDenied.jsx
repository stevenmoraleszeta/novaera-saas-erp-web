// Componente para mostrar mensajes de permisos
import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PermissionDenied = ({ 
  title = "Sin permisos", 
  message = "No tienes permisos para acceder a esta sección.",
  showIcon = true,
  variant = "default" // default, minimal, full
}) => {
  if (variant === "minimal") {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">
          {showIcon && <Lock className="h-8 w-8 mx-auto mb-2" />}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Contacta con el administrador para obtener los permisos necesarios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          {showIcon && <AlertCircle className="h-5 w-5 text-amber-600" />}
          <CardTitle className="text-amber-600">{title}</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Para acceder a esta funcionalidad, necesitas permisos específicos. 
          Contacta con el administrador del sistema.
        </p>
      </CardContent>
    </Card>
  );
};

export default PermissionDenied;
