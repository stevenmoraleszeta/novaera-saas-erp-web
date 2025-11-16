"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XIcon, AlertCircle, Users, UserCheck } from "lucide-react";
import { fetchRoles, assignRoleToUser, getUserRoles, removeUserRoles } from "@/services/userService";
import useEditModeStore from "@/stores/editModeStore";

export default function UserRoleModal({
  open = false,
  onOpenChange,
  user = null,
  onSaveUser,
  onDeleteUser,
  loading = false,
}) {
  const { isEditingMode } = useEditModeStore();
  
  // Estados para el usuario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Estados para roles
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("no-role");
  const [currentUserRoles, setCurrentUserRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesDirty, setRolesDirty] = useState(false);
  const [savingRoles, setSavingRoles] = useState(false);

  useEffect(() => {
    const initializeModal = async () => {
      if (open) {
        // Resetear estados primero
        setErrors({});
        setSubmitError(null);
        setIsDirty(false);
        setRolesDirty(false);
        setSelectedRole("no-role");
        setCurrentUserRoles([]);
        
        // Cargar roles disponibles primero
        const roles = await loadRoles();
        
        if (user) {
          // Cargar datos del usuario existente
          setFormData({
            name: user.name || user.record_data?.name || "",
            email: user.email || user.record_data?.email || "",
            password: "",
            confirmPassword: "",
          });
          
          // Cargar roles del usuario después de que los roles disponibles estén cargados
          // Pasar los roles directamente para evitar problemas de timing con el estado
          await loadUserRoles(roles || []);
        } else {
          // Reset para nuevo usuario
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setSelectedRole("no-role");
          setCurrentUserRoles([]);
        }
      }
    };

    initializeModal();
  }, [open, user]);

  const loadRoles = async () => {
    try {
      const roles = await fetchRoles();
      setAvailableRoles(roles || []);
      return roles || [];
    } catch (error) {
      console.error('Error loading roles:', error);
      setSubmitError('Error al cargar los roles');
      return [];
    }
  };

  const loadUserRoles = async (availableRolesList = []) => {
    if (!user) return;
    
    setRolesLoading(true);
    try {
      const userId = user.id || user.record_data?.id;
      
      // Obtener roles del usuario desde la API
      const userRoles = await getUserRoles(userId);
      setCurrentUserRoles(userRoles || []);
      
      // Obtener el rol principal
      let primaryRole = null;
      if (userRoles && userRoles.length > 0) {
        primaryRole = typeof userRoles[0] === 'string' 
          ? userRoles[0] 
          : userRoles[0]?.name || userRoles[0]?.rol_name || userRoles[0]?.toString();
      }
      
      // Si no hay rol en los roles obtenidos, intentar obtenerlo de los datos del usuario
      if (!primaryRole || primaryRole === 'Sin rol') {
        primaryRole = user.role || user.record_data?.role;
      }
      
      // Usar los roles pasados como parámetro o los del estado si están disponibles
      const rolesToUse = availableRolesList.length > 0 ? availableRolesList : availableRoles;
      
      // Establecer el rol seleccionado
      if (primaryRole && primaryRole !== "Sin rol" && primaryRole.trim() !== "") {
        // Convertir el nombre del rol a ID
        const roleFound = rolesToUse.find(role => 
          role.name === primaryRole || 
          role.name?.toLowerCase() === primaryRole?.toLowerCase()
        );
        if (roleFound) {
          setSelectedRole(roleFound.id.toString());
        } else {
          setSelectedRole("no-role");
        }
      } else {
        setSelectedRole("no-role");
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
      setSubmitError('Error al cargar los roles del usuario');
      setSelectedRole("no-role");
    } finally {
      setRolesLoading(false);
    }
  };
  
  // Efecto de respaldo para establecer el rol seleccionado si por alguna razón no se estableció antes
  // Esto solo se ejecuta si selectedRole es un nombre de rol (string) y los roles ya están cargados
  useEffect(() => {
    if (!user || !open || availableRoles.length === 0 || rolesLoading) return;
    
    // Solo procesar si selectedRole es un nombre de rol (no un ID numérico)
    const currentSelected = selectedRole;
    if (currentSelected && currentSelected !== "no-role" && isNaN(parseInt(currentSelected))) {
      // Es un nombre de rol, buscar su ID
      const roleFound = availableRoles.find(role => 
        role.name === currentSelected || 
        role.name?.toLowerCase() === currentSelected?.toLowerCase()
      );
      if (roleFound) {
        setSelectedRole(roleFound.id.toString());
      }
    }
  }, [availableRoles, user, open, rolesLoading]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
    setIsDirty(true);
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setRolesDirty(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    // Validar contraseña solo para nuevos usuarios o si se está cambiando
    if (!user && !formData.password) {
      newErrors.password = "La contraseña es requerida";
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      let userId = user?.id || user?.record_data?.id;
      
      // Guardar datos del usuario si hay cambios
      if (isDirty) {
        const userData = {
          name: formData.name,
          email: formData.email,
        };
        
        // Solo incluir contraseña si se proporcionó
        if (formData.password) {
          userData.password = formData.password;
        }
        
        // Para usuarios nuevos, incluir el rol en el payload inicial
        if (!userId && selectedRole && selectedRole !== "no-role") {
          const selectedRoleObj = availableRoles.find(role => role.id.toString() === selectedRole);
          if (selectedRoleObj) {
            userData.role = selectedRoleObj.name;
          }
        }
        
        const savedUser = await onSaveUser(userData);
        // Si es un nuevo usuario, obtener el ID del usuario creado
        if (!userId && savedUser) {
          userId = savedUser.id || savedUser.record_data?.id;
        }
      }
      
      // Guardar rol si hay cambios y tenemos un userId (para usuarios existentes)
      if (rolesDirty && userId && user) { // Solo para usuarios existentes
        setSavingRoles(true);
        try {
          if (selectedRole === "no-role") {
            // Remover todos los roles del usuario
            await removeUserRoles(userId);
          } else if (selectedRole) {
            // Encontrar el nombre del rol usando el ID seleccionado
            const selectedRoleObj = availableRoles.find(role => role.id.toString() === selectedRole);
            if (selectedRoleObj) {
              // Asignar el rol seleccionado usando el nombre del rol
              await assignRoleToUser(userId, selectedRoleObj.name);
            }
          }
          setRolesDirty(false);
        } catch (error) {
          console.error('Error saving role:', error);
          setSubmitError('Error al asignar el rol');
          return;
        } finally {
          setSavingRoles(false);
        }
      }
      
      setIsDirty(false);
      onOpenChange?.(false);
    } catch (error) {
      setSubmitError(error?.message || "Error al guardar");
    }
  };

  const handleDelete = () => {
    if (user && onDeleteUser) {
      onDeleteUser(user);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10 bg-black/30 flex items-start justify-center px-4 py-28">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[800px] relative z-10 flex flex-col overflow-hidden h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="bg-black text-white ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            aria-label="Cerrar modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto px-4 py-2 flex-1">
          <form noValidate className="space-y-6">
            {/* Datos del usuario */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Información del Usuario</h3>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre
                  <Badge className="ml-1 text-xs text-destructive bg-transparent">
                    *Requerido
                  </Badge>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nombre completo del usuario"
                  className={`h-11 ${errors.name ? "border-red-500" : ""}`}
                  disabled={loading}
                  autoFocus
                />
                {errors.name && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                  <Badge className="ml-1 text-xs text-destructive bg-transparent">
                    *Requerido
                  </Badge>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@ejemplo.com"
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                  disabled={loading}
                />
                {errors.email && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {user ? "Nueva Contraseña (opcional)" : "Contraseña"}
                  {!user && (
                    <Badge className="ml-1 text-xs text-destructive bg-transparent">
                      *Requerido
                    </Badge>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={user ? "Dejar vacío para mantener actual" : "Contraseña"}
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                  disabled={loading}
                />
                {errors.password && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              {formData.password && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar Contraseña
                    <Badge className="ml-1 text-xs text-destructive bg-transparent">
                      *Requerido
                    </Badge>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirmar contraseña"
                    className={`h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sección de roles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Asignación de Rol</h3>
              </div>

              {rolesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Cargando roles...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Selecciona el rol que tendrá este usuario en el sistema.
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol del Usuario</Label>
                    <Select value={selectedRole} onValueChange={handleRoleChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar rol..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-role">Sin rol</SelectItem>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentUserRoles.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Roles actuales:</strong> {currentUserRoles.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Footer con botones */}
        <div className="border-t p-4 flex justify-between">
          {/* Izquierda: Guardar y Eliminar */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              onClick={handleSave} 
              disabled={loading || savingRoles}
            >
              {loading || savingRoles ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>Guardar</>
              )}
            </Button>
            
            {user && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={loading || savingRoles}
              >
                Eliminar
              </Button>
            )}
          </div>

         
        </div>
      </div>
    </div>
  );
}
