import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Shield, Flame, Activity, AlertCircle, BarChart3, Layers, Filter } from 'lucide-react';

export const HeatMap: React.FC = () => {
  const { incidents } = useEmergency();
  
  // Hotspot visibility toggles
  const [showCrime, setShowCrime] = useState(true);
  const [showFire, setShowFire] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showHazard, setShowHazard] = useState(true);
  const [showActive, setShowActive] = useState(true);

  // Sector stats mock data
  const sectorData = [
    { name: 'Sector 1 (Residential)', crime: 14, fire: 3, medical: 22, hazard: 4, risk: 'Medium', color: 'var(--color-warning)' },
    { name: 'Sector 2 (Industrial)', crime: 6, fire: 19, medical: 8, hazard: 15, risk: 'High', color: 'var(--color-emergency)' },
    { name: 'Sector 3 (Downtown)', crime: 35, fire: 2, medical: 41, hazard: 8, risk: 'High', color: 'var(--color-emergency)' },
    { name: 'Sector 4 (Waterfront)', crime: 9, fire: 4, medical: 15, hazard: 18, risk: 'Medium', color: 'var(--color-warning)' },
    { name: 'Sector 5 (Commercial South)', crime: 18, fire: 1, medical: 19, hazard: 3, risk: 'Low', color: 'var(--color-success)' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', padding: '10px', height: '100%' }}>
      
      {/* LEFT PANEL: SVG Heat Map Canvas */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} style={{ color: 'var(--color-emergency)' }} />
            Safety & Emergency Incident Heat Map
          </h3>
          <span className="badge badge-emergency">ANALYTICS ENGINE</span>
        </div>

        {/* Canvas container */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#060810', borderRadius: '12px', border: '1px solid var(--border-color)', aspectRatio: '5/3' }}>
          <svg viewBox="0 0 1000 600" width="100%" height="100%" style={{ userSelect: 'none' }}>
            <defs>
              <pattern id="heatmap-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
              </pattern>
              
              {/* Radial Gradients for Hotspots */}
              <radialGradient id="grad-crime" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e90ff" stopOpacity="0.6"/>
                <stop offset="40%" stopColor="#1e90ff" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#1e90ff" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="grad-fire" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff4757" stopOpacity="0.7"/>
                <stop offset="40%" stopColor="#ff4757" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#ff4757" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="grad-medical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2ed573" stopOpacity="0.55"/>
                <stop offset="45%" stopColor="#2ed573" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#2ed573" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="grad-hazard" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffa502" stopOpacity="0.6"/>
                <stop offset="40%" stopColor="#ffa502" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#ffa502" stopOpacity="0"/>
              </radialGradient>
            </defs>

            {/* Base Grid */}
            <rect width="100%" height="100%" fill="url(#heatmap-grid)" />
            
            {/* Outline of roads for structure reference */}
            <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
            <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
            <line x1="200" y1="0" x2="200" y2="600" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
            <line x1="800" y1="0" x2="800" y2="600" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />

            {/* Historical Hotspot Glows (SVG circles with gradient fills) */}
            
            {/* Crime Hotspots (Sector 3 & 1) */}
            {showCrime && (
              <>
                <circle cx="510" cy="320" r="160" fill="url(#grad-crime)" />
                <circle cx="280" cy="220" r="110" fill="url(#grad-crime)" />
              </>
            )}

            {/* Fire Hotspots (Sector 2 Industrial) */}
            {showFire && (
              <>
                <circle cx="820" cy="180" r="140" fill="url(#grad-fire)" />
                <circle cx="860" cy="240" r="90" fill="url(#grad-fire)" />
              </>
            )}

            {/* Medical Hotspots (Downtown & Sector 1 Residential) */}
            {showMedical && (
              <>
                <circle cx="530" cy="240" r="150" fill="url(#grad-medical)" />
                <circle cx="210" cy="160" r="100" fill="url(#grad-medical)" />
              </>
            )}

            {/* Hazard Hotspots (Waterfront Industrial Sector 4) */}
            {showHazard && (
              <>
                <circle cx="480" cy="510" r="130" fill="url(#grad-hazard)" />
                <circle cx="750" cy="460" r="100" fill="url(#grad-hazard)" />
              </>
            )}

            {/* Current Active Incidents Glowing Indicators */}
            {showActive && incidents.filter(inc => inc.status !== 'resolved').map((inc) => (
              <g key={`heat-${inc.id}`} transform={`translate(${inc.location.x}, ${inc.location.y})`}>
                <circle cx="0" cy="0" r="22" 
                  fill={
                    inc.type === 'fire' 
                      ? 'rgba(255, 71, 87, 0.2)' 
                      : inc.type === 'crime' 
                      ? 'rgba(30, 144, 255, 0.2)' 
                      : inc.type === 'medical'
                      ? 'rgba(46, 213, 115, 0.2)'
                      : 'rgba(245, 158, 11, 0.2)'
                  } 
                  stroke={
                    inc.type === 'fire' 
                      ? 'var(--color-emergency)' 
                      : inc.type === 'crime' 
                      ? 'var(--color-info)' 
                      : inc.type === 'medical'
                      ? 'var(--color-success)'
                      : 'var(--color-warning)'
                  } 
                  strokeWidth="1.5"
                />
                <circle cx="0" cy="0" r="4" 
                  fill={
                    inc.type === 'fire' 
                      ? 'var(--color-emergency)' 
                      : inc.type === 'crime' 
                      ? 'var(--color-info)' 
                      : inc.type === 'medical'
                      ? 'var(--color-success)'
                      : 'var(--color-warning)'
                  } 
                />
              </g>
            ))}

            {/* Sector Border Overlay */}
            <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="5,10" />
            <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="5,10" />
            
            {/* Sector Texts */}
            <text x="20" y="30" fill="white" fontSize="10" fontWeight="bold" opacity="0.4">SECTOR 1</text>
            <text x="980" y="30" fill="white" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="end">SECTOR 2</text>
            <text x="20" y="580" fill="white" fontSize="10" fontWeight="bold" opacity="0.4">SECTOR 4</text>
            <text x="980" y="580" fill="white" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="end">SECTOR 5</text>
          </svg>
        </div>
      </div>

      {/* RIGHT PANEL: Filter Controls & Charts Analytics */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={20} style={{ color: 'var(--color-info)' }} />
          Density Filter & Analytics
        </h3>

        {/* Checkbox filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>LAYER VISIBILITY</span>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showCrime} onChange={(e) => setShowCrime(e.target.checked)} style={{ accentColor: 'var(--color-info)' }} />
            <Shield size={14} style={{ color: 'var(--color-info)' }} /> Historical Crimes
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showFire} onChange={(e) => setShowFire(e.target.checked)} style={{ accentColor: 'var(--color-emergency)' }} />
            <Flame size={14} style={{ color: 'var(--color-emergency)' }} /> Historical Fire Incidents
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showMedical} onChange={(e) => setShowMedical(e.target.checked)} style={{ accentColor: 'var(--color-success)' }} />
            <Activity size={14} style={{ color: 'var(--color-success)' }} /> Historical Medical Calls
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showHazard} onChange={(e) => setShowHazard(e.target.checked)} style={{ accentColor: 'var(--color-warning)' }} />
            <AlertCircle size={14} style={{ color: 'var(--color-warning)' }} /> Historical Hazards/Accidents
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
            <input type="checkbox" checked={showActive} onChange={(e) => setShowActive(e.target.checked)} style={{ accentColor: 'white' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} /> Active Emergencies Overlay
          </label>
        </div>

        {/* Charts & Breakdown */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BarChart3 size={14} /> SECTOR RISK BREAKDOWN
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '250px' }}>
            {sectorData.map((sector) => {
              const total = sector.crime + sector.fire + sector.medical + sector.hazard;
              // Calculate percent compared to max sector total (Downtown is 86)
              const percentage = Math.min((total / 90) * 100, 100);

              return (
                <div key={sector.name} style={{ fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'white' }}>{sector.name}</span>
                    <span style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{total} cases</span>
                      <span style={{ color: sector.color, fontWeight: 'bold' }}>[{sector.risk}]</span>
                    </span>
                  </div>
                  {/* Custom CSS progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: sector.risk === 'High' 
                          ? 'linear-gradient(to right, var(--color-warning), var(--color-emergency))' 
                          : sector.risk === 'Medium' 
                          ? 'var(--color-warning)' 
                          : 'var(--color-success)', 
                        borderRadius: '4px',
                        transition: 'width 1s ease-out'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
