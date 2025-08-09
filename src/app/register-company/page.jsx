"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { registerCompany } from "@/services/companyService";

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    // Datos de la empresa
    company_name: "",
    email: "",
    phone: "",
    address: "",
    // Datos del administrador
    admin_name: "",
    admin_email: "",
    admin_password: "",
    confirmPassword: ""
  });
  
  const [formError, setFormError] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(null);

  const validate = () => {
    const err = {};
    
    // Validar datos de empresa
    if (!form.company_name) err.company_name = "El nombre de la empresa es obligatorio";
    if (!form.email) err.email = "El email de la empresa es obligatorio";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) err.email = "El email no es válido";
    
    // Validar datos del administrador
    if (!form.admin_name) err.admin_name = "El nombre del administrador es obligatorio";
    if (!form.admin_email) err.admin_email = "El email del administrador es obligatorio";
    if (form.admin_email && !/\S+@\S+\.\S+/.test(form.admin_email)) err.admin_email = "El email no es válido";
    if (!form.admin_password) err.admin_password = "La contraseña es obligatoria";
    if (form.admin_password && form.admin_password.length < 6) err.admin_password = "La contraseña debe tener al menos 6 caracteres";
    if (!form.confirmPassword) err.confirmPassword = "Confirma tu contraseña";
    if (form.admin_password !== form.confirmPassword) err.confirmPassword = "Las contraseñas no coinciden";
    
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
      const companyData = {
        company_name: form.company_name,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_password: form.admin_password
      };
      
      const response = await registerCompany(companyData);
      
      if (response.success) {
        setSuccess(response.data); // Mostrar pantalla de confirmación y esperar acción del usuario
      }
    } catch (err) {
      setLocalError(err.message || "Error al registrar la empresa");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = () => {
    if (success?.company_code) {
      router.push(`/?company_code=${success.company_code}`);
    } else {
      router.push('/');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-[clamp(320px,90vw,clamp(500px,60vw,800px))] flex flex-col items-center justify-center px-4 py-[clamp(20px,10vh,100px)] mx-auto">
        <h1 className="text-5xl font-black mb-8 self-start">ERPLOGO</h1>
        <div className="bg-background w-full flex-1 rounded-lg gap-10 p-6 flex flex-col">
          <h2 className="text-3xl leading-none font-black">Empresa registrada</h2>
          <div className="flex-1 max-w-lg space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Datos de la empresa</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">Código de Empresa</span>
                  <span className="font-mono text-base bg-muted/30 border rounded px-3 py-2 select-all">{success.company_code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Empresa</span>
                  <span className="font-mono text-xs opacity-80">{success.schema_name}</span>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Guarda tu <strong>código de empresa</strong>; lo necesitarás para iniciar sesión. Haz clic en Aceptar para continuar.
            </p>
            <div>
              <Button onClick={handleAccept} className="h-11 text-base font-semibold w-full sm:w-auto">Aceptar</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[clamp(320px,90vw,clamp(500px,60vw,800px))] flex flex-col items-center justify-center px-4 py-[clamp(20px,10vh,100px)] mx-auto">
      <h1 className="text-5xl font-black mb-8 self-start">ERPLOGO</h1>
      
      <div className="bg-background w-full flex-1 rounded-lg gap-12 p-6 flex flex-col">
        <h2 className="text-3xl leading-none font-black">Registrar Empresa</h2>
        
        <div className="flex-1 overflow-y-auto max-w-lg">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit} autoComplete="off">
            {localError && (
              <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm text-center">
                {localError}
              </div>
            )}
            
            {/* Datos de la Empresa */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Datos de la Empresa</h3>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="company_name">Nombre de la Empresa</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  placeholder="Mi Empresa S.A."
                  value={form.company_name}
                  onChange={handleChange}
                  autoFocus
                  disabled={submitting}
                  className={formError.company_name ? "border-red-500" : ""}
                />
                {formError.company_name && (
                  <span className="text-xs text-red-600">{formError.company_name}</span>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email de la Empresa</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contacto@miempresa.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  className={formError.email ? "border-red-500" : ""}
                />
                {formError.email && (
                  <span className="text-xs text-red-600">{formError.email}</span>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Dirección (Opcional)</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Calle Principal 123, Ciudad"
                  value={form.address}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Datos del Administrador */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Datos del Administrador</h3>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin_name">Nombre del Administrador</Label>
                <Input
                  id="admin_name"
                  name="admin_name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={form.admin_name}
                  onChange={handleChange}
                  disabled={submitting}
                  className={formError.admin_name ? "border-red-500" : ""}
                />
                {formError.admin_name && (
                  <span className="text-xs text-red-600">{formError.admin_name}</span>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin_email">Email del Administrador</Label>
                <Input
                  id="admin_email"
                  name="admin_email"
                  type="email"
                  placeholder="admin@miempresa.com"
                  value={form.admin_email}
                  onChange={handleChange}
                  disabled={submitting}
                  className={formError.admin_email ? "border-red-500" : ""}
                />
                {formError.admin_email && (
                  <span className="text-xs text-red-600">{formError.admin_email}</span>
                )}
              </div>
              
              <div className="relative flex flex-col gap-2">
                <Label htmlFor="admin_password">Contraseña</Label>
                <Input
                  id="admin_password"
                  name="admin_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.admin_password}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`pr-10 ${formError.admin_password ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {formError.admin_password && (
                  <span className="text-xs text-red-600">{formError.admin_password}</span>
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
                  className={`pr-10 ${formError.confirmPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {formError.confirmPassword && (
                  <span className="text-xs text-red-600">{formError.confirmPassword}</span>
                )}
              </div>
            </div>

            <p className="text-sm text-black dark:text-black">
              ¿Ya tienes una empresa registrada?{" "}
              <Link href="/" className="text-black dark:text-black hover:underline font-medium">
                Iniciar Sesión
              </Link>
            </p>
          </form>
        </div>
        
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-start mt-auto pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto h-12 text-lg font-semibold"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Registrando Empresa..." : "Registrar Empresa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
