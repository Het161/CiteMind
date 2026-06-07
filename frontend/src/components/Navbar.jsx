import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const link = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        pathname === to ? 'bg-panel2 text-teal' : 'text-slate-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-ink/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-extrabold text-lg tracking-tight">
            Cite<span className="text-teal">Mind</span>
          </span>
          <span className="ml-2 text-[10px] uppercase tracking-widest text-grape border border-grape/40 rounded px-1.5 py-0.5">
            memory
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {link('/', 'Dashboard')}
          {link('/demo', 'Demo')}
          <div className="mx-3 h-6 w-px bg-edge" />
          <span className="text-sm text-slate-400 hidden sm:inline">{user?.name}</span>
          <button onClick={logout} className="ml-2 text-sm text-slate-400 hover:text-white">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
