// Register Page
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import axios from '../../lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.name) err.name = 'El nombre es obligatorio';
    if (!form.email) err.email = 'El correo es obligatorio';
    if (!form.password) err.password = 'La contraseña es obligatoria';
    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError({ ...formError, [e.target.name]: '' });
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
      await axios.post('/auth/register', form);
      setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al registrar usuario');
    }
    setSubmitting(false);
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
        <Button type="primary" disabled={submitting}>
          {submitting ? <Loader text="Registrando..." /> : 'Registrarse'}
        </Button>
        <Button type="secondary" onClick={() => router.push('/login')} style={{marginTop: 8}}>
          Volver a Iniciar Sesión
        </Button>
      </form>
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(120deg, var(--primary) 0%, var(--secondary) 100%);
        }
        .register-form {
          background: #fff;
          border-radius: var(--radius);
          box-shadow: 0 4px 32px rgba(0,0,0,0.08);
          padding: 2.5em 2em 2em 2em;
          min-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 1.2em;
        }
        h2 {
          text-align: center;
          color: var(--primary);
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}
