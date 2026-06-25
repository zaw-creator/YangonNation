'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

const STATUS_OPTS = ['pending','approved','rejected','suspended','expelled'];
const ROLE_OPTS   = ['new_member','active_member','officer','mod','suspended','expelled'];

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken]   = useState(null);
  const [tab, setTab]       = useState('members'); // members | invites
  const [stats, setStats]   = useState(null);
  const [members, setMembers] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');
  const [invites, setInvites]   = useState([]);
  const [invForm, setInvForm]   = useState({ memberName:'', email:'', expiryDays: 14 });
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError]     = useState('');
  const [invSuccess, setInvSuccess] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('yn_admin_token');
    if (!t) { router.replace('/admin/login'); return; }
    setToken(t);
  }, [router]);

  const authFetch = useCallback((url, opts = {}) => {
    return fetch(url, { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${token}` } });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/api/admin/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d.stats); });
  }, [token, authFetch]);

  const loadMembers = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams({ page, limit: 15 });
    if (search)       params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    if (filterType)   params.set('type', filterType);
    authFetch(`${API}/api/admin/members?${params}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setMembers(d.members); setTotal(d.total); } });
  }, [token, authFetch, page, search, filterStatus, filterType]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const loadInvites = useCallback(() => {
    if (!token) return;
    authFetch(`${API}/api/invite`).then(r => r.json()).then(d => { if (d.success) setInvites(d.invites); });
  }, [token, authFetch]);

  useEffect(() => { if (tab === 'invites') loadInvites(); }, [tab, loadInvites]);

  async function updateMember(id, update) {
    await authFetch(`${API}/api/admin/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    loadMembers();
  }

  async function generateInvite(e) {
    e.preventDefault();
    setInvLoading(true); setInvError(''); setInvSuccess('');
    try {
      const res  = await authFetch(`${API}/api/invite/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invForm),
      });
      const data = await res.json();
      if (res.ok) {
        setInvSuccess(`Invite sent to ${invForm.email}`);
        setInvForm({ memberName:'', email:'', expiryDays: 14 });
        loadInvites();
      } else {
        setInvError(data.message || 'Failed.');
      }
    } catch { setInvError('Network error.'); }
    finally { setInvLoading(false); }
  }

  function logout() { localStorage.removeItem('yn_admin_token'); router.replace('/admin/login'); }

  if (!token) return null;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <p className={styles.sideEyebrow}>AutoCult</p>
          <h1 className={styles.sideLogo}>YN</h1>
          <p className={styles.sideAdmin}>Admin Portal</p>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${tab==='members' ? styles.navActive : ''}`} onClick={() => setTab('members')}>Members</button>
          <button className={`${styles.navItem} ${tab==='invites' ? styles.navActive : ''}`} onClick={() => setTab('invites')}>Invites</button>
        </nav>
        <button className={styles.logout} onClick={logout}>Sign Out</button>
      </aside>

      <main className={styles.main}>
        {stats && (
          <div className={styles.statsRow}>
            {[['Total',stats.total],['Pending',stats.pending],['Approved',stats.approved],['Rejected',stats.rejected],['New',stats.newMembers],['Returning',stats.returning]]
              .map(([label,val]) => (
                <div key={label} className={styles.statCard}>
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
          </div>
        )}

        {tab === 'members' && (
          <>
            <div className={styles.toolbar}>
              <input className={styles.search} placeholder="Search name, email, nickname..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className={styles.filter}>
                <option value="">All Status</option>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className={styles.filter}>
                <option value="">All Types</option>
                <option value="new">New</option>
                <option value="returning">Returning</option>
              </select>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Type</th><th>Dept</th>
                    <th>Status</th><th>Role</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m._id}>
                      <td>
                        <div className={styles.memberName}>{m.fullName}</div>
                        <div className={styles.memberNick}>{m.nickname}</div>
                      </td>
                      <td className={styles.cellMuted}>{m.email}</td>
                      <td><span className={`${styles.badge} ${m.memberType==='returning' ? styles.badgeGold : styles.badgeGray}`}>{m.memberType}</span></td>
                      <td className={styles.cellMuted}>{m.department || '—'}</td>
                      <td>
                        <select value={m.status} onChange={e => updateMember(m._id, { status: e.target.value })} className={styles.inlineSelect}>
                          {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={m.role} onChange={e => updateMember(m._id, { role: e.target.value })} className={styles.inlineSelect}>
                          {ROLE_OPTS.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className={styles.cellMuted}>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          {m.status !== 'approved' && (
                            <button className={styles.btnApprove} onClick={() => updateMember(m._id, { status:'approved' })}>Approve</button>
                          )}
                          {m.status !== 'rejected' && (
                            <button className={styles.btnReject} onClick={() => updateMember(m._id, { status:'rejected' })}>Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr><td colSpan={8} className={styles.empty}>No members found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>{total} total</span>
              <button disabled={page === 1} onClick={() => setPage(p => p-1)} className={styles.pageBtn}>← Prev</button>
              <span className={styles.pageNum}>Page {page}</span>
              <button disabled={members.length < 15} onClick={() => setPage(p => p+1)} className={styles.pageBtn}>Next →</button>
            </div>
          </>
        )}

        {tab === 'invites' && (
          <>
            <div className={styles.inviteSection}>
              <h2 className={styles.sectionTitle}>Generate Invite</h2>
              <form className={styles.inviteForm} onSubmit={generateInvite}>
                <input placeholder="Member name" value={invForm.memberName}
                  onChange={e => setInvForm(f => ({ ...f, memberName: e.target.value }))} required />
                <input type="email" placeholder="Email address" value={invForm.email}
                  onChange={e => setInvForm(f => ({ ...f, email: e.target.value }))} required />
                <div className={styles.inviteRow}>
                  <label className={styles.inviteLabel}>Expiry (days)</label>
                  <input type="number" min={1} max={90} value={invForm.expiryDays}
                    onChange={e => setInvForm(f => ({ ...f, expiryDays: Number(e.target.value) }))} style={{ maxWidth: 100 }} />
                </div>
                {invError   && <p style={{ color: 'var(--red)', fontSize: 12 }}>{invError}</p>}
                {invSuccess && <p style={{ color: 'var(--gold)', fontSize: 12 }}>{invSuccess}</p>}
                <button type="submit" className={styles.inviteBtn} disabled={invLoading}>
                  {invLoading ? 'Sending...' : 'Generate & Send Invite'}
                </button>
              </form>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Status</th><th>Expires</th><th>Sent</th></tr>
                </thead>
                <tbody>
                  {invites.map(inv => {
                    const expired = new Date(inv.expiresAt) < new Date();
                    const status  = inv.used ? 'used' : expired ? 'expired' : 'pending';
                    return (
                      <tr key={inv._id}>
                        <td>{inv.memberName}</td>
                        <td className={styles.cellMuted}>{inv.email}</td>
                        <td><span className={`${styles.badge} ${status==='used' ? styles.badgeGold : status==='expired' ? styles.badgeRed : styles.badgeGray}`}>{status}</span></td>
                        <td className={styles.cellMuted}>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                        <td className={styles.cellMuted}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {invites.length === 0 && (
                    <tr><td colSpan={5} className={styles.empty}>No invites generated yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
