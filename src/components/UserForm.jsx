// UserForm.jsx - Reusable form for creating and editing users
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Alert from "./Alert";
import { fetchRoles, checkEmailExists } from "../services/userService";
import { Eye, EyeOff, Check, X, User, Mail, Shield, Lock } from "lucide-react";

/**
 * Props:
 *  - open: boolean
 *  - onOpenChange: function
 *  - mode: 'create' | 'edit'
 *  - initialData: object (for edit mode)
 *  - onSubmit: function
 *  - onCancel: function
 *  - loading: boolean
 *  - error: string
 */
export default function UserForm({
  open = false,
  onOpenChange,
  mode = "create",
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) {
  const isEditMode = mode === "edit";

  // Form state
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    password: "",
    confirmPassword: "",
    role: initialData.role || "",
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
  });

  // Validation and UI state
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Load roles on component mount
  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        confirmPassword: "",
        role: initialData.role || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else if (!open) {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        isActive: true,
      });
      setFormErrors({});
      setEmailValid(null);
    }
  }, [open, initialData]);

  // Load available roles
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const rolesData = await fetchRoles();
      console.log("Roles data received:", rolesData);

      // Transform roles to options format
      const roleOptions = rolesData.map((role) => ({
        value: role.name, // Always use role.name as value
        label: role.label || role.name,
      }));

      console.log("Role options transformed:", roleOptions);
      console.log("Original roles data:", rolesData);
      setRoles(roleOptions);
    } catch (err) {
      console.error("Error loading roles:", err);
    } finally {
      setRolesLoading(false);
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  // Check email uniqueness with debounce
  const checkEmailUniqueness = useCallback(
    async (email) => {
      if (
        !email ||
        !isValidEmail(email) ||
        (isEditMode && email === initialData.email)
      ) {
        setEmailValid(null);
        return;
      }

      try {
        setEmailChecking(true);
        const exists = await checkEmailExists(email);
        console.log("Email check result for", email, ":", exists);
        setEmailValid(!exists);
      } catch (err) {
        console.error("Error checking email:", err);
        // En caso de error, no bloquear el formulario
        setEmailValid(null);
      } finally {
        setEmailChecking(false);
      }
    },
    [isEditMode, initialData.email]
  );

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.email.trim() !== "") {
        checkEmailUniqueness(formData.email);
      } else {
        setEmailValid(null);
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, checkEmailUniqueness]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "El email es obligatorio";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "El formato del email no es válido";
    } else if (emailValid === false && !emailChecking) {
      errors.email = "Este email ya está registrado";
    }

    // Password validation (only for create mode or if password is provided in edit mode)
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = "La contraseña es obligatoria";
      } else if (!isValidPassword(formData.password)) {
        errors.password = "La contraseña debe tener al menos 6 caracteres";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirma tu contraseña";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }
    } else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Role validation
    if (!formData.role || formData.role.trim() === "") {
      errors.role = "Selecciona un rol";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (emailChecking) {
      console.log("Esperando validación de email...");
      return; // Wait for email validation
    }

    // Si el email no se pudo validar pero el formato es correcto, permitir continuar
    if (emailValid === null && isValidEmail(formData.email)) {
      console.log(
        "Email validation failed, but format is valid. Proceeding..."
      );
    }

    // Prepare data for submission
    const submitData = { ...formData };

    // Remove confirmPassword from submission
    delete submitData.confirmPassword;

    // Remove empty password in edit mode
    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    console.log("🚀 UserForm submitting data:", submitData);
    console.log("📋 Selected role:", submitData.role);
    console.log("📊 Available role options:", roles);

    onSubmit(submitData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {isEditMode
                  ? "Modifica la información del usuario"
                  : "Completa los datos del nuevo usuario"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Básica
            </h3>

            {/* Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Nombre completo *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ingresa el nombre completo"
                className={formErrors.name ? "border-red-500" : ""}
                disabled={loading}
              />
              {formErrors.name && (
                <p className="text-xs text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Correo electrónico *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="usuario@empresa.com"
                  className={formErrors.email ? "border-red-500" : ""}
                  disabled={loading}
                />
                {emailChecking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-xs">Verificando...</span>
                  </div>
                )}
                {emailValid === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Disponible</span>
                  </div>
                )}
                {emailValid === false && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-red-600">
                    <X className="w-4 h-4" />
                    <span className="text-xs">Ya registrado</span>
                  </div>
                )}
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Rol *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
                disabled={loading || rolesLoading}
              >
                <SelectTrigger
                  className={formErrors.role ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      rolesLoading ? "Cargando roles..." : "Selecciona un rol"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-xs text-red-600">{formErrors.role}</p>
              )}
            </div>

            {/* Status Field (only in edit mode) */}
            {isEditMode && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleChange("isActive", checked)
                    }
                    disabled={loading}
                  />
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Usuario activo
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Los usuarios inactivos no pueden acceder al sistema
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Password Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {isEditMode ? "Cambiar Contraseña (Opcional)" : "Contraseña *"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  {isEditMode ? "Nueva contraseña" : "Contraseña *"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={formErrors.password ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  {isEditMode
                    ? "Confirmar nueva contraseña"
                    : "Confirmar contraseña *"}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    placeholder="Repite la contraseña"
                    className={
                      formErrors.confirmPassword ? "border-red-500" : ""
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-600">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (emailValid === false && !emailChecking)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? "Actualizando..." : "Creando..."}
                </div>
              ) : (
                <>{isEditMode ? "Actualizar Usuario" : "Crear Usuario"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
