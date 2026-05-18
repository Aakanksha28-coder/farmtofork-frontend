import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import './VerifyOtp.css';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const phone = location.state?.phone || '';

  const [digits, setDigits]       = useState(['', '', '', '', '', '']);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const inputRefs = useRef([]);

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
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
      const data = await verifyOtp(phone, otp);
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
      await resendOtp(phone);
      setResendMsg('New OTP sent to your mobile!');
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend OTP.');
    }
  };

  if (!phone) {
    return (
      <div className="otp-page">
        <div className="otp-card">
          <p>No phone number found. Please <a href="/signup">sign up</a> again.</p>
        </div>
      </div>
    );
  }

  const masked = phone.replace(/\D/g, '').slice(-10);
  const display = masked.slice(0, 2) + 'XXXXXX' + masked.slice(-2);

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-icon">📱</div>
        <h2>Verify Your Mobile</h2>
        <p className="otp-sub">
          We sent a 6-digit OTP to<br/>
          <strong>+91 {display}</strong>
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
          <button className="otp-resend-btn" onClick={handleResend}>
            Didn't receive it? Resend OTP
          </button>
          {resendMsg && <p className="otp-resend-msg">{resendMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
