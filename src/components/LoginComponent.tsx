import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Shield, Mail, Lock, User, Phone, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const LoginComponent: React.FC = () => {
  const { loginUser, registerUser, loginError, registerError, clearAuthErrors } = useEmergency();
  const [isLogin, setIsLogin] = useState(true);
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearAuthErrors();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    if (isLogin) {
      const success = await loginUser(email, password);
      if (success) {
        // Logged in successfully!
      }
    } else {
      if (!name.trim() || !phone.trim()) {
        setLoading(false);
        return;
      }
      const success = await registerUser(name, email, password, phone);
      if (success) {
        // Toggle to login after registration success
        setIsLogin(true);
        clearAuthErrors();
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', padding: '20px' }}>
      <div className="glass-panel glow-info" style={{ width: '100%', maxWidth: '420px', padding: '30px', position: 'relative' }}>
        
        {/* Shield Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '25px', textAlign: 'center' }}>
          <div className="flex-center pulse-sos-btn" style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-info), #0056b3)',
            boxShadow: '0 0 20px var(--color-info-glow)'
          }}>
            <Shield size={30} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>SafeConnect Gate</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isLogin ? 'Sign in to access emergency tracking & services' : 'Create an emergency responder account'}
            </p>
          </div>
        </div>

        {/* Error Banners */}
        {((isLogin && loginError) || (!isLogin && registerError)) && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 71, 87, 0.08)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: '8px',
            color: 'var(--color-emergency)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{isLogin ? loginError : registerError}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            {!isLogin && (
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '5px', paddingLeft: '2px' }}>
                💡 Use <span style={{ color: '#a29bfe', fontWeight: 'bold' }}>@safeconnect.gov</span> email to register as an Authority/Dispatcher.
              </p>
            )}
          </div>

          {/* Phone Field (Register Only) */}
          {!isLogin && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PHONE NUMBER</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-accent"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Processing...' : isLogin ? 'Access Citizen Panel' : 'Register Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={handleToggleMode}
            style={{
              color: 'var(--color-info)',
              cursor: 'pointer',
              fontWeight: 'bold',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </span>
        </div>

      </div>
    </div>
  );
};
