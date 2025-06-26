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
        setUser(userToSet);
        clearTabs();
        // Espera breve para asegurar que el store se hidrate antes del redirect
        setTimeout(() => {
          router.replace("/");
        }, 100);
      } else {
        console.log("❌ No user in response:", response);
        setLocalError("No se pudo iniciar sesión. Verifica tus credenciales.");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setLocalError(err.message || "Error al intentar iniciar sesión");
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
                Iniciar Sesión
              </h2>
              <p className="text-gray-500 text-sm">
                Accede a tu cuenta del sistema ERP
              </p>
            </div>
            {localError && (
              <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm text-center">
                {localError}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Usuario
              </label>
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
                <span id="password-error" className="text-xs text-red-600">
                  {formError.password}
                </span>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={submitting}
            >
              {submitting ? "Validando..." : "Ingresar"}
            </Button>
            <div className="text-center mt-2">
              <Link href="/register" className="hover:underline font-medium">
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
