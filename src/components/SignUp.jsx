import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocationSelector from './LocationSelector';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    whatsapp: '',
    farmName: '',
    farmAddress: '',
    farmLocation: { country: '', state: '', district: '', city: '', postcode: '' },
    farmProducts: '',
    businessName: '',
    businessType: '',
    deliveryArea: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Prepare user data based on role
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        whatsapp: formData.whatsapp
      };
      
      // Add role-specific fields
      if (formData.role === 'farmer') {
        userData.roleSpecificData = {
          farmName: formData.farmName,
          farmAddress: formData.farmAddress,
          farmLocation: {
            country: formData.farmLocation.country,
            state: formData.farmLocation.state,
            district: formData.farmLocation.district,
            city: formData.farmLocation.city,
            postalCode: formData.farmLocation.postcode
          },
          // Keep a flat string for backward compatibility/search
          farmLocationText: [
            formData.farmLocation.city,
            formData.farmLocation.state,
            formData.farmLocation.country
          ].filter(Boolean).join(', '),
          farmProducts: formData.farmProducts
        };
      } else if (formData.role === 'admin') {
        userData.roleSpecificData = {
          businessName: formData.businessName,
          businessType: formData.businessType
        };
      } else if (formData.role === 'customer') {
        userData.roleSpecificData = {
          deliveryArea: formData.deliveryArea
        };
      }
      
      const user = await register(userData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render role-specific fields
  const renderRoleFields = () => {
    switch(formData.role) {
      case 'farmer':
        return (
          <>
            <div className="form-group">
              <label htmlFor="farmName">Farm Name</label>
              <input
                type="text"
                id="farmName"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                placeholder="Enter your farm name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="farmAddress">Farm Address (optional)</label>
              <input
                type="text"
                id="farmAddress"
                name="farmAddress"
                value={formData.farmAddress}
                onChange={handleChange}
                placeholder="House/Street/Village"
              />
            </div>

            <LocationSelector
              value={formData.farmLocation}
              onChange={(loc) => setFormData(prev => ({ ...prev, farmLocation: loc }))}
              autoDetect={true}
              requireDistrict={true}
            />

            <div className="form-group">
              <label htmlFor="farmProducts">Products You Grow</label>
              <textarea
                id="farmProducts"
                name="farmProducts"
                value={formData.farmProducts}
                onChange={handleChange}
                placeholder="List the products you grow"
                required
              />
            </div>
          </>
        );
      case 'admin':
        return (
          <>
            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter your business name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="businessType">Business Type</label>
              <input
                type="text"
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                placeholder="Enter your business type"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create an Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">I am a:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="customer">Customer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="whatsapp">WhatsApp Number <span style={{color:'#888',fontWeight:'normal'}}>(for order updates)</span></label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          
          {/* Render role-specific fields */}
          {renderRoleFields()}
          
          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
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