import { API_BASE_URL as BASE_URL } from '../config/api';
import { handleResponse, getAuthHeader } from '../utils/apiHelper';
const API_URL = `${BASE_URL}/products`;

export const createProduct = async (payload) => {
  const hasFile = payload && payload.imageFile instanceof File;
  let response;
  if (hasFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'imageFile') return;
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    formData.append('image', payload.imageFile);
    response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
  } else {
    response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
  }
  return handleResponse(response);
};

export const getProducts = async ({ upcoming } = {}) => {
  const params = new URLSearchParams();
  if (upcoming !== undefined) params.set('upcoming', String(upcoming));
  // Cache-busting to avoid 304 interfering with JSON parsing
  params.set('_', String(Date.now()));
  const response = await fetch(`${API_URL}?${params.toString()}`);
  return handleResponse(response);
};

export const getMyProducts = async () => {
  // Call dedicated protected endpoint
  const response = await fetch(`${API_URL}/mine`, { headers: { ...getAuthHeader() } });
  return handleResponse(response);
};

export const updateProduct = async (id, payload) => {
  const hasFile = payload && payload.imageFile instanceof File;
  let response;
  if (hasFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'imageFile') return;
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    formData.append('image', payload.imageFile);
    response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
      body: formData
    });
  } else {
    response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
  }
  return handleResponse(response);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return handleResponse(response);
};