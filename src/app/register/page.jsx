// Register Page
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { register as authServiceRegister } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
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
      const response = await authServiceRegister(
        form.name.trim(),
        form.email.trim(),
        form.password
      );
      setSuccess(
        "Usuario registrado correctamente. Ahora puedes iniciar sesión."
      );
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err?.message || "Error al registrar usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-[clamp(320px,90vw,clamp(500px,60vw,800px))] flex flex-col items-center justify-center px-4 py-[clamp(20px,10vh,100px)] mx-auto">
      <h1 className="text-5xl font-black mb-8 self-start">ERPLOGO</h1>
      <div className="bg-background w-full flex-1 rounded-lg gap-12 p-6 flex flex-col">
        {/* Header */}
        <h2 className="text-3xl leading-none font-black">Registro</h2>

        {/* Body */}
        <div className="flex-1 overflow-y-auto max-w-lg">
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
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
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu Nombre Completo"
                autoFocus
                disabled={submitting}
                className={formError.name ? "border-red-500" : ""}
              />
              {formError.name && (
                <span className="text-xs text-red-600">{formError.name}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                className={formError.email ? "border-red-500" : ""}
              />
              {formError.email && (
                <span className="text-xs text-red-600">{formError.email}</span>
              )}
            </div>

            <div className="relative flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
                className={`pr-10 ${
                  formError.password ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-7 h-7 w-7"
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
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
                className={`pr-10 ${
                  formError.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-7 h-7 w-7"
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

            <p className="text-sm text-black dark:text-black">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-black dark:text-black hover:underline font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-start mt-auto pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto h-12 text-lg font-semibold"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Registrando..." : "Registrarse"}
          </Button>
        </div>
      </div>
    </div>
  );
}
