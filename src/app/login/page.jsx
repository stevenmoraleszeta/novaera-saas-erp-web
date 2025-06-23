'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Loader = dynamic(() => import('../../components/ui/Loader'), { ssr: false, loading: () => <p>Cargando...</p> });
const Alert = dynamic(() => import('../../components/commmon/Alert'), { ssr: false });
const FormInput = dynamic(() => import('../../components/commmon/FormInput'), { ssr: false });
const Button = dynamic(() => import('../../components/commmon/Button'), { ssr: false });

export default function LoginPage() {
  const { login, status, error } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState({});
  const [localError, setLocalError] = useState('');

  const isSubmitting = status === 'authenticating';

  const validate = () => {
    const err = {};
    if (!form.email) err.email = 'El usuario es obligatorio';
    if (!form.password) err.password = 'La contraseña es obligatoria';
    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFormError(prev => ({ ...prev, [name]: '' }));
    setLocalError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLocalError('');

    try {
      const ok = await login(form.email, form.password);
      if (ok) {
        router.replace('/dashboard');
      } else {
        setLocalError('No se pudo iniciar sesión. Verifica tus credenciales.');
      }
    } catch (err) {
      setLocalError(err.message || 'Error al intentar iniciar sesión');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Iniciar Sesión</h2>
        {(error && error !== 'No autenticado') && <Alert type="error" message={error} />}
        {localError && <Alert type="error" message={localError} />}
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
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader text="Validando..." /> : 'Ingresar'}
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
