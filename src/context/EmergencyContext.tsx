import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Location {
  x: number; // SVG coordinate x (0-1000)
  y: number; // SVG coordinate y (0-600)
  address: string;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
}

export interface ContactLog {
  id: string;
  contactName: string;
  channel: 'SMS' | 'Email';
  status: 'sending' | 'sent' | 'failed';
  message: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  type: 'crime' | 'fire' | 'medical' | 'hazard';
  description: string;
  location: Location;
  isAnonymous: boolean;
  reporterName?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'resolved';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  voiceTranscription?: string;
  timestamp: string;
  updates: Array<{ status: string; note: string; time: string }>;
}

export interface Responder {
  id: string;
  incidentId: string;
  type: 'police' | 'fire' | 'ambulance';
  location: { x: number; y: number };
  targetLocation: { x: number; y: number };
  status: 'moving' | 'arrived';
  speed: number;
}

export interface DisasterAlert {
  id: string;
  type: 'flood' | 'earthquake' | 'storm' | 'general';
  title: string;
  message: string;
  severity: 'critical' | 'warning';
  timestamp: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  cardType?: 'first_aid' | 'fire_safety' | 'crime_report' | 'cardiac_arrest';
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'fire_station' | 'ambulance';
  location: { x: number; y: number };
  phone: string;
  status: 'active' | 'busy';
}

interface EmergencyContextType {
  role: 'citizen' | 'authority';
  setRole: (role: 'citizen' | 'authority') => void;
  activeCitizenTab: string;
  setActiveCitizenTab: (tab: string) => void;
  
  // SOS State
  activeSos: {
    id: string;
    location: Location;
    timestamp: string;
    status: 'pending' | 'dispatched' | 'arrived' | 'resolved';
  } | null;
  triggerSos: () => void;
  cancelSos: () => void;
  resolveSos: () => void;
  
  // Incidents
  incidents: Incident[];
  reportIncident: (
    type: Incident['type'],
    description: string,
    address: string,
    isAnonymous: boolean,
    reporterName?: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    voiceTranscription?: string
  ) => void;
  updateIncidentStatus: (id: string, status: Incident['status'], note: string) => void;
  
  // Responders
  responders: Responder[];
  dispatchResponder: (incidentId: string, type: Responder['type'], startX: number, startY: number, targetX: number, targetY: number) => void;
  
  // Disaster Alerts
  disasterAlerts: DisasterAlert[];
  broadcastDisaster: (title: string, message: string, severity: 'critical' | 'warning', type: DisasterAlert['type']) => void;
  dismissDisaster: (id: string) => void;
  
  // Settings & Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  deleteContact: (id: string) => void;
  contactLogs: ContactLog[];
  clearContactLogs: () => void;
  
  // Chatbot
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  triggerPresetChatCard: (cardType: ChatMessage['cardType']) => void;
  
  // static/service positions
  services: EmergencyService[];
  userLocation: Location;
  setUserLocation: (loc: Location) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

// Initial Services list
const defaultServices: EmergencyService[] = [
  { id: 's1', name: 'Downtown Police Precinct', type: 'police', location: { x: 500, y: 300 }, phone: '911 (Ext. 101)', status: 'active' },
  { id: 's2', name: 'Metro General Hospital', type: 'hospital', location: { x: 200, y: 150 }, phone: '911 (Ext. 102)', status: 'active' },
  { id: 's3', name: 'Central Fire Station #4', type: 'fire_station', location: { x: 800, y: 200 }, phone: '911 (Ext. 103)', status: 'active' },
  { id: 's4', name: 'Ambulance Depot West', type: 'ambulance', location: { x: 450, y: 480 }, phone: '911 (Ext. 104)', status: 'active' },
];

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'citizen' | 'authority'>('citizen');
  const [activeCitizenTab, setActiveCitizenTab] = useState<string>('sos');
  const [activeSos, setActiveSos] = useState<EmergencyContextType['activeSos']>(null);
  
  // Initial Mock Incidents
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'inc-1',
      type: 'fire',
      description: 'Minor electrical fire detected in server room. Small flames present.',
      location: { x: 820, y: 240, address: '88 Tech Boulevard, Sector 2' },
      isAnonymous: false,
      reporterName: 'John Doe',
      status: 'in_progress',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      updates: [
        { status: 'pending', note: 'Incident logged', time: new Date(Date.now() - 45 * 60000).toLocaleTimeString() },
        { status: 'accepted', note: 'Fire responders dispatched from Station #4', time: new Date(Date.now() - 42 * 60000).toLocaleTimeString() }
      ]
    },
    {
      id: 'inc-2',
      type: 'crime',
      description: 'Anonymous report of suspicious activity near storage locker units.',
      location: { x: 250, y: 380, address: '404 Industrial Way, Sector 1' },
      isAnonymous: true,
      status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      updates: [
        { status: 'pending', note: 'Incident reported anonymously', time: new Date(Date.now() - 10 * 60000).toLocaleTimeString() }
      ]
    }
  ]);
  
  const [responders, setResponders] = useState<Responder[]>([]);
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([
    {
      id: 'dis-1',
      type: 'storm',
      title: 'High Wind Advisory',
      message: 'Severe storm warning. Strong wind gusts up to 55mph expected. Secure outdoor objects.',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      active: true
    }
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'c-1', name: 'Sarah Jenkins (Spouse)', relation: 'Spouse', phone: '+1 (555) 019-2834', email: 'sarah.j@example.com' },
    { id: 'c-2', name: 'Robert Chen (Father)', relation: 'Father', phone: '+1 (555) 014-9988', email: 'r.chen@example.com' }
  ]);

  const [contactLogs, setContactLogs] = useState<ContactLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'chat-1', sender: 'ai', text: 'Hello! I am your AI Emergency Assistant. I can guide you through first aid, fire safety, or help report incidents. Click a template or write/speak to start.', timestamp: new Date().toLocaleTimeString() }
  ]);

  // Default User location (near the city center)
  const [userLocation, setUserLocation] = useState<Location>({
    x: 520,
    y: 220,
    address: '520 Main Street, Sector 3 (Downtown)'
  });

  const responderInterval = useRef<any>(null);

  // Track responders live movement simulation
  useEffect(() => {
    if (responders.length > 0) {
      if (!responderInterval.current) {
        responderInterval.current = setInterval(() => {
          setResponders((prevResponders) => {
            let activeCount = 0;
            const updated = prevResponders.map((resp) => {
              if (resp.status === 'arrived') return resp;
              
              activeCount++;
              const dx = resp.targetLocation.x - resp.location.x;
              const dy = resp.targetLocation.y - resp.location.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance <= resp.speed) {
                // Arrived at target
                // Also update incident/SOS status if matching
                setTimeout(() => {
                  setIncidents(prevIncidents => 
                    prevIncidents.map(inc => inc.id === resp.incidentId ? {
                      ...inc,
                      status: 'in_progress',
                      updates: [...inc.updates, { status: 'in_progress', note: `${resp.type.toUpperCase()} unit arrived on scene.`, time: new Date().toLocaleTimeString() }]
                    } : inc)
                  );
                  if (activeSos && activeSos.id === resp.incidentId) {
                    setActiveSos(prev => prev ? { ...prev, status: 'arrived' } : null);
                  }
                }, 0);
                
                return {
                  ...resp,
                  location: resp.targetLocation,
                  status: 'arrived' as const
                };
              } else {
                // Move towards target
                const ratio = resp.speed / distance;
                return {
                  ...resp,
                  location: {
                    x: resp.location.x + dx * ratio,
                    y: resp.location.y + dy * ratio
                  }
                };
              }
            });
            
            if (activeCount === 0 && responderInterval.current) {
              clearInterval(responderInterval.current);
              responderInterval.current = null;
            }
            return updated;
          });
        }, 1000);
      }
    }
    return () => {
      // Don't clear in cleanup unless component unmounts
    };
  }, [responders, activeSos]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (responderInterval.current) clearInterval(responderInterval.current);
    };
  }, []);

  // Trigger SOS alert
  const triggerSos = () => {
    const newSosId = `sos-${Date.now()}`;
    const newSos: EmergencyContextType['activeSos'] = {
      id: newSosId,
      location: userLocation,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to incidents queue so dispatchers see it instantly
    const newIncident: Incident = {
      id: newSosId,
      type: 'medical', // default to medical for general SOS
      description: 'ONE-TAP SOS ALERT ACTIVATED! Live GPS Tracking Active. Immediate assistance required.',
      location: userLocation,
      isAnonymous: false,
      reporterName: 'Emergency User',
      status: 'pending',
      timestamp: newSos.timestamp,
      updates: [{ status: 'pending', note: 'SOS alert broadcasted to all services', time: new Date().toLocaleTimeString() }]
    };

    setActiveSos(newSos);
    setIncidents((prev) => [newIncident, ...prev]);

    // Send notifications to emergency contacts (simulated)
    const logs: ContactLog[] = [];
    contacts.forEach((contact) => {
      const smsMsg = `ALERT: ${contact.name}, your contact has triggered a SafeConnect SOS! Live location: ${userLocation.address}. Dispatchers are responding.`;
      const emailMsg = `Dear ${contact.name},\n\nThis is an automated emergency alert from SafeConnect.\n\nYour contact has activated their One-Tap SOS emergency alert at ${new Date().toLocaleTimeString()}.\n\nLocation Details: ${userLocation.address}\nGPS SVG Coordinates: (${userLocation.x.toFixed(0)}, ${userLocation.y.toFixed(0)})\n\nEmergency dispatchers have been notified.`;
      
      logs.push({
        id: `log-${Date.now()}-sms-${contact.id}`,
        contactName: contact.name,
        channel: 'SMS',
        status: 'sending',
        message: smsMsg,
        timestamp: new Date().toLocaleTimeString()
      });
      logs.push({
        id: `log-${Date.now()}-email-${contact.id}`,
        contactName: contact.name,
        channel: 'Email',
        status: 'sending',
        message: emailMsg,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    setContactLogs(logs);

    // Simulate SMS/Email delivery network lag
    setTimeout(() => {
      setContactLogs(prevLogs => 
        prevLogs.map(log => ({
          ...log,
          status: Math.random() > 0.05 ? 'sent' : 'failed' // 95% success rate simulation
        }))
      );
    }, 2000);
  };

  const cancelSos = () => {
    if (activeSos) {
      // Resolve the incident log
      setIncidents((prev) => 
        prev.map(inc => inc.id === activeSos.id ? {
          ...inc,
          status: 'resolved',
          updates: [...inc.updates, { status: 'resolved', note: 'SOS canceled by User.', time: new Date().toLocaleTimeString() }]
        } : inc)
      );
      
      // Update responder list for this incident
      setResponders(prev => prev.filter(r => r.incidentId !== activeSos.id));
      setActiveSos(null);
    }
  };

  const resolveSos = () => {
    if (activeSos) {
      setIncidents((prev) => 
        prev.map(inc => inc.id === activeSos.id ? {
          ...inc,
          status: 'resolved',
          updates: [...inc.updates, { status: 'resolved', note: 'SOS resolved by authorities.', time: new Date().toLocaleTimeString() }]
        } : inc)
      );
      setResponders(prev => prev.filter(r => r.incidentId !== activeSos.id));
      setActiveSos(null);
    }
  };

  // Report an Incident
  const reportIncident = (
    type: Incident['type'],
    description: string,
    address: string,
    isAnonymous: boolean,
    reporterName?: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    voiceTranscription?: string
  ) => {
    // Generate incident coordinate randomly offset near user location
    const offsetAngle = Math.random() * Math.PI * 2;
    const offsetDist = Math.random() * 80 + 30; // offset slightly
    const newX = Math.min(Math.max(userLocation.x + Math.cos(offsetAngle) * offsetDist, 50), 950);
    const newY = Math.min(Math.max(userLocation.y + Math.sin(offsetAngle) * offsetDist, 50), 550);

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      type,
      description,
      location: {
        x: Math.round(newX),
        y: Math.round(newY),
        address: address || `Sector ${Math.floor(newX / 250) + 1}, City Grid`
      },
      isAnonymous,
      reporterName: isAnonymous ? undefined : (reporterName || 'Citizen User'),
      status: 'pending',
      mediaUrl,
      mediaType,
      voiceTranscription,
      timestamp: new Date().toISOString(),
      updates: [{ status: 'pending', note: 'Incident logged in dispatcher queue', time: new Date().toLocaleTimeString() }]
    };

    setIncidents(prev => [newIncident, ...prev]);
  };

  // Update status of incident
  const updateIncidentStatus = (id: string, status: Incident['status'], note: string) => {
    setIncidents(prev => 
      prev.map(inc => {
        if (inc.id === id) {
          const updatedInc = {
            ...inc,
            status,
            updates: [...inc.updates, { status, note, time: new Date().toLocaleTimeString() }]
          };
          if (activeSos && activeSos.id === id) {
            setActiveSos(prevSos => prevSos ? { ...prevSos, status: status as any } : null);
          }
          return updatedInc;
        }
        return inc;
      })
    );
  };

  // Dispatch responder unit
  const dispatchResponder = (
    incidentId: string,
    type: Responder['type'],
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ) => {
    const newResponder: Responder = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      incidentId,
      type,
      location: { x: startX, y: startY },
      targetLocation: { x: targetX, y: targetY },
      status: 'moving',
      speed: 25 // movement step size (approx 15 seconds to travel 350+px)
    };

    setResponders((prev) => [...prev, newResponder]);
    updateIncidentStatus(incidentId, 'accepted', `Emergency ${type} unit dispatched from station.`);
  };

  // Broadcast disaster warning from authority dashboard
  const broadcastDisaster = (title: string, message: string, severity: 'critical' | 'warning', type: DisasterAlert['type']) => {
    const newAlert: DisasterAlert = {
      id: `dis-${Date.now()}`,
      type,
      title,
      message,
      severity,
      timestamp: new Date().toISOString(),
      active: true
    };
    setDisasterAlerts(prev => [newAlert, ...prev]);
  };

  const dismissDisaster = (id: string) => {
    setDisasterAlerts(prev => 
      prev.map(a => a.id === id ? { ...a, active: false } : a)
    );
  };

  // Contacts
  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = {
      ...contact,
      id: `c-${Date.now()}`
    };
    setContacts(prev => [...prev, newContact]);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const clearContactLogs = () => {
    setContactLogs([]);
  };

  // AI Chatbot Logic with rich guides
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Simulated AI response based on query keywords
    setTimeout(() => {
      const cleanText = text.toLowerCase();
      let aiText = '';
      let cardType: ChatMessage['cardType'] = undefined;

      if (cleanText.includes('first aid') || cleanText.includes('wound') || cleanText.includes('bleed') || cleanText.includes('cpr')) {
        aiText = 'I have loaded the interactive emergency First Aid instruction guide. Please follow these critical steps immediately:';
        cardType = 'first_aid';
      } else if (cleanText.includes('heart') || cleanText.includes('cardiac') || cleanText.includes('chest pain') || cleanText.includes('heart attack')) {
        aiText = 'WARNING: Possible cardiac arrest emergency. Direct instructions loaded. Ensure emergency services are being called!';
        cardType = 'cardiac_arrest';
      } else if (cleanText.includes('fire') || cleanText.includes('smoke') || cleanText.includes('burn')) {
        aiText = 'I have loaded the emergency Fire Safety & evacuation instructions. Please check these details:';
        cardType = 'fire_safety';
      } else if (cleanText.includes('crime') || cleanText.includes('rob') || cleanText.includes('assault') || cleanText.includes('theft')) {
        aiText = 'I can assist you in preparing a crime report. Here are the essential pieces of information authorities will require:';
        cardType = 'crime_report';
      } else {
        // generic response
        aiText = "I'm processing your request. If this is a life-threatening situation, please trigger the SOS button immediately. If you need step-by-step help, you can ask about: 'First Aid steps', 'Fire safety instructions', 'Cardiac Arrest help', or how to 'Report a crime'. How can I help you right now?";
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiText,
        cardType,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const triggerPresetChatCard = (cardType: ChatMessage['cardType']) => {
    let presetUserText = '';
    let responseText = '';
    
    switch (cardType) {
      case 'first_aid':
        presetUserText = 'How do I perform basic first aid for severe bleeding?';
        responseText = 'I have loaded the interactive emergency First Aid instruction guide. Please follow these critical steps immediately:';
        break;
      case 'cardiac_arrest':
        presetUserText = 'What should I do if someone collapses from Cardiac Arrest?';
        responseText = 'CRITICAL ALERT: Cardiac arrest sequence initiated. Follow these CPR steps immediately:';
        break;
      case 'fire_safety':
        presetUserText = 'What are the fire safety evacuation guidelines?';
        responseText = 'I have loaded the emergency Fire Safety & evacuation instructions. Please check these details:';
        break;
      case 'crime_report':
        presetUserText = 'How do I report a crime and what details are needed?';
        responseText = 'I can assist you in preparing a crime report. Here are the essential pieces of information authorities will require:';
        break;
      default:
        return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: presetUserText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: responseText,
        cardType,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <EmergencyContext.Provider
      value={{
        role,
        setRole,
        activeCitizenTab,
        setActiveCitizenTab,
        activeSos,
        triggerSos,
        cancelSos,
        resolveSos,
        incidents,
        reportIncident,
        updateIncidentStatus,
        responders,
        dispatchResponder,
        disasterAlerts,
        broadcastDisaster,
        dismissDisaster,
        contacts,
        addContact,
        deleteContact,
        contactLogs,
        clearContactLogs,
        chatMessages,
        sendChatMessage,
        triggerPresetChatCard,
        services: defaultServices,
        userLocation,
        setUserLocation
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
