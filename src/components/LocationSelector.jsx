import React, { useEffect, useMemo, useState } from 'react';
import './LocationSelector.css';
import { getCurrentPosition, reverseGeocode } from '../services/locationService';

// Simplified LocationSelector: no country dropdowns. Auto-detect only, with light manual correction.
const LocationSelector = ({ value, onChange, autoDetect = true, requireDistrict = true }) => {
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [error, setError] = useState('');

  const current = useMemo(() => ({
    country: value?.country || '',
    state: value?.state || '',
    district: value?.district || '',
    city: value?.city || '',
    postcode: value?.postcode || ''
  }), [value]);

  const detect = async () => {
    try {
      setError('');
      setLoadingGeo(true);
      const coords = await getCurrentPosition();
      const info = await reverseGeocode(coords);
      onChange?.({
        country: info.country || '',
        state: info.state || '',
        district: info.district || '',
        city: info.city || '',
        postcode: info.postcode || ''
      });
    } catch (e) {
      setError('Unable to detect location. Please allow location access or fill manually.');
    } finally {
      setLoadingGeo(false);
    }
  };

  useEffect(() => {
    if (!autoDetect) return;
    // Only auto-detect if fields are empty to avoid overriding user-entered values
    if (current.state || current.city || current.postcode) return;
    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetect]);

  const handleField = (field, val) => {
    onChange?.({ ...current, [field]: val });
  };

  const isIndia = (current.country || '').toLowerCase() === 'india';

  return (
    <div className="location-selector">
      <div className="detect-row">
        <button type="button" className="btn btn-secondary" onClick={detect} disabled={loadingGeo}>
          {loadingGeo ? 'Detecting location…' : 'Use my current location'}
        </button>
        {error && <div className="error" style={{ marginLeft: '0.75rem' }}>{error}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input type="text" value={current.city} onChange={(e) => handleField('city', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>State</label>
          <input type="text" value={current.state} onChange={(e) => handleField('state', e.target.value)} required />
        </div>
      </div>

      {requireDistrict && isIndia && (
        <div className="form-row">
          <div className="form-group">
            <label>District</label>
            <input type="text" value={current.district} onChange={(e) => handleField('district', e.target.value)} />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Postal Code</label>
          <input type="text" value={current.postcode} onChange={(e) => handleField('postcode', e.target.value)} required />
        </div>
      </div>

      {current.country && (
        <div className="hint">Detected country: {current.country}</div>
      )}
    </div>
  );
};

export default LocationSelector;
