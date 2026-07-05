import React, { useState, useEffect, useRef } from 'react';
import { useEmergency, type Incident } from '../context/EmergencyContext';
import { Camera, Video, ShieldAlert, Mic, MicOff, AlertCircle, Send, Clock, CheckCircle2, EyeOff } from 'lucide-react';

export const IncidentForm: React.FC = () => {
  const {
    userLocation,
    reportIncident,
    incidents
  } = useEmergency();

  const [type, setType] = useState<Incident['type']>('crime');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(userLocation.address);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  
  // Media states
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaFileType, setMediaFileType] = useState<'image' | 'video' | undefined>(undefined);
  
  // Voice recording states
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync address field if user location changes on the map
  useEffect(() => {
    setAddress(userLocation.address);
  }, [userLocation]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (event: any) => {
        console.error(event.error);
        setVoiceError(`Voice transcription failed: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      // Speech recognition not supported fallback simulation
      setIsListening(true);
      setVoiceError(null);
      setTimeout(() => {
        const simulation = "URGENT: I just witnessed a car accident on the main crossing. Two vehicles involved, minor smoke coming from one car. Please send help immediately.";
        setDescription(prev => prev ? `${prev} ${simulation}` : simulation);
        setIsListening(false);
      }, 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  // Handle local image/video upload to DataURL preview
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaFileType(fileType);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaFile(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaFileType(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    reportIncident(
      type,
      description,
      address,
      isAnonymous,
      isAnonymous ? undefined : reporterName,
      mediaFile || undefined,
      mediaFileType,
      isListening ? description : undefined
    );

    // Reset form fields
    setDescription('');
    setMediaFile(null);
    setMediaFileType(undefined);
    setReporterName('');
    setIsListening(false);
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning">Pending Review</span>;
      case 'accepted': return <span className="badge badge-info">Dispatcher Dispatched</span>;
      case 'in_progress': return <span className="badge badge-emergency">Active Assistance</span>;
      case 'resolved': return <span className="badge badge-success">Resolved</span>;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
      
      {/* 1. Report Form Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} style={{ color: 'var(--color-warning)' }} />
          Report Emergency Incident
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Incident type radio buttons */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>INCIDENT CLASSIFICATION</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {(['crime', 'fire', 'medical', 'hazard'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: type === t ? 'white' : 'var(--border-color)',
                    background: type === t ? 'var(--bg-tertiary)' : 'transparent',
                    color: type === t ? 'white' : 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous Report Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOff size={16} style={{ color: isAnonymous ? 'var(--color-warning)' : 'var(--text-secondary)' }} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Report Anonymously</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Conceal identity from emergency services.</span>
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: 'var(--color-warning)'
              }}
            />
          </div>

          {/* Reporter name (if not anonymous) */}
          {!isAnonymous && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>REPORTER FULL NAME</label>
              <input 
                type="text" 
                placeholder="Enter your name (e.g. John Doe)"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}

          {/* Location field */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>INCIDENT GPS ADDRESS</label>
            <input 
              type="text" 
              placeholder="e.g. Street Address / Marker description"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Description and voice button */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REPORT DETAILS & DESCRIPTION</label>
              <button
                type="button"
                onClick={handleToggleVoice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isListening ? 'var(--color-emergency)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  color: 'white',
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  animation: isListening ? 'pulse-sos 1.5s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff size={10} /> : <Mic size={10} />}
                {isListening ? 'Stop Recording' : 'Voice Dictate'}
              </button>
            </div>
            
            <textarea 
              placeholder="Describe the incident (e.g. flames visible, suspicous suspect running east, injuries involved)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                outline: 'none',
                fontSize: '0.85rem',
                resize: 'none'
              }}
            />

            {voiceError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-emergency)', fontSize: '0.7rem', marginTop: '4px' }}>
                <AlertCircle size={10} />
                <span>{voiceError} (Mock dictation loaded)</span>
              </div>
            )}
          </div>

          {/* Media upload */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ATTACH INCIDENT EVIDENCE (PHOTO/VIDEO)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 15px',
                  background: 'var(--bg-tertiary)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  flex: 1
                }}
              >
                <Camera size={16} /> Upload Media
                <input 
                  type="file" 
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
              </label>
              
              {mediaFile && (
                <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  {mediaFileType === 'image' ? (
                    <img src={mediaFile} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                      <Video size={16} style={{ color: 'white' }} />
                    </div>
                  )}
                  <button 
                    type="button" 
                    onClick={clearMedia}
                    style={{
                      position: 'absolute',
                      top: 0, right: 0,
                      background: 'rgba(0,0,0,0.7)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-accent"
            style={{
              padding: '12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600,
              marginTop: '5px'
            }}
          >
            <Send size={16} /> Broadcast Incident Report
          </button>
        </form>
      </div>

      {/* 2. Timeline Status Tracking Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} style={{ color: 'var(--color-info)' }} />
          Incident Status Tracker
        </h3>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '420px', paddingRight: '5px' }}>
          {incidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No incidents reported yet.
            </div>
          ) : (
            incidents.map((inc) => (
              <div 
                key={inc.id} 
                style={{
                  padding: '12px 15px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span 
                      style={{
                        padding: '3px 8px',
                        background: inc.type === 'fire' ? 'rgba(255, 71, 87, 0.15)' : inc.type === 'crime' ? 'rgba(30, 144, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: inc.type === 'fire' ? 'var(--color-emergency)' : inc.type === 'crime' ? 'var(--color-info)' : 'var(--color-warning)',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {inc.type}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      #{inc.id.split('-')[1] || inc.id}
                    </span>
                  </div>
                  {getStatusBadge(inc.status)}
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {inc.description}
                </p>

                {/* Media preview (if exists) */}
                {inc.mediaUrl && (
                  <div style={{ width: '100%', maxHeight: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    {inc.mediaType === 'image' ? (
                      <img src={inc.mediaUrl} alt="evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={inc.mediaUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                )}

                {/* Location address */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Location:</span>
                  <span style={{ fontWeight: 600 }}>{inc.location.address}</span>
                </div>

                {/* Timeline flow chart updates */}
                <div style={{ marginTop: '5px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>TRACKING TIMELINE:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {inc.updates.map((update, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2px' }}>
                          <CheckCircle2 size={8} style={{ color: 'var(--color-success)' }} />
                          {idx < inc.updates.length - 1 && <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.1)' }} />}
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{update.note}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{update.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
