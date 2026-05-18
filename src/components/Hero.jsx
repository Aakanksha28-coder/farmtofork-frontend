import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Hero.css';

const STATS = [
  { value: '500+', label: 'Farmers' },
  { value: '10K+', label: 'Customers' },
  { value: '50+', label: 'Varieties' },
  { value: '24h',  label: 'Delivery' }
];

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="container hero-inner">
        <div className="hero-text">
          <span className="hero-tag">🌿 Farm to Fork — Direct from Farmers</span>
          <h1 className="hero-title">
            Fresh Produce,<br />
            <span className="hero-accent">Straight from the Farm</span>
          </h1>
          <p className="hero-sub">
            Skip the middlemen. Buy directly from local farmers and get the freshest
            fruits, vegetables &amp; flowers delivered to your door.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="hero-btn-primary">Shop Now →</Link>
            {!isAuthenticated && (
              <Link to="/signup" className="hero-btn-outline">Join as Farmer</Link>
            )}
            <Link to="/nearby-farmers" className="hero-btn-outline">📍 Nearby Farmers</Link>
          </div>
        </div>

        <div className="hero-stats">
          {STATS.map(s => (
            <div key={s.label} className="hero-stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fff"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
