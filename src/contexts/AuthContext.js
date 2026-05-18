import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await getCurrentUser();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError('');
    try {
      setLoading(true);
      const result = await loginUser(email, password);
      const { user, token } = result;
      if (token) localStorage.setItem('token', token);
      setCurrentUser(user);
      return result; // return full result so SignIn can check needsVerification
    } catch (err) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError('');
    try {
      setLoading(true);
      const { user, token } = await registerUser(userData);
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;