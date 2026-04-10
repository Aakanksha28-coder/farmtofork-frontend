import React, { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../services/productService';
import NegotiationPanel from '../components/NegotiationPanel';
import { useCart } from '../contexts/CartContext';
import './ProductsPage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { API_ORIGIN } from '../config/api';

const CATEGORIES = [
  { value: '', label: '🛒 All' },
  { value: 'vegetable', label: '🥦 Vegetables' },
  { value: 'fruits',    label: '🍎 Fruits' },
  { value: 'flowers',   label: '🌸 Flowers' },
  { value: 'pooja',     label: '🪔 Pooja Paath' },
];

const POOJA_BADGE = <span style={{ fontSize: '11px', background: 'linear-gradient(90deg,#ff6f00,#ffa000)', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontWeight: 700, marginLeft: '6px' }}>🪔 Pooja</span>;

const ProductsPage = () => {
  const { addItem } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isFarmer = currentUser?.role === 'farmer';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [openNegotiationFor, setOpenNegotiationFor] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyProducts, setNearbyProducts] = useState([]);

  // Detect user location once on mount
  useEffect(() => {
    if (isFarmer) return; // farmers don't need nearby suggestions
    (async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude: lat, longitude: lon } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            const data = await res.json();
            const addr = data.address || {};
            const city  = (addr.city || addr.town || addr.village || addr.county || '').toLowerCase();
            const state = (addr.state || '').toLowerCase();
            setUserLocation({ city, state });
          } catch { /* silent */ }
        },
        () => { /* permission denied — silent */ },
        { timeout: 6000 }
      );
    })();
  }, [isFarmer]);

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const list = await getProducts({ category: category || undefined });
        setProducts(list);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  // Compute nearby products when location is known
  useEffect(() => {
    if (!userLocation || !products.length) return;
    const { city, state } = userLocation;
    const nearby = products.filter(p => {
      const loc = p.farmer?.roleSpecificData?.farmLocation || {};
      const farmerCity  = (loc.city  || '').toLowerCase();
      const farmerState = (loc.state || '').toLowerCase();
      return (city  && farmerCity  && farmerCity.includes(city))  ||
             (state && farmerState && farmerState.includes(state));
    });
    setNearbyProducts(nearby.slice(0, 6));
  }, [userLocation, products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (unit) {
      list = list.filter(p => (p.unit || '').toLowerCase() === unit.toLowerCase());
    }
    if (upcomingOnly) {
      list = list.filter(p => !!p.isUpcoming);
    }
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!Number.isNaN(min)) {
      list = list.filter(p => Number(p.price) >= min);
    }
    if (!Number.isNaN(max) && max > 0) {
      list = list.filter(p => Number(p.price) <= max);
    }
    switch (sortBy) {
      case 'price_asc':
        list.sort((a,b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        list.sort((a,b) => Number(b.price) - Number(a.price));
        break;
      case 'name_asc':
        list.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        list.sort((a,b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // newest by createdAt desc if present
        list.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [products, search, unit, upcomingOnly, minPrice, maxPrice, sortBy]);

  const apiBase = API_ORIGIN;
  const imgSrc = (url) => !url ? null : (url.startsWith('http') || url.startsWith('data:')) ? url : `${apiBase}${url}`;

  const handleNegotiate = (product) => {
    if (!isAuthenticated || currentUser?.role !== 'customer') {
      navigate('/signin');
      return;
    }
    setOpenNegotiationFor(product);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated || currentUser?.role !== 'customer') {
      navigate('/signin');
      return;
    }
    addItem(product, 1);
    setToastMsg('Product added');
    setToastOpen(true);
  };

  return (
    <div className="products-page container">
      <h1>All Products</h1>
      <p className="subtitle">Browse and filter all farmer-listed produce.</p>

      {/* Nearby products section */}
      {!isFarmer && nearbyProducts.length > 0 && (
        <div className="nearby-section">
          <h2 className="nearby-title">📍 Near You — {userLocation?.city || userLocation?.state}</h2>
          <div className="nearby-grid">
            {nearbyProducts.map(product => (
              <div key={product._id} className="nearby-card" onClick={() => handleAddToCart(product)}>
                <img
                  src={imgSrc(product.imageUrl) || 'https://images.unsplash.com/photo-1524592157393-88fb3ef00d81?w=400&q=80'}
                  alt={product.name}
                />
                <div className="nearby-info">
                  <span className="nearby-name">{product.name}</span>
                  <span className="nearby-price">₹{product.price}/{product.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            className={`cat-tab${category === c.value ? ' active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="">All units</option>
          <option value="kg">kg</option>
          <option value="dozen">dozen</option>
          <option value="litre">litre</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          Upcoming Only
        </label>
        <input
          type="number"
          min="0"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          min="0"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
      </div>

      {loading && <div>Loading products...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && (
        <div className="products-grid">
          {filtered.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={imgSrc(product.imageUrl) || 'https://images.unsplash.com/photo-1524592157393-88fb3ef00d81?w=800&q=80&auto=format&fit=crop'}
                  alt={product.name}
                />
              </div>
              <div className="product-content">
                <div className="product-header">
                  <h3 className="product-title">{product.name}{product.category === 'pooja' ? POOJA_BADGE : null}</h3>
                  <span className="product-category">{product.unit || 'kg'}</span>
                </div>
                <div className="product-pricing">
                  <span className="product-price">₹{product.price}/{product.unit}</span>
                  {product.offer ? <span className="product-market-rate">{product.offer}</span> : null}
                  {product.isUpcoming ? <span className="badge">Upcoming</span> : null}
                </div>
                <p className="product-farmer">{product.availableDate ? `Available on ${new Date(product.availableDate).toLocaleDateString()}` : 'Farmer listing'}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => handleNegotiate(product)}>Negotiate</button>
                  { !isFarmer && (
                    <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                  )}
                </div>
              </div>
              {openNegotiationFor?._id === product._id && (
                <NegotiationPanel product={product} />
              )}
            </div>
          ))}
          {filtered.length === 0 && <div>No products match your filters.</div>}
        </div>
      )}
      <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />
    </div>
  );
};

export default ProductsPage;