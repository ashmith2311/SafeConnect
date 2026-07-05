import React from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { SOSButton } from './components/SOSButton';
import { MapComponent } from './components/MapComponent';
import { AIChatbot } from './components/AIChatbot';
import { IncidentForm } from './components/IncidentForm';
import { ContactSettings } from './components/ContactSettings';
import { DashboardQueue } from './components/DashboardQueue';
import { HeatMap } from './components/HeatMap';
import { DisasterBroadcast } from './components/DisasterBroadcast';
import { LoginComponent } from './components/LoginComponent';
import { Shield, Eye, ShieldAlert, AlertOctagon, Settings, MessageSquare, BarChart3, Megaphone, Terminal, AlertCircle, LogOut } from 'lucide-react';
import './App.css';

const MainLayout: React.FC = () => {
  const {
    role,
    setRole,
    activeCitizenTab,
    setActiveCitizenTab,
    disasterAlerts,
    dismissDisaster,
    isAuthenticated,
    currentUser,
    logoutUser
  } = useEmergency();

  // Find active, critical alerts that are undismissed
  const activeCriticalAlerts = disasterAlerts.filter(a => a.active);

  // Authority inner tab navigation
  const [authorityTab, setAuthorityTab] = React.useState<'queue' | 'heatmap' | 'broadcast'>('queue');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Global Navigation Bar */}
      <header className="glass-panel" style={{
        margin: '15px',
        padding: '12px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="flex-center" style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-emergency), #ff6b81)',
            boxShadow: '0 0 15px var(--color-emergency-glow)'
          }}>
            <Shield size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeConnect</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block' }}>Tactical Response Hub</span>
          </div>
        </div>

        {/* Auth status indicator / Logout button */}
        {role === 'citizen' && isAuthenticated && currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{currentUser.email}</span>
            </div>
            <button 
              onClick={logoutUser}
              title="Logout"
              className="flex-center"
              style={{
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid rgba(255, 71, 87, 0.2)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                color: 'var(--color-emergency)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Global Role Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setRole('citizen')}
            style={{
              padding: '8px 18px',
              borderRadius: '25px',
              border: 'none',
              background: role === 'citizen' ? 'linear-gradient(135deg, var(--color-info), #0056b3)' : 'transparent',
              color: role === 'citizen' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s'
            }}
          >
            <Eye size={14} /> CITIZEN HUB
          </button>
          <button
            onClick={() => setRole('authority')}
            style={{
              padding: '8px 18px',
              borderRadius: '25px',
              border: 'none',
              background: role === 'authority' ? 'linear-gradient(135deg, var(--color-emergency), #b32d3a)' : 'transparent',
              color: role === 'authority' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s'
            }}
          >
            <Terminal size={14} /> AUTHORITIES CMD
          </button>
        </div>
      </header>

      {/* 2. Disaster Warning Marquee Overlay (Citizen side only) */}
      {role === 'citizen' && activeCriticalAlerts.length > 0 && (
        <div style={{ padding: '0 15px', marginBottom: '15px' }}>
          {activeCriticalAlerts.map(alert => (
            <div 
              key={alert.id}
              className="glass-panel disaster-flash" 
              style={{
                padding: '12px 20px',
                borderLeft: '5px solid var(--color-emergency)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertOctagon className="pulse-sos-btn" style={{ color: 'var(--color-emergency)', flexShrink: 0 }} size={24} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-emergency)' }}>
                    CIVIL EMERGENCY WARNING: {alert.title.toUpperCase()}
                  </h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    {alert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissDisaster(alert.id)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  color: 'white',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Role Workspace Area */}
      <main style={{ flex: 1, padding: '0 15px 15px 15px', display: 'flex', flexDirection: 'column' }}>
        
        {/* CITIZEN PORTAL */}
        {role === 'citizen' && (
          !isAuthenticated ? (
            <LoginComponent />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 6fr', gap: '20px', flex: 1 }}>
            
            {/* Map occupies the left column */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <MapComponent />
            </div>

            {/* Citizen dashboard control tab group on the right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Tab Selector */}
              <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => setActiveCitizenTab('sos')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeCitizenTab === 'sos' ? 'rgba(255, 71, 87, 0.12)' : 'transparent',
                    color: activeCitizenTab === 'sos' ? 'var(--color-emergency)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <AlertOctagon size={16} /> ONE-TAP SOS
                </button>
                
                <button
                  onClick={() => setActiveCitizenTab('report')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeCitizenTab === 'report' ? 'rgba(255, 165, 2, 0.12)' : 'transparent',
                    color: activeCitizenTab === 'report' ? 'var(--color-warning)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <ShieldAlert size={16} /> REPORT CRIME/INCIDENT
                </button>

                <button
                  onClick={() => setActiveCitizenTab('chat')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeCitizenTab === 'chat' ? 'rgba(30, 144, 255, 0.12)' : 'transparent',
                    color: activeCitizenTab === 'chat' ? 'var(--color-info)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <MessageSquare size={16} /> AI EMERGENCY HELP
                </button>

                <button
                  onClick={() => setActiveCitizenTab('settings')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeCitizenTab === 'settings' ? 'rgba(112, 161, 255, 0.12)' : 'transparent',
                    color: activeCitizenTab === 'settings' ? 'var(--color-accent)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Settings size={16} /> CONTACTS CONFIG
                </button>
              </div>

              {/* Tab Content rendering */}
              <div style={{ flex: 1 }}>
                {activeCitizenTab === 'sos' && <SOSButton />}
                {activeCitizenTab === 'report' && <IncidentForm />}
                {activeCitizenTab === 'chat' && <AIChatbot />}
                {activeCitizenTab === 'settings' && <ContactSettings />}
              </div>
            </div>
          </div>
        )
      )}

        {/* AUTHORITIES COMMAND DECK */}
        {role === 'authority' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
            
            {/* Top workspace navigation */}
            <div className="glass-panel" style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setAuthorityTab('queue')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: authorityTab === 'queue' ? 'var(--bg-tertiary)' : 'transparent',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertCircle size={14} style={{ color: 'var(--color-emergency)' }} /> Dispatch Queue Console
                </button>
                
                <button
                  onClick={() => setAuthorityTab('heatmap')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: authorityTab === 'heatmap' ? 'var(--bg-tertiary)' : 'transparent',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BarChart3 size={14} style={{ color: 'var(--color-info)' }} /> Interactive Risk Heatmap
                </button>

                <button
                  onClick={() => setAuthorityTab('broadcast')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: authorityTab === 'broadcast' ? 'var(--bg-tertiary)' : 'transparent',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Megaphone size={14} style={{ color: 'var(--color-warning)' }} /> Broadcast Civil Alert
                </button>
              </div>

              <span className="badge badge-emergency" style={{ fontSize: '0.65rem' }}>
                LIVE RADAR ACTIVE
              </span>
            </div>

            {/* Main side-by-side workspace: Map (40%) + Controls (60%) */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '20px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <MapComponent />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {authorityTab === 'queue' && <DashboardQueue />}
                {authorityTab === 'heatmap' && <HeatMap />}
                {authorityTab === 'broadcast' && <DisasterBroadcast />}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer style={{
        padding: '10px 20px',
        textAlign: 'center',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto'
      }}>
        SafeConnect Emergency System Terminal v2.1.0 • Prepared for Academic Examination & Public Service. All mock networks simulated.
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EmergencyProvider>
      <MainLayout />
    </EmergencyProvider>
  );
};

export default App;
