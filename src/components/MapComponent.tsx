import React from 'react';
import { useEmergency, type Location } from '../context/EmergencyContext';
import { Shield, Home, Flame, Activity, User, Truck, Crosshair } from 'lucide-react';

export const MapComponent: React.FC = () => {
  const {
    services,
    userLocation,
    setUserLocation,
    activeSos,
    incidents,
    responders,
    role
  } = useEmergency();

  // Handle map click to set user location if in citizen mode
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (role !== 'citizen') return; // Only citizens can move their GPS location directly by clicking
    if (activeSos) return; // Cannot move location while SOS is active!

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Scale client coords to SVG viewbox (1000x600)
    const scaleX = 1000 / rect.width;
    const scaleY = 600 / rect.height;
    
    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    // Calculate sectors based on quadrant
    let sector = 'Sector 3 (Downtown)';
    if (clickX < 500 && clickY < 300) sector = 'Sector 1 (Residential)';
    else if (clickX >= 500 && clickY < 300) sector = 'Sector 2 (Industrial)';
    else if (clickX < 500 && clickY >= 300) sector = 'Sector 4 (Waterfront)';
    else sector = 'Sector 5 (Commercial South)';

    const newLoc: Location = {
      x: clickX,
      y: clickY,
      address: `${clickX} Street & ${clickY} Ave, ${sector}`
    };

    setUserLocation(newLoc);
  };

  // Helper for drawing service station icons
  const renderServiceIcon = (type: string, size = 16) => {
    switch (type) {
      case 'police': return <Shield size={size} style={{ color: '#1e90ff' }} />;
      case 'hospital': return <Activity size={size} style={{ color: '#2ed573' }} />;
      case 'fire_station': return <Flame size={size} style={{ color: '#ff4757' }} />;
      case 'ambulance': return <Truck size={size} style={{ color: '#ffa502' }} />;
      default: return <Home size={size} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={20} className="pulse-sos-btn" style={{ color: activeSos ? 'var(--color-emergency)' : 'var(--color-info)' }} />
            SafeConnect Tactical Map
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {role === 'citizen' 
              ? 'Click anywhere on the map grid to update your GPS location.' 
              : 'Real-time incident dispatch tracker and unit routes.'
            }
          </p>
        </div>
        
        {/* Map Legend */}
        <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e90ff' }} /> Police
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4757' }} /> Fire Station
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ed573' }} /> Hospital
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffa502' }} /> Ambulance Depot
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)' }} /> You (GPS)
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#070a13', borderRadius: '12px', border: '1px solid var(--border-color)', aspectRatio: '5/3' }}>
        <svg 
          viewBox="0 0 1000 600" 
          width="100%" 
          height="100%" 
          onClick={handleMapClick}
          style={{ cursor: role === 'citizen' && !activeSos ? 'crosshair' : 'default', userSelect: 'none' }}
        >
          {/* Definitions for map styling */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
            <radialGradient id="sos-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-emergency)" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="var(--color-emergency)" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="user-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#70a1ff" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#70a1ff" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* 1. Grid Overlay */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 2. Water / Rivers */}
          <path d="M 0 500 Q 200 480, 400 520 T 800 500 T 1000 530 L 1000 600 L 0 600 Z" fill="#0c1d33" opacity="0.6" />
          
          {/* 3. Parks (Greenspaces) */}
          <rect x="50" y="50" width="150" height="80" rx="10" fill="#0d251d" opacity="0.5" />
          <circle cx="850" cy="450" r="70" fill="#0d251d" opacity="0.4" />

          {/* 4. Roads (Major highways and streets grid) */}
          {/* Main vertical highway */}
          <line x1="500" y1="0" x2="500" y2="600" stroke="#161f36" strokeWidth="12" />
          <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(255,255,255,0.05)" strokeDasharray="6,6" strokeWidth="1" />
          {/* Main horizontal highway */}
          <line x1="0" y1="300" x2="1000" y2="300" stroke="#161f36" strokeWidth="12" />
          <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(255,255,255,0.05)" strokeDasharray="6,6" strokeWidth="1" />
          
          {/* Minor Sector Roads */}
          <line x1="200" y1="0" x2="200" y2="600" stroke="#101726" strokeWidth="6" />
          <line x1="800" y1="0" x2="800" y2="600" stroke="#101726" strokeWidth="6" />
          <line x1="0" y1="150" x2="1000" y2="150" stroke="#101726" strokeWidth="6" />
          <line x1="0" y1="480" x2="1000" y2="480" stroke="#101726" strokeWidth="6" />

          {/* 5. Sector divider borders (thin) */}
          <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10,5" />
          <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10,5" />
          <text x="30" y="35" fill="rgba(255,255,255,0.15)" fontSize="12" fontWeight="bold">SECTOR 1 (RESIDENTIAL)</text>
          <text x="970" y="35" fill="rgba(255,255,255,0.15)" fontSize="12" fontWeight="bold" textAnchor="end">SECTOR 2 (INDUSTRIAL)</text>
          <text x="30" y="580" fill="rgba(255,255,255,0.15)" fontSize="12" fontWeight="bold">SECTOR 4 (WATERFRONT)</text>
          <text x="970" y="580" fill="rgba(255,255,255,0.15)" fontSize="12" fontWeight="bold" textAnchor="end">SECTOR 5 (COMMERCIAL)</text>

          {/* 6. Active SOS Routing / Connection lines */}
          {activeSos && responders.filter(r => r.incidentId === activeSos.id).map(r => (
            <line 
              key={`route-${r.id}`}
              x1={r.location.x} 
              y1={r.location.y} 
              x2={activeSos.location.x} 
              y2={activeSos.location.y} 
              stroke="var(--color-emergency)" 
              strokeWidth="2" 
              strokeDasharray="5,5" 
              opacity="0.6"
            />
          ))}

          {/* Other Incident Routing lines */}
          {incidents.filter(inc => inc.status !== 'resolved' && inc.id !== activeSos?.id).map(inc => {
            const incResponders = responders.filter(r => r.incidentId === inc.id && r.status === 'moving');
            return incResponders.map(r => (
              <line 
                key={`route-${r.id}`}
                x1={r.location.x} 
                y1={r.location.y} 
                x2={inc.location.x} 
                y2={inc.location.y} 
                stroke="var(--color-warning)" 
                strokeWidth="1.5" 
                strokeDasharray="4,4" 
                opacity="0.4"
              />
            ));
          })}

          {/* 7. Emergency Service Stations */}
          {services.map((svc) => (
            <g key={svc.id} transform={`translate(${svc.location.x - 18}, ${svc.location.y - 18})`}>
              <circle cx="18" cy="18" r="20" fill="rgba(15, 23, 42, 0.9)" stroke="var(--border-color)" strokeWidth="1.5" />
              <foreignObject x="9" y="9" width="18" height="18">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {renderServiceIcon(svc.type)}
                </div>
              </foreignObject>
              <text x="18" y="40" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 1px 4px black' }}>
                {svc.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* 8. Active Incidents (excluding main SOS) */}
          {incidents.filter(inc => inc.status !== 'resolved' && inc.id !== activeSos?.id).map((inc) => (
            <g key={inc.id} transform={`translate(${inc.location.x}, ${inc.location.y})`}>
              <circle cx="0" cy="0" r="18" fill="rgba(245, 158, 11, 0.1)" stroke="var(--color-warning)" strokeWidth="1.5" className="ripple-circle" />
              <circle cx="0" cy="0" r="8" fill="var(--color-warning)" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {inc.type === 'fire' ? <Flame size={12} style={{ color: 'black' }} /> : <Shield size={12} style={{ color: 'black' }} />}
                </div>
              </foreignObject>
            </g>
          ))}

          {/* 9. Live User Location Marker */}
          <g transform={`translate(${userLocation.x}, ${userLocation.y})`}>
            {/* Pulsating emergency aura */}
            {activeSos ? (
              <>
                <circle cx="0" cy="0" r="45" fill="url(#sos-glow)" />
                <circle cx="0" cy="0" r="25" fill="none" stroke="var(--color-emergency)" strokeWidth="1.5" className="ripple-circle" style={{ animationDuration: '1.5s' }} />
                <circle cx="0" cy="0" r="10" fill="var(--color-emergency)" />
              </>
            ) : (
              <>
                <circle cx="0" cy="0" r="30" fill="url(#user-glow)" />
                <circle cx="0" cy="0" r="15" fill="none" stroke="#70a1ff" strokeWidth="1" className="ripple-circle" style={{ animationDuration: '3s' }} />
                <circle cx="0" cy="0" r="6" fill="#70a1ff" />
              </>
            )}
            
            {/* User Icon */}
            <g transform="translate(-10, -32)">
              <rect x="0" y="0" width="20" height="20" rx="4" fill="rgba(15,23,42,0.85)" stroke={activeSos ? 'var(--color-emergency)' : 'var(--color-accent)'} strokeWidth="1" />
              <foreignObject x="3" y="3" width="14" height="14">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={12} style={{ color: activeSos ? 'var(--color-emergency)' : 'var(--color-accent)' }} />
                </div>
              </foreignObject>
            </g>
          </g>

          {/* 10. Dispatched Responders Moving */}
          {responders.map((resp) => (
            <g key={resp.id} transform={`translate(${resp.location.x}, ${resp.location.y})`}>
              <circle cx="0" cy="0" r="12" fill={resp.type === 'police' ? '#1e90ff' : resp.type === 'fire' ? '#ff4757' : '#ffa502'} stroke="white" strokeWidth="1" />
              <foreignObject x="-6" y="-6" width="12" height="12">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {resp.type === 'police' && <Shield size={10} style={{ color: 'white' }} />}
                  {resp.type === 'fire' && <Flame size={10} style={{ color: 'white' }} />}
                  {resp.type === 'ambulance' && <Truck size={10} style={{ color: 'white' }} />}
                </div>
              </foreignObject>
              {resp.status === 'moving' && (
                <circle cx="0" cy="0" r="16" fill="none" stroke={resp.type === 'police' ? '#1e90ff' : '#ff4757'} strokeWidth="1" className="ripple-circle" style={{ animationDuration: '1s' }} />
              )}
            </g>
          ))}
        </svg>

        {/* Floating Sector Indicators info */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.7rem', display: 'flex', gap: '15px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>GPS Target: </span>
            <span style={{ fontWeight: 'bold' }}>({userLocation.x}, {userLocation.y})</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Active Responders: </span>
            <span style={{ fontWeight: 'bold', color: responders.filter(r => r.status === 'moving').length > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
              {responders.filter(r => r.status === 'moving').length} Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
