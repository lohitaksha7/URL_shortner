import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function ThemeToggleFloating() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Monitor resize for pixel-perfect positioning on mobile vs desktop
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Conditionally hide on the Home page ('/') since the Navbar has its own built-in toggle
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        top: isMobile ? '11px' : '13px',
        right: isMobile ? '16px' : '24px',
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-sm)',
        background: hovered ? 'var(--bg-card-hover)' : 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 99999, // Ensure it floats on top of all page contents
        color: 'var(--text-primary)',
        transition: 'var(--transition)',
        outline: 'none',
      }}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} style={{ color: '#fbbf24' }} />
      )}
    </button>
  );
}

export default ThemeToggleFloating;
