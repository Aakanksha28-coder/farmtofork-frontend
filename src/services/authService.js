import { API_BASE_URL as BASE_URL } from '../config/api';
import { handleResponse, getAuthHeader } from '../utils/apiHelper';

const mapUser = (data) => ({
  _id:             data?._id,
  name:            data?.name || '',
  email:           data?.email,
  role:            data?.role || 'customer',
  roleSpecificData: data?.roleSpecificData || {},
  isEmailVerified: data?.isEmailVerified ?? false
});

// Login
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data  = await handleResponse(response);
  const token = data?.token;
  const user  = mapUser(data);
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return { user, token, ...data };
};

// Register — returns requiresOtp flag
export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data  = await handleResponse(response);
  const token = data?.token;
  const user  = mapUser(data);
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return { user, token, requiresOtp: data?.requiresOtp, message: data?.message };
};

// Verify OTP — on success, update stored user as verified
export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data  = await handleResponse(response);
  const token = data?.token;
  const user  = mapUser(data);
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  return { user, token, message: data?.message };
};

// Resend OTP
export const resendOtp = async (email) => {
  const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(response);
};

// Logout
export const logoutUser = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { success: true };
};

// Get current user from API
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { ...getAuthHeader() }
    });
    const resData = await handleResponse(response);
    return resData?.user || resData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
