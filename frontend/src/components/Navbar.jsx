import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { gsap } from 'gsap';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navRef = useRef(null);

  // Entry animation on mount
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    gsap.fromTo(
      nav,
      { y: -64, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    );
  }, []);

  const link = (to, label) => (
    <Link
      to={to}
      className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        pathname === to
          ? 'text-teal'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      {pathname === to && (
        <span
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'rgba(45,212,191,0.1)',
            boxShadow: 'inset 0 0 0 1px rgba(45,212,191,0.2)',
          }}
        />
      )}
      <span className="relative">{label}</span>
    </Link>
  );

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-edge/50 backdrop-blur-md"
      style={{ background: 'rgba(10,13,20,0.85)' }}
    >
      {/* Animated glow line at bottom */}
      <div className="navbar-glow-line" />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="CiteMind home">
          {/* SVG icon */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <circle cx="16" cy="16" r="16" fill="rgba(45,212,191,0.08)" />
              <circle cx="16" cy="16" r="4" fill="#2dd4bf" />
              <circle cx="16" cy="7"  r="2.2" fill="#a78bfa" />
              <circle cx="23" cy="21" r="2.2" fill="#a78bfa" />
              <circle cx="9"  cy="21" r="2.2" fill="#a78bfa" />
              <line x1="16" y1="16" x2="16" y2="9.2"  stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="16" y1="16" x2="21.4" y2="19.4" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="16" y1="16" x2="10.6" y2="19.4" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.6" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight">
            Cite<span className="gradient-text">Mind</span>
          </span>
          <span
            className="ml-1 badge-grape"
            style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}
          >
            memory
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {link('/', 'Dashboard')}
          {link('/demo', 'Demo')}
          {link('/faq', 'FAQ')}

          <div className="mx-3 h-6 w-px bg-edge" />

          <span className="text-sm text-slate-400 hidden sm:inline">
            {user?.name}
          </span>
          <button
            id="nav-logout"
            onClick={logout}
            className="ml-2 text-sm text-slate-400 hover:text-rose transition-colors duration-200"
            aria-label="Logout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
