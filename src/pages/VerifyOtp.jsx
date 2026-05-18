import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import './VerifyOtp.css';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  // Email passed via navigation state from SignUp
  const email = location.state?.email || '';

  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) return setError('Please enter the complete 6-digit OTP');

    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp(email, otp);
      if (data.user) setCurrentUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendMsg('');
      await resendOtp(email);
      setResendMsg('New OTP sent! Check your inbox.');
      setCountdown(60);
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend OTP.');
    }
  };

  if (!email) {
    return (
      <div className="otp-page">
        <div className="otp-card">
          <p>No email found. Please <a href="/signup">sign up</a> again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-icon">📧</div>
        <h2>Verify Your Email</h2>
        <p className="otp-sub">
          We sent a 6-digit code to<br/>
          <strong>{email}</strong>
        </p>

        {error && <div className="otp-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="otp-box"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button type="submit" className="otp-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="otp-resend">
          {countdown > 0 ? (
            <span>Resend OTP in {countdown}s</span>
          ) : (
            <button className="otp-resend-btn" onClick={handleResend}>
              Resend OTP
            </button>
          )}
          {resendMsg && <p className="otp-resend-msg">{resendMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
