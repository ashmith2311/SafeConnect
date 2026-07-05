import React, { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { ShieldAlert, AlertTriangle, X, CheckCircle, Send, PhoneCall, Mail, AlertOctagon } from 'lucide-react';

export const SOSButton: React.FC = () => {
  const {
    activeSos,
    triggerSos,
    cancelSos,
    contactLogs,
    contacts,
    userLocation,
    setUserLocation
  } = useEmergency();

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownInterval = useRef<any>(null);

  // Handle countdown
  useEffect(() => {
    if (isCountingDown) {
      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current!);
            countdownInterval.current = null;
            setIsCountingDown(false);
            triggerSos();
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      setCountdown(3);
    }

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [isCountingDown]);

  const handleStartSos = () => {
    setIsCountingDown(true);
    setCountdown(3);
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
  };

  // Mock location preset options
  const locationPresets = [
    { x: 520, y: 220, address: '520 Main Street, Sector 3 (Downtown)' },
    { x: 180, y: 350, address: '22 Elm Street, Sector 1 (Residential)' },
    { x: 880, y: 150, address: '99 Industrial Park, Sector 2' },
    { x: 480, y: 520, address: 'Marina Pier 4, Sector 4 (Waterfront)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
      {/* Active emergency alert status bar */}
      {activeSos && (
        <div className="glass-panel disaster-flash" style={{ padding: '15px', borderLeft: '4px solid var(--color-emergency)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AlertOctagon className="pulse-sos-btn" style={{ color: 'var(--color-emergency)', flexShrink: 0 }} size={32} />
          <div>
            <h4 style={{ color: 'var(--color-emergency)', fontWeight: 'bold' }}>CRITICAL: EMERGENCY RESPONSE IN PROGRESS</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              Authorities have been dispatched to: <span style={{ textDecoration: 'underline' }}>{activeSos.location.address}</span>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
        
        {/* Main SOS Trigger Hub */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Scanline background for cyber secure theme */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(to bottom, transparent, rgba(255, 71, 87, 0.03) 50%, transparent)',
            animation: 'scanline 6s linear infinite',
            pointerEvents: 'none'
          }} />

          {!activeSos && !isCountingDown && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div 
                  className="flex-center pulse-sos-btn" 
                  onClick={handleStartSos}
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #ff4757 0%, #b32d3a 100%)',
                    cursor: 'pointer',
                    boxShadow: '0 0 40px rgba(255, 71, 87, 0.6), inset 0 0 20px rgba(255,255,255,0.2)',
                    border: '8px solid rgba(255, 71, 87, 0.3)',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>SOS</span>
                </div>
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>One-Tap Emergency Broadcast</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem', marginBottom: '20px' }}>
                Pressing this button will instantly share your GPS coordinates and notify your emergency contacts via SMS and Email.
              </p>
            </>
          )}

          {/* Countdown State */}
          {!activeSos && isCountingDown && (
            <div style={{ padding: '20px 0', width: '100%' }}>
              <div style={{ marginBottom: '25px', position: 'relative' }} className="radar-glow">
                <div 
                  className="flex-center"
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: '#2f3542',
                    margin: '0 auto',
                    border: '5px solid var(--color-warning)',
                    boxShadow: '0 0 30px var(--color-warning-glow)'
                  }}
                >
                  <span style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--color-warning)' }}>{countdown}</span>
                </div>
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-warning)', marginBottom: '10px' }}>Broadcasting in {countdown}...</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '25px' }}>
                Preparing SMS alerts to trusted contacts and pinging nearest dispatch station.
              </p>
              <button 
                onClick={handleCancelCountdown} 
                className="btn-secondary"
                style={{
                  padding: '12px 30px',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600
                }}
              >
                <X size={18} /> Cancel Alert
              </button>
            </div>
          )}

          {/* SOS Activated State */}
          {activeSos && (
            <div style={{ padding: '15px 0', width: '100%' }}>
              <div style={{ marginBottom: '20px' }}>
                <div 
                  className="flex-center"
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: '#1a0e10',
                    border: '8px solid var(--color-emergency)',
                    margin: '0 auto',
                    boxShadow: '0 0 35px var(--color-emergency-glow)',
                    position: 'relative'
                  }}
                >
                  <ShieldAlert className="pulse-sos-btn" size={72} style={{ color: 'var(--color-emergency)' }} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--color-emergency)', marginBottom: '4px' }}>SOS SIGNAL ACTIVE</h2>
              <span className="badge badge-emergency" style={{ marginBottom: '20px' }}>
                Status: {activeSos.status.toUpperCase()}
              </span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 25px auto' }}>
                Your live position is being monitored by authorities. Do not close this app until help arrives.
              </p>
              
              <button 
                onClick={cancelSos} 
                className="btn-primary"
                style={{
                  padding: '12px 30px',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, #2ed573, #26af5c)',
                  boxShadow: '0 4px 15px rgba(46, 213, 115, 0.4)'
                }}
              >
                <CheckCircle size={18} /> I am Safe Now (Cancel)
              </button>
            </div>
          )}
        </div>

        {/* Live Location and Emergency Contacts Notification Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Mock Location Selector for Citizen */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-info)' }} /> Simulated Location GPS
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You can simulatedly move your position to test how dispatcher radar tracking responds.
              </p>
              
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CURRENT ADDRESS</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>{userLocation.address}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Coordinates: X: {userLocation.x.toFixed(0)}, Y: {userLocation.y.toFixed(0)}
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>JUMP TO SECTOR</label>
                <select 
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                  value={userLocation.address}
                  onChange={(e) => {
                    const preset = locationPresets.find(p => p.address === e.target.value);
                    if (preset) {
                      setUserLocation(preset);
                    }
                  }}
                >
                  {locationPresets.map((preset) => (
                    <option key={preset.address} value={preset.address}>{preset.address.split(',')[0]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Notification Logger */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} style={{ color: 'var(--color-success)' }} /> Notification Broadcasts
            </h3>

            {contacts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No emergency contacts configured. Go to the Settings tab to add contacts.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Active notifications to emergency contacts:
                </p>

                <div className="toast-log-container">
                  {contactLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Trigger SOS to broadcast alerts to contacts.
                    </div>
                  ) : (
                    contactLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className={`toast-log-item ${log.status === 'sent' ? 'sent' : log.status === 'failed' ? 'failed' : ''}`}
                      >
                        <div>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {log.channel === 'SMS' ? <PhoneCall size={10} /> : <Mail size={10} />}
                            {log.contactName} ({log.channel})
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {log.message}
                          </div>
                        </div>
                        <div>
                          <span className={`badge ${
                            log.status === 'sent' 
                              ? 'badge-success' 
                              : log.status === 'failed' 
                              ? 'badge-emergency' 
                              : 'badge-warning'
                          }`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
