import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { resendVerificationEmail } from '../services/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }

    fetch(`${API_BASE_URL}/auth/verify/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.message?.toLowerCase().includes('success') || data.message?.toLowerCase().includes('verified')) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => navigate('/signin'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch(() => { setStatus('error'); setMessage('Network error. Please try again.'); });
  }, []); // eslint-disable-line

  const handleResend = async (e) => {
    e.preventDefault();
    try {
      const data = await resendVerificationEmail(resendEmail);
      setResendMsg(data.message || 'Verification email sent!');
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Verifying your email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#2e7d32' }}>Email Verified!</h2>
            <p style={{ color: '#555' }}>{message}</p>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Redirecting to sign in...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#c62828' }}>Verification Failed</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem' }}>{message}</p>

            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Resend verification email:</p>
            <form onSubmit={handleResend} style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={e => setResendEmail(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.95rem' }}
              />
              <button type="submit"
                style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>
                Resend Email
              </button>
            </form>
            {resendMsg && <p style={{ color: '#2e7d32', marginTop: '0.75rem', fontSize: '0.9rem' }}>{resendMsg}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
