import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/serenityService';
import type { Appointment, MembershipPlan } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────
const spaGold = '#9b8578';
const spaLight = '#c9a287';
const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '6px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
  padding: '24px',
  marginBottom: '24px',
};
const badge = (status: string): React.CSSProperties => {
  const colours: Record<string, string> = {
    PENDING: '#f6ad55',
    CONFIRMED: '#48bb78',
    COMPLETED: '#4299e1',
    CANCELLED: '#fc8181',
    ACTIVE: '#48bb78',
    CANCELLED_MEM: '#fc8181',
  };
  return {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: colours[status] ?? '#cbd5e0',
    color: 'white',
  };
};
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: spaGold, borderBottom: '2px solid #f0eae4', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f4f0ec', verticalAlign: 'top' };
const actionBtn = (colour = spaGold): React.CSSProperties => ({
  padding: '5px 12px',
  border: `1px solid ${colour}`,
  background: 'transparent',
  color: colour,
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  marginRight: '6px',
});

type Section = 'appointments' | 'memberships' | 'messages' | 'reviews';

// ─── Component ────────────────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>('appointments');

  // Appointment state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptFilter, setApptFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [apptLoading, setApptLoading] = useState(false);
  const [apptMsg, setApptMsg] = useState<string | null>(null);

  // Membership state
  const [memberships, setMemberships] = useState<any[]>([]);
  const [memLoading, setMemLoading] = useState(false);
  const [memMsg, setMemMsg] = useState<string | null>(null);

  // Membership Plans state
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('30');
  const [newPlanDiscount, setNewPlanDiscount] = useState('15');
  const [newPlanBenefits, setNewPlanBenefits] = useState('');
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Contact messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState<number | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<number, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<number | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<{ id: number; text: string; isError?: boolean } | null>(null);

  // Review state
  const [reviews, setReviews] = useState<any[]>([]);
  const [revLoading, setRevLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({});

  // ─── Data loaders ────────────────────────────────────────────────────────
  const loadAppointments = useCallback(async () => {
    setApptLoading(true);
    setApptMsg(null);
    try {
      const res = await adminApi.getAllAppointments();
      setAppointments(res.data);
    } catch {
      setApptMsg('Failed to load appointments.');
    } finally { setApptLoading(false); }
  }, []);

  const loadMemberships = useCallback(async () => {
    setMemLoading(true);
    setMemMsg(null);
    try {
      const res = await adminApi.getActiveMemberships();
      setMemberships(res.data);
    } catch {
      setMemMsg('Failed to load memberships.');
    } finally { setMemLoading(false); }
  }, []);

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await adminApi.getAllMembershipPlans();
      setPlans(res.data);
    } catch { /* silent */ } finally { setPlansLoading(false); }
  }, []);

  const loadMessages = useCallback(async () => {
    setMsgLoading(true);
    try {
      const res = await adminApi.getMessages();
      setMessages(res.data);
    } catch { /* silent */ } finally { setMsgLoading(false); }
  }, []);

  const loadReviews = useCallback(async () => {
    setRevLoading(true);
    try {
      const res = await adminApi.getReviews();
      setReviews(res.data);
    } catch { /* silent */ } finally { setRevLoading(false); }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadAppointments();
    }
  }, [isAdmin, loadStats, loadAppointments]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeSection === 'memberships') {
      loadMemberships();
      loadPlans();
    }
    if (activeSection === 'messages') loadMessages();
    if (activeSection === 'reviews') loadReviews();
  }, [activeSection, isAdmin, loadMemberships, loadPlans, loadMessages, loadReviews]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleStatusChange = async (id: number, newStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    setApptMsg(null);
    try {
      await adminApi.updateAppointmentStatus(id, newStatus as any);
      setApptMsg(`✓ Appointment #${id} updated to ${newStatus}.`);
      loadAppointments();
      loadStats();
    } catch (err: any) {
      setApptMsg(`✗ ${err.response?.data?.message || 'Failed to update status.'}`);
    }
  };

  const handleDeactivate = async (id: number, name: string) => {
    if (!window.confirm(`Deactivate ${name}'s membership? Future bookings will not receive a discount. Existing bookings retain their prices.`)) return;
    setMemMsg(null);
    try {
      await adminApi.deactivateMembership(id);
      setMemMsg('✓ Membership deactivated.');
      loadMemberships();
      loadStats();
    } catch (err: any) {
      setMemMsg(`✗ ${err.response?.data?.message || 'Failed to deactivate.'}`);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim() || !newPlanPrice) return;
    setPlanSubmitting(true);
    setMemMsg(null);
    try {
      await adminApi.createMembershipPlan({
        name: newPlanName.trim(),
        description: newPlanDesc.trim(),
        price: parseFloat(newPlanPrice),
        durationDays: parseInt(newPlanDuration) || 30,
        discountPercentage: parseFloat(newPlanDiscount) || 15,
        benefits: newPlanBenefits.trim(),
      });
      setMemMsg(`✓ New plan '${newPlanName}' created successfully!`);
      setNewPlanName('');
      setNewPlanDesc('');
      setNewPlanPrice('');
      setNewPlanBenefits('');
      setPlanFormOpen(false);
      loadPlans();
    } catch (err: any) {
      setMemMsg(`✗ ${err.response?.data?.message || 'Failed to create plan.'}`);
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove '${name}'? This plan will immediately be revoked and removed for all active customers as well.`)) return;
    setMemMsg(null);
    try {
      await adminApi.deleteMembershipPlan(id);
      setMemMsg(`✓ Membership plan '${name}' removed and revoked from all customers.`);
      loadPlans();
      loadMemberships();
      loadStats();
    } catch (err: any) {
      setMemMsg(`✗ ${err.response?.data?.message || 'Failed to remove plan.'}`);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await adminApi.markMessageRead(id);
      loadMessages();
      loadStats();
    } catch { /* silent */ }
  };

  const handleSendReply = async (id: number) => {
    const text = replyTextMap[id]?.trim();
    if (!text) return;
    setReplySubmitting(id);
    setReplyFeedback(null);
    try {
      await adminApi.replyToMessage(id, text);
      setReplyFeedback({ id, text: '✓ Reply sent successfully!' });
      setReplyTextMap(prev => ({ ...prev, [id]: '' }));
      loadMessages();
      loadStats();
    } catch (err: any) {
      setReplyFeedback({ id, text: err.response?.data?.message || 'Failed to send reply', isError: true });
    } finally {
      setReplySubmitting(null);
    }
  };

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <section className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div className="container">
          <h1 className="section-title">Admin Access Required</h1>
          <p className="section-subtitle">You must be logged in as an administrator to view this area.</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/login" className="btn">Sign In as Admin</Link>
          </div>
        </div>
      </section>
    );
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  // ─── Filtered appointments ────────────────────────────────────────────────
  const filteredAppts = apptFilter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === apptFilter);

  // ─── Sidebar nav ──────────────────────────────────────────────────────────
  const navItems: { key: Section; label: string; badge?: number }[] = [
    { key: 'appointments', label: '📋 Appointments', badge: stats.pendingAppointments },
    { key: 'memberships', label: '💳 Memberships', badge: stats.activeMemberships },
    { key: 'messages', label: '✉️ Messages', badge: stats.unreadMessages },
    { key: 'reviews', label: '⭐ Reviews', badge: stats.totalReviews },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '80vh', backgroundColor: '#f9f7f4' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        backgroundColor: 'white',
        borderRight: '1px solid #f0eae4',
        padding: '30px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #f0eae4' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 700, color: spaGold, margin: 0 }}>
            Serenity Spa
          </p>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0' }}>Owner Panel</p>
        </div>

        <nav style={{ padding: '16px 0', flex: 1 }}>
          {navItems.map(({ key, label, badge: b }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 20px',
                background: activeSection === key ? '#fdf8f5' : 'transparent',
                border: 'none',
                borderLeft: activeSection === key ? `3px solid ${spaGold}` : '3px solid transparent',
                color: activeSection === key ? spaGold : '#666',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '16px',
                fontWeight: activeSection === key ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{label}</span>
              {b != null && b > 0 && (
                <span style={{ background: spaLight, color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '12px' }}>
                  {b}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0eae4' }}>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '15px', fontFamily: "'Cormorant Garamond', serif" }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflowX: 'auto' }}>

        {/* ── A. Appointment Confirmation ──────────────────────────────── */}
        {activeSection === 'appointments' && (
          <div>
            <h2 style={{ color: spaGold, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>Appointment Confirmation</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>Confirm or reject customer bookings. New bookings arrive as Pending.</p>

            {apptMsg && (
              <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: apptMsg.startsWith('✓') ? '#f0fff4' : '#fff5f5', color: apptMsg.startsWith('✓') ? '#276749' : '#c53030', borderRadius: '4px' }}>
                {apptMsg}
              </div>
            )}

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(f => (
                <button key={f} onClick={() => setApptFilter(f)} style={{
                  padding: '6px 14px', borderRadius: '20px', border: `1px solid ${spaGold}`,
                  background: apptFilter === f ? spaGold : 'white', color: apptFilter === f ? 'white' : spaGold,
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                }}>
                  {f}
                </button>
              ))}
              <button onClick={loadAppointments} style={{ marginLeft: 'auto', ...actionBtn() }}>↻ Refresh</button>
            </div>

            {apptLoading ? (
              <p style={{ color: '#888' }}>Loading…</p>
            ) : filteredAppts.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: '#aaa' }}>No appointments found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                  <thead>
                    <tr>
                      <th style={th}>#ID</th>
                      <th style={th}>Customer</th>
                      <th style={th}>Treatment</th>
                      <th style={th}>Date & Time</th>
                      <th style={th}>Price</th>
                      <th style={th}>Status</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppts.map(a => (
                      <tr key={a.id}>
                        <td style={td}>#{a.id}</td>
                        <td style={td}>
                          <strong>{a.customerName}</strong><br />
                          <small style={{ color: '#888' }}>{a.customerEmail}</small>
                        </td>
                        <td style={td}>{a.treatmentName}</td>
                        <td style={td}>
                          {a.appointmentDate}<br />
                          <small style={{ color: '#888' }}>{String(a.startTime).substring(0, 5)}</small>
                        </td>
                        <td style={td}>
                          {a.finalPrice != null ? (
                            <>
                              <span>₹{Number(a.finalPrice).toFixed(2)}</span>
                              {a.membershipDiscountApplied && (
                                <><br /><small style={{ color: '#48bb78' }}>Membership discount applied</small></>
                              )}
                            </>
                          ) : a.originalPrice != null ? `₹${Number(a.originalPrice).toFixed(2)}` : '—'}
                        </td>
                        <td style={td}><span style={badge(a.status)}>{a.status}</span></td>
                        <td style={td}>
                          {a.status === 'PENDING' && (
                            <>
                              <button style={actionBtn('#48bb78')} onClick={() => handleStatusChange(a.id, 'CONFIRMED')}>✓ Confirm</button>
                              <button style={actionBtn('#e53e3e')} onClick={() => handleStatusChange(a.id, 'CANCELLED')}>✗ Reject</button>
                            </>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <>
                              <button style={actionBtn('#4299e1')} onClick={() => handleStatusChange(a.id, 'COMPLETED')}>Mark Completed</button>
                              <button style={actionBtn('#e53e3e')} onClick={() => handleStatusChange(a.id, 'CANCELLED')}>Cancel</button>
                            </>
                          )}
                          {(a.status === 'COMPLETED' || a.status === 'CANCELLED') && (
                            <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── B. Membership Management ─────────────────────────────────── */}
        {activeSection === 'memberships' && (
          <div>
            <h2 style={{ color: spaGold, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>Membership Management</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>View and deactivate active customer memberships. Historical bookings retain their original prices.</p>

            {memMsg && (
              <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: memMsg.startsWith('✓') ? '#f0fff4' : '#fff5f5', color: memMsg.startsWith('✓') ? '#276749' : '#c53030', borderRadius: '4px' }}>
                {memMsg}
              </div>
            )}

            {/* ── 1. Membership Plans Catalog (Add / Remove) ── */}
            <div style={{ ...card, marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: spaGold, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Membership Plans Catalog</h3>
                  <small style={{ color: '#888' }}>Create new plans or remove existing ones. Removing a plan revokes it immediately for all active members.</small>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={loadPlans} style={actionBtn()}>↻ Refresh Plans</button>
                  <button
                    onClick={() => setPlanFormOpen(!planFormOpen)}
                    style={{ ...actionBtn(spaGold), color: 'white', backgroundColor: spaGold }}
                  >
                    {planFormOpen ? '✖ Close Form' : '+ Add New Plan'}
                  </button>
                </div>
              </div>

              {/* Add New Plan Collapsible Form */}
              {planFormOpen && (
                <form onSubmit={handleCreatePlan} style={{ backgroundColor: '#f9f7f4', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #eedcd1' }}>
                  <h4 style={{ color: spaGold, marginTop: 0, marginBottom: '14px' }}>Create New Membership Plan</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>Plan Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Platinum Serenity"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>Monthly Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="e.g. 199.00"
                        value={newPlanPrice}
                        onChange={(e) => setNewPlanPrice(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>Discount Percentage (%) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        placeholder="e.g. 20"
                        value={newPlanDiscount}
                        onChange={(e) => setNewPlanDiscount(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>Duration (Days) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 30"
                        value={newPlanDuration}
                        onChange={(e) => setNewPlanDuration(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>Description</label>
                    <input
                      type="text"
                      placeholder="Short summary of the tier"
                      value={newPlanDesc}
                      onChange={(e) => setNewPlanDesc(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>Benefits (Comma separated list)</label>
                    <input
                      type="text"
                      placeholder="e.g. 20% Off All Massages, Unlimited Herbal Teas, Free Valet Parking"
                      value={newPlanBenefits}
                      onChange={(e) => setNewPlanBenefits(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={planSubmitting}
                    style={{
                      padding: '10px 22px',
                      backgroundColor: spaGold,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: planSubmitting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {planSubmitting ? 'Saving Plan…' : 'Save & Publish Plan'}
                  </button>
                </form>
              )}

              {/* Plans Table */}
              {plansLoading ? (
                <p style={{ color: '#888' }}>Loading plans…</p>
              ) : plans.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center' }}>No plans registered.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={th}>#ID</th>
                        <th style={th}>Plan Name</th>
                        <th style={th}>Monthly Price</th>
                        <th style={th}>Member Discount</th>
                        <th style={th}>Duration</th>
                        <th style={th}>Status</th>
                        <th style={th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((p) => (
                        <tr key={p.id}>
                          <td style={td}>#{p.id}</td>
                          <td style={td}>
                            <strong>{p.name}</strong><br />
                            <small style={{ color: '#888' }}>{p.description}</small>
                          </td>
                          <td style={td}>${p.price}</td>
                          <td style={td}><strong>{p.discountPercentage}%</strong></td>
                          <td style={td}>{p.durationDays} days</td>
                          <td style={td}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: p.active ? '#e6fffa' : '#fed7d7',
                              color: p.active ? '#234e52' : '#9b2c2c',
                            }}>
                              {p.active ? 'ACTIVE' : 'INACTIVE / REMOVED'}
                            </span>
                          </td>
                          <td style={td}>
                            {p.active ? (
                              <button
                                style={actionBtn('#e53e3e')}
                                onClick={() => handleDeletePlan(p.id, p.name)}
                              >
                                🗑️ Remove Plan
                              </button>
                            ) : (
                              <span style={{ color: '#aaa', fontSize: '13px' }}>Removed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── 2. Active Customer Memberships List ── */}
            <h3 style={{ color: spaGold, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>Active Customer Memberships</h3>
            <p style={{ color: '#888', marginBottom: '14px' }}>Active subscriptions held by customers.</p>

            {memLoading ? (
              <p style={{ color: '#888' }}>Loading…</p>
            ) : memberships.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: '#aaa' }}>No active customer memberships.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                  <thead>
                    <tr>
                      <th style={th}>#ID</th>
                      <th style={th}>Customer</th>
                      <th style={th}>Plan</th>
                      <th style={th}>Discount</th>
                      <th style={th}>Start Date</th>
                      <th style={th}>Expiry Date</th>
                      <th style={th}>Status</th>
                      <th style={th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((m: any) => (
                      <tr key={m.id}>
                        <td style={td}>#{m.id}</td>
                        <td style={td}>
                          <strong>{m.customerName}</strong><br />
                          <small style={{ color: '#888' }}>{m.customerEmail}</small>
                        </td>
                        <td style={td}>{m.planName}</td>
                        <td style={td}>{m.discountPercentage}%</td>
                        <td style={td}>{m.startDate}</td>
                        <td style={td}>{m.endDate}</td>
                        <td style={td}><span style={badge(m.status)}>{m.status}</span></td>
                        <td style={td}>
                          {m.activeNow ? (
                            <button
                              style={actionBtn('#e53e3e')}
                              onClick={() => handleDeactivate(m.id, m.customerName)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── C. Customer Messages ──────────────────────────────────────── */}
        {activeSection === 'messages' && (
          <div>
            <h2 style={{ color: spaGold, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>Customer Messages</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>Contact form submissions from customers. Click a message to expand it and mark it as read.</p>

            <div style={{ marginBottom: '16px' }}>
              <button onClick={loadMessages} style={actionBtn()}>↻ Refresh</button>
            </div>

            {msgLoading ? (
              <p style={{ color: '#888' }}>Loading…</p>
            ) : messages.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: '#aaa' }}>No messages yet.</div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} style={{
                  ...card,
                  borderLeft: m.read ? '4px solid #e2e8f0' : `4px solid ${spaLight}`,
                  cursor: 'pointer',
                  padding: '16px 20px',
                }} onClick={() => {
                  setExpandedMsg(expandedMsg === m.id ? null : m.id);
                  if (!m.read) handleMarkRead(m.id);
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: spaGold }}>{m.name}</strong>
                      <span style={{ color: '#888', fontSize: '13px', marginLeft: '10px' }}>{m.email}</span>
                      <span style={{ color: '#555', marginLeft: '12px' }}>{m.subject}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {m.reply ? (
                        <span style={{ ...badge('CONFIRMED'), backgroundColor: '#48bb78' }}>REPLIED</span>
                      ) : !m.read ? (
                        <span style={{ ...badge('PENDING'), backgroundColor: spaLight }}>UNREAD</span>
                      ) : null}
                      <small style={{ color: '#aaa' }}>{new Date(m.createdAt).toLocaleDateString()}</small>
                      <span style={{ color: spaGold }}>{expandedMsg === m.id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expandedMsg === m.id && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ padding: '12px', background: '#f9f7f4', borderRadius: '4px', color: '#555', lineHeight: 1.6, marginBottom: '14px' }}>
                        <strong>Message:</strong><br />
                        {m.message}
                      </div>

                      {/* Display existing reply if any */}
                      {m.reply && (
                        <div style={{ padding: '12px', background: '#e6fffa', borderLeft: '4px solid #38b2ac', borderRadius: '4px', marginBottom: '14px' }}>
                          <strong style={{ color: '#234e52' }}>Admin Reply:</strong>
                          <p style={{ margin: '4px 0 0', color: '#285e61', lineHeight: 1.5 }}>{m.reply}</p>
                          {m.repliedAt && (
                            <small style={{ color: '#4fd1c5', display: 'block', marginTop: '4px' }}>
                              Sent: {new Date(m.repliedAt).toLocaleString()}
                            </small>
                          )}
                        </div>
                      )}

                      {/* Reply compose form */}
                      <div style={{ borderTop: '1px solid #f0eae4', paddingTop: '12px' }} onClick={(e) => e.stopPropagation()}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: spaGold, marginBottom: '6px' }}>
                          {m.reply ? 'Send Another Reply:' : 'Reply to Customer:'}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={`Write a reply to ${m.name}...`}
                          value={replyTextMap[m.id] || ''}
                          onChange={(e) => setReplyTextMap(prev => ({ ...prev, [m.id]: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            marginBottom: '8px',
                            fontFamily: 'inherit',
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            disabled={replySubmitting === m.id || !replyTextMap[m.id]?.trim()}
                            onClick={() => handleSendReply(m.id)}
                            style={{
                              padding: '8px 18px',
                              backgroundColor: spaGold,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: (replySubmitting === m.id || !replyTextMap[m.id]?.trim()) ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              opacity: (!replyTextMap[m.id]?.trim() || replySubmitting === m.id) ? 0.6 : 1,
                            }}
                          >
                            {replySubmitting === m.id ? 'Sending…' : '✉️ Send Reply'}
                          </button>
                          {replyFeedback && replyFeedback.id === m.id && (
                            <span style={{ fontSize: '13px', color: replyFeedback.isError ? '#e53e3e' : '#38a169', fontWeight: 500 }}>
                              {replyFeedback.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── D. Customer Reviews ───────────────────────────────────────── */}
        {activeSection === 'reviews' && (
          <div>
            <h2 style={{ color: spaGold, fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>Customer Reviews</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>Verified reviews submitted by customers for completed appointments. Read-only.</p>

            <div style={{ marginBottom: '16px' }}>
              <button onClick={loadReviews} style={actionBtn()}>↻ Refresh</button>
            </div>

            {revLoading ? (
              <p style={{ color: '#888' }}>Loading…</p>
            ) : reviews.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: '#aaa' }}>No reviews yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {reviews.map((r: any) => (
                  <div key={r.id} style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ color: spaGold }}>{r.fullName || r.customerName || r.customerFullName}</strong>
                        {(r.profession) && (
                          <p style={{ fontSize: '12px', color: '#aaa', margin: '2px 0 0' }}>{r.profession}</p>
                        )}
                      </div>
                      <span style={{ color: '#f6ad55', fontSize: '16px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.treatmentName && (
                      <p style={{ fontSize: '13px', color: spaLight, marginBottom: '6px' }}>{r.treatmentName}</p>
                    )}
                    <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, marginBottom: '10px' }}>{r.comment || <em style={{ color: '#aaa' }}>No comment</em>}</p>
                    <small style={{ color: '#aaa' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
