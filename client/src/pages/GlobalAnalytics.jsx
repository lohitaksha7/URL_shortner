import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { LayoutDashboard, Link2, MousePointerClick, Award, Globe, ArrowRight, TrendingUp } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

function GlobalAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalData() {
      try {
        const res = await api.get('/analytics/global');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load global account analytics.');
      } finally {
        setLoading(false);
      }
    }
    fetchGlobalData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton" style={{ width: '200px', height: '32px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[1, 2, 3].map(i => <div key={i} className="card-static" style={{ height: '120px' }} />)}
          </div>
          <div className="card-static" style={{ height: '300px' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const avgClicks = data.totalLinks > 0 ? (data.totalClicks / data.totalLinks).toFixed(1) : 0;

  return (
    <DashboardLayout>
      <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>Global Analytics</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Aggregated overview of your entire Shortify account</p>
      </div>

      {/* Grid of Key Account Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Short Links</span>
            <Link2 size={18} color="#a78bfa" />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800 }}>{data.totalLinks}</h2>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Clicks</span>
            <MousePointerClick size={18} color="#60a5fa" />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800 }}>{data.totalClicks}</h2>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Clicks / Link</span>
            <TrendingUp size={18} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800 }}>{avgClicks}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Star Link Feature Card */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', borderColor: 'var(--border-accent)', boxShadow: 'var(--shadow-glow)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Award size={20} color="#fb923c" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Top Performing Link</h3>
          </div>

          {data.starLink ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Short Code</p>
                <a href={`http://localhost:3000/${data.starLink.shortCode}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-light)', textDecoration: 'none' }}>
                  /{data.starLink.shortCode}
                </a>
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination URL</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {data.starLink.originalUrl}
                </p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <span className="badge badge-green">{data.starLink.clicks} clicks</span>
                <Link to={`/analytics/${data.starLink.shortCode}`} className="btn-ghost" style={{ fontSize: '13px', textDecoration: 'none', gap: '4px' }}>
                  Detailed Stats <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '20px' }}>No click data captured yet.</p>
          )}
        </div>

        {/* Global Traffic Sources Bar Chart */}
        <div className="card-static" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Traffic Referrers (All Links)</h3>
          <div style={{ height: '180px' }}>
            {data.globalReferrers && data.globalReferrers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.globalReferrers} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={90} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="clicks" fill="rgba(59, 130, 246, 0.8)" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '60px' }}>No referral data</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default GlobalAnalytics;