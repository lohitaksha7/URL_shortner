import { Link, useLocation } from 'react-router-dom';
import { Link2, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8, 8, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          fontWeight: 800,
          fontSize: '20px',
          letterSpacing: '-0.3px',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
          }}
        >
          <Link2 size={18} color="#fff" />
        </div>
        <span className="text-gradient-bright">Shortify</span>
      </Link>

      {/* Nav Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          title="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {theme === 'light'
            ? <Moon size={16} />
            : <Sun size={16} style={{ color: '#fbbf24' }} />
          }
        </button>

        {user ? (
          <>
            <Link
              to="/dashboard"
              className="btn-secondary"
              style={{
                textDecoration: 'none',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{ textDecoration: 'none', padding: '9px 20px', fontSize: '14px' }}
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;