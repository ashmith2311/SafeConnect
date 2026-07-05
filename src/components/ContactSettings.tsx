import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Plus, Trash2, Users, Smartphone, Mail, Settings, RefreshCw } from 'lucide-react';

export const ContactSettings: React.FC = () => {
  const {
    contacts,
    addContact,
    deleteContact,
    contactLogs,
    clearContactLogs
  } = useEmergency();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Family');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    addContact({
      name,
      relation,
      phone,
      email
    });

    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
      
      {/* 1. Contact Management Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} style={{ color: 'var(--color-accent)' }} />
          Configure Emergency Contacts
        </h3>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Add trusted family members, spouses, or close friends. When you activate the SOS, these contacts will receive SMS and Email alerts with your live coordinates.
        </p>

        {/* List of Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE CONTACT LIST</label>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No emergency contacts added yet.
            </div>
          ) : (
            contacts.map((contact) => (
              <div 
                key={contact.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{contact.name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      {contact.relation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Smartphone size={10} /> {contact.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Mail size={10} /> {contact.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteContact(contact.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-emergency)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '4px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ADD NEW CONTACT</label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Contact Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            />
            <select 
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            >
              <option value="Family">Family</option>
              <option value="Spouse">Spouse</option>
              <option value="Friend">Friend</option>
              <option value="Work">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input 
              type="tel" 
              placeholder="Mobile Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-accent"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Contact
          </button>
        </form>

      </div>

      {/* 2. Notification Logs Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} style={{ color: 'var(--color-info)' }} />
            Notification Server Logs
          </h3>
          {contactLogs.length > 0 && (
            <button 
              onClick={clearContactLogs}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={12} /> Clear Logs
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          View simulated SMS gateway logs and SMTP mail transmission receipts fired when SOS triggers.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px' }}>
          {contactLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No notification transactions logged.
            </div>
          ) : (
            contactLogs.map((log) => (
              <div 
                key={log.id} 
                style={{
                  padding: '10px 12px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${
                    log.status === 'sent' 
                      ? 'var(--color-success)' 
                      : log.status === 'failed' 
                      ? 'var(--color-emergency)' 
                      : 'var(--color-warning)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {log.channel === 'SMS' ? <Smartphone size={10} /> : <Mail size={10} />}
                    {log.contactName} ({log.channel})
                  </span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    {log.timestamp}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: '4px 0' }}>
                  {log.message}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <span className={`badge ${
                    log.status === 'sent' 
                      ? 'badge-success' 
                      : log.status === 'failed' 
                      ? 'badge-emergency' 
                      : 'badge-warning'
                  }`} style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                    {log.status === 'sending' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <RefreshCw size={8} style={{ animation: 'pulse-radar 1.5s infinite linear' }} /> sending
                      </span>
                    ) : log.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
