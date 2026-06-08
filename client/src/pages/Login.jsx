import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Link2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Captcha from '../components/Captcha';
import { GoogleLogin } from '@react-oauth/google';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const captchaRef = useRef(null);

  async function handleGoogleSuccess(credentialResponse) {
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    const captchaToken = captchaRef.current?.getToken();
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, captchaToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      captchaRef.current?.reset();
      toast.error(error?.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse){
      setLoading(true);
      try{
          await loginWithGoogle(credentialResponse.credential);
          toast.success("Welcome");
          navigate('/dashboard');
      }catch(error){
          toast.error('Google Sign-In failed');
      }finally{
          setLoading(false);
      }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Left Panel — Branding */}
      <div
        className="mesh-bg"
        style={{
          flex: '0 0 45%',
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="lg:flex"
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
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
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

        {/* Center Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontSize: '2.6rem',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: '20px',
            }}
          >
            Shorten URLs.
            <br />
            <span className="text-gradient">Track everything.</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '320px' }}>
            Sign in to access your dashboard, view analytics, and manage all your short links in one place.
          </p>

          {/* Feature bullets */}
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Redis-powered sub-5ms redirects',
              'Click analytics and trend charts',
              'JWT-secured endpoints',
            ].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(124,58,237,0.2)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '10px', color: 'var(--accent-light)' }}>✓</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
          © 2025 Shortify. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          className="animate-fade-in"
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Mobile Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '20px',
              marginBottom: '40px',
            }}
            className="lg:hidden"
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
              }}
            >
              <Link2 size={16} color="#fff" />
            </div>
            <span className="text-gradient-bright">Shortify</span>
          </Link>

          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '36px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 500 }}>
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div className="form-group">
              <label className="label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                  style={{ paddingLeft: '42px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <Captcha ref={captchaRef} />

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ height: '50px', fontSize: '15px', marginTop: '4px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin-slow 0.7s linear infinite',
                    }}
                  />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
            <span style={{ padding: '0 10px', fontSize: '14px' }}>or</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          </div>

          {/* Google Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In failed')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
