// Login Page
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "../../stores/userStore";
import useTabStore from "../../stores/tabStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { login as authServiceLogin } from "@/services/authService";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { setUser } = useUserStore();
  const { clearTabs } = useTabStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.email) err.email = "El usuario es obligatorio";
    if (!form.password) err.password = "La contraseña es obligatoria";
    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError({ ...formError, [name]: "" });
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setLocalError("");
    try {
      const response = await authServiceLogin(form.email, form.password);
      console.log("🚀 Login response:", response);

      // Check if response has user property or if it's the user data directly
      if (response && (response.user || response.id)) {
        const userToSet = response.user || response;
        console.log("🚀 Setting user:", userToSet);
        console.log("🚀 User roles:", userToSet.roles);
        console.log("🚀 User is_active:", userToSet.is_active);
        
        // Check if user is active
        if (userToSet.is_active === false || userToSet.isActive === false) {
          console.log("❌ User is inactive:", userToSet);
          setLocalError("Tu cuenta está inactiva. Contacta al administrador para activarla.");
          return;
        }
        
        setUser(userToSet);
        clearTabs();
        window.location.href = "/modules";
      } else {
        console.log("❌ No user in response:", response);
        setLocalError("No se pudo iniciar sesión. Verifica tus credenciales.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setLocalError(err.response.data.error
 || "Error al intentar iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    setForm({ email: "admin@novaeracorp.com", password: "admin123" });
    setFormError({});
    setLocalError("");
    setSubmitting(true);
    try {
      const response = await authServiceLogin("admin@novaeracorp.com", "admin123");
      console.log("🚀 Admin login response:", response);

      if (response && (response.user || response.id)) {
        const userToSet = response.user || response;
        console.log("🚀 Setting admin user:", userToSet);
        
        if (userToSet.is_active === false || userToSet.isActive === false) {
          setLocalError("Tu cuenta está inactiva. Contacta al administrador para activarla.");
          return;
        }
        
        setUser(userToSet);
        clearTabs();
        window.location.href = "/modules";
      } else {
        setLocalError("No se pudo iniciar sesión como administrador.");
      }
    } catch (err) {
      console.error("❌ Admin login error:", err);
      setLocalError(err.response?.data?.error || "Error al intentar iniciar sesión como administrador");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-[clamp(320px,90vw,clamp(500px,60vw,800px))] flex flex-col items-center justify-center px-4 py-[clamp(20px,10vh,100px)] mx-auto">
      <h1 className="text-5xl font-black mb-8 self-start">ERPLOGO</h1>
      <div className="bg-background w-full flex-1 rounded-lg gap-6 p-6 flex flex-col">
        {/* Header */}
        <h2 className="text-3xl leading-none font-black">Iniciar Sesión</h2>

        {/* Body */}
        <div className="flex-1 overflow-y-auto max-w-lg">
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {localError && (
              <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm text-center">
                {localError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Usuario</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
                disabled={submitting}
                className={formError.email ? "border-red-500" : ""}
                aria-invalid={!!formError.email}
                aria-describedby="email-error"
              />
              {formError.email && (
                <span id="email-error" className="text-xs text-red-600">
                  {formError.email}
                </span>
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
                aria-invalid={!!formError.password}
                aria-describedby="password-error"
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
                <span id="password-error" className="text-xs text-red-600">
                  {formError.password}
                </span>
              )}
            </div>

            <p className="text-sm text-black dark:text-black">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-black dark:text-black hover:underline font-medium"
              >
                Regístrates
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Recomendamos ingresar como administrador para probar todas las funcionalidades de personalización del sistema.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium h-12"
              onClick={handleAdminLogin}
              disabled={submitting}
            >
              Ingresar como Administrador
            </Button>
            
            <Button
              type="submit"
              className="w-full sm:flex-1 h-12 text-lg font-semibold"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Validando..." : "Iniciar Sesión"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
