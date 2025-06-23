// UserForm.jsx - Reusable form for creating and editing users
import React, { useState, useEffect, useCallback } from 'react';
import FormInput from '../commmon/FormInput';
import SelectInput from '../commmon/SelectInput';
import Button from '../commmon/Button';
import Alert from '../commmon/Alert';
import { fetchRoles, checkEmailExists } from '../../services/userService';
import { PiEyeBold, PiEyeSlashBold, PiCheckBold, PiXBold } from 'react-icons/pi';

/**
 * Props:
 *  - mode: 'create' | 'edit'
 *  - initialData: object (for edit mode)
 *  - onSubmit: function
 *  - onCancel: function
 *  - loading: boolean
 *  - error: string
 */
export default function UserForm({
    mode = 'create',
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
    error = null
}) {
    const isEditMode = mode === 'edit';

    // Form state
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        confirmPassword: '',
        role: initialData.role || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
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
        loadRoles();
    }, []);

    // Load available roles
    const loadRoles = async () => {
        try {
            setRolesLoading(true);
            const rolesData = await fetchRoles();
            console.log('Roles data received:', rolesData);

            // Transform roles to options format
            const roleOptions = rolesData.map(role => ({
                value: role.name, // Always use role.name as value
                label: role.label || role.name
            }));

            console.log('Role options transformed:', roleOptions);
            console.log('Original roles data:', rolesData);
            setRoles(roleOptions);
        } catch (err) {
            console.error('Error loading roles:', err);
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
    const checkEmailUniqueness = useCallback(async (email) => {
        if (!email || !isValidEmail(email) || (isEditMode && email === initialData.email)) {
            setEmailValid(null);
            return;
        }

        try {
            setEmailChecking(true);
            const exists = await checkEmailExists(email);
            console.log('Email check result for', email, ':', exists);
            setEmailValid(!exists);
        } catch (err) {
            console.error('Error checking email:', err);
            // En caso de error, no bloquear el formulario
            setEmailValid(null);
        } finally {
            setEmailChecking(false);
        }
    }, [isEditMode, initialData.email]);

    // Debounced email check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.email && formData.email.trim() !== '') {
                checkEmailUniqueness(formData.email);
            } else {
                setEmailValid(null);
                setEmailChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.email, checkEmailUniqueness]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'El nombre es obligatorio';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'El nombre debe tener al menos 2 caracteres';
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'El email es obligatorio';
        } else if (!isValidEmail(formData.email)) {
            errors.email = 'El formato del email no es válido';
        } else if (emailValid === false && !emailChecking) {
            errors.email = 'Este email ya está registrado';
        }

        // Password validation (only for create mode or if password is provided in edit mode)
        if (!isEditMode) {
            if (!formData.password) {
                errors.password = 'La contraseña es obligatoria';
            } else if (!isValidPassword(formData.password)) {
                errors.password = 'La contraseña debe tener al menos 6 caracteres';
            }

            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Confirma tu contraseña';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Las contraseñas no coinciden';
            }
        } else if (formData.password && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        // Role validation
        if (!formData.role || formData.role.trim() === '') {
            errors.role = 'Selecciona un rol';
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
            console.log('Esperando validación de email...');
            return; // Wait for email validation
        }

        // Si el email no se pudo validar pero el formato es correcto, permitir continuar
        if (emailValid === null && isValidEmail(formData.email)) {
            console.log('Email validation failed, but format is valid. Proceeding...');
        }

        // Prepare data for submission
        const submitData = { ...formData };

        // Remove confirmPassword from submission
        delete submitData.confirmPassword;

        // Remove empty password in edit mode
        if (isEditMode && !submitData.password) {
            delete submitData.password;
        }

        console.log('🚀 UserForm submitting data:', submitData);
        console.log('📋 Selected role:', submitData.role);
        console.log('📊 Available role options:', roles);

        onSubmit(submitData);
    };

    return (
        <div className="user-form">
            <div className="form-header">
                <h2>{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                <p>{isEditMode ? 'Modifica la información del usuario' : 'Completa los datos del nuevo usuario'}</p>
            </div>

            {error && (
                <Alert type="error" message={error} />
            )}

            <form onSubmit={handleSubmit} className="form-content">
                <div className="form-grid">
                    {/* Name Field */}
                    <FormInput
                        label="Nombre completo *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={formErrors.name}
                        placeholder="Ingresa el nombre completo"
                        autoFocus
                    />

                    {/* Email Field */}
                    <div className="email-field">
                        <FormInput
                            label="Correo electrónico *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={formErrors.email}
                            placeholder="usuario@empresa.com"
                        />
                        {emailChecking && (
                            <div className="email-status checking">
                                <div className="spinner"></div>
                                <span>Verificando...</span>
                            </div>
                        )}
                        {emailValid === true && (
                            <div className="email-status valid">
                                <PiCheckBold />
                                <span>Email disponible</span>
                            </div>
                        )}
                        {emailValid === false && (
                            <div className="email-status invalid">
                                <PiXBold />
                                <span>Email ya registrado</span>
                            </div>
                        )}
                    </div>

                    {/* Role Field */}
                    <SelectInput
                        label="Rol *"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        options={roles}
                        error={formErrors.role}
                        placeholder={rolesLoading ? "Cargando roles..." : "Selecciona un rol"}
                        loading={rolesLoading}
                    />

                    {/* Status Field (only in edit mode) */}
                    {isEditMode && (
                        <div className="status-field">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Usuario activo
                            </label>
                            <p className="field-helper">Los usuarios inactivos no pueden acceder al sistema</p>
                        </div>
                    )}
                </div>

                {/* Password Fields (create mode or optional in edit mode) */}
                <div className="password-section">
                    <h3>{isEditMode ? 'Cambiar Contraseña (Opcional)' : 'Contraseña *'}</h3>

                    <div className="form-grid">
                        <div className="password-field">
                            <FormInput
                                label={isEditMode ? "Nueva contraseña" : "Contraseña *"}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                error={formErrors.password}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <PiEyeSlashBold /> : <PiEyeBold />}
                            </button>
                        </div>

                        <div className="password-field">
                            <FormInput
                                label={isEditMode ? "Confirmar nueva contraseña" : "Confirmar contraseña *"}
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={formErrors.confirmPassword}
                                placeholder="Repite la contraseña"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showConfirmPassword ? <PiEyeSlashBold /> : <PiEyeBold />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading || emailChecking}
                        disabled={loading || (emailValid === false && !emailChecking)}
                    >
                        {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </Button>
                </div>
            </form>

            <style jsx>{`
        .user-form {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-header {
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: var(--background, #f9fafb);
        }

        .form-header h2 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary, #111827);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .form-header p {
          margin: 0;
          color: var(--text-secondary, #6b7280);
          font-size: 0.875rem;
        }

        .form-content {
          padding: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .email-field {
          position: relative;
        }

        .email-status {
          position: absolute;
          right: 0.75rem;
          top: 2.25rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          pointer-events: none;
          z-index: 10;
        }

        .email-status.checking {
          color: var(--text-secondary, #6b7280);
        }

        .email-status.valid {
          color: var(--success-text, #16a34a);
        }

        .email-status.invalid {
          color: var(--error-text, #dc2626);
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid var(--border-color, #e5e7eb);
          border-top: 2px solid var(--primary-green, #7ed957);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .status-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-primary, #111827);
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color, #e5e7eb);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background-color: var(--primary-green, #7ed957);
          border-color: var(--primary-green, #7ed957);
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .field-helper {
          font-size: 0.75rem;
          color: var(--text-secondary, #6b7280);
          margin: 0;
        }

        .password-section {
          margin-bottom: 2rem;
        }

        .password-section h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary, #111827);
          font-size: 1.125rem;
          font-weight: 600;
        }

        .password-field {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 2.25rem;
          background: none;
          border: none;
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s ease;
          z-index: 10;
        }

        .password-toggle:hover {
          color: var(--text-primary, #111827);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .form-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .form-content {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions :global(button) {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
} 