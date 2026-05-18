import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { resendOtp } from '../services/authService';
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resendMsg, setResendMsg]     = useState('');
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
      // If backend says needs verification, go to OTP page
      if (result?.needsVerification) {
        navigate('/verify-otp', { state: { email } });
        return;
      }
      navigate('/');
    } catch (err) {
      if (err.message?.includes('verify') || err.message?.includes('verification')) {
        setNeedsVerify(true);
      }
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend.');
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
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={handleResend}
                  style={{ background: 'none', border: 'none', color: '#1565c0', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
                  Resend verification email
                </button>
                {resendMsg && <span style={{ marginLeft: '8px', color: '#2e7d32', fontSize: '0.85rem' }}>{resendMsg}</span>}
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