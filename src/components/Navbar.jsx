import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { ReactComponent as LogoSVG } from './Logo.svg';
import { FaBars, FaShoppingCart } from 'react-icons/fa';
import Drawer from './Drawer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const displayName = (
    (currentUser && (currentUser.name || currentUser.username || currentUser.fullName)) ||
    (currentUser?.email ? currentUser.email.split('@')[0] : null) ||
    'User'
  );

  const role = currentUser?.role;
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Avatar: initials-based circle
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarColor = role === 'farmer' ? '#4CAF50' : '#2196F3';

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <Link to="/">
              <LogoSVG className="logo" />
            </Link>
          </div>

          <div className="navbar-center">
            {isAuthenticated && (
              <div className="navbar-user">
                <div className="avatar" style={{ background: avatarColor }} title={role}>
                  {initials}
                </div>
                <span className="user-greeting">Hi, {displayName}</span>
                {role && <span className="role-badge">{role}</span>}
              </div>
            )}
          </div>

          <div className="navbar-right">
            {/* Cart icon — only for customers or unauthenticated */}
            {role !== 'farmer' && (
              <button className="cart-btn" onClick={() => navigate('/cart')} aria-label="Cart">
                <FaShoppingCart />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            )}
            {/* Nearby Farmers pin */}
            <button className="nearby-btn" onClick={() => navigate('/nearby-farmers')} aria-label="Nearby Farmers" title="Nearby Farmers">
              📍
            </button>
            <NotificationBell />
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="drawer-toggle"
              aria-label="Open navigation menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </nav>
  );
};

export default Navbar;