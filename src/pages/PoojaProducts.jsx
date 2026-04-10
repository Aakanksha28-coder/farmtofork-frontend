import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL, API_ORIGIN } from '../config/api';
import './PoojaProducts.css';

const FESTIVALS = ['', 'Ganesh Chaturthi', 'Diwali', 'Navratri', 'Holi', 'Daily Pooja', 'Dussehra'];

const tagClass = (tag) => {
  if (tag === 'organic') return 'organic';
  if (tag === 'festival-special') return 'festival';
  if (tag === 'temple-grade') return 'temple';
  return '';
};

const PoojaProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ festival: '', organic: false, minPrice: '', maxPrice: '' });
  const { addToCart }             = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.festival)  params.set('festival', filters.festival);
      if (filters.organic)   params.set('organic', 'true');
      if (filters.minPrice)  params.set('minPrice', filters.minPrice);
      if (filters.maxPrice)  params.set('maxPrice', filters.maxPrice);
      const res  = await fetch(`${API_BASE_URL}/products/pooja?${params.toString()}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  return (
    <div className="pooja-page">
      <div className="pooja-hero">
        <h1>🪔 Pooja Essentials</h1>
        <p>Fresh, pure & farm-grown products for your sacred rituals</p>
      </div>

      {/* Filters */}
      <div className="pooja-filters">
        <label>
          Festival
          <select value={filters.festival} onChange={e => handleFilter('festival', e.target.value)}>
            {FESTIVALS.map(f => <option key={f} value={f}>{f || 'All Festivals'}</option>)}
          </select>
        </label>
        <label>
          Min Price (₹)
          <input type="number" min="0" placeholder="0"
            value={filters.minPrice} onChange={e => handleFilter('minPrice', e.target.value)} />
        </label>
        <label>
          Max Price (₹)
          <input type="number" min="0" placeholder="Any"
            value={filters.maxPrice} onChange={e => handleFilter('maxPrice', e.target.value)} />
        </label>
        <label className="filter-organic">
          <input type="checkbox" checked={filters.organic}
            onChange={e => handleFilter('organic', e.target.checked)} />
          🌿 Organic Only
        </label>
      </div>

      {loading ? (
        <div className="pooja-loading">🪔 Loading sacred products...</div>
      ) : products.length === 0 ? (
        <div className="pooja-empty">
          <span>🪷</span>
          No pooja products found. Try adjusting your filters.
        </div>
      ) : (
        <div className="pooja-grid">
          {products.map(p => (
            <div key={p._id} className="pooja-card">
              {p.imageUrl ? (
                <img src={p.imageUrl.startsWith('http') || p.imageUrl.startsWith('data:') ? p.imageUrl : `${API_ORIGIN}${p.imageUrl}`} alt={p.name} className="pooja-card-img" />
              ) : (
                <div className="pooja-card-img-placeholder">🌸</div>
              )}

              <div className="pooja-card-body">
                {/* Festival badge */}
                {p.suitableFor && (
                  <span className="festival-badge">🌼 {p.suitableFor.split(',')[0].trim()} Special</span>
                )}

                <p className="pooja-card-name">{p.name}</p>
                <p className="pooja-card-farmer">by {p.farmer?.name || 'Farmer'}</p>
                <p className="pooja-card-price">₹{p.price}/{p.unit || 'kg'}</p>

                {p.suitableFor && (
                  <p className="pooja-card-suitable">🙏 Suitable for: {p.suitableFor}</p>
                )}
                {p.specialNotes && (
                  <p className="pooja-card-notes">📝 {p.specialNotes}</p>
                )}

                <div className="pooja-tags">
                  {p.isOrganic && <span className="pooja-tag organic">🌿 Organic</span>}
                  {(p.tags || []).map(tag => (
                    <span key={tag} className={`pooja-tag ${tagClass(tag)}`}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="pooja-card-footer">
                <button className="pooja-add-btn" onClick={() => addToCart(p)}>
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoojaProducts;
