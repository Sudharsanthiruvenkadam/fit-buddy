import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage, Field } from '../components/UI.jsx';

function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/progress';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (user) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setError(''); setErrors({});
    if (isRegister && form.password !== form.confirmPassword) return setErrors({ confirmPassword: 'Passwords do not match.' });
    setSaving(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) { setError(err.message); setErrors(err.errors || {}); } finally { setSaving(false); }
  }

  return (
    <div className="container">
      <div className="auth-wrap card">
        <h1 style={{ fontSize: '2.6rem' }}>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{isRegister ? 'Start where you are. Keep moving forward.' : 'Show up. Level up.'}</p>
        <ErrorMessage>{error}</ErrorMessage>
        <form onSubmit={submit} noValidate>
          {isRegister && <Field label="Name" id="a-name" error={errors.name}><input id="a-name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={50} aria-invalid={!!errors.name} /></Field>}
          <Field label="Email" id="a-email" error={errors.email}><input id="a-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} /></Field>
          <Field label="Password" id="a-pass" error={errors.password} hint={isRegister ? 'At least 8 characters.' : undefined}><input id="a-pass" type="password" value={form.password} onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} aria-invalid={!!errors.password} /></Field>
          {isRegister && <Field label="Confirm password" id="a-conf" error={errors.confirmPassword}><input id="a-conf" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" aria-invalid={!!errors.confirmPassword} /></Field>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>{saving ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        </form>
        <p style={{ marginTop: '1rem', marginBottom: 0 }} className="muted">
          {isRegister ? <>Already have an account? <Link to="/login" state={location.state}>Log in</Link></> : <>New here? <Link to="/register" state={location.state}>Create an account</Link></>}
        </p>
        <p className="muted small" style={{ marginTop: '.75rem', marginBottom: 0 }}>Password reset and email verification are not set up yet.</p>
      </div>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
