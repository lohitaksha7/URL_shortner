import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Zap, Shield, BarChart3, Link2, ArrowRight, Copy, Check, Globe, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Captcha from '../components/Captcha';

function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const captchaRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    const captchaToken = captchaRef.current?.getToken();
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/shorten', { url, captchaToken });
      setShortUrl(response.data.shortUrl);
      toast.success('Short URL created!');
      captchaRef.current?.reset();
    } catch (error) {
      captchaRef.current?.reset();
      toast.error('Failed to shorten URL. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <MainLayout>
      {/* ======= HERO ======= */}
      <section
        className="mesh-bg"
        style={{
          minHeight: 'calc(100vh - var(--navbar-height))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Pill badge */}
        <div className="badge badge-purple animate-fade-in" style={{ marginBottom: '20px', fontSize: '13px' }}>
          <Zap size={12} />
          Lightning-fast redirects powered by Redis
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in delay-100"
          style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-2px',
            maxWidth: '860px',
            marginBottom: '24px',
          }}
        >
          Shorten URLs.{' '}
          <span className="text-gradient">Track Everything.</span>
          <br />
          Scale Effortlessly.
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in delay-200"
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '540px',
            lineHeight: 1.7,
            marginBottom: '48px',
          }}
        >
          Production-grade URL shortener with analytics, distributed caching,
          queue workers, and JWT authentication.
        </p>

        {/* URL Input Form */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in delay-300"
          style={{
            width: '100%',
            maxWidth: '680px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Globe
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Paste your long URL here..."
                className="input"
                style={{ paddingLeft: '44px', height: '54px', fontSize: '15px', borderRadius: 'var(--radius-lg)' }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                height: '54px',
                padding: '0 28px',
                fontSize: '15px',
                borderRadius: 'var(--radius-lg)',
                minWidth: '140px',
              }}
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
                  Shortening...
                </span>
              ) : (
                <>
                  Shorten <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* CAPTCHA */}
          <Captcha ref={captchaRef} />
        </form>

        {/* Result Card */}
        {shortUrl && (
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              zIndex: 1,
              position: 'relative',
              borderColor: 'var(--border-accent)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
                Your short link
              </p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: 'var(--accent-light)',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {shortUrl}
              </a>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={handleCopy}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
              </button>
              <button
                onClick={() => setShortUrl('')}
                className="btn-ghost"
                style={{ padding: '10px' }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div
          className="animate-fade-in delay-400"
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '56px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {[
            { value: '10M+', label: 'URLs Shortened' },
            { value: '<5ms', label: 'Avg Redirect Time' },
            { value: '99.9%', label: 'Uptime' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section
        style={{
          padding: '100px 24px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-1px',
              marginBottom: '16px',
            }}
          >
            Everything you need,{' '}
            <span className="text-gradient">nothing you don't</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Built with a production-grade stack — not just a toy project.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          <FeatureCard
            icon={Zap}
            iconColor="purple"
            title="Lightning Fast Redirects"
            text="Redis-powered caching ensures sub-5ms redirects at any scale. Your users never wait."
            delay="0"
          />
          <FeatureCard
            icon={BarChart3}
            iconColor="blue"
            title="Advanced Analytics"
            text="Track clicks, browsers, referrers, and time-series trends with beautiful charts."
            delay="100"
          />
          <FeatureCard
            icon={Shield}
            iconColor="green"
            title="Secure & Scalable"
            text="JWT authentication, rate limiting, Bull queue workers, and horizontal scaling built-in."
            delay="200"
          />
        </div>
      </section>

      {/* ======= CTA ======= */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            marginBottom: '16px',
          }}
        >
          Ready to shorten smarter?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
          Create a free account and start shortening in seconds.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '16px' }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '14px 28px', fontSize: '16px' }}>
            Sign In
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}

const iconColorMap = {
  purple: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: 'rgba(124,58,237,0.2)' },
  blue:   { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  green:  { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
};

function FeatureCard({ icon: Icon, iconColor, title, text, delay }) {
  const colors = iconColorMap[iconColor] || iconColorMap.purple;
  return (
    <div
      className={`card animate-fade-in`}
      style={{
        padding: '32px',
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon size={22} color={colors.color} />
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '10px',
          letterSpacing: '-0.3px',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {text}
      </p>
    </div>
  );
}

export default Home;