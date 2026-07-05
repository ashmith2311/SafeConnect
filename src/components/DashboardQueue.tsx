import React, { useState } from 'react';
import { useEmergency, type Incident, type Responder } from '../context/EmergencyContext';
import { AlertCircle, Shield, Flame, Activity, Truck, User, MapPin, Send, Image, HelpCircle } from 'lucide-react';

export const DashboardQueue: React.FC = () => {
  const {
    incidents,
    responders,
    dispatchResponder,
    updateIncidentStatus,
    services
  } = useEmergency();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(incidents[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');
  const [customNote, setCustomNote] = useState('');

  const selectedIncident = incidents.find(inc => inc.id === selectedIncidentId);

  // Filter incidents list
  const filteredIncidents = incidents.filter(inc => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return inc.status === 'pending';
    if (filterStatus === 'active') return inc.status === 'accepted' || inc.status === 'in_progress';
    if (filterStatus === 'resolved') return inc.status === 'resolved';
    return true;
  });

  const getServiceStationCoordinates = (type: Responder['type']) => {
    // Map responder type to default service locations
    switch (type) {
      case 'police':
        return services.find(s => s.type === 'police')?.location || { x: 500, y: 300 };
      case 'fire':
        return services.find(s => s.type === 'fire_station')?.location || { x: 800, y: 200 };
      case 'ambulance':
        return services.find(s => s.type === 'ambulance')?.location || { x: 450, y: 480 };
    }
  };

  const handleDispatch = (type: Responder['type']) => {
    if (!selectedIncident) return;
    
    const startLoc = getServiceStationCoordinates(type);
    dispatchResponder(
      selectedIncident.id,
      type,
      startLoc.x,
      startLoc.y,
      selectedIncident.location.x,
      selectedIncident.location.y
    );
  };

  const handleUpdateStatus = (status: Incident['status']) => {
    if (!selectedIncident) return;
    const note = status === 'resolved' ? 'Incident resolved and archived.' : `Incident marked as ${status}.`;
    updateIncidentStatus(selectedIncident.id, status, note);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !customNote.trim()) return;

    updateIncidentStatus(selectedIncident.id, selectedIncident.status, customNote);
    setCustomNote('');
  };

  const getIncidentIcon = (type: Incident['type']) => {
    switch (type) {
      case 'crime': return <Shield size={18} style={{ color: '#1e90ff' }} />;
      case 'fire': return <Flame size={18} style={{ color: '#ff4757' }} />;
      case 'medical': return <Activity size={18} style={{ color: '#2ed573' }} />;
      case 'hazard': return <AlertCircle size={18} style={{ color: '#ffa502' }} />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '20px', padding: '10px', height: '100%', minHeight: '520px' }}>
      
      {/* LEFT PANEL: Queue List */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} style={{ color: 'var(--color-emergency)' }} />
          Emergency Incident Queue
        </h3>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
          {(['all', 'pending', 'active', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: filterStatus === status ? 'var(--bg-tertiary)' : 'transparent',
                color: filterStatus === status ? 'white' : 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* List of queue items */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px' }}>
          {filteredIncidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No incidents match this status.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const activeRes = responders.filter(r => r.incidentId === inc.id);
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  style={{
                    padding: '12px',
                    background: selectedIncidentId === inc.id ? 'var(--glass-bg-hover)' : 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid',
                    borderColor: selectedIncidentId === inc.id ? 'var(--color-emergency)' : 'var(--border-color)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                    <div className="flex-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                      {getIncidentIcon(inc.type)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        #{inc.id.split('-')[1] || inc.id} • {new Date(inc.timestamp).toLocaleTimeString()}
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: 'white', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '150px' }}>
                        {inc.description}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <span className={`badge ${
                      inc.status === 'pending' 
                        ? 'badge-warning' 
                        : inc.status === 'resolved' 
                        ? 'badge-success' 
                        : 'badge-emergency'
                    }`} style={{ fontSize: '0.55rem', padding: '2px 5px' }}>
                      {inc.status === 'accepted' ? 'dispatched' : inc.status}
                    </span>
                    {activeRes.length > 0 && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-info)', fontWeight: 600 }}>
                        {activeRes.length} units dispatched
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Incident Command Center Details */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedIncident ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
            
            {/* Header / ID / Status Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <span className="badge badge-emergency" style={{ fontSize: '0.65rem' }}>COMMAND CENTER</span>
                <h4 style={{ fontSize: '1.1rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getIncidentIcon(selectedIncident.type)}
                  Incident #{selectedIncident.id.split('-')[1] || selectedIncident.id}
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedIncident.status !== 'resolved' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="btn-secondary" 
                      style={{ padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255, 165, 2, 0.1)', border: '1px solid rgba(255, 165, 2, 0.3)', color: 'var(--color-warning)' }}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('resolved')}
                      className="btn-secondary" 
                      style={{ padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.3)', color: 'var(--color-success)' }}
                    >
                      Resolve
                    </button>
                  </>
                )}
                {selectedIncident.status === 'resolved' && (
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>RESOLVED</span>
                )}
              </div>
            </div>

            {/* Reporter / Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              {/* Caller Info */}
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>REPORTER INFO</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', color: selectedIncident.isAnonymous ? 'var(--color-warning)' : 'white' }}>
                  <User size={12} />
                  {selectedIncident.isAnonymous ? 'ANONYMOUS WITNESS' : (selectedIncident.reporterName || 'Citizen')}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Broadcaster ID: {selectedIncident.id}
                </span>
              </div>

              {/* Coordinates Info */}
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>TACTICAL COORDINATES</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-info)' }}>
                  <MapPin size={12} />
                  X: {selectedIncident.location.x}, Y: {selectedIncident.location.y}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                  {selectedIncident.location.address}
                </span>
              </div>
            </div>

            {/* Description / Transcripts */}
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>INCIDENT BRIEF DESCRIPTION</span>
              <p style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.4 }}>
                {selectedIncident.description}
              </p>
              {selectedIncident.voiceTranscription && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--color-info)' }}>
                  <span style={{ fontWeight: 'bold', display: 'block' }}>VOICE TRANSCRIPTION COMMAND:</span>
                  "{selectedIncident.voiceTranscription}"
                </div>
              )}
            </div>

            {/* Media attachment preview */}
            {selectedIncident.mediaUrl && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Image size={12} /> ATTACHED MEDIA EVIDENCE (CITIZEN UPLOAD)
                </span>
                <div style={{ display: 'flex', justifyContent: 'center', background: '#000', borderRadius: '6px', overflow: 'hidden', maxHeight: '120px' }}>
                  {selectedIncident.mediaType === 'image' ? (
                    <img src={selectedIncident.mediaUrl} alt="evidence" style={{ width: '100%', objectFit: 'contain' }} />
                  ) : (
                    <video src={selectedIncident.mediaUrl} controls style={{ width: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              </div>
            )}

            {/* Dispatcher Actions */}
            {selectedIncident.status !== 'resolved' && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', background: 'rgba(255, 71, 87, 0.02)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>TACTICAL UNIT DISPATCH PANEL</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button 
                    onClick={() => handleDispatch('police')}
                    className="btn-secondary" 
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Shield size={14} style={{ color: '#1e90ff' }} /> Dispatch Police
                  </button>
                  <button 
                    onClick={() => handleDispatch('fire')}
                    className="btn-secondary" 
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Flame size={14} style={{ color: '#ff4757' }} /> Dispatch Fire
                  </button>
                  <button 
                    onClick={() => handleDispatch('ambulance')}
                    className="btn-secondary" 
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Truck size={14} style={{ color: '#ffa502' }} /> Dispatch EMT
                  </button>
                </div>
              </div>
            )}

            {/* Timeline Notes logger */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '130px', paddingRight: '5px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>INCIDENT TIMELINE ACTIVITY LOG</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedIncident.updates.map((up, i) => (
                  <div key={i} style={{ fontSize: '0.7rem', padding: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span className={`badge ${
                        up.status === 'pending' 
                          ? 'badge-warning' 
                          : up.status === 'resolved' 
                          ? 'badge-success' 
                          : 'badge-emergency'
                      }`} style={{ fontSize: '0.5rem', padding: '1px 3px', marginRight: '6px' }}>
                        {up.status}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{up.note}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{up.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Notes input form */}
            {selectedIncident.status !== 'resolved' && (
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <input 
                  type="text" 
                  placeholder="Transmit dispatch instruction/update note..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.8rem'
                  }}
                />
                <button type="submit" className="btn-accent" style={{ padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={14} />
                </button>
              </form>
            )}

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', color: 'var(--text-muted)' }}>
            <HelpCircle size={48} style={{ marginBottom: '15px', color: 'var(--text-muted)' }} />
            <h4 style={{ color: 'white', marginBottom: '4px' }}>No Incident Selected</h4>
            <p style={{ fontSize: '0.8rem' }}>Select an active emergency or report from the queue list to open details.</p>
          </div>
        )}
      </div>

    </div>
  );
};
