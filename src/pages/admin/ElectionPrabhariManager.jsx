import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';

// Tab configuration starting from Booth hierarchy as requested
const HIERARCHY_TABS = [
  { id: 'booth_karyakarta', label_mr: '१. बूथ कार्यकर्ता', label_en: '1. Booth Karyakarta', icon: '👤', color: '#2563eb' },
  { id: 'booth_pramukh', label_mr: '२. बूथ प्रमुख', label_en: '2. Booth Pramukh', icon: '🎖️', color: '#16a34a' },
  { id: 'booth_area_pramukh', label_mr: '३. बूथ एरिया प्रमुख', label_en: '3. Booth Area Pramukh', icon: '📍', color: '#d97706' },
  { id: 'taluka_pramukh', label_mr: '४. तालुका प्रमुख', label_en: '4. Taluka Pramukh', icon: '🏛️', color: '#9333ea' },
  { id: 'jilha_pramukh', label_mr: '५. जिल्हा प्रमुख', label_en: '5. Jilha Pramukh', icon: '👑', color: '#dc2626' },
  { id: 'vibhag_pramukh', label_mr: '६. विभाग प्रमुख', label_en: '6. Vibhag Pramukh', icon: '⭐', color: '#0891b2' },
  { id: 'add_more', label_mr: '➕ अजून जोडा (निवडणुका)', label_en: '+ Add More (Elections)', icon: '🗳️', color: '#4f46e5' },
];

export default function ElectionPrabhariManager({ isMr = true, lang = 'mr' }) {
  const [activeTab, setActiveTab] = useState('booth_karyakarta');
  const [prabharis, setPrabharis] = useState([]);
  const [elections, setElections] = useState([]);
  const [boothsList, setBoothsList] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElection, setSelectedElection] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedTaluka, setSelectedTaluka] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp_number: '',
    role_type: 'booth_karyakarta',
    election_id: 1,
    election_name: '२८२ - सांगली विधानसभा निवडणूक २०२६',
    district: 'सांगली',
    taluka: 'मिरज',
    village: '',
    booth_no: '१',
    booth_name: '',
    area_name: '',
    assigned_voters_target: 500,
    status: 'active',
    responsibilities: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1. Fetch Prabharis from DB
  const fetchPrabharis = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== 'add_more' && activeTab !== 'all') {
        params.role_type = activeTab;
      }
      if (selectedElection !== 'all') params.election_id = selectedElection;
      if (selectedDistrict !== 'all') params.district = selectedDistrict;
      if (selectedTaluka !== 'all') params.taluka = selectedTaluka;
      if (searchQuery) params.search = searchQuery;

      const res = await apiClient.get('/election-prabharis', { params });
      if (res.data?.success) {
        setPrabharis(res.data.data || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to load election prabharis:', err);
      showToast(isMr ? 'डेटा लोड करताना एरर आली.' : 'Failed to load prabharis.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Elections List from DB
  const fetchElections = async () => {
    try {
      const res = await apiClient.get('/elections-list');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setElections(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load elections:', err);
    }
  };

  // 3. Fetch Polling Booths from DB
  const fetchBooths = async () => {
    try {
      const res = await apiClient.get('/booths');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBoothsList(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load booths:', err);
    }
  };

  useEffect(() => {
    fetchElections();
    fetchBooths();
  }, []);

  useEffect(() => {
    fetchPrabharis();
  }, [activeTab, selectedElection, selectedDistrict, selectedTaluka]);

  // Handle Form Submission (Create / Update)
  const handleSavePrabhari = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast(isMr ? 'कृपया नाव आणि फोन नंबर टाका.' : 'Please enter name and phone.');
      return;
    }

    try {
      if (editItem) {
        await apiClient.put(`/election-prabharis/${editItem.id}`, formData);
        showToast(isMr ? 'प्रभारी माहिती अद्ययावत केली!' : 'Prabhari updated successfully!');
      } else {
        await apiClient.post('/election-prabharis', formData);
        showToast(isMr ? 'नवीन प्रभारी यशस्वीरीत्या नियुक्त केले!' : 'New Prabhari appointed!');
      }
      setShowAddModal(false);
      setEditItem(null);
      fetchPrabharis();
    } catch (err) {
      console.error('Save failed:', err);
      showToast(isMr ? 'जतन करताना त्रुटी आली.' : 'Failed to save Prabhari.');
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(isMr ? `'${name}' यांची नोंद काढून टाकायची आहे का?` : `Delete record for '${name}'?`)) return;
    try {
      await apiClient.delete(`/election-prabharis/${id}`);
      showToast(isMr ? 'प्रभारी नोंद काढून टाकली.' : 'Prabhari record removed.');
      fetchPrabharis();
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(isMr ? 'काढून टाकताना एरर आली.' : 'Failed to delete.');
    }
  };

  // Open Edit Modal
  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      phone: item.phone,
      whatsapp_number: item.whatsapp_number || item.phone,
      role_type: item.role_type,
      election_id: item.election_id || 1,
      election_name: item.election_name || '२८२ - सांगली विधानसभा निवडणूक २०२६',
      district: item.district || 'सांगली',
      taluka: item.taluka || '',
      village: item.village || '',
      booth_no: item.booth_no || '१',
      booth_name: item.booth_name || '',
      area_name: item.area_name || '',
      assigned_voters_target: item.assigned_voters_target || 500,
      status: item.status || 'active',
      responsibilities: item.responsibilities || '',
    });
    setShowAddModal(true);
  };

  // Open New Modal
  const handleOpenNewModal = (presetRole = null, presetElection = null) => {
    setEditItem(null);
    setFormData({
      name: '',
      phone: '',
      whatsapp_number: '',
      role_type: presetRole || (activeTab === 'add_more' ? 'booth_karyakarta' : activeTab),
      election_id: presetElection?.id || (elections[0]?.id || 1),
      election_name: presetElection?.name || (elections[0]?.name || '२८२ - सांगली विधानसभा निवडणूक २०२६'),
      district: 'सांगली',
      taluka: 'मिरज',
      village: 'माधवनगर',
      booth_no: '१',
      booth_name: boothsList[0]?.booth_name_mr || 'जिल्हा परिषद प्राथमिक शाळा, खोली क्र. १',
      area_name: '',
      assigned_voters_target: 500,
      status: 'active',
      responsibilities: '',
    });
    setShowAddModal(true);
  };

  // Filtered List for Display
  const displayedPrabharis = useMemo(() => {
    let list = prabharis;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.village?.toLowerCase().includes(q) ||
          p.area_name?.toLowerCase().includes(q) ||
          p.booth_no?.includes(q)
      );
    }
    return list;
  }, [prabharis, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '700',
            fontSize: '13.5px',
            border: '1px solid #3b82f6',
          }}
        >
          <span>ℹ️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            🏛️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#fbbf24', color: '#78350f', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                {isMr ? 'संघटनात्मक रचना' : 'Hierarchy Structure'}
              </span>
              <span style={{ fontSize: '11px', color: '#bfdbfe', fontWeight: '600' }}>
                {isMr ? 'डेटाबेस लाइव्ह कनेक्ट' : 'Live DB Sync'}
              </span>
            </div>
            <h1 style={{ margin: '4px 0 2px 0', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.3px' }}>
              {isMr ? 'निवडणूक प्रभारी व्यवस्थापन (Election Prabhari)' : 'Election Prabhari Management'}
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#dbeafe', maxWidth: '650px' }}>
              {isMr
                ? 'बूथ कार्यकर्ता, बूथ प्रमुख, एरिया प्रमुख, तालुका, जिल्हा व विभाग प्रमुखांची रचना आणि जबाबदारी व्यवस्थापन.'
                : 'Booth to Division hierarchy management, appointment, booth assignments, and ground coverage tracking.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenNewModal()}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '11px 20px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>➕</span>
            <span>{isMr ? 'नवीन प्रभारी नियुक्त करा' : 'Appoint New Prabhari'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'एकूण नियुक्त प्रभारी' : 'Total Prabharis'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{counts.total || prabharis.length}</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>✓ {counts.active || 0} {isMr ? 'सक्रिय कार्यकर्ते' : 'Active'}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'बूथ कार्यकर्ते' : 'Booth Workers'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>{counts.booth_karyakarta || 0}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'घरोघरी मतदार संपर्क' : 'Voter Outreach'}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'बूथ प्रमुख' : 'Booth Heads'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{counts.booth_pramukh || 0}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'मतदान केंद्र प्रमुख' : 'Polling Station Leads'}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'एरिया व तालुका प्रमुख' : 'Area & Taluka Leads'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#9333ea', marginTop: '4px' }}>{(counts.booth_area_pramukh || 0) + (counts.taluka_pramukh || 0)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'झोनल व तालुका समन्वय' : 'Zonal & Taluka Coord'}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'जिल्हा व विभाग प्रमुख' : 'District & Division Leads'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>{(counts.jilha_pramukh || 0) + (counts.vibhag_pramukh || 0)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'उच्चस्तरीय धोरणात्मक नेतृत्व' : 'High Command'}</div>
        </div>
      </div>

      {/* Hierarchy Level Tabs (Starting from Booth as requested) */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {HIERARCHY_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: isSelected ? `2px solid ${tab.color}` : '1.5px solid transparent',
                  background: isSelected ? `${tab.color}15` : '#f8fafc',
                  color: isSelected ? tab.color : '#475569',
                  fontSize: '13.5px',
                  fontWeight: isSelected ? '800' : '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.icon}</span>
                <span>{isMr ? tab.label_mr : tab.label_en}</span>
                {tab.id !== 'add_more' && counts[tab.id] !== undefined && (
                  <span
                    style={{
                      background: isSelected ? tab.color : '#cbd5e1',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontSize: '11px',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontWeight: '800',
                    }}
                  >
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 7: "Add More" - Shows All Elections from Database */}
      {activeTab === 'add_more' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  🗳️ {isMr ? 'डेटाबेसमधील सर्व निवडणुका (Elections in Database)' : 'All Elections in Database'}
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {isMr
                    ? 'येथून तुम्ही विशिष्ट निवडणुकीसाठी नवीन प्रभारी स्तर किंवा थेट प्रभारी नेमू शकता.'
                    : 'Select an election to appoint dedicated election prabharis or manage custom campaign levels.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenNewModal()}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>➕</span>
                <span>{isMr ? 'या निवडणुकीसाठी प्रभारी जोडा' : 'Add Prabhari for Election'}</span>
              </button>
            </div>

            {/* Elections Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {elections.map((ele) => (
                <div
                  key={ele.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '18px',
                    border: '1.5px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: ele.status === 'ACTIVE' || ele.status === 'LIVE' ? '#dcfce7' : '#f1f5f9',
                          color: ele.status === 'ACTIVE' || ele.status === 'LIVE' ? '#166534' : '#475569',
                        }}
                      >
                        ● {ele.status || 'ACTIVE'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        ID: #{ele.id}
                      </span>
                    </div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                      {ele.name}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px' }}>
                      प्रकार: <span style={{ fontWeight: '700', color: '#334155' }}>{ele.type || 'विधानसभा'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#2563eb' }}>
                      👥 {ele.prabhari_count || 0} {isMr ? 'प्रभारी नियुक्त' : 'Prabharis Appointed'}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenNewModal(null, ele)}
                      style={{
                        background: '#1e40af',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      + {isMr ? 'प्रभारी जोडा' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 1 TO 6: Hierarchy Members List & Management */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* Search Box */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <input
                type="text"
                placeholder={isMr ? 'नाव, फोन, बूथ क्र. किंवा परिसराने शोधा...' : 'Search by name, phone, booth or area...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }}>🔍</span>
            </div>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                background: '#ffffff',
                fontWeight: '600',
              }}
            >
              <option value="all">{isMr ? 'सर्व जिल्हे (All Districts)' : 'All Districts'}</option>
              <option value="सांगली">सांगली (Sangli)</option>
              <option value="कोल्हापूर">कोल्हापूर (Kolhapur)</option>
              <option value="सातारा">सातारा (Satara)</option>
              <option value="पुणे">पुणे (Pune)</option>
            </select>

            {/* Taluka Filter */}
            <select
              value={selectedTaluka}
              onChange={(e) => setSelectedTaluka(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                background: '#ffffff',
                fontWeight: '600',
              }}
            >
              <option value="all">{isMr ? 'सर्व तालुके (All Talukas)' : 'All Talukas'}</option>
              <option value="मिरज">मिरज</option>
              <option value="सांगली शहर">सांगली शहर</option>
              <option value="कुपवाड">कुपवाड</option>
              <option value="तासगाव">तासगाव</option>
              <option value="कवठे महांकाळ">कवठे महांकाळ</option>
              <option value="वाळवा">वाळवा / इस्लामपूर</option>
            </select>

            {/* Total Results */}
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginLeft: 'auto' }}>
              {isMr ? 'एकूण निकाल:' : 'Total Results:'} <span style={{ color: '#0f172a' }}>{displayedPrabharis.length}</span>
            </div>
          </div>

          {/* Members Table */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'प्रभारी नाव व पद' : 'Name & Role'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'जिल्हा / तालुका' : 'District / Taluka'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'नियुक्त बूथ / कार्यक्षेत्र' : 'Assigned Booth / Area'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'संपर्क (कॉल / व्हॉट्सॲप)' : 'Contact'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'लक्षित मतदार' : 'Voters Target'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'स्थिती' : 'Status'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        ⏳ {isMr ? 'डेटाबेसवरून माहिती लोड होत आहे...' : 'Loading prabharis from database...'}
                      </td>
                    </tr>
                  ) : displayedPrabharis.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        ℹ️ {isMr ? 'या स्तरावर अद्याप कोणतेही प्रभारी नियुक्त केलेले नाहीत.' : 'No prabharis found for this hierarchy level.'}
                      </td>
                    </tr>
                  ) : (
                    displayedPrabharis.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
                      >
                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: '700' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{item.name}</div>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '2px',
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontWeight: '700',
                            }}
                          >
                            {item.role_title_mr || item.role_title_en}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '700', color: '#334155' }}>📍 {item.district}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.taluka || '—'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {item.booth_no && item.booth_no !== 'सर्व' ? (
                            <div style={{ display: 'inline-block', background: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '11.5px' }}>
                              🗳️ बूथ क्र. {item.booth_no}
                            </div>
                          ) : (
                            <div style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '11.5px' }}>
                              🏛️ संपूर्ण क्षेत्र
                            </div>
                          )}
                          <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600', marginTop: '3px', maxWidth: '240px' }}>
                            {item.booth_name || item.area_name || item.village || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <a
                              href={`tel:${item.phone}`}
                              style={{
                                background: '#f1f5f9',
                                color: '#0f172a',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              📞 {item.phone}
                            </a>
                            {item.whatsapp_number && (
                              <a
                                href={`https://wa.me/91${item.whatsapp_number.replace(/[^\d]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontWeight: '800',
                                  fontSize: '12px',
                                }}
                                title="WhatsApp"
                              >
                                💬
                              </a>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{item.assigned_voters_target || 500} मतदार</div>
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                            {item.covered_voters || 0} संपर्कित ({Math.round(((item.covered_voters || 0) / (item.assigned_voters_target || 500)) * 100)}%)
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: item.status === 'active' ? '#dcfce7' : item.status === 'training' ? '#fef3c7' : '#fee2e2',
                              color: item.status === 'active' ? '#166534' : item.status === 'training' ? '#92400e' : '#991b1b',
                            }}
                          >
                            ● {item.status === 'active' ? (isMr ? 'सक्रिय' : 'Active') : item.status === 'training' ? (isMr ? 'प्रशिक्षणार्थी' : 'Training') : (isMr ? 'रजेवर' : 'Inactive')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                padding: '5px 9px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '700',
                              }}
                              title={isMr ? 'माहिती बदला' : 'Edit'}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.name)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                padding: '5px 9px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '700',
                              }}
                              title={isMr ? 'काढून टाका' : 'Delete'}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Appoint / Edit Prabhari */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '24px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {editItem ? (isMr ? '✏️ प्रभारी माहिती अद्ययावत करा' : 'Edit Prabhari Details') : (isMr ? '➕ नवीन प्रभारी नियुक्ती नोंद' : 'Appoint New Prabhari')}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'सर्व माहिती डेटाबेसमध्ये सुरक्षित सेव्ह होईल' : 'Directly saved into the database'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePrabhari} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Role Type & Election */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'प्रभारी पद स्तर (Hierarchy Role)' : 'Hierarchy Role'} *
                  </label>
                  <select
                    value={formData.role_type}
                    onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                    required
                  >
                    <option value="booth_karyakarta">१. बूथ कार्यकर्ता (Booth Karyakarta)</option>
                    <option value="booth_pramukh">२. बूथ प्रमुख (Booth Pramukh)</option>
                    <option value="booth_area_pramukh">३. बूथ एरिया प्रमुख (Booth Area Pramukh)</option>
                    <option value="taluka_pramukh">४. तालुका प्रमुख (Taluka Pramukh)</option>
                    <option value="jilha_pramukh">५. जिल्हा प्रमुख (Jilha Pramukh)</option>
                    <option value="vibhag_pramukh">६. विभाग प्रमुख (Vibhag Pramukh)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'निवडणूक (Election)' : 'Election'} *
                  </label>
                  <select
                    value={formData.election_id}
                    onChange={(e) => {
                      const sel = elections.find((x) => x.id === Number(e.target.value));
                      setFormData({ ...formData, election_id: e.target.value, election_name: sel?.name || formData.election_name });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                    required
                  >
                    {elections.map((el) => (
                      <option key={el.id} value={el.id}>{el.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'प्रभारीचे पूर्ण नाव' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isMr ? 'उदा. सचिन दत्तात्रय पाटील' : 'e.g. Sachin Patil'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'मोबाईल नंबर' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9822000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp_number: formData.whatsapp_number || e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Row 3: District, Taluka, Village */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'जिल्हा' : 'District'} *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'तालुका' : 'Taluka'}
                  </label>
                  <input
                    type="text"
                    placeholder="मिरज / सांगली"
                    value={formData.taluka}
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'गाव / प्रभाग' : 'Village / Ward'}
                  </label>
                  <input
                    type="text"
                    placeholder="माधवनगर / प्रभाग ४"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Row 4: Official Booth Selection (Loaded from DB) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'बूथ क्रमांक' : 'Booth No.'}
                  </label>
                  <select
                    value={formData.booth_no}
                    onChange={(e) => {
                      const matched = boothsList.find((b) => b.booth_no?.includes(e.target.value));
                      setFormData({
                        ...formData,
                        booth_no: e.target.value,
                        booth_name: matched?.booth_name_mr || formData.booth_name,
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="सर्व">{isMr ? 'सर्व बूथ (All Booths)' : 'All Booths'}</option>
                    {boothsList.map((b) => {
                      const num = b.booth_no?.replace(/[^\d]/g, '') || b.id;
                      return (
                        <option key={b.id} value={num}>
                          बूथ क्र. {num} ({b.village_mr || b.taluka_mr})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'मतदान केंद्र नाव / परिसर' : 'Polling Station / Area'}
                  </label>
                  <input
                    type="text"
                    placeholder={isMr ? 'उदा. जिल्हा परिषद प्राथमिक शाळा' : 'e.g. ZP Primary School'}
                    value={formData.booth_name}
                    onChange={(e) => setFormData({ ...formData, booth_name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Row 5: Target Voters & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'लक्षित मतदार संख्या' : 'Target Voters Target'}
                  </label>
                  <input
                    type="number"
                    value={formData.assigned_voters_target}
                    onChange={(e) => setFormData({ ...formData, assigned_voters_target: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                    {isMr ? 'कार्य स्थिती' : 'Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="active">{isMr ? 'सक्रिय (Active)' : 'Active'}</option>
                    <option value="training">{isMr ? 'प्रशिक्षणार्थी (Training)' : 'Training'}</option>
                    <option value="inactive">{isMr ? 'रजेवर / निष्क्रिय (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Responsibilities */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px', color: '#334155' }}>
                  {isMr ? 'विशेष जबाबदारी व कार्यसूचना (Responsibilities)' : 'Responsibilities'}
                </label>
                <textarea
                  rows="3"
                  placeholder={isMr ? 'उदा. घरोघरी मतदार स्लिप वाटप, व्हीलचेअर व्यवस्था व संपर्क...' : 'Enter specific responsibilities...'}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  ✓ {editItem ? (isMr ? 'अद्ययावत करा' : 'Update') : (isMr ? 'जतन करा (Save to DB)' : 'Save to DB')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
