import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import LocationSelector from './LocationSelector';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: 'customer', farmName: '', farmAddress: '',
    farmLocation: { country: '', state: '', district: '', city: '', postcode: '' },
    farmProducts: '', deliveryArea: ''
  });

  const [coords, setCoords]         = useState(null);
  const [locStatus, setLocStatus]   = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') setAlreadyExists(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match');
    if (formData.password.length < 6)
      return setError('Password must be at least 6 characters');
    if (!formData.phone || formData.phone.replace(/\D/g,'').length < 10)
      return setError('Please enter a valid 10-digit mobile number');

    try {
      setError('');
      setLoading(true);

      const userData = {
        name: formData.name, email: formData.email,
        phone: formData.phone, password: formData.password,
        role: formData.role,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {})
      };

      if (formData.role === 'farmer') {
        userData.roleSpecificData = {
          farmName: formData.farmName, farmAddress: formData.farmAddress,
          farmLocation: {
            country: formData.farmLocation.country, state: formData.farmLocation.state,
            district: formData.farmLocation.district, city: formData.farmLocation.city,
            postalCode: formData.farmLocation.postcode
          },
          farmLocationText: [formData.farmLocation.city, formData.farmLocation.state, formData.farmLocation.country].filter(Boolean).join(', '),
          farmProducts: formData.farmProducts
        };
      } else {
        userData.roleSpecificData = { deliveryArea: formData.deliveryArea };
      }

      await registerUser(userData);
      navigate('/verify-otp', { state: { phone: formData.phone } });
    } catch (err) {
      const msg = err.message || 'Failed to create account. Please try again.';
      setError(msg);
      if (msg.toLowerCase().includes('already exists')) setAlreadyExists(true);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (formData.role !== 'farmer') return null;
    return (
      <>
        <div className="form-group">
          <label>Farm Name</label>
          <input name="farmName" value={formData.farmName} onChange={handleChange} placeholder="Your farm name" required />
        </div>
        <div className="form-group">
          <label>Farm Address (optional)</label>
          <input name="farmAddress" value={formData.farmAddress} onChange={handleChange} placeholder="House/Street/Village" />
        </div>
        <div className="form-group">
          <label>Farm GPS Location</label>
          <button type="button" className="signup-button"
            style={{ background: coords ? '#388e3c' : '#1976d2', marginBottom: '6px' }}
            onClick={() => {
              setLocStatus('Detecting...');
              navigator.geolocation.getCurrentPosition(
                (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus(`✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`); },
                () => setLocStatus('❌ Permission denied'), { timeout: 8000 }
              );
            }}>
            📍 {coords ? 'Re-capture' : 'Capture My Farm Location'}
          </button>
          {locStatus && <small style={{ color: coords ? '#2e7d32' : '#c62828' }}>{locStatus}</small>}
        </div>
        <LocationSelector value={formData.farmLocation}
          onChange={(loc) => setFormData(prev => ({ ...prev, farmLocation: loc }))}
          autoDetect={true} requireDistrict={true} />
        <div className="form-group">
          <label>Products You Grow</label>
          <textarea name="farmProducts" value={formData.farmProducts} onChange={handleChange} placeholder="e.g. Tomatoes, Onions, Rice" required />
        </div>
      </>
    );
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create an Account</h2>
        {error && (
          <div className="error-message">
            {error}
            {alreadyExists && (
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                <a href="/signin" style={{ color: '#1565c0', fontWeight: 600 }}>Sign in here</a>
                {' or '}
                <button type="button" onClick={() => navigate('/verify-otp', { state: { phone: formData.phone } })}
                  style={{ background: 'none', border: 'none', color: '#2e7d32', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: '0.9rem', padding: 0 }}>
                  Verify your number
                </button>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I am a:</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="customer">Customer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Mobile Number <span style={{ color: '#4CAF50', fontSize: '0.8rem' }}>(OTP will be sent here)</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="10-digit mobile number" maxLength={10} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
          </div>
          {renderRoleFields()}
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up & Get OTP'}
          </button>
        </form>
        <div className="signup-footer">
          <p>Already have an account? <a href="/signin">Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
