// Login Page
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import Link from 'next/link';

export default function LoginPage() {
  const { login, status, error } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.email) err.email = 'El usuario es obligatorio';
    if (!form.password) err.password = 'La contraseña es obligatoria';
    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError({ ...formError, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await login(form.email, form.password);
    setSubmitting(false);
    if (ok) router.replace('/dashboard');
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Iniciar Sesión</h2>
        {error && error !== 'No autenticado' && <Alert type="error" message={error} />}
        <FormInput
          label="Usuario"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={formError.email}
          autoFocus
        />
        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={formError.password}
        />
        <Button type="primary" disabled={submitting || status === 'authenticating'}>
          {submitting || status === 'authenticating' ? <Loader text="Validando..." /> : 'Ingresar'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/register">¿No tienes cuenta? Regístrate</Link>
        </div>
      </form>
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(120deg, #232526 0%, #7ed957 100%);
        }
        .login-form {
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
          .login-form {
            min-width: 90vw;
            padding: 1.5em 0.5em;
          }
        }
      `}</style>
    </div>
  );
}
