import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import LocationSelector from './LocationSelector';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    farmName: '',
    farmAddress: '',
    farmLocation: { country: '', state: '', district: '', city: '', postcode: '' },
    farmProducts: '',
    deliveryArea: ''
  });

  const [coords, setCoords]     = useState(null);
  const [locStatus, setLocStatus] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
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

    try {
      setError('');
      setLoading(true);

      const userData = {
        name:  formData.name,
        email: formData.email,
        password: formData.password,
        role:  formData.role,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {})
      };

      if (formData.role === 'farmer') {
        userData.roleSpecificData = {
          farmName:    formData.farmName,
          farmAddress: formData.farmAddress,
          farmLocation: {
            country:    formData.farmLocation.country,
            state:      formData.farmLocation.state,
            district:   formData.farmLocation.district,
            city:       formData.farmLocation.city,
            postalCode: formData.farmLocation.postcode
          },
          farmLocationText: [
            formData.farmLocation.city,
            formData.farmLocation.state,
            formData.farmLocation.country
          ].filter(Boolean).join(', '),
          farmProducts: formData.farmProducts
        };
      } else {
        userData.roleSpecificData = { deliveryArea: formData.deliveryArea };
      }

      const result = await registerUser(userData);
      // Redirect to OTP verification page with email
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      const msg = err.message || 'Failed to create an account. Please try again.';
      setError(msg);
      // If email already exists, offer to sign in
      if (msg.toLowerCase().includes('already exists')) {
        setAlreadyExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (formData.role === 'farmer') return (
      <>
        <div className="form-group">
          <label htmlFor="farmName">Farm Name</label>
          <input type="text" id="farmName" name="farmName" value={formData.farmName}
            onChange={handleChange} placeholder="Enter your farm name" required />
        </div>

        <div className="form-group">
          <label htmlFor="farmAddress">Farm Address (optional)</label>
          <input type="text" id="farmAddress" name="farmAddress" value={formData.farmAddress}
            onChange={handleChange} placeholder="House/Street/Village" />
        </div>

        <div className="form-group">
          <label>Farm GPS Location</label>
          <button type="button" className="signup-button"
            style={{ background: coords ? '#388e3c' : '#1976d2', marginBottom: '6px' }}
            onClick={() => {
              setLocStatus('Detecting...');
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  setLocStatus(`✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                },
                () => setLocStatus('❌ Permission denied'),
                { timeout: 8000 }
              );
            }}>
            📍 {coords ? 'Re-capture Location' : 'Capture My Farm Location'}
          </button>
          {locStatus && <small style={{ color: coords ? '#2e7d32' : '#c62828' }}>{locStatus}</small>}
        </div>

        <LocationSelector
          value={formData.farmLocation}
          onChange={(loc) => setFormData(prev => ({ ...prev, farmLocation: loc }))}
          autoDetect={true}
          requireDistrict={true}
        />

        <div className="form-group">
          <label htmlFor="farmProducts">Products You Grow</label>
          <textarea id="farmProducts" name="farmProducts" value={formData.farmProducts}
            onChange={handleChange} placeholder="List the products you grow" required />
        </div>
      </>
    );
    return null;
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ color: '#2e7d32' }}>Check Your Email!</h2>
          <p style={{ color: '#555', lineHeight: 1.6 }}>{success}</p>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create an Account</h2>
        {error && (
          <div className="error-message">
            {error}
            {alreadyExists && (
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <a href="/signin" style={{ color: '#1565c0', fontWeight: 600 }}>Sign in here</a>
                {' '}or{' '}
                <button
                  type="button"
                  onClick={() => navigate('/verify-otp', { state: { email: formData.email } })}
                  style={{ background: 'none', border: 'none', color: '#2e7d32', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: '0.9rem', padding: 0 }}>
                  Verify your email
                </button>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">I am a:</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="customer">Customer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" value={formData.name}
              onChange={handleChange} placeholder="Enter your full name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="Create a password (min 6 chars)" required />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirm your password" required />
          </div>

          {renderRoleFields()}

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
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
