import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type LoginRole = 'user' | 'admin';

const LoginPage: React.FC = () => {
  const [loginRole, setLoginRole] = useState<LoginRole>('user');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // Client-side password confirmation check
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }
        // Registration always creates a USER account
        await register(fullName, email, password, confirmPassword);
        navigate('/booking');
      } else {
        const userData = await login(email, password);
        // Verify the actual role matches the selected login type
        const actualRole = userData.role; // 'ROLE_ADMIN' or 'ROLE_USER'
        if (loginRole === 'admin') {
          if (actualRole !== 'ROLE_ADMIN') {
            setError('This account does not have administrator access. Please select User Login.');
            return;
          }
          navigate('/admin');
        } else {
          if (actualRole === 'ROLE_ADMIN') {
            // Admin logging in as user – still works but redirect to admin
            navigate('/admin');
          } else {
            navigate('/booking');
          }
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const spaGold = '#9b8578';
  const spaLight = '#c9a287';

  return (
    <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', backgroundColor: '#f9f7f4' }}>
      <div className="container" style={{ width: '100%', maxWidth: '520px' }}>
        <h1 className="section-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="section-subtitle">
          {isRegister
            ? 'Begin your journey with Serenity Spa'
            : 'Sign in to manage your appointments & wellness treatments'}
        </p>

        {/* Role selector – only shown for login, not registration */}
        {!isRegister && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            background: 'white',
            borderRadius: '5px',
            padding: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            {(['user', 'admin'] as LoginRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => { setLoginRole(role); setError(null); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                  backgroundColor: loginRole === role ? spaGold : 'transparent',
                  color: loginRole === role ? 'white' : spaGold,
                }}
              >
                {role === 'user' ? '👤  User Login' : '🔐  Admin Login'}
              </button>
            ))}
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '5px', boxShadow: '0 5px 20px rgba(0,0,0,0.06)' }}>
          {error && (
            <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#fde8e8', color: '#c53030', borderRadius: '4px', fontSize: '15px' }}>
              {error}
            </div>
          )}

          {!isRegister && (
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px', textAlign: 'center', fontStyle: 'italic' }}>
              {loginRole === 'admin'
                ? '🔐 Admin credentials required — for spa owners only'
                : '👤 Enter your customer account details below'}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: spaGold, fontWeight: 500, fontSize: '16px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: spaGold, fontWeight: 500, fontSize: '16px' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: spaGold, fontWeight: 500, fontSize: '16px' }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>

            {isRegister && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: spaGold, fontWeight: 500, fontSize: '16px' }}>Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn"
              style={{ width: '100%', backgroundColor: spaGold, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Processing...' : isRegister ? 'Register' : loginRole === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '15px', color: '#777' }}>
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: spaLight, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: spaLight, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Create one here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
