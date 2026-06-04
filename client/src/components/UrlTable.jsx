import { useState } from 'react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import { Copy, Trash2, BarChart3, Check, ExternalLink, QrCode, AlignJustify } from 'lucide-react';
import { Link } from 'react-router-dom';

function UrlTable({ urls, onDelete, onRefreshClicks }) {
  const [copiedId, setCopiedId] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);
  // qrModal = null (closed) | { shortCode, type, imgSrc } (open)
  const [qrModal, setQrModal] = useState(null);

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

  // ─── Download directly without preview ───────────────────────────────────────
  // We use fetch() instead of axios because we need raw binary (Blob),
  // not JSON. axios parses responses as JSON by default.
  async function downloadFile(shortCode, type = 'qr', format = 'png') {
    try {
      const token = localStorage.getItem('token');
      const url   = `http://localhost:3000/urls/${shortCode}/${type}?format=${format}&download=true`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const blob    = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link    = document.createElement('a');
      link.href     = blobUrl;
      link.download = `${type}-${shortCode}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl); // always free memory after use
    } catch {
      toast.error(`Failed to download ${type}`);
    }
  }

  // ─── Load image into memory and show modal preview ────────────────────────────
  async function previewAndDownload(shortCode, type = 'qr') {
    try {
      const token  = localStorage.getItem('token');
      const url    = `http://localhost:3000/urls/${shortCode}/${type}?format=png`;
      const res    = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const blob   = await res.blob();
      const imgSrc = URL.createObjectURL(blob); // Blob → fake local URL for <img src>
      setQrModal({ shortCode, type, imgSrc });
    } catch {
      toast.error('Failed to load preview');
    }
  }

  function closeModal() {
    if (qrModal?.imgSrc) URL.revokeObjectURL(qrModal.imgSrc); // free memory
    setQrModal(null);
  }

  function downloadFromModal() {
    if (!qrModal) return;
    const link    = document.createElement('a');
    link.href     = qrModal.imgSrc;
    link.download = `${qrModal.type}-${qrModal.shortCode}.png`;
    link.click();
    closeModal();
  }

  return (
    <>
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

                    {/* QR Code */}
                    <button
                      onClick={() => previewAndDownload(url.shortCode, 'qr')}
                      className="btn-ghost"
                      title="Preview & Download QR Code"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <QrCode size={16} />
                    </button>

                    {/* Barcode */}
                    <button
                      onClick={() => previewAndDownload(url.shortCode, 'barcode')}
                      className="btn-ghost"
                      title="Preview & Download Barcode"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <AlignJustify size={16} />
                    </button>

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

      {/* ── QR / Barcode Preview Modal ── */}
      {qrModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fade-in-fast 0.2s ease both',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-static"
            style={{
              padding: '32px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              minWidth: '300px',
              border: '1px solid var(--border-accent)',
              boxShadow: 'var(--shadow-glow-strong)',
              animation: 'slide-up 0.3s ease both',
            }}
          >
            {/* Title */}
            <p style={{ fontWeight: 700, fontSize: '16px' }}>
              {qrModal.type === 'qr' ? '🔳 QR Code' : '📊 Barcode'} — <span style={{ color: 'var(--accent-light)', fontFamily: 'monospace' }}>{qrModal.shortCode}</span>
            </p>

            {/* Image — always white bg so QR is visible in dark mode */}
            <div style={{ padding: '16px', background: '#fff', borderRadius: 'var(--radius-md)' }}>
              <img
                src={qrModal.imgSrc}
                alt={`${qrModal.type} for ${qrModal.shortCode}`}
                style={{ display: 'block', width: '220px', height: 'auto' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={downloadFromModal}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                ⬇ Download PNG
              </button>
              <button
                onClick={closeModal}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UrlTable;