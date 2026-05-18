import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState('');
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter both email and password');
    try {
      setError('');
      setNeedsVerify(false);
      setLoading(true);
      const result = await login(email, password);
      if (result?.needsVerification) {
        navigate('/verify-otp', { state: { phone: result.phone } });
        return;
      }
      navigate('/');
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify')) {
        setNeedsVerify(true);
      }
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Sign In</h2>
        {error && (
          <div className="error-message">
            {error}
            {needsVerify && (
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                <button onClick={() => navigate('/verify-otp')}
                  style={{ background: 'none', border: 'none', color: '#2e7d32', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: '0.9rem', padding: 0 }}>
                  Verify your mobile number
                </button>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required />
          </div>
          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="signin-footer">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;