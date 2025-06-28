"use client";

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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Alert from "../common/Alert";
import { fetchRoles, checkEmailExists } from "../../services/userService";
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
}) {
  const { user } = useUserStore();

  const isEditMode = mode === "edit";

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    position: "",
    phone: "",
    address: "",
    created_by: user?.id || null,
    isActive: true,
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
        department: initialData.department || "",
        position: initialData.position || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        created_by: user?.id || null,
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
        department: "",
        position: "",
        phone: "",
        address: "",
        created_by: user?.id || null,
        isActive: true,
      });
      setFormErrors({});
      setEmailValid(null);
    }
  }, [open, initialData, user?.id]);

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

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Debes confirmar la contraseña";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
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

    // Prepare data for submission
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      department: formData.department,
      position: formData.position,
      phone: formData.phone,
      address: formData.address,
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
    if (onDelete && initialData) {
      onDelete(initialData);
    }
  };

  return (
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
              <h3 className="text-lg font-medium text-gray-900">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="usuario@empresa.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {mode === "create" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Contraseña segura"
                    required={mode === "create"}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Información Laboral
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input
                    id="role"
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    placeholder="Ej: Administrador, Usuario, Editor"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    placeholder="Ej: IT, Ventas, Recursos Humanos"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                    placeholder="Ej: Desarrollador, Gerente, Analista"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 234 567 8900"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Información Adicional
              </h3>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Dirección completa"
                  rows={3}
                  disabled={loading}
                />
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
  );
}
