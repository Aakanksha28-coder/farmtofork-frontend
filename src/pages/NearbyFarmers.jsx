import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import './NearbyFarmers.css';

const RADII = [10, 20, 30, 40, 60, 100];

const NearbyFarmers = () => {
  const [farmers, setFarmers]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [coords, setCoords]       = useState(null);
  const [radius, setRadius]       = useState(40);
  const [locError, setLocError]   = useState('');
  const [detecting, setDetecting] = useState(false);

  const fetchNearby = useCallback(async (lat, lng, r) => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/farmers/nearby?lat=${lat}&lng=${lng}&radius=${r}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setFarmers(data.farmers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setDetecting(false);
        fetchNearby(c.lat, c.lng, radius);
      },
      () => {
        setLocError('Location permission denied. Please allow access to find nearby farmers.');
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  // Re-fetch when radius changes (if we already have coords)
  useEffect(() => {
    if (coords) fetchNearby(coords.lat, coords.lng, radius);
  }, [radius]); // eslint-disable-line

  const imgSrc = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80';
    return url.startsWith('http') || url.startsWith('data:') ? url : url;
  };

  return (
    <div className="nf-page container">
      <div className="nf-header">
        <h1>🌾 Farmers Near You</h1>
        <p>Find fresh produce from farmers within your area</p>
      </div>

      {/* Controls */}
      <div className="nf-controls">
        <button className="nf-detect-btn" onClick={detectLocation} disabled={detecting}>
          {detecting ? '📡 Detecting...' : '📍 Use My Location'}
        </button>

        <div className="nf-radius-group">
          <span>Radius:</span>
          {RADII.map(r => (
            <button
              key={r}
              className={`nf-radius-btn${radius === r ? ' active' : ''}`}
              onClick={() => setRadius(r)}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {locError && <div className="nf-error">⚠️ {locError}</div>}
      {error    && <div className="nf-error">❌ {error}</div>}

      {!coords && !loading && !locError && (
        <div className="nf-empty">
          <div className="nf-empty-icon">🗺️</div>
          <p>Click "Use My Location" to discover farmers near you</p>
        </div>
      )}

      {loading && (
        <div className="nf-loading">
          <div className="nf-spinner" />
          <p>Finding farmers within {radius} km...</p>
        </div>
      )}

      {!loading && coords && (
        <>
          <div className="nf-result-info">
            {farmers.length > 0
              ? `Found ${farmers.length} farmer${farmers.length > 1 ? 's' : ''} within ${radius} km`
              : `No farmers found within ${radius} km — try a larger radius`}
          </div>

          <div className="nf-grid">
            {farmers.map(f => (
              <div key={f._id} className="nf-card">
                <div className="nf-card-header">
                  <div className="nf-avatar">{(f.name || 'F')[0].toUpperCase()}</div>
                  <div>
                    <div className="nf-name">{f.name}</div>
                    {f.farmName && <div className="nf-farm">{f.farmName}</div>}
                    {f.farmLocation && (
                      <div className="nf-location">📍 {f.farmLocation}</div>
                    )}
                  </div>
                </div>

                {f.totalProducts > 0 && (
                  <div className="nf-products">
                    <div className="nf-products-label">
                      {f.totalProducts} product{f.totalProducts > 1 ? 's' : ''} available
                    </div>
                    <div className="nf-product-chips">
                      {f.products.map(p => (
                        <div key={p._id} className="nf-chip">
                          {p.imageUrl && (
                            <img src={imgSrc(p.imageUrl)} alt={p.name} className="nf-chip-img" />
                          )}
                          <span>{p.name}</span>
                          <span className="nf-chip-price">₹{p.price}/{p.unit}</span>
                        </div>
                      ))}
                      {f.totalProducts > 3 && (
                        <div className="nf-chip nf-chip-more">+{f.totalProducts - 3} more</div>
                      )}
                    </div>
                  </div>
                )}

                {f.whatsapp && (
                  <a
                    className="nf-whatsapp-btn"
                    href={`https://wa.me/91${f.whatsapp.replace(/\D/g,'')}?text=Hi%20${encodeURIComponent(f.name)}%2C%20I%20found%20you%20on%20FarmToFork!`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyFarmers;
