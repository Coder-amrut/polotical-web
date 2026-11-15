import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../api/axios';
import {
  Users,
  Search,
  Bot,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  Lock,
  Sparkles,
  UserCheck,
  Filter
} from 'lucide-react';

export default function UsersAiPermissionManager({ language = 'mr', onNotice = null, onError = null }) {
  const isMr = language === 'mr';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'WORKER', 'OFFICER', 'AI_ONLY', 'NO_AI'
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 3500);
    if (isErr && onError) onError(msg);
    else if (!isErr && onNotice) onNotice(msg);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users-list');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
      showToast(isMr ? 'वापरकर्ते यादी लोड करण्यात अयशस्वी.' : 'Failed to load users list.', true);
    } finally {
      setLoading(false);
    }
  }, [isMr]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle single user AI toggle
  const handleToggleAi = async (u) => {
    setTogglingUserId(u.id);
    const prevStatus = Boolean(u.can_use_ai);
    const newStatus = !prevStatus;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, can_use_ai: newStatus } : item))
    );

    try {
      const res = await apiClient.post(`/admin/users/${u.id}/toggle-ai-access`);
      const msg = res.data?.message || (newStatus
        ? `${u.full_name} यांना AI Chatbot ॲक्सेस देण्यात आला.`
        : `${u.full_name} यांचा AI Chatbot ॲक्सेस बंद करण्यात आला.`);
      showToast(msg);
    } catch (err) {
      console.error('Toggle AI access failed:', err);
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, can_use_ai: prevStatus } : item))
      );
      showToast(err.response?.data?.message || (isMr ? 'त्रुटी आली, कृपया पुन्हा प्रयत्न करा.' : 'Failed to toggle AI access.'), true);
    } finally {
      setTogglingUserId(null);
    }
  };

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search match
      const q = search.toLowerCase().trim();
      const nameMatch = (u.full_name || '').toLowerCase().includes(q);
      const phoneMatch = (u.phone || '').includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const matchesSearch = !q || nameMatch || phoneMatch || emailMatch;

      if (!matchesSearch) return false;

      // Role & AI filter match
      if (roleFilter === 'all') return true;
      if (roleFilter === 'AI_ONLY') return Boolean(u.can_use_ai);
      if (roleFilter === 'NO_AI') return !u.can_use_ai;
      if (roleFilter === 'WORKER') return u.roles?.some((r) => r.name === 'WORKER');
      if (roleFilter === 'OFFICER') return u.roles?.some((r) => r.name === 'OFFICER');

      return true;
    });
  }, [users, search, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const aiEnabled = users.filter((u) => u.can_use_ai).length;
    const aiDisabled = total - aiEnabled;
    const workersCount = users.filter((u) => u.roles?.some((r) => r.name === 'WORKER')).length;
    const officersCount = users.filter((u) => u.roles?.some((r) => r.name === 'OFFICER')).length;
    return { total, aiEnabled, aiDisabled, workersCount, officersCount };
  }, [users]);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            top: '18px',
            right: '24px',
            zIndex: 100,
            background: toast.isErr ? '#fef2f2' : '#f0fdf4',
            border: `1.5px solid ${toast.isErr ? '#fca5a5' : '#86efac'}`,
            color: toast.isErr ? '#b91c1c' : '#15803d',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '13px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{toast.isErr ? '⚠️' : '✓'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
            }}
          >
            👥
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              {isMr ? 'सर्व वापरकर्ते व AI Chatbot ॲक्सेस व्यवस्थापन' : 'Registered Users & AI Chatbot Access Control'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              {isMr
                ? 'सिस्टीममधील सर्व वापरकर्त्यांची यादी व कोणाला AI Chatbot वापरायचा अधिकार द्यायचा ते येथे ठरवा'
                : 'Manage user directory and control who has permission to use the AI Chatbot'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '9px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#334155',
            fontWeight: '750',
            fontSize: '12px',
            cursor: 'pointer',
          }}
          title={isMr ? 'यादी ताजी करा' : 'Refresh Users'}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>{isMr ? 'रीफ्रेश' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            {isMr ? 'एकूण वापरकर्ते' : 'Total Users'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
            {stats.total}
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🤖</span> {isMr ? 'AI ॲक्सेस सुरू' : 'AI Enabled'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
            {stats.aiEnabled}
          </div>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🔒</span> {isMr ? 'AI ॲक्सेस बंद' : 'AI Disabled'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', marginTop: '2px' }}>
            {stats.aiDisabled}
          </div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase' }}>
            👷 {isMr ? 'कार्यकर्ते' : 'Field Workers'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1d4ed8', marginTop: '2px' }}>
            {stats.workersCount}
          </div>
        </div>

        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: '700', textTransform: 'uppercase' }}>
            👔 {isMr ? 'अधिकारी' : 'Officers'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>
            {stats.officersCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '360px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder={isMr ? 'नाव, फोन किंवा ईमेलने शोधा...' : 'Search by name, phone or email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '9px 12px 9px 34px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { key: 'all', label_mr: 'सर्व वापरकर्ते', label_en: 'All' },
            { key: 'AI_ONLY', label_mr: '🤖 AI सुरू असलेले', label_en: 'AI Enabled' },
            { key: 'NO_AI', label_mr: '🔒 AI बंद असलेले', label_en: 'AI Disabled' },
            { key: 'WORKER', label_mr: '👷 कार्यकर्ते', label_en: 'Workers' },
            { key: 'OFFICER', label_mr: '👔 अधिकारी', label_en: 'Officers' },
          ].map((pill) => {
            const isActive = roleFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setRoleFilter(pill.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '750',
                  border: isActive ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: isActive ? '#eff6ff' : '#ffffff',
                  color: isActive ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isMr ? pill.label_mr : pill.label_en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '12px 16px' }}>{isMr ? 'वापरकर्त्याचे नाव' : 'User Name'}</th>
              <th style={{ padding: '12px 14px' }}>{isMr ? 'संपर्क माहिती' : 'Contact'}</th>
              <th style={{ padding: '12px 14px' }}>{isMr ? 'भूमिका (Role)' : 'Role'}</th>
              <th style={{ padding: '12px 14px' }}>{isMr ? 'खाते स्थिती' : 'Account Status'}</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isMr ? '🤖 AI Chatbot परवानगी' : 'AI Chatbot Permission'}</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>{isMr ? 'थेट ॲक्सेस बदला' : 'Action Toggle'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#1e3a8a', fontWeight: '750' }}>
                  ⏳ {isMr ? 'डेटाबेसमधून वापरकर्ते लोड होत आहेत...' : 'Loading users list from database...'}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  {isMr ? 'कोणतेही वापरकर्ते आढळले नाहीत.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isToggling = togglingUserId === u.id;
                const hasAi = Boolean(u.can_use_ai);
                const roleNames = u.roles?.map((r) => r.name).join(', ') || 'WORKER';
                const isAdmin = roleNames.includes('ADMIN');

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Name + Avatar */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            background: hasAi ? '#eff6ff' : '#f1f5f9',
                            color: hasAi ? '#1d4ed8' : '#64748b',
                            border: `1.5px solid ${hasAi ? '#bfdbfe' : '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '13px',
                          }}
                        >
                          {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px' }}>
                            {u.full_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {isMr ? 'वापरकर्ता आयडी' : 'User ID'}: #{u.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>
                        📞 {u.phone || '—'}
                      </div>
                      {u.email && (
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          ✉️ {u.email}
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          background: isAdmin ? '#fef3c7' : roleNames.includes('OFFICER') ? '#faf5ff' : '#eff6ff',
                          color: isAdmin ? '#b45309' : roleNames.includes('OFFICER') ? '#7c3aed' : '#1d4ed8',
                          border: `1px solid ${isAdmin ? '#fde68a' : roleNames.includes('OFFICER') ? '#ddd6fe' : '#bfdbfe'}`,
                        }}
                      >
                        {isAdmin ? '👑 ADMIN' : roleNames.includes('OFFICER') ? '👔 OFFICER' : '👷 WORKER'}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '750',
                          background: u.status === 'ACTIVE' || u.status === 'active' ? '#dcfce7' : '#f1f5f9',
                          color: u.status === 'ACTIVE' || u.status === 'active' ? '#15803d' : '#64748b',
                          border: `1px solid ${u.status === 'ACTIVE' || u.status === 'active' ? '#86efac' : '#cbd5e1'}`,
                        }}
                      >
                        {u.status === 'ACTIVE' || u.status === 'active' ? '🟢 सक्रिय (Active)' : '⚪ ऑफलाइन'}
                      </span>
                    </td>

                    {/* AI Chatbot Status Badge */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {hasAi ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1.5px solid #86efac',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '11.5px',
                            boxShadow: '0 1px 3px rgba(22, 163, 74, 0.15)',
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>🤖</span>
                          <span>{isMr ? 'परवानगी सुरू' : 'AI Allowed'}</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #cbd5e1',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontWeight: '750',
                            fontSize: '11.5px',
                          }}
                        >
                          <span style={{ fontSize: '12px' }}>🔒</span>
                          <span>{isMr ? 'परवानगी बंद' : 'No AI Access'}</span>
                        </span>
                      )}
                    </td>

                    {/* Action Toggle Button */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAi(u)}
                        disabled={isToggling}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: isToggling ? 'not-allowed' : 'pointer',
                          fontWeight: '800',
                          fontSize: '12px',
                          background: hasAi
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          boxShadow: hasAi
                            ? '0 2px 6px rgba(220, 38, 38, 0.25)'
                            : '0 2px 6px rgba(16, 185, 129, 0.25)',
                          transition: 'all 0.15s ease',
                          opacity: isToggling ? 0.6 : 1,
                        }}
                        title={hasAi ? (isMr ? 'AI Chatbot ॲक्सेस बंद करा' : 'Revoke AI Access') : (isMr ? 'AI Chatbot ॲक्सेस सुरू करा' : 'Grant AI Access')}
                      >
                        {isToggling ? (
                          <span>⏳ ...</span>
                        ) : hasAi ? (
                          <>
                            <span>🔒</span>
                            <span>{isMr ? 'ॲक्सेस बंद करा' : 'Revoke AI'}</span>
                          </>
                        ) : (
                          <>
                            <span>🤖</span>
                            <span>{isMr ? 'AI ॲक्सेस द्या' : 'Grant AI'}</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

