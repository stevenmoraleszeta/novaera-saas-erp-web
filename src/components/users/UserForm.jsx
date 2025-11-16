"use client";

// UserForm.jsx - Reusable form for creating and editing users
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import ReusableCombobox from "@/components/ui/reusableCombobox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Alert from "../common/Alert";
import { checkEmailExists } from "../../services/userService";
import {
  Eye,
  EyeOff,
  Check,
  X,
  User,
  Mail,
  Shield,
  Lock,
  Save,
  X as XIcon,
} from "lucide-react";

import useUserStore from "@/stores/userStore";

/**
 * Props:
 *  - open: boolean
 *  - onOpenChange: function
 *  - mode: 'create' | 'edit'
 *  - initialData: object (for edit mode)
 *  - onSubmit: function
 *  - onCancel: function
 *  - onDelete: function
 *  - loading: boolean
 *  - error: string
 */
export default function UserForm({
  open = false,
  onOpenChange,
  mode = "create",
  initialData = null,
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  error = null,
  roles = [],
}) {
  const { user } = useUserStore();

  const isEditMode = mode === "edit";

  // Form state - only include fields that exist in the database
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    isActive: true,
  });

  // Validation and UI state
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Transform roles to options format
  const roleOptions = [
    { value: "Sin rol", label: "Sin rol" },
    ...roles.map((role) => ({
      value: role.name,
      label: role.name,
    })),
  ];

  // Load roles on component mount - removed since we now receive roles as prop

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && initialData) {
      console.log('UserForm - Setting initial data:', initialData);
      console.log('UserForm - Available roles:', roles);
      console.log('UserForm - Role from initialData:', initialData.role);
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      console.log('UserForm - Form data set with role:', initialData.role || "");
    } else if (!open) {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        isActive: true,
      });
      setFormErrors({});
      setEmailValid(null);
    }
  }, [open, initialData, user?.id, roles]);

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
        (isEditMode && email === initialData?.email)
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
    [isEditMode, initialData?.email]
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
      errors.email = "El correo electrónico es obligatorio";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "El correo electrónico no es válido";
    } else if (emailValid === false && !emailChecking) {
      errors.email = "Este correo electrónico ya está registrado";
    }

    // Role validation
    if (!formData.role) {
      errors.role = "Debes seleccionar un rol";
    }

    // Password validation (only for create mode or if password is provided in edit mode)
    if (!isEditMode || formData.password) {
      if (!formData.password) {
        errors.password = "La contraseña es obligatoria";
      } else if (!isValidPassword(formData.password)) {
        errors.password = "La contraseña debe tener al menos 6 caracteres";
      }
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

    // Prepare data for submission - only include fields that exist in database
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      isActive: formData.isActive,
    };

    // Only include password if provided (for edit mode) or always (for create mode)
    if (!isEditMode || formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange?.(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (onDelete && initialData) {
      onDelete(initialData);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nombre y apellidos"
                    required
                    disabled={loading}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="usuario@empresa.com"
                      required
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                  {emailValid === false && (
                    <p className="text-sm text-red-500">Este email ya está en uso</p>
                  )}
                  {emailValid === true && (
                    <p className="text-sm text-green-500">Email disponible</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {mode === "create" ? "Contraseña" : "Nueva Contraseña (opcional)"}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Contraseña segura"
                      required={mode === "create"}
                      disabled={loading}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Rol y Estado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <ReusableCombobox
                    label="Rol del Sistema"
                    placeholder="Selecciona un rol"
                    options={roleOptions}
                    value={formData.role}
                    onChange={(value) => handleChange("role", value)}
                    disabled={loading}
                  />
                  {formData.role && (
                    <p className="text-xs text-gray-500">
                      Rol actual: {formData.role}
                    </p>
                  )}
                  {formErrors.role && (
                    <p className="text-sm text-red-500">{formErrors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Estado del Usuario</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleChange("isActive", checked)}
                      disabled={loading}
                    />
                    <Label htmlFor="isActive" className="text-sm">
                      Usuario activo
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Los usuarios inactivos no podrán iniciar sesión
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter>
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Eliminar
            </Button>
          )}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              loading || !formData.name.trim() || !formData.email.trim()
            }
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>{mode === "edit" ? "Actualizar" : "Crear"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Modal */}
    <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-600" />
            Confirmar Eliminación
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            ¿Estás seguro de que deseas eliminar al usuario{" "}
            <span className="font-semibold">{initialData?.name}</span>?
          </p>
          <p className="text-sm text-red-600">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={cancelDelete}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
