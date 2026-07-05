import React, { useState } from 'react';
import { useEmergency, type DisasterAlert } from '../context/EmergencyContext';
import { Megaphone, AlertOctagon, AlertTriangle, ShieldAlert, Trash2 } from 'lucide-react';

export const DisasterBroadcast: React.FC = () => {
  const { disasterAlerts, broadcastDisaster, dismissDisaster } = useEmergency();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'warning'>('warning');
  const [type, setType] = useState<DisasterAlert['type']>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    broadcastDisaster(title, message, severity, type);
    
    // Reset form
    setTitle('');
    setMessage('');
  };

  const getAlertIcon = (t: DisasterAlert['type'], size = 16) => {
    switch (t) {
      case 'flood':
      case 'storm':
        return <AlertTriangle size={size} style={{ color: 'var(--color-warning)' }} />;
      case 'earthquake':
        return <AlertOctagon size={size} style={{ color: 'var(--color-emergency)' }} />;
      default:
        return <ShieldAlert size={size} style={{ color: 'var(--color-info)' }} />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
      
      {/* 1. Broadcast Creation Form */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Megaphone size={20} style={{ color: 'var(--color-emergency)' }} />
          Civil Disaster Warning System
        </h3>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          Broadcast high-priority disaster warnings directly to the screens of all active citizen users. Use carefully.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Alert Type */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>HAZARD TYPE</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="general">General Hazard</option>
              <option value="flood">Flood Warning</option>
              <option value="earthquake">Earthquake Alert</option>
              <option value="storm">Severe Storm Warning</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>SEVERITY LEVEL</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: severity === 'warning' ? 'rgba(255, 165, 2, 0.1)' : 'transparent' }}>
                <input type="radio" checked={severity === 'warning'} onChange={() => setSeverity('warning')} style={{ accentColor: 'var(--color-warning)' }} />
                <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} /> Warning
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: severity === 'critical' ? 'rgba(255, 71, 87, 0.1)' : 'transparent' }}>
                <input type="radio" checked={severity === 'critical'} onChange={() => setSeverity('critical')} style={{ accentColor: 'var(--color-emergency)' }} />
                <AlertOctagon size={14} style={{ color: 'var(--color-emergency)' }} /> Critical Alert
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>BROADCAST TITLE</label>
            <input 
              type="text" 
              placeholder="e.g. Flash Flood Evacuation Order"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ALERT INSTRUCTIONS & DETAILS</label>
            <textarea 
              placeholder="Provide clear guidelines (e.g. stay indoors, move to higher ground, avoid downtown bridges)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.8rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            style={{
              padding: '10px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '5px'
            }}
          >
            <Megaphone size={16} /> Broadcast System Warning
          </button>
        </form>
      </div>

      {/* 2. Active Broadcast History List */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Megaphone size={20} style={{ color: 'var(--color-info)' }} />
          Active Broadcaster Feed
        </h3>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          View alerts currently broadcasting across the citizen terminal. You can deactivate warning states below.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px' }}>
          {disasterAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No active weather/disaster alerts.
            </div>
          ) : (
            disasterAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={alert.active && alert.severity === 'critical' ? 'disaster-flash' : ''}
                style={{
                  padding: '12px',
                  background: alert.active 
                    ? alert.severity === 'critical' 
                      ? 'rgba(255, 71, 87, 0.04)' 
                      : 'rgba(255, 165, 2, 0.04)'
                    : 'rgba(255,255,255,0.01)',
                  border: '1px solid',
                  borderColor: alert.active 
                    ? alert.severity === 'critical' 
                      ? 'var(--color-emergency)' 
                      : 'var(--color-warning)'
                    : 'var(--border-color)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '3px' }}>
                    {getAlertIcon(alert.type, 20)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'white' }}>{alert.title}</strong>
                      <span className={`badge ${
                        alert.severity === 'critical' ? 'badge-emergency' : 'badge-warning'
                      }`} style={{ fontSize: '0.5rem', padding: '1px 4px' }}>
                        {alert.severity}
                      </span>
                      {!alert.active && (
                        <span className="badge badge-success" style={{ fontSize: '0.5rem', padding: '1px 4px' }}>DEACTIVATED</span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {alert.message}
                    </p>

                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                      Fired: {new Date(alert.timestamp).toLocaleTimeString()} • ID: {alert.id}
                    </span>
                  </div>
                </div>

                {alert.active && (
                  <button
                    onClick={() => dismissDisaster(alert.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-emergency)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
