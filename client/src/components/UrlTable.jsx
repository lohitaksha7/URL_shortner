import { useState } from 'react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { Copy, Trash2, BarChart3, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function UrlTable({ urls, onDelete, onRefreshClicks }) {
  const [copiedId, setCopiedId] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);

  async function handleRefreshClicks(e, urlId){
        e.stopPropagation();
        if(refreshingId) return null;

        setRefreshingId(urlId);
        await onRefreshClicks(urlId);
        setRefreshingId(null);
  }

  function handleCopy(id, url) {
    copy(url);
    toast.success('Copied to clipboard!');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div
      className="card-static animate-fade-in"
      style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Your Links
        </h3>
        <span className="badge badge-purple">{urls.length} total</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short Link</th>
              <th>Clicks</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url, i) => (
              <tr
                key={url.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Original URL */}
                <td>
                  <div
                    style={{
                      maxWidth: '260px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                    title={url.originalUrl}
                  >
                    {url.originalUrl}
                  </div>
                </td>

                {/* Short URL */}
                <td>
                  <a
                    href={`http://localhost:3000/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="badge badge-purple" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {`http://localhost:3000/${url.shortCode}`}
                    </span>
                    <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
                  </a>
                </td>

                {/* Clicks */}
                <td
                  onClick={(e) => handleRefreshClicks(e, url.id)}
                  style={{ cursor: 'pointer' }}
                  title="Click to refresh click count in real-time"
                >
                  <span
                    className="badge badge-green"
                    style={{
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {refreshingId === url.id ? (
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid rgba(52, 211, 153, 0.3)',
                          borderTop: '2px solid #34d399',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                    ) : null}
                    {url._count?.clickEvents ?? 0} clicks
                  </span>
                </td>

                {/* Date */}
                <td>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(url.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(url.id, `http://localhost:3000/${url.shortCode}`)}
                      className="btn-ghost"
                      title="Copy link"
                      style={{ color: copiedId === url.id ? '#34d399' : 'var(--text-secondary)' }}
                    >
                      {copiedId === url.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>

                    {/* Analytics */}
                    <Link
                      to={`/analytics/${url.shortCode}`}
                      className="btn-ghost"
                      title="View analytics"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <BarChart3 size={16} />
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(url.id)}
                      className="btn-danger"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UrlTable;