import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from './Login.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start tracking AI citations in minutes.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="reg-name">Name</label>
          <input
            id="reg-name"
            className="input"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            className="input"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            className="input"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
        <button id="reg-submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-slate-400 mt-5 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-teal font-medium hover:text-teal/80 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
