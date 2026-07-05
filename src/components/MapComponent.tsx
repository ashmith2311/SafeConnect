import React, { useEffect, useRef, useState } from 'react';
import { useEmergency, type Location } from '../context/EmergencyContext';
import { Shield, Home, Flame, Activity, User, Truck, Crosshair, Navigation } from 'lucide-react';

// Road network nodes (x, y) used for routing along streets
const ROAD_NODES: Record<string, [number, number]> = {
  // Horizontal major roads intersections
  A: [0, 150],    B: [200, 150],  C: [350, 150],  D: [500, 150],  E: [650, 150],  F: [800, 150],  G: [1000, 150],
  H: [0, 300],    I: [200, 300],  J: [350, 300],  K: [500, 300],  L: [650, 300],  M: [800, 300],  N: [1000, 300],
  O: [0, 450],    P: [200, 450],  Q: [350, 450],  R: [500, 450],  S: [650, 450],  T: [800, 450],  U: [1000, 450],
};

// 12+ static civilian members on the map
const CITIZEN_MEMBERS = [
  { id: 'cm1',  name: 'Aarav S.',    x: 105, y: 85,   color: '#7bed9f', status: 'safe' },
  { id: 'cm2',  name: 'Priya M.',    x: 270, y: 200,  color: '#70a1ff', status: 'safe' },
  { id: 'cm3',  name: 'Rahul D.',    x: 430, y: 120,  color: '#eccc68', status: 'safe' },
  { id: 'cm4',  name: 'Sneha K.',    x: 680, y: 75,   color: '#a29bfe', status: 'safe' },
  { id: 'cm5',  name: 'Vikram R.',   x: 860, y: 200,  color: '#fd79a8', status: 'safe' },
  { id: 'cm6',  name: 'Divya L.',    x: 140, y: 370,  color: '#ffeaa7', status: 'safe' },
  { id: 'cm7',  name: 'Kiran B.',    x: 310, y: 355,  color: '#81ecec', status: 'safe' },
  { id: 'cm8',  name: 'Meera P.',    x: 560, y: 260,  color: '#74b9ff', status: 'safe' },
  { id: 'cm9',  name: 'Arjun T.',    x: 730, y: 370,  color: '#55efc4', status: 'danger' },
  { id: 'cm10', name: 'Lakshmi A.',  x: 920, y: 350,  color: '#fd79a8', status: 'safe' },
  { id: 'cm11', name: 'Suresh V.',   x: 170, y: 500,  color: '#e17055', status: 'safe' },
  { id: 'cm12', name: 'Ananya G.',   x: 460, y: 490,  color: '#a29bfe', status: 'safe' },
  { id: 'cm13', name: 'Ravi N.',     x: 620, y: 510,  color: '#7bed9f', status: 'safe' },
  { id: 'cm14', name: 'Pooja S.',    x: 850, y: 500,  color: '#eccc68', status: 'danger' },
];

// Snap a point to the nearest road node
function snapToRoad(x: number, y: number): [number, number] {
  let best = Object.values(ROAD_NODES)[0];
  let bestDist = Infinity;
  for (const [nx, ny] of Object.values(ROAD_NODES)) {
    const d = Math.hypot(nx - x, ny - y);
    if (d < bestDist) { bestDist = d; best = [nx, ny]; }
  }
  return best;
}

// Build an L-shaped road route: start → road snap → road snap → end
function buildRoadPath(x1: number, y1: number, x2: number, y2: number): string {
  const [sx, sy] = snapToRoad(x1, y1);
  const [ex, ey] = snapToRoad(x2, y2);
  // Go from start to nearest road, travel horizontally then vertically, reach nearest road of destination, then end
  return `M ${x1} ${y1} L ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey} L ${x2} ${y2}`;
}

// Arrow head along a path (draws a small triangle at end point pointing in a given direction)
function ArrowHead({ x, y, dx, dy, color }: { x: number; y: number; dx: number; dy: number; color: string }) {
  const len = Math.hypot(dx, dy);
  if (len === 0) return null;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const size = 8;
  const points = [
    `${x},${y}`,
    `${x - ux * size + px * size * 0.5},${y - uy * size + py * size * 0.5}`,
    `${x - ux * size - px * size * 0.5},${y - uy * size - py * size * 0.5}`,
  ].join(' ');
  return <polygon points={points} fill={color} opacity={0.85} />;
}

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

  const [hoveredCitizen, setHoveredCitizen] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Subtle slow movement for citizens
  const offsets = useRef(
    CITIZEN_MEMBERS.map(() => ({ dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.2 }))
  );

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (role !== 'citizen') return;
    if (activeSos) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 600 / rect.height;
    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);
    let sector = 'Sector 3 (Downtown)';
    if (clickX < 500 && clickY < 300) sector = 'Sector 1 (Residential)';
    else if (clickX >= 500 && clickY < 300) sector = 'Sector 2 (Industrial)';
    else if (clickX < 500 && clickY >= 300) sector = 'Sector 4 (Waterfront)';
    else sector = 'Sector 5 (Commercial South)';
    const newLoc: Location = { x: clickX, y: clickY, address: `${clickX} Street & ${clickY} Ave, ${sector}` };
    setUserLocation(newLoc);
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={20} className="pulse-sos-btn" style={{ color: activeSos ? 'var(--color-emergency)' : 'var(--color-info)' }} />
            SafeConnect Tactical Map
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {role === 'citizen'
              ? 'Click anywhere on the map to update your GPS location.'
              : 'Live dispatch tracker — road routing and civilian member positions.'}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
          {[
            { color: '#1e90ff', label: 'Police' },
            { color: '#ff4757', label: 'Fire' },
            { color: '#2ed573', label: 'Hospital' },
            { color: '#ffa502', label: 'Ambulance' },
            { color: 'var(--color-accent)', label: 'You (GPS)' },
            { color: '#7bed9f', label: 'Citizen (Safe)' },
            { color: '#ff4757', label: 'Citizen (Danger)' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#060c1a', borderRadius: '12px', border: '1px solid var(--border-color)', aspectRatio: '5/3' }}>
        <svg
          viewBox="0 0 1000 600"
          width="100%"
          height="100%"
          onClick={handleMapClick}
          style={{ cursor: role === 'citizen' && !activeSos ? 'crosshair' : 'default', userSelect: 'none' }}
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
            </pattern>
            <radialGradient id="sos-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-emergency)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-emergency)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="user-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#70a1ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#70a1ff" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,165,0,0.8)" />
            </marker>
            <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,71,87,0.8)" />
            </marker>
          </defs>

          {/* 1. Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 2. Water body bottom */}
          <path d="M 0 530 Q 150 510, 300 535 T 600 520 T 900 535 T 1000 525 L 1000 600 L 0 600 Z" fill="#07192e" opacity="0.8" />
          <text x="500" y="575" fill="rgba(30,144,255,0.25)" fontSize="11" fontWeight="bold" textAnchor="middle">COASTAL WATERWAY</text>

          {/* 3. Parks */}
          <rect x="40" y="40" width="130" height="85" rx="12" fill="#0a1f14" opacity="0.7" />
          <text x="105" y="88" fill="rgba(46,213,115,0.4)" fontSize="9" textAnchor="middle">🌳 PARK</text>
          <ellipse cx="870" cy="440" rx="75" ry="55" fill="#0a1f14" opacity="0.6" />
          <text x="870" y="444" fill="rgba(46,213,115,0.4)" fontSize="9" textAnchor="middle">🌿 RESERVE</text>

          {/* 4. ROAD NETWORK — Major Highways */}
          {/* Vertical Highway (Main Ave) */}
          <line x1="500" y1="0" x2="500" y2="600" stroke="#1a2540" strokeWidth="16" />
          <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(255,255,255,0.06)" strokeDasharray="20,12" strokeWidth="1.5" />
          <text x="507" y="20" fill="rgba(255,255,255,0.2)" fontSize="9" fontWeight="bold">MAIN AVE ↕</text>

          {/* Horizontal Highway (Central Blvd) */}
          <line x1="0" y1="300" x2="1000" y2="300" stroke="#1a2540" strokeWidth="16" />
          <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="20,12" strokeWidth="1.5" />
          <text x="10" y="295" fill="rgba(255,255,255,0.2)" fontSize="9" fontWeight="bold">CENTRAL BLVD →</text>

          {/* Secondary streets */}
          <line x1="200" y1="0" x2="200" y2="600" stroke="#101b30" strokeWidth="8" />
          <text x="207" y="20" fill="rgba(255,255,255,0.15)" fontSize="8">NORTH ST ↕</text>
          <line x1="800" y1="0" x2="800" y2="600" stroke="#101b30" strokeWidth="8" />
          <text x="807" y="20" fill="rgba(255,255,255,0.15)" fontSize="8">EAST ST ↕</text>
          <line x1="350" y1="0" x2="350" y2="600" stroke="#0d1626" strokeWidth="5" />
          <text x="357" y="20" fill="rgba(255,255,255,0.1)" fontSize="8">PARK RD ↕</text>
          <line x1="650" y1="0" x2="650" y2="600" stroke="#0d1626" strokeWidth="5" />
          <text x="657" y="20" fill="rgba(255,255,255,0.1)" fontSize="8">RIVER RD ↕</text>

          {/* Horizontal secondary streets */}
          <line x1="0" y1="150" x2="1000" y2="150" stroke="#101b30" strokeWidth="8" />
          <text x="10" y="145" fill="rgba(255,255,255,0.15)" fontSize="8">HILL RD →</text>
          <line x1="0" y1="450" x2="1000" y2="450" stroke="#101b30" strokeWidth="8" />
          <text x="10" y="445" fill="rgba(255,255,255,0.15)" fontSize="8">SOUTH RD →</text>
          <line x1="0" y1="220" x2="1000" y2="220" stroke="#0d1626" strokeWidth="4" />
          <line x1="0" y1="380" x2="1000" y2="380" stroke="#0d1626" strokeWidth="4" />

          {/* Diagonal/diagonal shortcuts */}
          <line x1="200" y1="150" x2="350" y2="300" stroke="#0d1626" strokeWidth="4" />
          <line x1="650" y1="300" x2="800" y2="150" stroke="#0d1626" strokeWidth="4" />
          <line x1="200" y1="450" x2="350" y2="300" stroke="#0d1626" strokeWidth="4" />
          <line x1="650" y1="300" x2="800" y2="450" stroke="#0d1626" strokeWidth="4" />

          {/* Intersection dots */}
          {[
            [200, 150], [350, 150], [500, 150], [650, 150], [800, 150],
            [200, 300], [350, 300], [500, 300], [650, 300], [800, 300],
            [200, 450], [350, 450], [500, 450], [650, 450], [800, 450],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#1e2d4a" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          ))}

          {/* Road direction arrows on major roads */}
          {/* → on Central Blvd */}
          {[150, 320, 490, 680, 880].map((x, i) => (
            <polygon key={`harrow-${i}`} points={`${x},297 ${x+10},300 ${x},303`} fill="rgba(255,255,255,0.12)" />
          ))}
          {/* ↓ on Main Ave */}
          {[70, 200, 360, 470].map((y, i) => (
            <polygon key={`varrow-${i}`} points={`497,${y} 500,${y+10} 503,${y}`} fill="rgba(255,255,255,0.12)" />
          ))}

          {/* 5. Sector labels */}
          <text x="30" y="30" fill="rgba(255,255,255,0.1)" fontSize="11" fontWeight="bold">SECTOR 1 — RESIDENTIAL</text>
          <text x="970" y="30" fill="rgba(255,255,255,0.1)" fontSize="11" fontWeight="bold" textAnchor="end">SECTOR 2 — INDUSTRIAL</text>
          <text x="30" y="590" fill="rgba(255,255,255,0.1)" fontSize="11" fontWeight="bold">SECTOR 4 — WATERFRONT</text>
          <text x="970" y="590" fill="rgba(255,255,255,0.1)" fontSize="11" fontWeight="bold" textAnchor="end">SECTOR 5 — COMMERCIAL</text>

          {/* 6. Road-snapped responder routing paths with arrows */}
          {activeSos && responders.filter(r => r.incidentId === activeSos.id).map(r => {
            const path = buildRoadPath(r.location.x, r.location.y, activeSos.location.x, activeSos.location.y);
            const [ex, ey] = [activeSos.location.x, activeSos.location.y];
            const [sx] = snapToRoad(r.location.x, r.location.y);
            const [, sney] = snapToRoad(ex, ey);
            return (
              <g key={`route-${r.id}`}>
                <path d={path} stroke="rgba(255,71,87,0.5)" strokeWidth="2.5" strokeDasharray="8,5" fill="none" markerEnd="url(#arrow-red)" />
                <ArrowHead x={ex} y={ey} dx={sx - ex} dy={sney - ey} color="rgba(255,71,87,0.8)" />
              </g>
            );
          })}

          {incidents.filter(inc => inc.status !== 'resolved' && inc.id !== activeSos?.id).map(inc => {
            const incResponders = responders.filter(r => r.incidentId === inc.id && r.status === 'moving');
            return incResponders.map(r => {
              const path = buildRoadPath(r.location.x, r.location.y, inc.location.x, inc.location.y);
              return (
                <path key={`route-${r.id}`} d={path} stroke="rgba(255,165,0,0.45)" strokeWidth="2" strokeDasharray="6,5" fill="none" markerEnd="url(#arrow-orange)" />
              );
            });
          })}

          {/* 7. Citizen members */}
          {CITIZEN_MEMBERS.map((c, idx) => {
            const ox = Math.sin(tick * 0.6 + idx) * offsets.current[idx].dx * 4;
            const oy = Math.cos(tick * 0.5 + idx) * offsets.current[idx].dy * 4;
            const cx = c.x + ox;
            const cy = c.y + oy;
            const isDanger = c.status === 'danger';
            const isHovered = hoveredCitizen === c.id;
            const dotColor = isDanger ? '#ff4757' : c.color;

            return (
              <g
                key={c.id}
                transform={`translate(${cx}, ${cy})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredCitizen(c.id)}
                onMouseLeave={() => setHoveredCitizen(null)}
              >
                {/* Pulsing ring for danger members */}
                {isDanger && (
                  <circle cx="0" cy="0" r="16" fill="none" stroke="#ff4757" strokeWidth="1.5" className="ripple-circle" style={{ animationDuration: '1.2s' }} />
                )}

                {/* Walking direction indicator (small arrow) */}
                <Navigation
                  size={6}
                  style={{
                    color: dotColor,
                    transform: `rotate(${(idx * 47) % 360}deg)`,
                    position: 'absolute'
                  }}
                />

                {/* Member dot */}
                <circle cx="0" cy="0" r={isHovered ? 9 : 7} fill={dotColor} stroke="white" strokeWidth="1.2" filter="url(#glow)" />

                {/* Initial letter */}
                <text x="0" y="4" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">{c.name[0]}</text>

                {/* Name badge on hover */}
                {isHovered && (
                  <g transform="translate(-30, -32)">
                    <rect x="0" y="0" width="60" height="18" rx="4" fill="rgba(0,0,0,0.85)" stroke={dotColor} strokeWidth="1" />
                    <text x="30" y="12" fill={dotColor} fontSize="8" fontWeight="bold" textAnchor="middle">{c.name}</text>
                  </g>
                )}

                {/* Danger label always visible */}
                {isDanger && !isHovered && (
                  <g transform="translate(-22, -26)">
                    <rect x="0" y="0" width="44" height="14" rx="3" fill="rgba(255,71,87,0.9)" />
                    <text x="22" y="10" fill="white" fontSize="7.5" fontWeight="bold" textAnchor="middle">⚠ DANGER</text>
                  </g>
                )}

                {/* Walking direction arrow */}
                <polygon
                  points={`0,-12 3,-7 -3,-7`}
                  fill={dotColor}
                  opacity="0.6"
                  transform={`rotate(${(idx * 53) % 360})`}
                />
              </g>
            );
          })}

          {/* 8. Emergency Service Stations */}
          {services.map((svc) => (
            <g key={svc.id} transform={`translate(${svc.location.x - 18}, ${svc.location.y - 18})`}>
              <circle cx="18" cy="18" r="21" fill="rgba(10, 18, 35, 0.92)" stroke="var(--border-color)" strokeWidth="1.5" />
              <foreignObject x="9" y="9" width="18" height="18">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {renderServiceIcon(svc.type)}
                </div>
              </foreignObject>
              <text x="18" y="42" fill="white" fontSize="7.5" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 1px 4px black' }}>
                {svc.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* 9. Active Incidents */}
          {incidents.filter(inc => inc.status !== 'resolved' && inc.id !== activeSos?.id).map((inc) => (
            <g key={inc.id} transform={`translate(${inc.location.x}, ${inc.location.y})`}>
              <circle cx="0" cy="0" r="20" fill="rgba(245,158,11,0.08)" stroke="var(--color-warning)" strokeWidth="1.5" className="ripple-circle" />
              <circle cx="0" cy="0" r="9" fill="var(--color-warning)" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {inc.type === 'fire' ? <Flame size={12} style={{ color: 'black' }} /> : <Shield size={12} style={{ color: 'black' }} />}
                </div>
              </foreignObject>
            </g>
          ))}

          {/* 10. User GPS Location Marker */}
          <g transform={`translate(${userLocation.x}, ${userLocation.y})`}>
            {activeSos ? (
              <>
                <circle cx="0" cy="0" r="50" fill="url(#sos-glow)" />
                <circle cx="0" cy="0" r="28" fill="none" stroke="var(--color-emergency)" strokeWidth="1.5" className="ripple-circle" style={{ animationDuration: '1.5s' }} />
                <circle cx="0" cy="0" r="11" fill="var(--color-emergency)" />
              </>
            ) : (
              <>
                <circle cx="0" cy="0" r="32" fill="url(#user-glow)" />
                <circle cx="0" cy="0" r="17" fill="none" stroke="#70a1ff" strokeWidth="1" className="ripple-circle" style={{ animationDuration: '3s' }} />
                <circle cx="0" cy="0" r="7" fill="#70a1ff" />
              </>
            )}
            <g transform="translate(-11, -34)">
              <rect x="0" y="0" width="22" height="22" rx="5" fill="rgba(15,23,42,0.9)" stroke={activeSos ? 'var(--color-emergency)' : 'var(--color-accent)'} strokeWidth="1.5" />
              <foreignObject x="3" y="3" width="16" height="16">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={13} style={{ color: activeSos ? 'var(--color-emergency)' : 'var(--color-accent)' }} />
                </div>
              </foreignObject>
            </g>
            <text x="0" y="28" fill="rgba(112,161,255,0.8)" fontSize="8" fontWeight="bold" textAnchor="middle">YOU</text>
          </g>

          {/* 11. Dispatched Responders */}
          {responders.map((resp) => (
            <g key={resp.id} transform={`translate(${resp.location.x}, ${resp.location.y})`}>
              {resp.status === 'moving' && (
                <circle cx="0" cy="0" r="18" fill="none" stroke={resp.type === 'police' ? '#1e90ff' : '#ff4757'} strokeWidth="1.2" className="ripple-circle" style={{ animationDuration: '0.9s' }} />
              )}
              <circle cx="0" cy="0" r="12" fill={resp.type === 'police' ? '#1e90ff' : resp.type === 'fire' ? '#ff4757' : '#ffa502'} stroke="white" strokeWidth="1.2" />
              <foreignObject x="-6" y="-6" width="12" height="12">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {resp.type === 'police' && <Shield size={10} style={{ color: 'white' }} />}
                  {resp.type === 'fire' && <Flame size={10} style={{ color: 'white' }} />}
                  {resp.type === 'ambulance' && <Truck size={10} style={{ color: 'white' }} />}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>

        {/* Bottom status bar */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ background: 'rgba(0,0,0,0.82)', padding: '5px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.7rem', display: 'flex', gap: '16px' }}>
            <span><span style={{ color: 'var(--text-muted)' }}>GPS: </span><span style={{ fontWeight: 'bold' }}>({userLocation.x}, {userLocation.y})</span></span>
            <span><span style={{ color: 'var(--text-muted)' }}>Civilians on map: </span><span style={{ fontWeight: 'bold', color: '#7bed9f' }}>{CITIZEN_MEMBERS.length}</span></span>
            <span><span style={{ color: 'var(--text-muted)' }}>In danger: </span><span style={{ fontWeight: 'bold', color: '#ff4757' }}>{CITIZEN_MEMBERS.filter(c => c.status === 'danger').length}</span></span>
            <span><span style={{ color: 'var(--text-muted)' }}>Responders: </span><span style={{ fontWeight: 'bold', color: responders.filter(r => r.status === 'moving').length > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>{responders.filter(r => r.status === 'moving').length} Active</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
