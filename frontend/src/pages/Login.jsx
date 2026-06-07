import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import HeroCanvas from '../components/HeroCanvas.jsx';
import { useGSAPEntrance } from '../hooks/useGSAP.js';
import { gsap } from 'gsap';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your citation memory.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-sm text-rose-400" role="alert">{error}</p>}
        <button id="login-submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-slate-400 mt-5 text-center">
        No account?{' '}
        <Link to="/register" className="text-teal font-medium hover:text-teal/80 transition-colors">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

/**
 * AuthShell — shared wrapper for Login / Register pages.
 * Features: full-screen Three.js canvas, aurora glows, GSAP entrance.
 */
export function AuthShell({ title, subtitle, children }) {
  const cardRef = useGSAPEntrance(0.1);
  const logoRef = useGSAPEntrance(0);

  // Animate the glowing orb behind the logo
  useEffect(() => {
    gsap.to('.auth-orb', {
      scale: 1.15,
      opacity: 0.7,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Three.js molecular canvas background */}
      <HeroCanvas />

      {/* Aurora glow blobs */}
      <div className="aurora-bg" />

      {/* Card panel */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo mark */}
        <div className="text-center mb-7" ref={logoRef}>
          {/* Glowing orb behind logo */}
          <div className="relative inline-block">
            <div
              className="auth-orb absolute inset-0 rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(45,212,191,0.4) 0%, rgba(167,139,250,0.3) 60%, transparent 100%)',
                transform: 'scale(1.8)',
              }}
            />
            <div className="relative text-5xl mb-1 float-anim" aria-hidden="true">⬡</div>
          </div>
          <h1 className="text-3xl font-display font-extrabold mt-2 tracking-tight">
            Cite<span className="gradient-text">Mind</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Everyone has monitoring.{' '}
            <span className="text-teal">We have memory.</span>
          </p>
        </div>

        {/* Glass card */}
        <div
          ref={cardRef}
          className="glass rounded-2xl p-7"
          style={{ boxShadow: 'var(--glow-teal)' }}
        >
          <h2 className="text-xl font-bold mb-1">{title}</h2>
          <p className="text-sm text-slate-400 mb-5">{subtitle}</p>
          {children}
        </div>

        {/* FAQ link */}
        <p className="text-center text-xs text-slate-600 mt-5">
          Have questions?{' '}
          <Link to="/faq" className="text-slate-400 hover:text-teal transition-colors">
            View FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
