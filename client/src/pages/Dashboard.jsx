import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link2, MousePointerClick, TrendingUp, Search, Plus, Globe, Copy, Check, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import UrlTable from '../components/UrlTable';
import Pagination from '../components/Pagination';
import Captcha from '../components/Captcha';

const LIMIT = 10; // URLs per page

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Shorten form
  const [newUrl, setNewUrl] = useState('');
  const [shortening, setShortening] = useState(false);

  // Show the result right after shortening
  const [justShortened, setJustShortened] = useState(null);
  const [copied, setCopied] = useState(false);
  const captchaRef = useRef(null);

  // Stats for the 3 cards
  const [stats, setStats] = useState({
    totalLinks:      0,
    linksThisWeek:   0,
    linksLastWeek:   0,
    totalClicks:     0,
    clicksThisWeek:  0,
    clicksLastWeek:  0,
    activeLinks:     0,
  });

    const [ loadingLinks, setLoadingLinks ] = useState(false);
    const [ loadingClicks, setLoadingClicks] = useState(false);
    const [ loadingActive, setLoadingActive ] = useState(false);

    const [status, setStatus] = useState('all');
    const [sortBy,setSortBy] = useState('recent');

  // ─── Fetch URLs from backend ─────────────────────────────────────────────────
  async function fetchUrls(searchTerm = search, pageNum = page, statusVal = status, sortVal = sortBy) {
    try {
      // Backend returns { urls: [...], total, page, totalPages }
      const response = await api.get(
        `/urls?search=${searchTerm}&page=${pageNum}&limit=${LIMIT}&status=${statusVal}&sortBy=${sortVal}`
      );
      setUrls(response.data.urls || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch URLs');
//       setUrls([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
        setPage(1);
        fetchUrls(search, 1, status, sortBy);
//         fetchStats();
  }, [status,sortBy]);

  // Load on mount — fetch both the URL list and the stats
  useEffect(()=>{
     fetchUrls();
     fetchStats();
  },[]);

  async function fetchStats() {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch {
      // stats are best-effort — don't block the page
    }
  }

  // Helper: compute % trend, guard against division by zero
  function trendPct(thisWeek, lastWeek) {
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }

  // Re-fetch when page changes (but not on first render — handled above)
  useEffect(() => {
    if (!loading) {
      fetchUrls(search, page);
    }
  }, [page]);

  // ─── Page change handler ──────────────────────────────────────────────────────
  function handlePageChange(newPage) {
    setPage(newPage);
    // Scroll back to top of table smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Search handler ───────────────────────────────────────────────────────────
  function handleSearch(e) {
    e.preventDefault();
    setPage(1); // reset to page 1 on new search
    fetchUrls(search, 1);
  }

  // ─── Shorten a new URL ────────────────────────────────────────────────────────
  async function handleShorten(e) {
    e.preventDefault();
    if (!newUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    const captchaToken = captchaRef.current?.getToken();
    if(!captchaToken){
        toast.error('Please complete the captcha.');
        return;
    }
    setShortening(true);
    try {
      const response = await api.post('/shorten', { url: newUrl,captchaToken});
      toast.success('URL shortened!');
      setJustShortened(response.data.shortUrl);
      setNewUrl('');
      setPage(1);           // go back to page 1 so user sees new link
      fetchUrls(search, 1);
      fetchStats();
      captchaRef.current?.reset();
    } catch (error) {
      captchaRef.current?.reset();
      toast.error('Failed to shorten URL');
    } finally {
      setShortening(false);
    }
  }

  function handleCopy() {
    if (!justShortened) return;
    navigator.clipboard.writeText(justShortened);
    toast.success('Copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Delete a URL ─────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    const previous = urls;
    setUrls((prev) => prev.filter((u) => u.id !== id));
    try {
      await api.delete(`/urls/${id}`);
      toast.success('URL deleted');
      // If we deleted the last item on this page, go back one page
      if (urls.length === 1 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        fetchUrls(search, newPage);
      } else {
        fetchUrls(search, page);
      }
      fetchStats();
    } catch {
      setUrls(previous);
      toast.error('Delete failed');
    }
  }

  const totalUrls = Array.isArray(urls) ? urls.length : 0;

  async function refreshLinks(){
      setLoadingLinks(true);
      try{
            const res = await api.get('/stats');
            setStats(prev =>({
                ...prev,
                totalLinks: res.data.totalLinks,
                linksThisWeek: res.data.linksThisWeek,
                linksLastWeek: res.data.linksLastWeek,
            }));
      }catch(error){
         toast.error("Failed to update Links.Try again!");
      }finally{
        setLoadingLinks(false);
      }
  }

  async function refreshClicks(){
        setLoadingClicks(true);
        try{
            const res = await api.get('/stats');
            setStats(prev=>({
                ...prev,
                totalClicks: res.data.totalClicks,
                clicksThisWeek: res.data.clicksThisWeek,
                clicksLastWeek: res.data.clicksLastWeek
            }));
        }catch(error){
            toast.error("Failed to update clicks.")
        }finally{
            setLoadingClicks(false);
        }
  }

  async function refreshActive(){
        setLoadingActive(true);
        try{
            const res = await api.get('/stats');
            setStats(prev=>({
                ...prev,
                activeLinks: res.data.activeLinks,
            }));
        }catch(error){
            toast.error("Failed to update active links.");
        }finally{
            setLoadingActive(false);
        }
  }

  async function refreshRowClicks(urlId){
        try{
            const response = await api.get(`/urls/${urlId}/clicks`);
            const updatedCount = response.data.clickCount;
            setUrls((prevUrls)=>
                prevUrls.map((url)=>
                    url.id === urlId
                    ? { ...url, _count: {...url._count, clickEvents: updatedCount} }
                    : url
                )
            );
            toast.success("Clicks updated.")
        }catch(error){
            toast.error("Failed to update clicks.");
        }
  }

  return (
    <DashboardLayout>
      {/* ── Header ── */}
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
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Manage and track all your short links
            {total > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
                ({total} total)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatsCard
          title="Total Links"
          value={stats.totalLinks}
          icon={Link2}
          color="purple"
          trend={trendPct(stats.linksThisWeek, stats.linksLastWeek)}
          onClick = {refreshLinks}
          isLoading = {loadingLinks}
        />
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          icon={MousePointerClick}
          color="blue"
          trend={trendPct(stats.clicksThisWeek, stats.clicksLastWeek)}
          onClick = {refreshClicks}
          isLoading = {loadingClicks}
        />
        <StatsCard
          title="Active Links"
          value={stats.activeLinks}
          icon={TrendingUp}
          color="green"
          trend={trendPct(stats.linksThisWeek, stats.linksLastWeek)}
          onClick = {refreshActive}
          isLoading = {loadingActive}
        />
      </div>

      {/* ── Shorten Form ── */}
      <div
        className="card-static animate-fade-in delay-100"
        style={{ padding: '20px 24px', marginBottom: '16px', borderRadius: 'var(--radius-lg)' }}
      >
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          Shorten a new URL
        </p>

        <form onSubmit={handleShorten} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Globe
              size={16}
              style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="https://your-very-long-url.com/goes/here"
              className="input"
              style={{ paddingLeft: '40px', height: '46px' }}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={shortening}
            style={{ height: '46px', padding: '0 22px', fontSize: '14px' }}
          >
            {shortening ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin-slow 0.7s linear infinite',
                }} />
                Shortening...
              </span>
            ) : (
              <><Plus size={16} /> Shorten</>
            )}
          </button>
          <div style={{ width: '100%', marginTop: '4px' }}>
            <Captcha ref={captchaRef} />
          </div>
        </form>

        {/* Result card */}
        {justShortened && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '14px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Short link ready
              </p>
              <a
                href={justShortened}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent-light)', textDecoration: 'none' }}
              >
                {justShortened}
              </a>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={handleCopy} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
              <button onClick={() => setJustShortened(null)} className="btn-ghost" style={{ padding: '8px' }} title="Dismiss">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Search & Filter Controls ── */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: '8px', flex: '1 1 300px' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search your links..."
              className="input"
              style={{ paddingLeft: '40px', height: '42px', fontSize: '14px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(e); } }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ height: '42px', padding: '0 18px', fontSize: '14px', flexShrink: 0 }}
          >
            <Search size={15} />
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              padding: '0 14px',
              height: '42px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '120px',
              transition: 'var(--transition)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="all">All Links</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              padding: '0 14px',
              height: '42px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '140px',
              transition: 'var(--transition)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="most_clicked">Most Clicked</option>
            <option value="least_clicked">Least Clicked</option>
          </select>
        </div>
      </div>

      {/* ── Table / Skeleton / Empty ── */}
      {loading ? (
        <TableSkeleton />
      ) : totalUrls === 0 ? (
        <EmptyStateCustom />
      ) : (
        <>
          <UrlTable
            urls={urls}
            onDelete={handleDelete}
            onRefreshClicks={refreshRowClicks}
          />

          {/* ── Pagination ── */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {/* Per-page info */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} links
          </p>
        </>
      )}
    </DashboardLayout>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="card-static" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ width: '120px', height: '20px' }} />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '20px', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton" style={{ flex: 3, height: '16px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ flex: 1, height: '16px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyStateCustom() {
  return (
    <div className="card animate-fade-in" style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
      }}>
        <Link2 size={28} style={{ color: 'var(--accent-light)' }} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>No links yet</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.6 }}>
        Shorten your first URL using the form above and start tracking clicks.
      </p>
    </div>
  );
}

export default Dashboard;