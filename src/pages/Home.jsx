import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Products from '../components/Products';

const Home = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && currentUser?.role === 'farmer') {
      navigate('/farmer', { replace: true });
    }
  }, [loading, isAuthenticated, currentUser, navigate]);

  // While auth is resolving, render nothing to avoid flash
  if (loading) return null;

  // Farmer — redirect handled above, render nothing here
  if (isAuthenticated && currentUser?.role === 'farmer') return null;

  // Customer or unauthenticated — show the public homepage
  return (
    <>
      <Hero />
      <Features />
      <Products />
    </>
  );
};

export default Home;
