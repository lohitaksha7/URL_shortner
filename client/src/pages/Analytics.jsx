import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { ArrowLeft, MousePointerClick, Activity, CheckCircle2, Globe, Clock } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

function Analytics() {
  const { code } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchAnalytics() {
    try {
      const response = await api.get(`/analyticsRoutes/${code}`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <AnalyticsSkeleton />
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Analytics not found for this URL.</p>
          <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', marginTop: '20px', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Build chart data
  const chartData = analytics.recentClicks.map((click, index) => ({
    index: index + 1,
    clicks: index + 1,
    time: new Date(click.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              marginBottom: '12px',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              marginBottom: '6px',
            }}
          >
            Analytics
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code
              style={{
                fontSize: '13px',
                color: 'var(--accent-light)',
                background: 'rgba(124,58,237,0.12)',
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              /{code}
            </code>
            <span className="badge badge-green">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#34d399',
                  display: 'inline-block',
                }}
              />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <AnalyticsCard
          title="Total Clicks"
          value={analytics.totalClicks}
          icon={MousePointerClick}
          color="purple"
        />
        <AnalyticsCard
          title="Recent Events"
          value={analytics.recentClicks.length}
          icon={Activity}
          color="blue"
        />
        <AnalyticsCard
          title="Status"
          value="Active"
          icon={CheckCircle2}
          color="green"
          isText
        />
      </div>

      {/* Chart */}
      <div
        className="card-static animate-fade-in delay-200"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Click Activity</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {analytics.recentClicks.length} events
          </span>
        </div>
        <div style={{ padding: '24px', height: '280px' }}>
          {chartData.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
              }}
            >
              No click data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#555570', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#555570', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  cursor={{ stroke: 'rgba(124,58,237,0.3)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  fill="url(#clickGradient)"
                  dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#a78bfa' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Breakdowns Section */}
      <div
        className="animate-fade-in delay-250"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* 1. Devices Donut Chart */}
        <div className="card-static" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Devices
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {analytics.devices && analytics.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#7c3aed', '#3b82f6', '#34d399', '#fb923c'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No device data</p>
            )}
          </div>
        </div>

        {/* 2. Top Referrers Bar Chart */}
        <div className="card-static" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Top Referrers
          </h3>
          <div style={{ height: '200px' }}>
            {analytics.referrer && analytics.referrer.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.referrer} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    width={110}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="clicks" fill="rgba(124, 58, 237, 0.8)" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '80px' }}>No referral data</p>
            )}
          </div>
        </div>

        {/* 3. Browsers List with Progress Bars */}
        <div className="card-static" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0px' }}>
            Top Browsers
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '180px' }}>
            {analytics.browsers && analytics.browsers.length > 0 ? (
              analytics.browsers.slice(0, 4).map((b) => {
                const total = analytics.browsers.reduce((sum, curr) => sum + curr.value, 0);
                const pct = Math.round((b.value / (total || 1)) * 100);
                return (
                  <div key={b.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{b.name}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.value} clicks ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No browser data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Clicks Table */}
      <div
        className="card-static animate-fade-in delay-300"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Clicks</h2>
          <span className="badge badge-purple">{analytics.recentClicks.length} total</span>
        </div>

        {analytics.recentClicks.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
          >
            No clicks recorded yet. Share your link to start collecting data.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Browser / Device</th>
                  <th>Referrer</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentClicks.map((click, i) => (
                  <tr
                    key={click.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          {click.ipAddress || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '13px',
                        }}
                        title={click.userAgent}
                      >
                        {click.userAgent || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: '160px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '13px',
                        }}
                      >
                        {click.referrer ? (
                          <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                            {click.referrer}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        {new Date(click.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Stat card component
function AnalyticsCard({ title, value, icon: Icon, color, isText }) {
  const colorMap = {
    purple: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
    blue:   { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    green:  { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  };
  const colors = colorMap[color] || colorMap.purple;

  return (
    <div
      className="card animate-fade-in"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--text-muted)',
          }}
        >
          {title}
        </p>
        {Icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={17} color={colors.color} />
          </div>
        )}
      </div>
      <h2
        style={{
          fontSize: isText ? '24px' : '36px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-1px',
          lineHeight: 1,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

// Loading skeleton
function AnalyticsSkeleton() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '180px', height: '32px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '100px', height: '24px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card-static" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '60px', height: '36px' }} />
          </div>
        ))}
      </div>
      <div className="card-static" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', height: '300px' }}>
        <div className="skeleton" style={{ width: '120px', height: '20px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}

export default Analytics;