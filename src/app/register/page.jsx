// Register Page
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, status, error: authError } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.name) err.name = "El nombre es obligatorio";
    if (!form.email) err.email = "El correo es obligatorio";
    if (!form.email.includes("@")) err.email = "El correo debe ser válido";
    if (!form.password) err.password = "La contraseña es obligatoria";
    if (form.password.length < 6)
      err.password = "La contraseña debe tener al menos 6 caracteres";
    if (form.password !== form.confirmPassword)
      err.confirmPassword = "Las contraseñas no coinciden";

    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError({ ...formError, [name]: "" });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );
      setSuccess(
        "Usuario registrado correctamente. Ahora puedes iniciar sesión."
      );
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err?.message || authError || "Error al registrar usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl">
        <CardContent className="p-8">
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Registro de Usuario
              </h2>
              <p className="text-gray-500 text-sm">
                Crea tu cuenta para acceder al sistema ERP
              </p>
            </div>
            {error && (
              <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 rounded px-3 py-2 text-sm text-center">
                {success}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu Nombre Completo"
                autoFocus
                disabled={submitting || status === "registering"}
                className={formError.name ? "border-red-500" : ""}
              />
              {formError.name && (
                <span className="text-xs text-red-600">{formError.name}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Correo
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting || status === "registering"}
                className={formError.email ? "border-red-500" : ""}
              />
              {formError.email && (
                <span className="text-xs text-red-600">{formError.email}</span>
              )}
            </div>

            <div className="relative flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={submitting || status === "registering"}
                className={`pr-10 ${
                  formError.password ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-8 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {formError.password && (
                <span className="text-xs text-red-600">
                  {formError.password}
                </span>
              )}
            </div>

            <div className="relative flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirmar Contraseña
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={submitting || status === "registering"}
                className={`pr-10 ${
                  formError.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-8 h-7 w-7"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {formError.confirmPassword && (
                <span className="text-xs text-red-600">
                  {formError.confirmPassword}
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={submitting || status === "registering"}
            >
              {submitting || status === "registering"
                ? "Registrando..."
                : "Registrarse"}
            </Button>

            <div className="text-center mt-2">
              <Link href="/login" className="hover:underline font-medium">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
