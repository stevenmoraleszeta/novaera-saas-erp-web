// Register Page
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, status, error: authError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.name) err.name = 'El nombre es obligatorio';
    if (!form.email) err.email = 'El correo es obligatorio';
    if (!form.email.includes('@')) err.email = 'El correo debe ser válido';
    if (!form.password) err.password = 'La contraseña es obligatoria';
    if (form.password.length < 6) err.password = 'La contraseña debe tener al menos 6 caracteres';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Las contraseñas no coinciden';

    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Campo ${name} cambiado a: ${value}`);
    setForm({ ...form, [name]: value });
    setFormError({ ...formError, [name]: '' });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando proceso de registro...', form);

    if (!validate()) {
      console.log('Validación fallida', formError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Enviando datos de registro...');
      // Asegurarnos de que estamos enviando exactamente lo que espera el backend
      const response = await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );
      console.log('Respuesta de registro:', response);

      setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err?.message || authError || 'Error al registrar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Registro de Usuario</h2>
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        <FormInput
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={formError.name}
          autoFocus
        />
        <FormInput
          label="Correo"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={formError.email}
        />
        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={formError.password}
        />
        <FormInput
          label="Confirmar Contraseña"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={formError.confirmPassword}
        />
        <Button
          type="submit"
          disabled={submitting || status === 'registering'}
        >
          {submitting || status === 'registering' ? <Loader text="Registrando..." /> : 'Registrarse'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(120deg, #232526 0%, #7ed957 100%);
        }
        .register-form {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 6px 32px rgba(35,37,38,0.10), 0 1.5px 8px #7ed95733;
          padding: 2.7em 2.2em 2em 2.2em;
          min-width: 350px;
          display: flex;
          flex-direction: column;
          gap: 1.3em;
        }
        h2 {
          text-align: center;
          color: #232526;
          margin-bottom: 0.5em;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        @media (max-width: 600px) {
          .register-form {
            min-width: 90vw;
            padding: 1.5em 0.5em;
          }
        }
      `}</style>
    </div>
  );
}
