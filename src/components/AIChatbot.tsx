import React, { useState, useEffect, useRef } from 'react';
import { useEmergency, type ChatMessage } from '../context/EmergencyContext';
import { Send, Mic, MicOff, AlertCircle, HelpCircle, Heart, Flame, ShieldAlert, Activity } from 'lucide-react';

export const AIChatbot: React.FC = () => {
  const { chatMessages, sendChatMessage, triggerPresetChatCard } = useEmergency();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecognitionError(`Speech recognition failed: ${event.error}`);
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
      // Speech recognition not supported - simulate speech input
      setIsListening(true);
      setRecognitionError(null);
      setTimeout(() => {
        const simulations = [
          'Help, someone has severe bleeding in their leg!',
          'How do I perform CPR on a collapsed person?',
          'What are the fire safety rules for smoke escape?',
          'I need to report a robbery suspect.'
        ];
        const randomSim = simulations[Math.floor(Math.random() * simulations.length)];
        setInputText(randomSim);
        setIsListening(false);
      }, 2500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  // Render visual cards for emergency guidance
  const renderCard = (cardType: ChatMessage['cardType']) => {
    if (!cardType) return null;

    switch (cardType) {
      case 'first_aid':
        return (
          <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(46, 213, 115, 0.05)', border: '1px solid rgba(46, 213, 115, 0.25)', borderRadius: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontSize: '0.95rem', marginBottom: '10px', fontWeight: 'bold' }}>
              <Activity size={18} /> FIRST AID GUIDE: SEVERE BLEEDING
            </h4>
            <ol style={{ fontSize: '0.8rem', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
              <li><strong>Apply Pressure:</strong> Cover the wound with a sterile dressing or clean cloth. Press hard with both hands.</li>
              <li><strong>Elevate:</strong> Position the injured limb above heart level to decrease pressure on the bleed.</li>
              <li><strong>Pressure Points:</strong> If bleeding continues, press on the main artery supplying the limb (inner upper arm or groin).</li>
              <li><strong>Tourniquet:</strong> If bleeding is catastrophic and uncontrollable, apply a tourniquet 2-3 inches above the wound (never on a joint). Tighten until bleeding stops. Record the time.</li>
            </ol>
          </div>
        );

      case 'cardiac_arrest':
        return (
          <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(255, 71, 87, 0.05)', border: '1px solid rgba(255, 71, 87, 0.25)', borderRadius: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emergency)', fontSize: '0.95rem', marginBottom: '10px', fontWeight: 'bold' }}>
              <Heart size={18} className="pulse-sos-btn" /> CARDIAC ARREST: CPR PROTOCOL
            </h4>
            
            {/* Pulsating Heartbeat Simulator Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div className="flex-center pulse-sos-btn" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-emergency)' }}>
                <Activity size={16} style={{ color: 'white' }} />
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                <strong style={{ color: 'white' }}>CPR Pace: 100 - 120 compressions per minute</strong>
                <p style={{ color: 'var(--text-secondary)' }}>Compress to the beat of "Stayin' Alive"</p>
              </div>
            </div>

            <ol style={{ fontSize: '0.8rem', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
              <li><strong>Verify Responsiveness:</strong> Shake the victim gently and yell, "Are you okay?". Check for normal breathing.</li>
              <li><strong>Call 911 immediately:</strong> Put your phone on speaker and follow the dispatcher's instructions.</li>
              <li><strong>Chest Compressions:</strong> Place hands in the center of the chest. Push hard and fast (2 inches deep, 100-120bpm). Do not stop.</li>
              <li><strong>AED:</strong> If an Automated External Defibrillator is available, turn it on immediately and follow the spoken voice prompts.</li>
            </ol>
          </div>
        );

      case 'fire_safety':
        return (
          <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(255, 165, 2, 0.05)', border: '1px solid rgba(255, 165, 2, 0.25)', borderRadius: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontSize: '0.95rem', marginBottom: '10px', fontWeight: 'bold' }}>
              <Flame size={18} /> FIRE ESCAPE & EVACUATION
            </h4>
            <ol style={{ fontSize: '0.8rem', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
              <li><strong>Stay Low:</strong> Smoke and toxic gases rise. Crawl on your hands and knees to stay under the smoke layer.</li>
              <li><strong>Test Doors:</strong> Feel doors with the back of your hand before opening. If hot, do not open. Find an alternate escape route.</li>
              <li><strong>Stop, Drop, and Roll:</strong> If clothing catches fire, drop to the ground and roll repeatedly to extinguish flames.</li>
              <li><strong>Do NOT Go Back:</strong> Exit to the safe muster point. Never re-enter a burning building for belongings.</li>
            </ol>
          </div>
        );

      case 'crime_report':
        return (
          <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(30, 144, 255, 0.05)', border: '1px solid rgba(30, 144, 255, 0.25)', borderRadius: '10px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-info)', fontSize: '0.95rem', marginBottom: '10px', fontWeight: 'bold' }}>
              <ShieldAlert size={18} /> CRIME SUSPECT REPORT CHECKLIST
            </h4>
            <p style={{ fontSize: '0.75rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              Write down as many details as possible for investigators:
            </p>
            <ul style={{ fontSize: '0.8rem', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-primary)' }}>
              <li><strong>Suspect Details:</strong> Estimate gender, age, height, build, hair color, facial hair, tattoos, and clothing layers.</li>
              <li><strong>Weapons:</strong> Did you see handguns, knives, blunt instruments, or other hazards?</li>
              <li><strong>Vehicles:</strong> Note make, model, color, license plate digits, and direction of flight.</li>
              <li><strong>Incident Timeline:</strong> Exact time, sequence of events, and status of any victims.</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px' }}>
      
      {/* Tab Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={20} style={{ color: 'var(--color-info)' }} />
          Emergency AI Assistant
        </h3>
        <span className="badge badge-info">
          AI ONLINE
        </span>
      </div>

      {/* Preset Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={() => triggerPresetChatCard('first_aid')}
          className="btn-secondary" 
          style={{ padding: '8px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Activity size={14} style={{ color: 'var(--color-success)' }} /> Bleeding First Aid
        </button>
        <button 
          onClick={() => triggerPresetChatCard('cardiac_arrest')}
          className="btn-secondary" 
          style={{ padding: '8px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Heart size={14} style={{ color: 'var(--color-emergency)' }} /> Cardiac CPR Guide
        </button>
        <button 
          onClick={() => triggerPresetChatCard('fire_safety')}
          className="btn-secondary" 
          style={{ padding: '8px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Flame size={14} style={{ color: 'var(--color-warning)' }} /> Fire Safety Card
        </button>
        <button 
          onClick={() => triggerPresetChatCard('crime_report')}
          className="btn-secondary" 
          style={{ padding: '8px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <ShieldAlert size={14} style={{ color: 'var(--color-info)' }} /> Suspect Checklist
        </button>
      </div>

      {/* Chat Messages Log */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px', marginBottom: '15px', maxHeight: '300px' }}>
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div 
              style={{
                background: msg.sender === 'user' ? 'var(--color-info)' : 'var(--bg-tertiary)',
                color: 'white',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                fontSize: '0.85rem',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: msg.sender === 'user' ? '0 2px 10px var(--color-info-glow)' : 'none'
              }}
            >
              {msg.text}
              {renderCard(msg.cardType)}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Voice feedback / Error Indicator */}
      {recognitionError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-emergency)', fontSize: '0.7rem', padding: '6px', background: 'rgba(255, 71, 87, 0.05)', borderRadius: '6px', marginBottom: '8px' }}>
          <AlertCircle size={12} />
          <span>{recognitionError} (Simulated Voice Fallback Enabled)</span>
        </div>
      )}

      {/* Text Form Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <input 
          type="text" 
          placeholder={isListening ? "Listening... Speak now" : "Ask for instructions (e.g. bleeding control)..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isListening}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '25px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'white',
            outline: 'none',
            fontSize: '0.85rem',
            transition: 'border 0.3s'
          }}
        />
        
        {/* Mic Button */}
        <button 
          type="button"
          onClick={handleToggleVoice}
          className="btn-secondary"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isListening ? 'var(--color-emergency)' : 'var(--bg-tertiary)',
            borderColor: isListening ? 'var(--color-emergency)' : 'var(--border-color)',
            color: 'white',
            animation: isListening ? 'pulse-sos 1.5s infinite' : 'none'
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send Button */}
        <button 
          type="submit"
          className="btn-accent"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
